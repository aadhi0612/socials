import boto3
import os
from dotenv import load_dotenv
from typing import Optional, List
from app.schemas.user import UserOut, UserUpdate

# Load environment variables from .env
load_dotenv()

def get_dynamodb_resource():
    return boto3.resource(
        "dynamodb",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_DEFAULT_REGION"),
    )

dynamodb = get_dynamodb_resource()
table = dynamodb.Table('users')  # Make sure your DynamoDB table is named 'users'

def get_user_by_id(user_id: str) -> Optional[UserOut]:
    response = table.get_item(Key={'id': user_id})
    item = response.get('Item')
    if item:
        item['user_id'] = item['id']
        item.pop('password', None)
        return UserOut(**item)
    return None

def list_users() -> List[UserOut]:
    response = table.scan()
    items = response.get('Items', [])
    users = []
    for item in items:
        item['user_id'] = item['id']
        item.pop('password', None)
        users.append(UserOut(**item))
    return users

def update_user(user_id: str, user_update: UserUpdate) -> Optional[UserOut]:
    update_expr = []
    expr_attr_values = {}
    expr_attr_names = {}
    if user_update.name is not None:
        update_expr.append('#nm = :name')
        expr_attr_values[':name'] = user_update.name
        expr_attr_names['#nm'] = 'name'
    if not update_expr:
        return get_user_by_id(user_id)
    update_expression = 'SET ' + ', '.join(update_expr)
    kwargs = {
        'Key': {'id': user_id},
        'UpdateExpression': update_expression,
        'ExpressionAttributeValues': expr_attr_values
    }
    if expr_attr_names:
        kwargs['ExpressionAttributeNames'] = expr_attr_names
    table.update_item(**kwargs)
    return get_user_by_id(user_id)

def get_user_item_by_id(user_id: str) -> Optional[dict]:
    response = table.get_item(Key={'id': user_id})
    return response.get('Item')

# Add this function for login by email
def get_user_item_by_email(email: str) -> Optional[dict]:
    response = table.scan(FilterExpression='email = :email', ExpressionAttributeValues={':email': email})
    items = response.get('Items', [])
    return items[0] if items else None