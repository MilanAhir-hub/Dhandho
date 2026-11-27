import sys
# Configure UTF-8 encoding for Windows terminal output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from database import SessionLocal
from ai.agent import ask_ai_assistant

def test_natural_language_variations():
    print("\n============================================================")
    print("TESTING DIVERSE NATURAL LANGUAGE USER COMMANDS")
    print("============================================================")
    db = SessionLocal()
    
    test_cases = [
        {
            "query": "add a tshirt with the price of 500 and the total quantity is 50",
            "expected_name": "tshirt",
            "expected_price": 500.0,
            "expected_qty": 50.0,
        },
        {
            "query": "Add a product, with the name Balaji waffer and its price is 10 and quantity 40",
            "expected_name": "Balaji waffer",
            "expected_price": 10.0,
            "expected_qty": 40.0,
        },
        {
            "query": "create product Colgate Toothpaste with price 130 and stock 25",
            "expected_name": "Colgate Toothpaste",
            "expected_price": 130.0,
            "expected_qty": 25.0,
        },
        {
            "query": "new item Soap with price of 45 and quantity is 30",
            "expected_name": "Soap",
            "expected_price": 45.0,
            "expected_qty": 30.0,
        },
        {
            "query": "Add a product Milk having price 60 and total quantity 15",
            "expected_name": "Milk",
            "expected_price": 60.0,
            "expected_qty": 15.0,
        },
    ]

    try:
        for idx, tc in enumerate(test_cases, 1):
            conv_id = f"test_nat_{idx}"
            print(f"\n--- Case {idx}: \"{tc['query']}\" ---")
            res = ask_ai_assistant(tc["query"], db, conversation_id=conv_id)
            print("AI Response:\n", res["response"])
            print("Proposal Data:", res["proposal"]["data"] if res["proposal"] else None)
            
            assert res["proposal"] is not None, f"Failed: Proposal was not created for: {tc['query']}"
            pdata = res["proposal"]["data"]
            assert pdata["name"].lower() == tc["expected_name"].lower(), f"Name mismatch! Got '{pdata['name']}', expected '{tc['expected_name']}'"
            assert pdata["selling_price"] == tc["expected_price"], f"Price mismatch! Got {pdata['selling_price']}, expected {tc['expected_price']}"
            assert pdata["stock_quantity"] == tc["expected_qty"], f"Quantity mismatch! Got {pdata['stock_quantity']}, expected {tc['expected_qty']}"
            print(f"[OK] Case {idx} Passed!")

        print("\n============================================================")
        print(">>> ALL NATURAL COMMAND TEST CASES PASSED SUCCESSFULLY! <<<")
        print("============================================================")
    finally:
        db.close()

if __name__ == "__main__":
    test_natural_language_variations()
