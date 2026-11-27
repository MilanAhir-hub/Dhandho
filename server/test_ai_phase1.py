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

# Step 2: Test direct agent function with database session
def test_direct_agent():
    print("\n--- Running Direct LangGraph Agent Tests ---")
    # Open real database session
    db = SessionLocal()
    try:
        # Helper to extract text from result
        def get_text(res):
            return res["response"] if isinstance(res, dict) else res

        # Case 1: List products
        res_products = get_text(ask_ai_assistant("List my products", db))
        print("\n[Case 1: List products]:\n", res_products)
        assert "Products in store:" in res_products, "Failed: Products list missing."

        # Case 2: Show inventory
        res_inventory = get_text(ask_ai_assistant("Show my inventory", db))
        print("\n[Case 2: Show inventory]:\n", res_inventory)
        assert "Inventory Summary:" in res_inventory, "Failed: Inventory summary missing."

        # Case 3: Show sales information
        res_sales = get_text(ask_ai_assistant("Show my sales information", db))
        print("\n[Case 3: Show sales information]:\n", res_sales)
        assert "Sales Summary:" in res_sales, "Failed: Sales summary missing."

        # Case 4: Calculate revenue
        res_revenue = get_text(ask_ai_assistant("Calculate revenue for last 30 days", db))
        print("\n[Case 4: Calculate revenue]:\n", res_revenue)
        assert "Revenue Report" in res_revenue, "Failed: Revenue report missing."

        # Case 5: General query
        res_general = get_text(ask_ai_assistant("Hello", db))
        print("\n[Case 5: General greeting]:\n", res_general)
        assert "Namaste" in res_general, "Failed: Greeting missing."

        print("\n>>> All direct agent cases passed successfully!")
    finally:
        # Close database session
        db.close()

# Step 3: Test FastAPI /ai/chat HTTP endpoint
def test_api_endpoint():
    print("\n--- Running FastAPI /ai/chat Endpoint Tests ---")
    
    # Test valid message
    response = client.post("/ai/chat", json={"message": "Show my inventory"})
    print("\n[API Test - Show inventory]: Status", response.status_code)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()
    assert "response" in data
    print("API Response:", data["response"][:100], "...")

    # Test empty message (failure case validation)
    err_response = client.post("/ai/chat", json={"message": "   "})
    print("\n[API Test - Empty message validation]: Status", err_response.status_code)
    assert err_response.status_code == 400, f"Expected 400, got {err_response.status_code}"

    print("\n>>> All API endpoint tests passed successfully!")

if __name__ == "__main__":
    test_direct_agent()
    test_api_endpoint()
