from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SupplierCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=15)
    company_name: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    company_name: Optional[str] = None


class SupplierResponse(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    company_name: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
