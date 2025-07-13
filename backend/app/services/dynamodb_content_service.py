import boto3
import os
from dotenv import load_dotenv
from typing import Optional, List
from app.schemas.content import ContentCreate, ContentUpdate, ContentOut
from datetime import datetime
import uuid
from boto3.dynamodb.conditions import Attr

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
table = dynamodb.Table('content')

def create_content(content: ContentCreate) -> ContentOut:
    now = datetime.utcnow().isoformat()
    item = content.dict()
    item['id'] = str(uuid.uuid4())
    item['created_at'] = now
    item['updated_at'] = now
    if 'platforms' not in item:
        item['platforms'] = []
    if 'scheduled_for' not in item:
        item['scheduled_for'] = None
    table.put_item(Item=item)
    return ContentOut(**item)

def get_content(content_id: str) -> Optional[ContentOut]:
    response = table.get_item(Key={'id': content_id})
    item = response.get('Item')
    if item:
        return ContentOut(**item)
    return None

def list_content(author_id: Optional[str] = None) -> List[ContentOut]:
    if author_id:
        response = table.scan(
            FilterExpression=Attr('author_id').eq(author_id)
        )
    else:
        response = table.scan()
    items = response.get('Items', [])
    return [ContentOut(**item) for item in items]

def update_content(content_id: str, content_update: ContentUpdate) -> Optional[ContentOut]:
    update_expr = []
    expr_attr_values = {}
    expr_attr_names = {}
    for field, value in content_update.dict(exclude_unset=True).items():
        update_expr.append(f'#{field} = :{field}')
        expr_attr_values[f':{field}'] = value
        expr_attr_names[f'#{field}'] = field
    if not update_expr:
        return get_content(content_id)
    update_expression = 'SET ' + ', '.join(update_expr) + ', updated_at = :updated_at'
    expr_attr_values[':updated_at'] = datetime.utcnow().isoformat()
    table.update_item(
        Key={'id': content_id},
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expr_attr_values,
        ExpressionAttributeNames=expr_attr_names
    )
    return get_content(content_id)

def delete_content(content_id: str) -> bool:
    table.delete_item(Key={'id': content_id})
    return True 