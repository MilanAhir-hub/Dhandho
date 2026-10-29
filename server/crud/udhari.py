from typing import List
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.udhari import UdhariPayment
from models.customer import Customer
from schemas.udhari import UdhariPaymentCreate


def record_udhari_payment(db: Session, data: UdhariPaymentCreate) -> UdhariPayment:
    """
    When a customer pays back their credit (khata):
    1. Validates the customer exists.
    2. Validates they are not paying more than what they owe.
    3. Records the payment.
    4. Reduces the customer's udhari_balance.
    """
    customer = db.get(Customer, data.customer_id)
    if not customer:
        raise ValueError(f"Customer ID {data.customer_id} not found.")

    if data.amount_paid > customer.udhari_balance:
        raise ValueError(
            f"Payment of ₹{data.amount_paid} exceeds udhari balance of ₹{customer.udhari_balance:.2f}."
        )

    payment = UdhariPayment(
        customer_id=data.customer_id,
        amount_paid=data.amount_paid,
        note=data.note,
    )
    db.add(payment)
    customer.udhari_balance = round(customer.udhari_balance - data.amount_paid, 2)
    db.commit()
    db.refresh(payment)
    return payment


def get_udhari_payments_for_customer(db: Session, customer_id: int) -> List[UdhariPayment]:
    stmt = select(UdhariPayment).where(UdhariPayment.customer_id == customer_id).order_by(UdhariPayment.payment_date.desc())
    return db.scalars(stmt).all()
