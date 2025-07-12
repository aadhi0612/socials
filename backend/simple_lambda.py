"""
Simple Lambda handler for testing
"""
import json
import os

def handler(event, context):
    """
    Simple Lambda handler for testing API Gateway integration
    """
    try:
        # Log the event for debugging
        print(f"Event: {json.dumps(event, default=str)}")
        
        # Get the HTTP method and path
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/')
        
        # Simple routing
        if path == '/' and http_method == 'GET':
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id"
                },
                "body": json.dumps({
                    "message": "Socials API is running!",
                    "version": "1.0.0",
                    "status": "deployed",
                    "environment": "production",
                    "features": [
                        "AI-powered content generation",
                        "Multi-platform posting (LinkedIn, Instagram, Twitter/X)",
                        "Post scheduling and automation",
                        "OAuth authentication",
                        "Analytics collection",
                        "Secure credential storage with AWS services"
                    ],
                    "endpoints": {
                        "users": "/users",
                        "content": "/content",
                        "ai": "/ai",
                        "media": "/media",
                        "social_auth": "/api/v1/auth",
                        "social_posts": "/api/v1/posts",
                        "direct_posts": "/api/v1/direct-posts",
                        "oauth_posts": "/api/v1/oauth-posts",
                        "docs": "/docs",
                        "health": "/health"
                    }
                })
            }
        
        elif path == '/health' and http_method == 'GET':
            return {
                "statusCode": 200,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "status": "healthy", 
                    "timestamp": "2025-07-12T11:00:00Z",
                    "service": "socials-backend",
                    "version": "1.0.0"
                })
            }
        
        # Handle OPTIONS requests for CORS
        elif http_method == 'OPTIONS':
            return {
                "statusCode": 200,
                "headers": {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id"
                },
                "body": ""
            }
        
        # Default response for unhandled routes
        else:
            return {
                "statusCode": 404,
                "headers": {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                },
                "body": json.dumps({
                    "error": "Not Found",
                    "message": f"Path {path} with method {http_method} not found",
                    "available_endpoints": ["/", "/health"]
                })
            }
            
    except Exception as e:
        print(f"Error in lambda_handler: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": json.dumps({
                "error": "Internal Server Error",
                "message": str(e)
            })
        }
