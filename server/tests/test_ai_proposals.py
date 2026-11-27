"""Automated tests for the AI proposal gate (prompt.md Section 6).

Run from the server folder:  python tests/test_ai_proposals.py
"""

import os
import sys

TEST_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.dirname(TEST_DIR)
DB_PATH = os.path.join(TEST_DIR, "test_ai_gate.db")
if os.path.exists(DB_PATH):
    os.remove(DB_PATH)
os.environ["DATABASE_URL"] = "sqlite:///" + DB_PATH.replace("\\", "/")
sys.path.insert(0, SERVER_DIR)

from datetime import datetime, timedelta, timezone  # noqa: E402

from ai import proposals  # noqa: E402
from ai.tools.product_tools import validate_product_data  # noqa: E402
from database import SessionLocal, engine  # noqa: E402
from models.product import Product  # noqa: E402
from models.user import Base  # noqa: E402

Base.metadata.create_all(engine)

VALID_PAYLOAD = {"name": "Test Product", "price": 10.0, "stock": 5}


def make_proposal(user_id=1):
    """Create one pending proposal and return its id."""
    return proposals.create_proposal(
        user_id=user_id,
        conversation_id="test_conversation",
        action="create_product",
        payload=VALID_PAYLOAD,
    )


def get_status(proposal_id):
    """Read the raw status straight from the database."""
    with SessionLocal() as db:
        row = db.get(proposals.AiProposal, proposal_id)
        return row.status if row else None


def product_count():
    """Count Product rows in a fresh session."""
    with SessionLocal() as db:
        return db.query(Product).count()


def expect_error(func, fragment, *args):
    """Call func and assert it fails with an error containing the fragment."""
    try:
        func(*args)
    except (ValueError, PermissionError) as exc:
        message = str(exc).lower()
        assert fragment.lower() in message, (
            f"Expected error containing '{fragment}' but got: {exc}"
        )
    else:
        raise AssertionError(
            f"Expected an error containing '{fragment}' but none was raised"
        )


def test_validate_rejects_bad_inputs():
    expect_error(validate_product_data, "name", {})

    expect_error(validate_product_data, "name", {"name": "   "})

    expect_error(validate_product_data, "too long", {"name": "x" * 101})

    expect_error(validate_product_data, "price", {"name": "Milk"})

    expect_error(validate_product_data, "price", {"name": "Milk", "price": "free"})

    expect_error(validate_product_data, "greater than 0", {"name": "Milk", "price": 0})

    expect_error(validate_product_data, "greater than 0", {"name": "Milk", "price": -1})

    expect_error(validate_product_data, "stock", {"name": "Milk", "price": 3})

    expect_error(validate_product_data, "negative", {"name": "Milk", "price": 3, "stock": -2})

    cleaned = validate_product_data({"name": " Milk ", "price": 3, "stock": 10})
    assert cleaned == {"name": "Milk", "price": 3.0, "stock": 10.0}


def test_proposal_creation_does_not_write_product():
    before = product_count()

    proposal_id = make_proposal(user_id=1)
    saved = proposals.get_proposal(proposal_id)

    assert saved is not None
    assert saved["status"] == "pending"
    assert saved["data"] == {"name": "Test Product", "price": 10.0, "stock": 5.0}
    assert get_status(proposal_id) == "pending"
    assert product_count() == before


def test_execute_happens_exactly_once():
    proposal_id = make_proposal(user_id=1)
    before = product_count()

    with SessionLocal() as db:
        first = proposals.execute_proposal(proposal_id, 1, db)
        after = product_count()

    assert first["status"] == "approved"
    assert first["product_id"] is not None
    assert after == before + 1

    with SessionLocal() as db:
        second = proposals.execute_proposal(proposal_id, 1, db)
        twice = product_count()

    assert second["status"] == "approved"
    assert second["product_id"] == first["product_id"]
    assert twice == after


def test_rejection_does_not_write_product():
    proposal_id = make_proposal(user_id=1)
    before = product_count()

    result = proposals.reject_proposal(proposal_id, 1)

    assert result["status"] == "rejected"
    assert get_status(proposal_id) == "rejected"
    assert product_count() == before

    expect_error(lambda: proposals.reject_proposal(proposal_id, 1), "no longer pending")


def test_unknown_proposal_is_rejected():
    with SessionLocal() as db:
        expect_error(lambda: proposals.execute_proposal("no-such-id", 1, db), "not found")
    expect_error(lambda: proposals.reject_proposal("no-such-id", 1), "not found")


def test_expired_proposal_is_rejected():
    proposal_id = make_proposal(user_id=1)

    with SessionLocal() as db:
        row = db.get(proposals.AiProposal, proposal_id)
        row.created_at = datetime.now(timezone.utc) - timedelta(
            minutes=proposals.PROPOSAL_TTL_MINUTES + 5
        )
        db.commit()

    before = product_count()
    with SessionLocal() as db:
        expect_error(lambda: proposals.execute_proposal(proposal_id, 1, db), "expired")
    assert product_count() == before
    assert get_status(proposal_id) == "expired"


def test_cross_user_access_is_blocked():
    proposal_id = make_proposal(user_id=2)
    before = product_count()

    with SessionLocal() as db:
        expect_error(lambda: proposals.execute_proposal(proposal_id, 99, db), "another user")
    assert product_count() == before
    assert get_status(proposal_id) == "pending"

    expect_error(lambda: proposals.reject_proposal(proposal_id, 99), "another user")


def test_execution_failure_rolls_back():
    proposal_id = make_proposal(user_id=1)
    original = proposals.create_product

    def failing_create(db, data):
        raise RuntimeError("simulated database failure")

    proposals.create_product = failing_create
    try:
        before = product_count()
        with SessionLocal() as db:
            raised = False
            try:
                proposals.execute_proposal(proposal_id, 1, db)
            except RuntimeError:
                raised = True
            assert raised
    finally:
        proposals.create_product = original

    assert product_count() == before
    assert get_status(proposal_id) == "failed"

    with SessionLocal() as db:
        expect_error(lambda: proposals.execute_proposal(proposal_id, 1, db), "no longer pending")


TESTS = [
    test_validate_rejects_bad_inputs,
    test_proposal_creation_does_not_write_product,
    test_execute_happens_exactly_once,
    test_rejection_does_not_write_product,
    test_unknown_proposal_is_rejected,
    test_expired_proposal_is_rejected,
    test_cross_user_access_is_blocked,
    test_execution_failure_rolls_back,
]


def main():
    passed = 0
    failed = 0
    for test in TESTS:
        try:
            test()
            passed += 1
            print(f"PASS {test.__name__}")
        except Exception as exc:  # keep going so every test reports
            failed += 1
            print(f"FAIL {test.__name__}: {exc}")
    print(f"{passed} passed, {failed} failed")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
