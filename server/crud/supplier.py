from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.supplier import Supplier
from schemas.supplier import SupplierCreate, SupplierUpdate


def create_supplier(db: Session, data: SupplierCreate) -> Supplier:
    supplier = Supplier(**data.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


def get_all_suppliers(db: Session) -> List[Supplier]:
    return db.scalars(select(Supplier)).all()


def get_supplier_by_id(db: Session, supplier_id: int) -> Optional[Supplier]:
    return db.get(Supplier, supplier_id)


def update_supplier(db: Session, supplier_id: int, data: SupplierUpdate) -> Optional[Supplier]:
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(supplier, field, value)
    db.commit()
    db.refresh(supplier)
    return supplier


def delete_supplier(db: Session, supplier_id: int) -> bool:
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        return False
    db.delete(supplier)
    db.commit()
    return True
