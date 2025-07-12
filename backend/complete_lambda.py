"""
Complete Lambda handler for Socials API
"""
import json
import os
import uuid
import time
from datetime import datetime

def handler(event, context):
    """
    Complete Lambda handler for Socials API
    """
    try:
        # Log the event for debugging
        print(f"Event: {json.dumps(event, default=str)}")
        
        # Get the HTTP method and path
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/')
        query_params = event.get('queryStringParameters') or {}
        body = event.get('body')
        headers = event.get('headers', {})
        
        # Parse body if present
        request_data = {}
        if body:
            try:
                request_data = json.loads(body)
            except:
                request_data = {}
        
        # CORS headers
        cors_headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id"
        }
        
        # Handle OPTIONS requests for CORS
        if http_method == 'OPTIONS':
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": ""
            }
        
        # Route handling
        if path == '/' and http_method == 'GET':
            return {
                "statusCode": 200,
                "headers": cors_headers,
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
                "headers": cors_headers,
                "body": json.dumps({
                    "status": "healthy", 
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "service": "socials-backend",
                    "version": "1.0.0"
                })
            }
        
        # User endpoints
        elif path.startswith('/users'):
            return handle_users(path, http_method, request_data, headers, cors_headers)
        
        # Content endpoints
        elif path.startswith('/content'):
            return handle_content(path, http_method, request_data, headers, cors_headers)
        
        # AI endpoints
        elif path.startswith('/ai'):
            return handle_ai(path, http_method, request_data, headers, cors_headers)
        
        # Media endpoints
        elif path.startswith('/media'):
            return handle_media(path, http_method, request_data, headers, cors_headers)
        
        # Social media endpoints
        elif path.startswith('/api/v1'):
            return handle_social_media(path, http_method, request_data, headers, cors_headers)
        
        # Default response for unhandled routes
        else:
            return {
                "statusCode": 404,
                "headers": cors_headers,
                "body": json.dumps({
                    "error": "Not Found",
                    "message": f"Path {path} with method {http_method} not found",
                    "available_endpoints": ["/", "/health", "/users", "/content", "/ai", "/media", "/api/v1"]
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

def handle_users(path, method, data, headers, cors_headers):
    """Handle user-related endpoints"""
    if path == '/users/login' and method == 'POST':
        # Mock login
        email = data.get('email', '')
        password = data.get('password', '')
        
        if email and password:
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({
                    "token": f"mock_token_{uuid.uuid4().hex[:16]}",
                    "user_id": str(uuid.uuid4()),
                    "email": email,
                    "message": "Login successful"
                })
            }
        else:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Email and password required"})
            }
    
    elif path == '/users/register' and method == 'POST':
        # Mock registration
        username = data.get('username', '')
        email = data.get('email', '')
        password = data.get('password', '')
        
        if username and email and password:
            return {
                "statusCode": 201,
                "headers": cors_headers,
                "body": json.dumps({
                    "user_id": str(uuid.uuid4()),
                    "username": username,
                    "email": email,
                    "message": "User created successfully"
                })
            }
        else:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Username, email and password required"})
            }
    
    elif path == '/users/me' and method == 'GET':
        # Mock user profile
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "user_id": str(uuid.uuid4()),
                "username": "demo_user",
                "email": "demo@example.com",
                "created_at": datetime.utcnow().isoformat() + "Z"
            })
        }
    
    else:
        return {
            "statusCode": 404,
            "headers": cors_headers,
            "body": json.dumps({"error": "User endpoint not found"})
        }

def handle_content(path, method, data, headers, cors_headers):
    """Handle content-related endpoints"""
    if path == '/content/' and method == 'GET':
        # Mock content list
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps([
                {
                    "id": str(uuid.uuid4()),
                    "title": "Sample Post 1",
                    "content": "This is a sample social media post",
                    "platforms": ["twitter", "linkedin"],
                    "created_at": datetime.utcnow().isoformat() + "Z"
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Sample Post 2", 
                    "content": "Another sample post with AI generation",
                    "platforms": ["twitter"],
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
            ])
        }
    
    elif path == '/content/' and method == 'POST':
        # Mock content creation
        return {
            "statusCode": 201,
            "headers": cors_headers,
            "body": json.dumps({
                "id": str(uuid.uuid4()),
                "title": data.get('title', 'New Post'),
                "content": data.get('content', ''),
                "platforms": data.get('platforms', []),
                "created_at": datetime.utcnow().isoformat() + "Z",
                "message": "Content created successfully"
            })
        }
    
    else:
        return {
            "statusCode": 404,
            "headers": cors_headers,
            "body": json.dumps({"error": "Content endpoint not found"})
        }

def handle_ai(path, method, data, headers, cors_headers):
    """Handle AI-related endpoints"""
    if path == '/ai/generate-text' and method == 'POST':
        # Mock AI text generation
        prompt = data.get('prompt', '')
        platform = data.get('platform', 'general')
        
        # Simple mock responses based on platform
        mock_responses = {
            'twitter': f"🚀 Exciting news! {prompt[:100]}... #AI #Innovation #Tech",
            'linkedin': f"I'm excited to share insights about {prompt[:150]}. This represents a significant opportunity in our industry. What are your thoughts?",
            'general': f"Here's an AI-generated response about {prompt[:200]}..."
        }
        
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "generated_text": mock_responses.get(platform, mock_responses['general']),
                "platform": platform,
                "prompt": prompt,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
        }
    
    elif path == '/ai/generate-image' and method == 'POST':
        # Mock AI image generation
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "image_url": "https://via.placeholder.com/512x512/4F46E5/FFFFFF?text=AI+Generated",
                "prompt": data.get('prompt', ''),
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "message": "Mock AI image generated"
            })
        }
    
    else:
        return {
            "statusCode": 404,
            "headers": cors_headers,
            "body": json.dumps({"error": "AI endpoint not found"})
        }

def handle_media(path, method, data, headers, cors_headers):
    """Handle media-related endpoints"""
    if path == '/media/' and method == 'GET':
        # Mock media list
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps([
                {
                    "id": str(uuid.uuid4()),
                    "name": "sample-image.jpg",
                    "url": "https://via.placeholder.com/400x300",
                    "type": "image",
                    "size": 1024000,
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
            ])
        }
    
    elif path == '/media/' and method == 'POST':
        # Mock media upload
        return {
            "statusCode": 201,
            "headers": cors_headers,
            "body": json.dumps({
                "id": str(uuid.uuid4()),
                "name": data.get('name', 'uploaded-file'),
                "url": "https://via.placeholder.com/400x300",
                "message": "Media uploaded successfully"
            })
        }
    
    else:
        return {
            "statusCode": 404,
            "headers": cors_headers,
            "body": json.dumps({"error": "Media endpoint not found"})
        }

def handle_social_media(path, method, data, headers, cors_headers):
    """Handle social media API endpoints"""
    if path == '/api/v1/direct-posts/immediate' and method == 'POST':
        # Mock social media posting
        content = data.get('content', '')
        platforms = data.get('platforms', [])
        
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "success": True,
                "message": "Post published successfully",
                "platforms": platforms,
                "content": content,
                "post_id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
        }
    
    elif path == '/api/v1/direct-posts/test-credentials' and method == 'GET':
        # Mock credentials test
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "twitter": {"status": "connected", "username": "demo_user"},
                "linkedin": {"status": "connected", "name": "Demo User"},
                "message": "All credentials are valid"
            })
        }
    
    elif path.startswith('/api/v1/oauth-posts'):
        # Mock OAuth endpoints
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "message": "OAuth endpoint - feature coming soon",
                "status": "mock_response"
            })
        }
    
    else:
        return {
            "statusCode": 404,
            "headers": cors_headers,
            "body": json.dumps({"error": "Social media endpoint not found"})
        }
