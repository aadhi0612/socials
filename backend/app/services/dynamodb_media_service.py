import boto3
import os
from dotenv import load_dotenv
from typing import Optional, List
from app.schemas.media import MediaCreate, MediaOut
from datetime import datetime
import uuid

load_dotenv()

def get_dynamodb_resource():
    # Use IAM role credentials in Lambda, fall back to env vars for local development
    if os.getenv('AWS_LAMBDA_FUNCTION_NAME'):
        # Running in Lambda - use IAM role
        return boto3.resource("dynamodb", region_name="us-east-2")
    else:
        # Local development - use environment variables
        return boto3.resource(
            "dynamodb",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_DEFAULT_REGION"),
        )

dynamodb = get_dynamodb_resource()
table = dynamodb.Table('media')

def add_media(user_id: str, media: MediaCreate) -> MediaOut:
    now = datetime.utcnow().isoformat()
    item = media.dict()
    item['id'] = str(uuid.uuid4())
    item['user_id'] = user_id
    item['created_at'] = now
    table.put_item(Item=item)
    return MediaOut(**item)

def list_media(user_id: str) -> List[MediaOut]:
    response = table.scan(FilterExpression='user_id = :uid', ExpressionAttributeValues={':uid': user_id})
    items = response.get('Items', [])
    return [MediaOut(**item) for item in items]

def delete_media(media_id: str) -> bool:
    table.delete_item(Key={'id': media_id})
    return True

def update_media(media_id: str, updates: dict, user_id: str) -> MediaOut:
    # Fetch the item to check ownership
    response = table.get_item(Key={'id': media_id})
    item = response.get('Item')
    if not item:
        raise Exception('Media not found')
    if item.get('user_id') != user_id:
        raise Exception('Not authorized to update this media')
    # Build update expression
    update_expr = []
    expr_attr_values = {}
    for k, v in updates.items():
        update_expr.append(f"{k} = :{k}")
        expr_attr_values[f":{k}"] = v
    if not update_expr:
        return MediaOut(**item)
    update_expr_str = "SET " + ", ".join(update_expr)
    table.update_item(
        Key={'id': media_id},
        UpdateExpression=update_expr_str,
        ExpressionAttributeValues=expr_attr_values
    )
    # Return updated item
    response = table.get_item(Key={'id': media_id})
    item = response.get('Item')
    return MediaOut(**item) 