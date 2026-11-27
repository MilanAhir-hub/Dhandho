import sys
# Configure UTF-8 encoding for Windows terminal output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from datetime import datetime, timezone
from database import SessionLocal
from ai.agent import ask_ai_assistant

def test_phase4_business_analytics():
    print("=" * 60)
    print("TESTING PHASE 4: BUSINESS ANALYTICS TOOLS")
    print("=" * 60)

    db = SessionLocal()
    try:
        # Case 1: "What is my revenue this month?"
        print("\n--- Test 1: 'What is my revenue this month?' ---")
        res1 = ask_ai_assistant("What is my revenue this month?", db, conversation_id="test_analytics_1")
        text1 = res1["response"]
        print("AI Response:\n", text1)
        assert "revenue" in text1.lower(), "Expected revenue in response"
        assert "₹" in text1 or "rs" in text1.lower(), "Expected currency symbol in response"
        assert "month" in text1.lower(), "Expected month mention in response"
        assert "assumption" in text1.lower() or "progress" in text1.lower() or "include" in text1.lower(), "Expected assumptions explanation"
        print("[OK] Test 1 (Monthly Revenue) Passed!")

        # Case 2: "Compare this month with last month."
        print("\n--- Test 2: 'Compare this month with last month.' ---")
        res2 = ask_ai_assistant("Compare this month with last month.", db, conversation_id="test_analytics_2")
        text2 = res2["response"]
        print("AI Response:\n", text2)
        assert "comparison" in text2.lower() or "compare" in text2.lower() or "month" in text2.lower(), "Expected comparison response"
        assert "last month" in text2.lower(), "Expected last month mention"
        assert "current month" in text2.lower() or datetime.now(timezone.utc).strftime("%B").lower() in text2.lower()
        print("[OK] Test 2 (Month Comparison) Passed!")

        # Case 3: "Which products sell the most?"
        print("\n--- Test 3: 'Which products sell the most?' ---")
        res3 = ask_ai_assistant("Which products sell the most?", db, conversation_id="test_analytics_3")
        text3 = res3["response"]
        print("AI Response:\n", text3)
        assert "best-selling" in text3.lower() or "sold" in text3.lower() or "top" in text3.lower(), "Expected best-selling products list"
        assert "parle" in text3.lower() or "packet" in text3.lower() or "unit" in text3.lower() or "₹" in text3
        print("[OK] Test 3 (Top Selling Products) Passed!")

        # Case 4: "Which products have low stock?"
        print("\n--- Test 4: 'Which products have low stock?' ---")
        res4 = ask_ai_assistant("Which products have low stock?", db, conversation_id="test_analytics_4")
        text4 = res4["response"]
        print("AI Response:\n", text4)
        assert "stock" in text4.lower(), "Expected stock mentions"
        assert "alert" in text4.lower() or "restock" in text4.lower() or "threshold" in text4.lower()
        print("[OK] Test 4 (Low Stock Products) Passed!")

        print("\n" + "=" * 60)
        print(">>> ALL PHASE 4 BUSINESS ANALYTICS TESTS PASSED! <<<")
        print("=" * 60)

    finally:
        db.close()

if __name__ == "__main__":
    test_phase4_business_analytics()
