"""
AWS Lambda handler for serverless deployment
"""
import json
import os
from mangum import Mangum
from app.main import app

# Set environment for Lambda
os.environ.setdefault("AWS_LAMBDA_FUNCTION_NAME", "socials-api")

# Create Lambda handler
handler = Mangum(app, lifespan="off")

def lambda_handler(event, context):
    """
    AWS Lambda handler function
    """
    try:
        # Log the event for debugging
        print(f"Event: {json.dumps(event, default=str)}")
        
        # Handle the request
        response = handler(event, context)
        
        # Log the response for debugging
        print(f"Response: {json.dumps(response, default=str)}")
        
        return response
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            },
            "body": json.dumps({
                "detail": "Internal server error",
                "error": str(e)
            })
        }
