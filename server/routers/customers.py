from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from schemas.udhari import UdhariPaymentCreate, UdhariPaymentResponse
from crud.customer import (
    create_customer, get_all_customers, get_customer_by_id,
    update_customer, delete_customer, get_customers_with_udhari,
)
from crud.udhari import record_udhari_payment, get_udhari_payments_for_customer

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def add_customer(data: CustomerCreate, db: Session = Depends(get_db)):
    return create_customer(db, data)


@router.get("/", response_model=List[CustomerResponse])
def list_customers(db: Session = Depends(get_db)):
    return get_all_customers(db)


@router.get("/udhari", response_model=List[CustomerResponse])
def list_customers_with_udhari(db: Session = Depends(get_db)):
    """Returns only customers who have a pending udhari (credit) balance."""
    return get_customers_with_udhari(db)


@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = get_customer_by_id(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return customer


@router.patch("/{customer_id}", response_model=CustomerResponse)
def edit_customer(customer_id: int, data: CustomerUpdate, db: Session = Depends(get_db)):
    customer = update_customer(db, customer_id, data)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_customer(customer_id: int, db: Session = Depends(get_db)):
    deleted = delete_customer(db, customer_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Customer not found.")


# --- Udhari payment routes (nested under customer) ---

@router.post("/{customer_id}/pay-udhari", response_model=UdhariPaymentResponse)
def pay_udhari(customer_id: int, data: UdhariPaymentCreate, db: Session = Depends(get_db)):
    """Record a payment from a customer towards their udhari balance."""
    data.customer_id = customer_id
    try:
        return record_udhari_payment(db, data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{customer_id}/udhari-history", response_model=List[UdhariPaymentResponse])
def udhari_history(customer_id: int, db: Session = Depends(get_db)):
    """Get the full payment history for a customer's udhari."""
    return get_udhari_payments_for_customer(db, customer_id)
