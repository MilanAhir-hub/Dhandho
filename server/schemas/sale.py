from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field


# --- Sale Item (one product line inside a bill) ---

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    unit_price: float
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


# --- Sale (the full bill) ---

class SaleCreate(BaseModel):
    customer_id: Optional[int] = None                          # None = walk-in cash customer
    payment_type: Literal["cash", "udhari"] = "cash"
    items: List[SaleItemCreate] = Field(..., min_length=1)     # At least one item required
    note: Optional[str] = None


class SaleResponse(BaseModel):
    id: int
    customer_id: Optional[int]
    total_amount: float
    payment_type: str
    note: Optional[str]
    sale_date: datetime
    items: List[SaleItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
