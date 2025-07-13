import json
import os
from mangum import Mangum
from app.main import app

# Initialize the Mangum adapter for AWS Lambda
handler = Mangum(app, lifespan="off")

# Allowed origins
ALLOWED_ORIGINS = [
    "https://main.d2b7ip780trkwd.amplifyapp.com",
    "https://socials.dataopslabs.com",
    "http://localhost:5173",
    "http://localhost:3000"
]

def get_cors_headers(origin=None):
    """Get appropriate CORS headers based on origin"""
    if origin and origin in ALLOWED_ORIGINS:
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json'
        }
    else:
        # Default to Amplify URL if origin not recognized
        return {
            'Access-Control-Allow-Origin': 'https://main.d2b7ip780trkwd.amplifyapp.com',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json'
        }

def lambda_handler(event, context):
    """
    AWS Lambda handler function with guaranteed CORS headers
    """
    # Get origin from headers
    origin = None
    if 'headers' in event:
        origin = event['headers'].get('origin') or event['headers'].get('Origin')
    
    try:
        response = handler(event, context)
        
        # Ensure CORS headers are always present
        if 'headers' not in response:
            response['headers'] = {}
        
        cors_headers = get_cors_headers(origin)
        response['headers'].update(cors_headers)
        
        return response
        
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return {
            'statusCode': 500,
            'headers': get_cors_headers(origin),
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e),
                'detail': 'Please check the logs for more information'
            })
        }
