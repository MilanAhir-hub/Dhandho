from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.supplier import SupplierCreate, SupplierUpdate, SupplierResponse
from crud.supplier import (
    create_supplier, get_all_suppliers, get_supplier_by_id,
    update_supplier, delete_supplier,
)

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def add_supplier(data: SupplierCreate, db: Session = Depends(get_db)):
    return create_supplier(db, data)


@router.get("/", response_model=List[SupplierResponse])
def list_suppliers(db: Session = Depends(get_db)):
    return get_all_suppliers(db)


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = get_supplier_by_id(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    return supplier


@router.patch("/{supplier_id}", response_model=SupplierResponse)
def edit_supplier(supplier_id: int, data: SupplierUpdate, db: Session = Depends(get_db)):
    supplier = update_supplier(db, supplier_id, data)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    return supplier


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_supplier(supplier_id: int, db: Session = Depends(get_db)):
    deleted = delete_supplier(db, supplier_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Supplier not found.")
