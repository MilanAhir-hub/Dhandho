from sqlalchemy import Integer, Float, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from models.user import Base


class UdhariPayment(Base):
    """
    When a customer comes in and pays back their credit (khata), 
    we record it here and reduce their udhari_balance in the customers table.
    """
    __tablename__ = "udhari_payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    amount_paid: Mapped[float] = mapped_column(Float, nullable=False)
    note: Mapped[str] = mapped_column(String(255), nullable=True)           # e.g. "Paid via UPI"
    payment_date: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
