from pydantic import BaseModel, EmailStr
from typing import Optional, Literal

class User(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Literal["Admin", "Editor", "Viewer"]
    avatar: Optional[str] = None
    lastActive: Optional[str] = None  # ISO string