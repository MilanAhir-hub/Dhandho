from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


# --- Purchase Item (one product line inside a purchase order) ---

class PurchaseItemCreate(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., gt=0)    # Buying price for this batch


class PurchaseItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: float
    unit_price: float
    subtotal: float

    model_config = ConfigDict(from_attributes=True)


# --- Purchase (the full purchase order) ---

class PurchaseCreate(BaseModel):
    supplier_id: Optional[int] = None
    items: List[PurchaseItemCreate] = Field(..., min_length=1)
    note: Optional[str] = None


class PurchaseResponse(BaseModel):
    id: int
    supplier_id: Optional[int]
    total_amount: float
    note: Optional[str]
    purchase_date: datetime
    items: List[PurchaseItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
