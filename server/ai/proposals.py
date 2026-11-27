"""Persistence and execution for AI product proposals.

A proposal is a draft product that the AI assistant wants to create.
Nothing touches the real products table until the human user approves it.
"""

import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, Session, mapped_column

from ai.tools.product_tools import build_product_create, validate_product_data
from ai.tools.supplier_tools import build_supplier_create, validate_supplier_data
from crud.product import create_product
from crud.supplier import create_supplier
from database import SessionLocal, engine
from models.user import Base

PROPOSAL_TTL_MINUTES = 30


class AiProposal(Base):
    """A pending product draft created by the AI assistant."""

    __tablename__ = "ai_proposals"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, nullable=False)
    conversation_id: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    payload_json: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    executed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    result_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    product_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


# Make sure the proposals table exists without touching other tables.
try:
    Base.metadata.create_all(engine, tables=[AiProposal.__table__])
except Exception:
    pass


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _is_expired(created_at: Optional[datetime]) -> bool:
    """Return True when the proposal is older than PROPOSAL_TTL_MINUTES."""
    if created_at is None:
        return True
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return _utcnow() - created_at > timedelta(minutes=PROPOSAL_TTL_MINUTES)


def _row_to_dict(row: AiProposal) -> dict:
    try:
        payload = json.loads(row.payload_json)
    except json.JSONDecodeError:
        payload = {}
    return {
        "proposal_id": row.id,
        "user_id": row.user_id,
        "conversation_id": row.conversation_id,
        "action": row.action,
        "status": row.status,
        "data": payload,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "executed_at": row.executed_at.isoformat() if row.executed_at else None,
        "product_id": row.product_id,
    }


def create_proposal(
    user_id: int,
    conversation_id: str,
    action: str,
    payload: dict,
) -> str:
    """Save a pending proposal and return its id."""
    db = SessionLocal()
    try:
        row = AiProposal(
            id=str(uuid.uuid4()),
            user_id=user_id,
            conversation_id=conversation_id,
            action=action,
            payload_json=json.dumps(payload),
            status="pending",
        )
        db.add(row)
        db.commit()
        return row.id
    finally:
        db.close()


def get_proposal(proposal_id: str) -> Optional[dict]:
    """Return a proposal dict, or None when it does not exist."""
    db = SessionLocal()
    try:
        row = db.get(AiProposal, proposal_id)
        if row is None:
            return None
        return _row_to_dict(row)
    finally:
        db.close()


def reject_proposal(proposal_id: str, user_id: int) -> dict:
    """Mark a pending proposal as rejected. Never touches the products table."""
    db = SessionLocal()
    try:
        row = db.get(AiProposal, proposal_id)
        if row is None:
            raise ValueError("Proposal not found.")
        if row.user_id != user_id:
            raise PermissionError("This proposal belongs to another user.")
        if row.status != "pending":
            raise ValueError(
                f"This proposal is no longer pending (status: {row.status})."
            )
        try:
            payload = json.loads(row.payload_json)
        except json.JSONDecodeError:
            payload = {}
        product_name = payload.get("name", "this product")
        row.status = "rejected"
        row.executed_at = _utcnow()
        if row.action == "create_supplier":
            row.result_message = f"Rejected. The supplier '{product_name}' was NOT created."
        else:
            row.result_message = f"Rejected. The product '{product_name}' was NOT created."
        db.commit()
        return {
            "status": "rejected",
            "proposal_id": row.id,
            "message": row.result_message,
        }
    finally:
        db.close()


def execute_proposal(proposal_id: str, user_id: int, db: Session) -> dict:
    """Approve and execute a proposal exactly once using the caller's session.

    The proposal row is claimed (status approved) before create_product runs,
    so a crash or double click can never create the product twice.
    """
    row = db.get(AiProposal, proposal_id)
    if row is None:
        raise ValueError("Proposal not found.")
    if row.user_id != user_id:
        raise PermissionError("This proposal belongs to another user.")
    if row.status == "approved":
        return {
            "status": "approved",
            "proposal_id": row.id,
            "message": row.result_message or "This proposal was already approved.",
            "product_id": row.product_id,
        }
    if row.status != "pending":
        raise ValueError(f"This proposal is no longer pending (status: {row.status}).")
    if _is_expired(row.created_at):
        row.status = "expired"
        row.executed_at = _utcnow()
        row.result_message = "This proposal expired before it was approved."
        db.commit()
        raise ValueError("This proposal has expired. Please ask for the product again.")

    try:
        payload = json.loads(row.payload_json)
    except json.JSONDecodeError:
        payload = {}

    if row.action == "create_supplier":
        clean = validate_supplier_data(payload)
        supplier_data = build_supplier_create(clean)

        row.status = "approved"
        db.commit()

        try:
            supplier = create_supplier(db, supplier_data)
        except Exception:
            db.rollback()
            db.refresh(row)
            row.status = "failed"
            row.result_message = "Execution failed. Please add the supplier again."
            db.commit()
            raise

        row.product_id = supplier.id
        row.executed_at = _utcnow()
        row.result_message = f"Supplier '{supplier.name}' was created successfully."
        db.commit()
        return {
            "status": "approved",
            "proposal_id": row.id,
            "message": row.result_message,
            "product_id": supplier.id,
            "product_name": supplier.name,
        }

    clean = validate_product_data(payload)
    product_data = build_product_create(clean)

    # Claim first so a repeated request cannot execute twice.
    row.status = "approved"
    db.commit()

    try:
        product = create_product(db, product_data)
    except Exception:
        db.rollback()  # claim survives; product creation rolled back
        db.refresh(row)
        row.status = "failed"
        row.result_message = "Execution failed. Please create the product again."
        db.commit()
        raise

    row.product_id = product.id
    row.executed_at = _utcnow()
    row.result_message = f"Product '{product.name}' was created successfully."
    db.commit()
    return {
        "status": "approved",
        "proposal_id": row.id,
        "message": row.result_message,
        "product_id": product.id,
        "product_name": product.name,
    }
