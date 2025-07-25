from fastapi import APIRouter, HTTPException, Body, Depends, Request
from typing import List, Optional
from app.schemas.content import ContentCreate, ContentUpdate, ContentOut
from app.services.dynamodb_content_service import create_content, get_content, list_content, update_content, delete_content
import boto3
import os
from dotenv import load_dotenv

router = APIRouter(prefix="/content", tags=["content"])

@router.post("/", response_model=ContentOut)
def create_content_endpoint(content: ContentCreate):
    return create_content(content)

@router.get("/", response_model=List[ContentOut])
def list_content_endpoint(author_id: Optional[str] = None):
    return list_content(author_id)

@router.get("/{content_id}", response_model=ContentOut)
def get_content_endpoint(content_id: str):
    content = get_content(content_id)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.put("/{content_id}", response_model=ContentOut)
def update_content_endpoint(content_id: str, content_update: ContentUpdate):
    content = update_content(content_id, content_update)
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    return content

@router.delete("/{content_id}")
def delete_content_endpoint(content_id: str):
    delete_content(content_id)
    return {"message": "Content deleted"} 

@router.post("/media/presign-upload")
def presign_upload(post_id: str = Body(...), filename: str = Body(...), filetype: str = Body(...)):
    load_dotenv()
    s3 = boto3.client(
        "s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_DEFAULT_REGION"),
    )
    bucket = os.getenv("AWS_S3_BUCKET")
    s3_key = f"content/{post_id}/{filename}"
    try:
        url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={
                'Bucket': bucket,
                'Key': s3_key,
                'ContentType': filetype
            },
            ExpiresIn=3600
        )
        return {"url": url, "s3_key": s3_key}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 