from pydantic import BaseModel, EmailStr
from typing import Optional, Literal, List
import uuid

class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Literal["Admin", "Editor", "Viewer"]
    avatar: Optional[str] = None
    lastActive: Optional[str] = None  # ISO string

class UserOut(BaseModel):
    user_id: str
    email: EmailStr
    name: Optional[str] = None
    role: str
    is_active: bool

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None

class UserListOut(BaseModel):
    users: List[UserOut]