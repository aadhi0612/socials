from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MediaBase(BaseModel):
    url: str
    type: str  # 'image' or 'video'
    name: Optional[str] = None
    ai_generated: Optional[bool] = False
    created_at: Optional[datetime] = None
    tags: Optional[List[str]] = None

class MediaCreate(MediaBase):
    pass

class MediaOut(MediaBase):
    id: str
    user_id: str 