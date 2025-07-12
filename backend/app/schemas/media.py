from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MediaBase(BaseModel):
    url: str
    type: str  # 'image' or 'video'
    name: Optional[str] = None
    description: Optional[str] = None  # For storing AI prompts or descriptions
    prompt: Optional[str] = None  # Specifically for AI-generated content prompts
    ai_generated: Optional[bool] = False
    created_at: Optional[datetime] = None
    tags: Optional[List[str]] = None

class MediaCreate(MediaBase):
    pass

class MediaOut(MediaBase):
    id: str
    user_id: str 