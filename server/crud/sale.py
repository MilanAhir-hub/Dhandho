from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.sale import Sale, SaleItem
from models.product import Product
from models.customer import Customer
from schemas.sale import SaleCreate


def create_sale(db: Session, data: SaleCreate) -> Sale:
    """
    Creates a full sale (bill):
    1. Validates all products exist and have enough stock.
    2. Calculates subtotals and total.
    3. Saves the Sale and its SaleItems.
    4. Reduces stock for each product sold.
    5. If payment is udhari, adds total to the customer's udhari_balance.
    """

    # Step 1: Validate products and stock
    total_amount = 0.0
    sale_items_data = []

    for item in data.items:
        product = db.get(Product, item.product_id)
        if not product:
            raise ValueError(f"Product ID {item.product_id} not found.")
        if product.stock_quantity < item.quantity:
            raise ValueError(
                f"Not enough stock for '{product.name}'. "
                f"Available: {product.stock_quantity} {product.unit}, Requested: {item.quantity}."
            )
        subtotal = round(item.quantity * product.selling_price, 2)
        total_amount += subtotal
        sale_items_data.append({
            "product": product,
            "quantity": item.quantity,
            "unit_price": product.selling_price,
            "subtotal": subtotal,
        })

    total_amount = round(total_amount, 2)

    # Step 2: Create the Sale record
    sale = Sale(
        customer_id=data.customer_id,
        total_amount=total_amount,
        payment_type=data.payment_type,
        note=data.note,
    )
    db.add(sale)
    db.flush()  # Get sale.id without committing yet

    # Step 3: Create SaleItems and reduce stock
    for item_data in sale_items_data:
        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=item_data["product"].id,
            quantity=item_data["quantity"],
            unit_price=item_data["unit_price"],
            subtotal=item_data["subtotal"],
        )
        db.add(sale_item)
        item_data["product"].stock_quantity -= item_data["quantity"]  # Reduce stock

    # Step 4: If udhari sale, add to customer's credit balance
    if data.payment_type == "udhari":
        if not data.customer_id:
            raise ValueError("Customer is required for udhari (credit) sales.")
        customer = db.get(Customer, data.customer_id)
        if not customer:
            raise ValueError(f"Customer ID {data.customer_id} not found.")
        customer.udhari_balance += total_amount

    db.commit()
    db.refresh(sale)
    return sale


def get_all_sales(db: Session) -> List[Sale]:
    return db.scalars(select(Sale).order_by(Sale.sale_date.desc())).all()


def get_sale_by_id(db: Session, sale_id: int) -> Optional[Sale]:
    return db.get(Sale, sale_id)


def get_sale_items(db: Session, sale_id: int) -> List[SaleItem]:
    return db.scalars(select(SaleItem).where(SaleItem.sale_id == sale_id)).all()
