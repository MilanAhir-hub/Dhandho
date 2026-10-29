from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.purchase import Purchase, PurchaseItem
from models.product import Product
from schemas.purchase import PurchaseCreate


def create_purchase(db: Session, data: PurchaseCreate) -> Purchase:
    """
    Records a stock purchase from a supplier:
    1. Validates all products exist.
    2. Calculates subtotals and total.
    3. Saves the Purchase and its PurchaseItems.
    4. Increases stock for each product purchased.
    5. Updates the product's buying_price to the latest purchase price.
    """

    total_amount = 0.0
    purchase_items_data = []

    for item in data.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise ValueError(f"Product ID {item.product_id} not found.")
        subtotal = round(item.quantity * item.unit_price, 2)
        total_amount += subtotal
        purchase_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": subtotal,
        })

    total_amount = round(total_amount, 2)

    # Create the Purchase record
    purchase = Purchase(
        supplier_id=data.supplier_id,
        total_amount=total_amount,
        note=data.note,
    )
    db.add(purchase)
    db.flush()  # Get purchase.id without committing yet

    # Create PurchaseItems, update stock and buying price
    for item_data in purchase_items_data:
        purchase_item = PurchaseItem(
            purchase_id=purchase.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"],
        )
        db.add(purchase_item)
        item_data["product"].stock_quantity += item_data["quantity"]      # Increase stock
        item_data["product"].buying_price = item_data["unit_price"]       # Update latest cost price

    db.commit()
    db.refresh(purchase)
    return purchase


def get_all_purchases(db: Session) -> List[Purchase]:
    return db.scalars(select(Purchase).order_by(Purchase.purchase_date.desc())).all()


def get_purchase_by_id(db: Session, purchase_id: int) -> Optional[Purchase]:
    return db.get(Purchase, purchase_id)


def get_purchase_items(db: Session, purchase_id: int) -> List[PurchaseItem]:
    return db.scalars(select(PurchaseItem).where(PurchaseItem.purchase_id == purchase_id)).all()
