import sys
# Configure UTF-8 encoding for Windows terminal output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from database import SessionLocal
from main import app
from models.product import Product
from ai.agent import ask_ai_assistant
from ai.proposals import (
    create_product_proposal,
    get_proposal,
    reject_proposal,
    execute_proposal,
    proposals_store,
)

# Step 1: Initialize FastAPI test client
client = TestClient(app)

# Step 2: Test that a proposed change does NOT modify the database before approval
def test_preview_does_not_modify_db():
    print("\n============================================================")
    print("TEST 1: PROPOSAL PREVIEW DOES NOT MODIFY DATABASE")
    print("============================================================")
    db = SessionLocal()
    try:
        # Get count before proposing
        count_before = db.query(Product).count()
        
        # User triggers add product with full details
        conv_id = "test_phase3_preview"
        res = ask_ai_assistant("Add a product Parle-G with price 10 and 50 stock", db, conversation_id=conv_id)
        
        # Verify proposal was created
        assert res["proposal"] is not None, "Proposal should be returned in state."
        proposal_id = res["proposal"]["proposal_id"]
        print("Generated Proposal ID:", proposal_id)
        print("AI Response:\n", res["response"])
        
        # Count in database MUST remain unchanged
        count_after = db.query(Product).count()
        assert count_after == count_before, f"Database modified prematurely! Before: {count_before}, After: {count_after}"
        print(f"[OK] Database count remained strictly at {count_before}. Preview did not touch database!")
    finally:
        db.close()

# Step 3: Test that rejection cancels without writing to database
def test_rejection_does_not_modify_db():
    print("\n============================================================")
    print("TEST 2: REJECTION DOES NOT MODIFY DATABASE")
    print("============================================================")
    db = SessionLocal()
    try:
        count_before = db.query(Product).count()
        
        # Create a test proposal
        proposal = create_product_proposal("Test Reject Biscuit", 15.0, 30.0, user_id=1, conversation_id="conv_rej")
        prop_id = proposal["proposal_id"]
        
        # Call rejection endpoint
        response = client.post("/ai/proposal/reject", json={"proposal_id": prop_id, "user_id": 1})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "rejected"
        print("Rejection Endpoint Response:", data["message"])
        
        # Check database count again - must be unchanged
        count_after = db.query(Product).count()
        assert count_after == count_before, "Database was modified upon rejection!"
        
        # Check that proposal in store is marked rejected
        prop_stored = get_proposal(prop_id)
        assert prop_stored["status"] == "rejected"
        print("[OK] Test 2 Passed: Proposal rejected cleanly with 0 database writes!")
    finally:
        db.close()

# Step 4: Test that approval executes the operation exactly once
def test_approval_executes_once():
    print("\n============================================================")
    print("TEST 3: APPROVAL EXECUTES OPERATION EXACTLY ONCE")
    print("============================================================")
    db = SessionLocal()
    unique_name = f"Approval Test Snack {datetime.now().strftime('%H%M%S')}"
    try:
        count_before = db.query(Product).count()
        
        # Create a test proposal
        proposal = create_product_proposal(unique_name, 25.0, 100.0, user_id=1, conversation_id="conv_app")
        prop_id = proposal["proposal_id"]
        
        # Call approval endpoint
        response = client.post("/ai/proposal/approve", json={"proposal_id": prop_id, "user_id": 1})
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "executed"
        new_prod_id = data["product_id"]
        print(f"Approval Succeeded! Created Product ID #{new_prod_id} ('{data['product_name']}')")
        
        # Verify product exists in database table
        saved_product = db.get(Product, new_prod_id)
        assert saved_product is not None
        assert saved_product.name == unique_name
        assert saved_product.selling_price == 25.0
        assert saved_product.stock_quantity == 100.0
        
        # Count should have increased by exactly 1
        count_after = db.query(Product).count()
        assert count_after == count_before + 1
        print("[OK] Test 3 Passed: Item written to database once upon approval!")
        return prop_id
    finally:
        db.close()

# Step 5: Test replay prevention (duplicate execution must fail)
def test_duplicate_approval_rejected(executed_prop_id: str):
    print("\n============================================================")
    print("TEST 4: DUPLICATE APPROVAL REPLAY PREVENTED")
    print("============================================================")
    db = SessionLocal()
    try:
        count_before = db.query(Product).count()
        
        # Attempt to approve the already-executed proposal a second time
        response = client.post("/ai/proposal/approve", json={"proposal_id": executed_prop_id, "user_id": 1})
        print("Second Approval Attempt Status Code:", response.status_code)
        assert response.status_code == 400, "Second approval should be rejected with HTTP 400!"
        detail = response.json()["detail"]
        print("Second Approval Rejection Detail:", detail)
        assert "already been executed" in detail.lower()
        
        # Database count must not increase
        count_after = db.query(Product).count()
        assert count_after == count_before
        print("[OK] Test 4 Passed: Duplicate execution replay strictly blocked!")
    finally:
        db.close()

# Step 6: Test invalid or expired proposals are rejected
def test_expired_proposal_rejected():
    print("\n============================================================")
    print("TEST 5: EXPIRED PROPOSAL IS REJECTED")
    print("============================================================")
    db = SessionLocal()
    try:
        # Create proposal and manually backdate expiration to 10 minutes ago
        proposal = create_product_proposal("Expired Product", 10.0, 5.0, user_id=1)
        prop_id = proposal["proposal_id"]
        proposals_store[prop_id]["expires_at"] = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()
        
        # Attempt approval of expired proposal
        response = client.post("/ai/proposal/approve", json={"proposal_id": prop_id, "user_id": 1})
        print("Expired Approval Status Code:", response.status_code)
        assert response.status_code == 400
        assert "expired" in response.json()["detail"].lower()
        print("[OK] Test 5 Passed: Expired proposal was rejected!")
    finally:
        db.close()

# Step 7: Test authorization check (user 2 cannot approve user 1's proposal)
def test_unauthorized_user_blocked():
    print("\n============================================================")
    print("TEST 6: UNAUTHORIZED USER ACCESS BLOCKED")
    print("============================================================")
    proposal = create_product_proposal("User 1 Secret Item", 50.0, 20.0, user_id=1)
    prop_id = proposal["proposal_id"]
    
    # User 99 attempts to approve User 1's proposal
    response = client.post("/ai/proposal/approve", json={"proposal_id": prop_id, "user_id": 99})
    print("Unauthorized Approval Status Code:", response.status_code)
    assert response.status_code == 403
    print("Rejection message:", response.json()["detail"])
    print("[OK] Test 6 Passed: Unauthorized user access blocked with 403 Forbidden!")

# Step 8: Test invalid prices and quantities are rejected
def test_invalid_price_and_quantity_rejected():
    print("\n============================================================")
    print("TEST 7: INVALID PRICES AND QUANTITIES REJECTED")
    print("============================================================")
    # Negative price
    try:
        create_product_proposal("Bad Price Item", -10.0, 50.0)
        assert False, "Should fail on negative price"
    except ValueError as e:
        print("[OK] Caught negative price:", e)

    # Negative quantity
    try:
        create_product_proposal("Bad Quantity Item", 10.0, -5.0)
        assert False, "Should fail on negative quantity"
    except ValueError as e:
        print("[OK] Caught negative quantity:", e)
        
    print("[OK] Test 7 Passed: Invalid prices and quantities safely rejected!")

if __name__ == "__main__":
    test_preview_does_not_modify_db()
    test_rejection_does_not_modify_db()
    executed_id = test_approval_executes_once()
    test_duplicate_approval_rejected(executed_id)
    test_expired_proposal_rejected()
    test_unauthorized_user_blocked()
    test_invalid_price_and_quantity_rejected()
    print("\n============================================================")
    print(">>> ALL PHASE 3 SECURITY & APPROVAL TESTS PASSED! <<<")
    print("============================================================")
