"""Validation helpers for supplier proposals.

Mirrors :mod:`server.ai.tools.product_tools` for the supplier domain.
The AI assistant parses free-form user text into a ``collected`` dict,
and these functions turn it into a valid supplier payload or raise a
``ValueError`` with a short, user-friendly message that the assistant
can show back to the user.
"""

from typing import Any, Dict

from schemas.supplier import SupplierCreate


def validate_supplier_data(collected: Dict[str, Any]) -> Dict[str, Any]:
    """Validate a collected supplier payload and normalize it.

    Returns a dict with ``name``, ``phone``, and ``company_name`` keys.
    Phone and company name are optional (``None`` when absent); the
    supplier name is required.

    Raises ``ValueError`` with a short, user-facing message when the
    data is invalid.
    """
    name = collected.get("name")
    if not isinstance(name, str) or not name.strip():
        raise ValueError("the supplier name is missing")
    name = name.strip()
    if len(name) > 100:
        raise ValueError("the supplier name is too long (max 100 characters)")

    phone = collected.get("phone")
    if phone is not None and not isinstance(phone, str):
        phone = str(phone)
    if isinstance(phone, str):
        phone = phone.strip()
        if not phone:
            phone = None
        elif len(phone) > 15:
            raise ValueError("the phone number is too long (max 15 characters)")

    company_name = collected.get("company_name")
    if company_name is not None and not isinstance(company_name, str):
        company_name = str(company_name)
    if isinstance(company_name, str):
        company_name = company_name.strip()
        if not company_name:
            company_name = None
        elif len(company_name) > 200:
            raise ValueError("the company name is too long (max 200 characters)")

    return {
        "name": name,
        "phone": phone,
        "company_name": company_name,
    }


def build_supplier_create(clean: Dict[str, Any]) -> SupplierCreate:
    """Build a :class:`~server.schemas.supplier.SupplierCreate` from a
    validated payload produced by :func:`validate_supplier_data`.

    Uses the same schema as the regular supplier endpoint, so a proposal
    that passes validation here will also pass model-level validation.
    """
    return SupplierCreate(
        name=clean["name"],
        phone=clean.get("phone"),
        company_name=clean.get("company_name"),
    )
