import sys
# Configure UTF-8 encoding for Windows terminal output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from database import SessionLocal
from main import app
from ai.agent import ask_ai_assistant

# Step 1: Initialize FastAPI test client
client = TestClient(app)

# Step 2: Test multi-turn conversational follow-up questions
def test_multiturn_conversation():
    print("\n============================================================")
    print("TEST 1: MULTI-TURN CONVERSATION & STEP-BY-STEP QUESTIONS")
    print("============================================================")
    db = SessionLocal()
    conv_id = "test_thread_phase2_1"
    try:
        # Turn 1: User says 'Add a product'
        res1 = ask_ai_assistant("Add a product", db, conversation_id=conv_id)
        print("\nTurn 1 (User: 'Add a product'):")
        print("AI Response:", res1["response"])
        assert "product name" in res1["response"].lower(), "Expected AI to ask for product name."
        assert res1["intent"] == "add_product", "Intent should be 'add_product'."

        # Turn 2: User gives product name 'Parle-G'
        res2 = ask_ai_assistant("Parle-G", db, conversation_id=conv_id)
        print("\nTurn 2 (User: 'Parle-G'):")
        print("AI Response:", res2["response"])
        assert "price" in res2["response"].lower(), "Expected AI to ask for price."
        assert res2["collected_data"].get("name") == "Parle-G", "Collected name should be 'Parle-G'."

        # Turn 3: User gives price '10 rupees'
        res3 = ask_ai_assistant("10 rupees", db, conversation_id=conv_id)
        print("\nTurn 3 (User: '10 rupees'):")
        print("AI Response:", res3["response"])
        assert "units" in res3["response"].lower() or "stock" in res3["response"].lower(), "Expected AI to ask for units/stock."
        assert res3["collected_data"].get("price") == 10.0, "Collected price should be 10.0."

        # Turn 4: User gives quantity '50'
        res4 = ask_ai_assistant("50", db, conversation_id=conv_id)
        print("\nTurn 4 (User: '50'):")
        print("AI Response:", res4["response"])
        assert "review this proposed change" in res4["response"].lower() or "prepare the proposed addition" in res4["response"].lower()
        assert res4["collected_data"].get("quantity") == 50.0, "Collected quantity should be 50.0."
        assert len(res4["missing_fields"]) == 0, "No missing fields should remain."

        print("\n[OK] Test 1 Passed: Complete step-by-step follow-up questioning verified!")
    finally:
        db.close()

# Step 3: Test avoiding asking again for information already provided
def test_avoid_reasking_provided_info():
    print("\n============================================================")
    print("TEST 2: AVOID RE-ASKING FOR ALREADY PROVIDED INFORMATION")
    print("============================================================")
    db = SessionLocal()
    conv_id = "test_thread_phase2_upfront"
    try:
        # User provides name, price, and quantity all in the first message
        res = ask_ai_assistant("Add a product Parle-G with price 10 and 50 stock", db, conversation_id=conv_id)
        print("\nUser Input: 'Add a product Parle-G with price 10 and 50 stock'")
        print("AI Response:", res["response"])
        print("Collected Data:", res["collected_data"])
        
        assert "review this proposed change" in res["response"].lower() or "prepare the proposed addition" in res["response"].lower() or "i have the product name" in res["response"].lower()
        assert len(res["missing_fields"]) == 0, "Should have 0 missing fields since all were provided upfront."
        print("\n[OK] Test 2 Passed: Did not re-ask for already provided info!")
    finally:
        db.close()

# Step 4: Test user and conversation state separation
def test_conversation_isolation():
    print("\n============================================================")
    print("TEST 3: CONVERSATION & USER STATE ISOLATION")
    print("============================================================")
    db = SessionLocal()
    try:
        # User A starts adding a product on thread A
        res_user_a = ask_ai_assistant("Add a product", db, conversation_id="thread_A", user_id=101)
        assert res_user_a["intent"] == "add_product"

        # User B on thread B asks a completely different question
        res_user_b = ask_ai_assistant("Show my inventory", db, conversation_id="thread_B", user_id=102)
        assert res_user_b["intent"] is None
        assert "inventory summary" in res_user_b["response"].lower() or "inventory" in res_user_b["response"].lower()

        # User A continues on thread A - state must be untouched!
        res_user_a2 = ask_ai_assistant("Maggi 2-Minute", db, conversation_id="thread_A", user_id=101)
        assert res_user_a2["collected_data"].get("name") == "Maggi 2-Minute"
        assert "price" in res_user_a2["response"].lower()

        print("\n[OK] Test 3 Passed: User A and User B conversations are strictly isolated!")
    finally:
        db.close()

# Step 5: Verify Phase 1 functionality remains 100% working
def test_phase1_preservation():
    print("\n============================================================")
    print("TEST 4: PHASE 1 READ-ONLY TOOLS PRESERVATION")
    print("============================================================")
    db = SessionLocal()
    try:
        # Check products list
        p_res = ask_ai_assistant("List my products", db, conversation_id="read_only_products")
        assert "product" in p_res["response"].lower() or "item" in p_res["response"].lower()
        print("[OK] 'List my products' working.")

        # Check inventory
        i_res = ask_ai_assistant("Show my inventory", db, conversation_id="read_only_inventory")
        assert "inventory" in i_res["response"].lower() or "stock" in i_res["response"].lower()
        print("[OK] 'Show my inventory' working.")

        # Check sales
        s_res = ask_ai_assistant("Show my sales information", db, conversation_id="read_only_sales")
        assert "sale" in s_res["response"].lower() or "bill" in s_res["response"].lower()
        print("[OK] 'Show my sales information' working.")

        # Check revenue
        r_res = ask_ai_assistant("Calculate revenue for last 30 days", db, conversation_id="read_only_revenue")
        assert "revenue" in r_res["response"].lower()
        print("[OK] 'Calculate revenue' working.")

        # Check specific product lookup
        sp_res = ask_ai_assistant("how many packates of this left:- Amul Taaza Homogenised Milk 1L", db, conversation_id="read_only_lookup")
        assert "amul" in sp_res["response"].lower() and "taaza" in sp_res["response"].lower()
        assert "4" in sp_res["response"]
        print("[OK] Specific product query working.")

        print("\n[OK] Test 4 Passed: All Phase 1 capabilities fully preserved without breaking anything!")
    finally:
        db.close()

# Step 6: Test HTTP API endpoint with conversation tracking
def test_http_endpoint_phase2():
    print("\n============================================================")
    print("TEST 5: FASTAPI /ai/chat ENDPOINT WITH THREAD MEMORY")
    print("============================================================")
    thread_id = "http_phase2_test"
    
    # Step A: POST Add product
    r1 = client.post("/ai/chat", json={"message": "Add a product", "conversation_id": thread_id})
    assert r1.status_code == 200
    data1 = r1.json()
    assert "product name" in data1["response"].lower()
    assert data1["intent"] == "add_product"

    # Step B: POST Name
    r2 = client.post("/ai/chat", json={"message": "Tata Tea Gold", "conversation_id": thread_id})
    assert r2.status_code == 200
    data2 = r2.json()
    assert "price" in data2["response"].lower()
    assert data2["collected_data"]["name"] == "Tata Tea Gold"

    print("[OK] Test 5 Passed: FastAPI endpoint correctly handles multi-turn state across HTTP requests!")

if __name__ == "__main__":
    test_multiturn_conversation()
    test_avoid_reasking_provided_info()
    test_conversation_isolation()
    test_phase1_preservation()
    test_http_endpoint_phase2()
    print("\n============================================================")
    print(">>> ALL PHASE 2 TESTS COMPLETED SUCCESSFULLY! <<<")
    print("============================================================")
