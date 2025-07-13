import json
import os
from mangum import Mangum
from app.main import app

# Initialize the Mangum adapter for AWS Lambda
handler = Mangum(app, lifespan="off")

# Allowed origins - TEMPORARILY ALLOW ALL
ALLOWED_ORIGINS = ["*"]

def get_cors_headers(origin=None):
    """Get appropriate CORS headers based on origin"""
    # Allow all origins for demo
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS,PATCH',
        'Access-Control-Allow-Credentials': 'false',  # Must be false when origin is *
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
