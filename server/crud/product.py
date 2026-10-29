from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.product import Product
from schemas.product import ProductCreate, ProductUpdate


def create_product(db: Session, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_all_products(db: Session) -> List[Product]:
    return db.scalars(select(Product)).all()


def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
    return db.get(Product, product_id)


def update_product(db: Session, product_id: int, data: ProductUpdate) -> Optional[Product]:
    product = db.get(Product, product_id)
    if not product:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: int) -> bool:
    product = db.get(Product, product_id)
    if not product:
        return False
    db.delete(product)
    db.commit()
    return True


def get_low_stock_products(db: Session) -> List[Product]:
    """Returns all products where current stock is below the low_stock_alert threshold."""
    stmt = select(Product).where(Product.stock_quantity < Product.low_stock_alert)
    return db.scalars(stmt).all()
