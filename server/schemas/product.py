from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = None
    unit: str = Field(..., description="e.g. kg, liter, piece, packet")
    buying_price: float = Field(..., gt=0)
    selling_price: float = Field(..., gt=0)
    stock_quantity: float = Field(default=0.0, ge=0)
    low_stock_alert: float = Field(default=5.0, ge=0)


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    buying_price: Optional[float] = None
    selling_price: Optional[float] = None
    low_stock_alert: Optional[float] = None


class ProductResponse(BaseModel):
    id: int
    name: str
    category: Optional[str]
    unit: str
    buying_price: float
    selling_price: float
    stock_quantity: float
    low_stock_alert: float
    is_low_stock: bool = False       # Computed field — True when stock < low_stock_alert
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
