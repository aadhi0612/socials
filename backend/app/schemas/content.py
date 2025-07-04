from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ContentBase(BaseModel):
    title: str
    body: str
    media: Optional[List[str]] = None
    status: Optional[str] = 'draft'
    platforms: Optional[List[str]] = None
    scheduled_for: Optional[str] = None

class ContentCreate(ContentBase):
    author_id: str

class ContentUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    media: Optional[List[str]] = None
    status: Optional[str] = None
    platforms: Optional[List[str]] = None
    scheduled_for: Optional[str] = None

class ContentOut(ContentBase):
    id: str
    author_id: str
    created_at: datetime
    updated_at: datetime 