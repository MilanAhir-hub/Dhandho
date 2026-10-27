from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# Schema 1: Data needed when a user wants to REGISTER
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="Valid email address")
    password: str = Field(..., min_length=6, description="Password with minimum 6 characters")


# Schema 2: Data needed when a user wants to LOGIN
class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., description="User password")


# Schema 3: Data safe to RETURN to the client
# Notice: password is excluded so it is NEVER leaked!
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    # In Pydantic v2, from_attributes=True allows converting 
    # SQLAlchemy database objects directly into Pydantic models
    model_config = ConfigDict(from_attributes=True)
