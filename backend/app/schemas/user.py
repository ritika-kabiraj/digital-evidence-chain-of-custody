from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class RoleOut(RoleBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    wallet_address: Optional[str] = None
    badge_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role_id: int

class UserOut(UserBase):
    id: str
    role_id: int
    role: Optional[RoleOut] = None
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
