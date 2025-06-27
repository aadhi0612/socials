from fastapi import APIRouter, HTTPException
from app.schemas.user import User
from app.services.dynamodb_service import get_dynamodb_resource

router = APIRouter()
dynamodb = get_dynamodb_resource()
table = dynamodb.Table("users")

@router.post("/", response_model=User)
def create_user(user: User):
    table.put_item(Item=user.dict())
    return user

@router.get("/{user_id}", response_model=User)
def get_user(user_id: str):
    response = table.get_item(Key={"id": user_id})
    item = response.get("Item")
    if not item:
        raise HTTPException(status_code=404, detail="User not found")
    return item