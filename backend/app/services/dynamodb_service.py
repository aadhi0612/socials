import boto3
import os
from dotenv import load_dotenv
from typing import Optional, List
from app.schemas.user import UserOut, UserUpdate
from botocore.exceptions import ClientError

# Load environment variables from .env
load_dotenv()

def get_dynamodb_resource():
    # Use IAM role credentials in Lambda, fallback to env vars for local dev
    if os.getenv("AWS_LAMBDA_FUNCTION_NAME"):
        # Running in Lambda, use IAM role
        return boto3.resource("dynamodb", region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-2"))
    else:
        # Local development, use env vars
        return boto3.resource(
            "dynamodb",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-2"),
        )

def create_users_table_if_not_exists():
    """Create users table if it doesn't exist"""
    try:
        dynamodb = get_dynamodb_resource()
        table = dynamodb.create_table(
            TableName='users',
            KeySchema=[
                {
                    'AttributeName': 'id',
                    'KeyType': 'HASH'
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'id',
                    'AttributeType': 'S'
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        table.wait_until_exists()
        print("Created users table")
        return table
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            # Table already exists
            return dynamodb.Table('users')
        else:
            raise e

# Initialize DynamoDB
dynamodb = get_dynamodb_resource()

# Try to get the table, create if it doesn't exist
try:
    table = dynamodb.Table('users')
    # Test if table exists by describing it
    table.table_status
except ClientError as e:
    if e.response['Error']['Code'] == 'ResourceNotFoundException':
        print("Users table not found, creating...")
        table = create_users_table_if_not_exists()
    else:
        raise e

def get_user_by_id(user_id: str) -> Optional[UserOut]:
    try:
        response = table.get_item(Key={'id': user_id})
        item = response.get('Item')
        if item:
            item['user_id'] = item['id']
            item.pop('password', None)
            return UserOut(**item)
        return None
    except Exception as e:
        print(f"Error getting user by id: {e}")
        return None

def list_users() -> List[UserOut]:
    try:
        response = table.scan()
        items = response.get('Items', [])
        users = []
        for item in items:
            item['user_id'] = item['id']
            item.pop('password', None)
            users.append(UserOut(**item))
        return users
    except Exception as e:
        print(f"Error listing users: {e}")
        return []

def update_user(user_id: str, user_update: UserUpdate) -> Optional[UserOut]:
    try:
        update_expr = []
        expr_attr_values = {}
        expr_attr_names = {}
        if user_update.name is not None:
            update_expr.append('#nm = :name')
            expr_attr_values[':name'] = user_update.name
            expr_attr_names['#nm'] = 'name'
        if user_update.profile_pic_url is not None:
            update_expr.append('#pic = :pic')
            expr_attr_values[':pic'] = user_update.profile_pic_url
            expr_attr_names['#pic'] = 'profile_pic_url'
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
    except Exception as e:
        print(f"Error updating user: {e}")
        return None

def get_user_item_by_id(user_id: str) -> Optional[dict]:
    try:
        response = table.get_item(Key={'id': user_id})
        return response.get('Item')
    except Exception as e:
        print(f"Error getting user item by id: {e}")
        return None

# Add this function for login by email
def get_user_item_by_email(email: str) -> Optional[dict]:
    try:
        response = table.scan(FilterExpression='email = :email', ExpressionAttributeValues={':email': email})
        items = response.get('Items', [])
        return items[0] if items else None
    except Exception as e:
        print(f"Error getting user by email: {e}")
        return None