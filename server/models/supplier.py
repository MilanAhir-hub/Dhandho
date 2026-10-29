from sqlalchemy import Integer, String, DateTime, func
from models.user import Base
from sqlalchemy.orm import Mapped, mapped_column


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    phone: Mapped[str] = mapped_column(String(15), nullable=True)
    company_name: Mapped[str] = mapped_column(String(100), nullable=True)   # e.g. "Mauli Traders", "HUL Distributor"
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
