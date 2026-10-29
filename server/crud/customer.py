from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from models.customer import Customer
from schemas.customer import CustomerCreate, CustomerUpdate


def create_customer(db: Session, data: CustomerCreate) -> Customer:
    customer = Customer(**data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


def get_all_customers(db: Session) -> List[Customer]:
    return db.scalars(select(Customer)).all()


def get_customer_by_id(db: Session, customer_id: int) -> Optional[Customer]:
    return db.get(Customer, customer_id)


def update_customer(db: Session, customer_id: int, data: CustomerUpdate) -> Optional[Customer]:
    customer = db.get(Customer, customer_id)
    if not customer:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int) -> bool:
    customer = db.get(Customer, customer_id)
    if not customer:
        return False
    db.delete(customer)
    db.commit()
    return True


def get_customers_with_udhari(db: Session) -> List[Customer]:
    """Returns all customers who still have a pending udhari balance."""
    stmt = select(Customer).where(Customer.udhari_balance > 0)
    return db.scalars(stmt).all()
