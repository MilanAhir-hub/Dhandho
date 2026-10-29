from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.product import ProductCreate, ProductUpdate, ProductResponse
from crud.product import (
    create_product, get_all_products, get_product_by_id,
    update_product, delete_product, get_low_stock_products,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def add_product(data: ProductCreate, db: Session = Depends(get_db)):
    return create_product(db, data)


@router.get("/", response_model=List[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    products = get_all_products(db)
    result = []
    for p in products:
        p_dict = {
            "id": p.id, "name": p.name, "category": p.category, "unit": p.unit,
            "buying_price": p.buying_price, "selling_price": p.selling_price,
            "stock_quantity": p.stock_quantity, "low_stock_alert": p.low_stock_alert,
            "is_low_stock": p.stock_quantity < p.low_stock_alert,
            "created_at": p.created_at,
        }
        result.append(ProductResponse(**p_dict))
    return result


@router.get("/low-stock", response_model=List[ProductResponse])
def list_low_stock(db: Session = Depends(get_db)):
    """Returns products that are running low on stock."""
    products = get_low_stock_products(db)
    return [
        ProductResponse(
            id=p.id, name=p.name, category=p.category, unit=p.unit,
            buying_price=p.buying_price, selling_price=p.selling_price,
            stock_quantity=p.stock_quantity, low_stock_alert=p.low_stock_alert,
            is_low_stock=True, created_at=p.created_at,
        )
        for p in products
    ]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return ProductResponse(
        id=product.id, name=product.name, category=product.category, unit=product.unit,
        buying_price=product.buying_price, selling_price=product.selling_price,
        stock_quantity=product.stock_quantity, low_stock_alert=product.low_stock_alert,
        is_low_stock=product.stock_quantity < product.low_stock_alert,
        created_at=product.created_at,
    )


@router.patch("/{product_id}", response_model=ProductResponse)
def edit_product(product_id: int, data: ProductUpdate, db: Session = Depends(get_db)):
    product = update_product(db, product_id, data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")
    return ProductResponse(
        id=product.id, name=product.name, category=product.category, unit=product.unit,
        buying_price=product.buying_price, selling_price=product.selling_price,
        stock_quantity=product.stock_quantity, low_stock_alert=product.low_stock_alert,
        is_low_stock=product.stock_quantity < product.low_stock_alert,
        created_at=product.created_at,
    )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_product(product_id: int, db: Session = Depends(get_db)):
    deleted = delete_product(db, product_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found.")
