from sqlalchemy import Integer, Float, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from models.user import Base


class Sale(Base):
    """
    One row = one bill at the shop counter.
    A sale can be CASH (paid immediately) or UDHARI (customer pays later).
    customer_id is nullable — walk-in anonymous customer doesn't need to be registered.
    """
    __tablename__ = "sales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=True)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_type: Mapped[str] = mapped_column(String(10), nullable=False)   # "cash" or "udhari"
    note: Mapped[str] = mapped_column(String(255), nullable=True)
    sale_date: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SaleItem(Base):
    """
    One row = one product line inside a bill.
    e.g. 2 kg Atta at ₹45/kg → subtotal ₹90
    """
    __tablename__ = "sale_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sale_id: Mapped[int] = mapped_column(Integer, ForeignKey("sales.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)        # Selling price at the time of sale
    subtotal: Mapped[float] = mapped_column(Float, nullable=False)          # quantity × unit_price
