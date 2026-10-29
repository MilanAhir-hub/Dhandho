from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UdhariPaymentCreate(BaseModel):
    customer_id: int
    amount_paid: float = Field(..., gt=0)
    note: Optional[str] = None


class UdhariPaymentResponse(BaseModel):
    id: int
    customer_id: int
    amount_paid: float
    note: Optional[str]
    payment_date: datetime

    model_config = ConfigDict(from_attributes=True)
