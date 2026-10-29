from sqlalchemy import Integer, String, Float, DateTime, func
from models.user import Base
from sqlalchemy.orm import Mapped, mapped_column


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(15), nullable=True, unique=True)
    address: Mapped[str] = mapped_column(String(255), nullable=True)
    udhari_balance: Mapped[float] = mapped_column(Float, default=0.0)    # Total credit/khata amount pending
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
