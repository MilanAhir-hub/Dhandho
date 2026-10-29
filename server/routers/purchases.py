from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.purchase import PurchaseCreate, PurchaseResponse, PurchaseItemResponse
from crud.purchase import create_purchase, get_all_purchases, get_purchase_by_id, get_purchase_items

router = APIRouter(prefix="/purchases", tags=["Purchases"])


@router.post("/", response_model=PurchaseResponse, status_code=status.HTTP_201_CREATED)
def add_purchase(data: PurchaseCreate, db: Session = Depends(get_db)):
    """
    Record a stock purchase from a supplier. Automatically:
    - Increases stock for each product purchased.
    - Updates the product's latest buying price.
    """
    try:
        purchase = create_purchase(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    items = get_purchase_items(db, purchase.id)
    return PurchaseResponse(
        id=purchase.id,
        supplier_id=purchase.supplier_id,
        total_amount=purchase.total_amount,
        note=purchase.note,
        purchase_date=purchase.purchase_date,
        items=[PurchaseItemResponse.model_validate(i) for i in items],
    )


@router.get("/", response_model=List[PurchaseResponse])
def list_purchases(db: Session = Depends(get_db)):
    purchases = get_all_purchases(db)
    result = []
    for purchase in purchases:
        items = get_purchase_items(db, purchase.id)
        result.append(PurchaseResponse(
            id=purchase.id,
            supplier_id=purchase.supplier_id,
            total_amount=purchase.total_amount,
            note=purchase.note,
            purchase_date=purchase.purchase_date,
            items=[PurchaseItemResponse.model_validate(i) for i in items],
        ))
    return result


@router.get("/{purchase_id}", response_model=PurchaseResponse)
def get_purchase(purchase_id: int, db: Session = Depends(get_db)):
    purchase = get_purchase_by_id(db, purchase_id)
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found.")
    items = get_purchase_items(db, purchase.id)
    return PurchaseResponse(
        id=purchase.id,
        supplier_id=purchase.supplier_id,
        total_amount=purchase.total_amount,
        note=purchase.note,
        purchase_date=purchase.purchase_date,
        items=[PurchaseItemResponse.model_validate(i) for i in items],
    )
