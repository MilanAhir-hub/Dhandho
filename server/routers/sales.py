from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.sale import SaleCreate, SaleResponse, SaleItemResponse
from crud.sale import create_sale, get_all_sales, get_sale_by_id, get_sale_items

router = APIRouter(prefix="/sales", tags=["Sales"])


@router.post("/", response_model=SaleResponse, status_code=status.HTTP_201_CREATED)
def make_sale(data: SaleCreate, db: Session = Depends(get_db)):
    """
    Create a new sale (bill). Automatically:
    - Reduces stock for each item sold.
    - Adds to customer's udhari_balance if payment_type is 'udhari'.
    """
    try:
        sale = create_sale(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    items = get_sale_items(db, sale.id)
    return SaleResponse(
        id=sale.id,
        customer_id=sale.customer_id,
        total_amount=sale.total_amount,
        payment_type=sale.payment_type,
        note=sale.note,
        sale_date=sale.sale_date,
        items=[SaleItemResponse.model_validate(i) for i in items],
    )


@router.get("/", response_model=List[SaleResponse])
def list_sales(db: Session = Depends(get_db)):
    sales = get_all_sales(db)
    result = []
    for sale in sales:
        items = get_sale_items(db, sale.id)
        result.append(SaleResponse(
            id=sale.id,
            customer_id=sale.customer_id,
            total_amount=sale.total_amount,
            payment_type=sale.payment_type,
            note=sale.note,
            sale_date=sale.sale_date,
            items=[SaleItemResponse.model_validate(i) for i in items],
        ))
    return result


@router.get("/{sale_id}", response_model=SaleResponse)
def get_sale(sale_id: int, db: Session = Depends(get_db)):
    sale = get_sale_by_id(db, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found.")
    items = get_sale_items(db, sale.id)
    return SaleResponse(
        id=sale.id,
        customer_id=sale.customer_id,
        total_amount=sale.total_amount,
        payment_type=sale.payment_type,
        note=sale.note,
        sale_date=sale.sale_date,
        items=[SaleItemResponse.model_validate(i) for i in items],
    )
