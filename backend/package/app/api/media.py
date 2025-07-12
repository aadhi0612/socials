from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List
from app.schemas.media import MediaCreate, MediaOut
from app.services.dynamodb_media_service import add_media, list_media, delete_media, update_media
from app.api.user import get_current_user_jwt

router = APIRouter(prefix="/media", tags=["media"])

@router.get("/", response_model=List[MediaOut])
def get_media(current_user=Depends(get_current_user_jwt)):
    return list_media(current_user["user_id"])

@router.post("/", response_model=MediaOut)
def create_media(media: MediaCreate, current_user=Depends(get_current_user_jwt)):
    return add_media(current_user["user_id"], media)

@router.delete("/{media_id}")
def remove_media(media_id: str, current_user=Depends(get_current_user_jwt)):
    # Optionally, check ownership before deleting
    delete_media(media_id)
    return {"message": "Media deleted"}

@router.patch("/{media_id}", response_model=MediaOut)
def patch_media(media_id: str, updates: dict = Body(...), current_user=Depends(get_current_user_jwt)):
    # Optionally, check ownership before updating
    return update_media(media_id, updates, current_user["user_id"]) 