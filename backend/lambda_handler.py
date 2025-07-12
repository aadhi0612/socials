import json
import os
from mangum import Mangum
from app.main import app

# Initialize the Mangum adapter for AWS Lambda
handler = Mangum(app, lifespan="off")

# Optional: Add custom event handling if needed
def lambda_handler(event, context):
    """
    AWS Lambda handler function
    """
    try:
        return handler(event, context)
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': 'https://socials.dataopslabs.com',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
                'Access-Control-Allow-Credentials': 'true',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }
