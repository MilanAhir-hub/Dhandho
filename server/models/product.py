from sqlalchemy import Integer, String, Float, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from models.user import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=True)     # e.g. "Dal", "Oil", "Soap"
    unit: Mapped[str] = mapped_column(String(20), nullable=False)         # e.g. "kg", "liter", "piece"
    buying_price: Mapped[float] = mapped_column(Float, nullable=False)    # Price owner pays to supplier
    selling_price: Mapped[float] = mapped_column(Float, nullable=False)   # Price charged to customer
    stock_quantity: Mapped[float] = mapped_column(Float, default=0.0)     # Current stock available
    low_stock_alert: Mapped[float] = mapped_column(Float, default=5.0)    # Warn when stock falls below this
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
