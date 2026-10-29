from sqlalchemy import Integer, Float, String, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from models.user import Base


class Purchase(Base):
    """
    One row = one purchase order from a supplier.
    e.g. Owner buys 50 kg Atta from Mauli Traders today.
    """
    __tablename__ = "purchases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    supplier_id: Mapped[int] = mapped_column(Integer, ForeignKey("suppliers.id"), nullable=True)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    note: Mapped[str] = mapped_column(String(255), nullable=True)
    purchase_date: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PurchaseItem(Base):
    """
    One row = one product line inside a purchase order.
    e.g. 50 kg Atta at ₹40/kg (buying price) → subtotal ₹2000
    """
    __tablename__ = "purchase_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    purchase_id: Mapped[int] = mapped_column(Integer, ForeignKey("purchases.id"), nullable=False)
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)        # Buying price at the time of purchase
    subtotal: Mapped[float] = mapped_column(Float, nullable=False)          # quantity × unit_price
