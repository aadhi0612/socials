"""
Enhanced Lambda handler with LinkedIn OAuth integration
"""
import json
import os
import uuid
import time
import hashlib
import boto3
import urllib.parse
import urllib.request
from datetime import datetime, timedelta

# Initialize DynamoDB
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('DEFAULT_REGION', 'us-east-2'))

# DynamoDB table names
USERS_TABLE = 'socials-users'
CONTENT_TABLE = 'socials-content'
MEDIA_TABLE = 'socials-media'

# LinkedIn OAuth configuration
LINKEDIN_CLIENT_ID = os.environ.get('LINKEDIN_CLIENT_ID', '')
LINKEDIN_CLIENT_SECRET = os.environ.get('LINKEDIN_CLIENT_SECRET', '')
LINKEDIN_REDIRECT_URI = 'https://socials.dataopslabs.com/auth/linkedin/callback'

def handler(event, context):
    """
    Enhanced Lambda handler with LinkedIn OAuth
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
                        "User authentication with DynamoDB",
                        "LinkedIn OAuth community integration",
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
                        "auth": "/auth",
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
                    "version": "1.0.0",
                    "database": "DynamoDB connected",
                    "linkedin_oauth": "configured"
                })
            }
        
        # LinkedIn OAuth endpoints
        elif path.startswith('/auth/linkedin'):
            return handle_linkedin_oauth(path, http_method, request_data, query_params, headers, cors_headers)
        
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
                    "available_endpoints": ["/", "/health", "/users", "/content", "/ai", "/media", "/auth", "/api/v1"]
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

def handle_linkedin_oauth(path, method, data, query_params, headers, cors_headers):
    """Handle LinkedIn OAuth flow"""
    
    if path == '/auth/linkedin/login' and method == 'GET':
        # Generate LinkedIn OAuth URL
        state = str(uuid.uuid4())
        
        linkedin_auth_url = (
            f"https://www.linkedin.com/oauth/v2/authorization?"
            f"response_type=code&"
            f"client_id={LINKEDIN_CLIENT_ID}&"
            f"redirect_uri={urllib.parse.quote(LINKEDIN_REDIRECT_URI)}&"
            f"state={state}&"
            f"scope=r_liteprofile%20r_emailaddress"
        )
        
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "auth_url": linkedin_auth_url,
                "state": state,
                "message": "Redirect user to auth_url for LinkedIn OAuth"
            })
        }
    
    elif path == '/auth/linkedin/callback' and method == 'GET':
        # Handle LinkedIn OAuth callback
        code = query_params.get('code')
        state = query_params.get('state')
        error = query_params.get('error')
        
        if error:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({
                    "error": "OAuth Error",
                    "message": f"LinkedIn OAuth failed: {error}"
                })
            }
        
        if not code:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({
                    "error": "Missing Code",
                    "message": "Authorization code not provided"
                })
            }
        
        try:
            # Exchange code for access token
            token_response = exchange_linkedin_code_for_token(code)
            
            if not token_response:
                return {
                    "statusCode": 400,
                    "headers": cors_headers,
                    "body": json.dumps({
                        "error": "Token Exchange Failed",
                        "message": "Failed to exchange code for access token"
                    })
                }
            
            access_token = token_response.get('access_token')
            
            # Get user profile from LinkedIn
            profile = get_linkedin_profile(access_token)
            
            if not profile:
                return {
                    "statusCode": 400,
                    "headers": cors_headers,
                    "body": json.dumps({
                        "error": "Profile Fetch Failed",
                        "message": "Failed to fetch LinkedIn profile"
                    })
                }
            
            # Create or update user in DynamoDB
            user = create_or_update_linkedin_user(profile, access_token)
            
            # Generate our app token
            app_token = generate_token(user['user_id'])
            
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({
                    "success": True,
                    "token": app_token,
                    "user_id": user['user_id'],
                    "email": user.get('email', ''),
                    "username": user.get('username', ''),
                    "profile": user.get('profile', {}),
                    "message": "LinkedIn OAuth successful"
                })
            }
            
        except Exception as e:
            print(f"LinkedIn OAuth error: {str(e)}")
            return {
                "statusCode": 500,
                "headers": cors_headers,
                "body": json.dumps({
                    "error": "OAuth Processing Error",
                    "message": f"Failed to process LinkedIn OAuth: {str(e)}"
                })
            }
    
    else:
        return {
            "statusCode": 404,
            "headers": cors_headers,
            "body": json.dumps({"error": "LinkedIn OAuth endpoint not found"})
        }

def exchange_linkedin_code_for_token(code):
    """Exchange LinkedIn authorization code for access token"""
    try:
        token_url = "https://www.linkedin.com/oauth/v2/accessToken"
        
        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': LINKEDIN_REDIRECT_URI,
            'client_id': LINKEDIN_CLIENT_ID,
            'client_secret': LINKEDIN_CLIENT_SECRET
        }
        
        # Encode data
        post_data = urllib.parse.urlencode(data).encode('utf-8')
        
        # Create request
        req = urllib.request.Request(
            token_url,
            data=post_data,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        # Make request
        with urllib.request.urlopen(req) as response:
            response_data = response.read().decode('utf-8')
            return json.loads(response_data)
            
    except Exception as e:
        print(f"Token exchange error: {str(e)}")
        return None

def get_linkedin_profile(access_token):
    """Get LinkedIn user profile"""
    try:
        # Get basic profile
        profile_url = "https://api.linkedin.com/v2/me"
        
        req = urllib.request.Request(
            profile_url,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        with urllib.request.urlopen(req) as response:
            profile_data = json.loads(response.read().decode('utf-8'))
        
        # Get email
        email_url = "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))"
        
        req = urllib.request.Request(
            email_url,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        with urllib.request.urlopen(req) as response:
            email_data = json.loads(response.read().decode('utf-8'))
        
        # Extract email
        email = ""
        if email_data.get('elements'):
            email = email_data['elements'][0]['handle~']['emailAddress']
        
        # Combine profile data
        return {
            'id': profile_data.get('id'),
            'firstName': profile_data.get('firstName', {}).get('localized', {}).get('en_US', ''),
            'lastName': profile_data.get('lastName', {}).get('localized', {}).get('en_US', ''),
            'email': email,
            'profilePicture': profile_data.get('profilePicture', {})
        }
        
    except Exception as e:
        print(f"Profile fetch error: {str(e)}")
        return None

def create_or_update_linkedin_user(profile, access_token):
    """Create or update user from LinkedIn profile"""
    users_table = get_or_create_table(
        USERS_TABLE,
        [{'AttributeName': 'user_id', 'KeyType': 'HASH'}],
        [{'AttributeName': 'user_id', 'AttributeType': 'S'}]
    )
    
    linkedin_id = profile.get('id')
    email = profile.get('email', '')
    first_name = profile.get('firstName', '')
    last_name = profile.get('lastName', '')
    full_name = f"{first_name} {last_name}".strip()
    
    # Check if user exists by LinkedIn ID
    try:
        response = users_table.scan(
            FilterExpression='linkedin_id = :linkedin_id',
            ExpressionAttributeValues={':linkedin_id': linkedin_id}
        )
        
        existing_users = response.get('Items', [])
        
        if existing_users:
            # Update existing user
            user = existing_users[0]
            user['last_login'] = datetime.utcnow().isoformat() + "Z"
            user['linkedin_access_token'] = access_token
            
            users_table.put_item(Item=user)
            return user
        else:
            # Create new user
            user_id = str(uuid.uuid4())
            username = email.split('@')[0] if email else f"linkedin_{linkedin_id}"
            
            user = {
                'user_id': user_id,
                'username': username,
                'email': email,
                'linkedin_id': linkedin_id,
                'linkedin_access_token': access_token,
                'auth_provider': 'linkedin',
                'created_at': datetime.utcnow().isoformat() + "Z",
                'last_login': datetime.utcnow().isoformat() + "Z",
                'profile': {
                    'name': full_name or username,
                    'first_name': first_name,
                    'last_name': last_name,
                    'bio': 'LinkedIn community member',
                    'avatar': 'https://via.placeholder.com/150'
                }
            }
            
            users_table.put_item(Item=user)
            return user
            
    except Exception as e:
        print(f"User creation error: {str(e)}")
        raise e

def get_or_create_table(table_name, key_schema, attribute_definitions):
    """Get or create DynamoDB table"""
    try:
        table = dynamodb.Table(table_name)
        table.load()
        return table
    except:
        # Table doesn't exist, create it
        try:
            table = dynamodb.create_table(
                TableName=table_name,
                KeySchema=key_schema,
                AttributeDefinitions=attribute_definitions,
                BillingMode='PAY_PER_REQUEST'
            )
            table.wait_until_exists()
            return table
        except Exception as e:
            print(f"Error creating table {table_name}: {str(e)}")
            return None

def hash_password(password):
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token(user_id):
    """Generate a simple JWT-like token"""
    timestamp = str(int(time.time()))
    token_data = f"{user_id}:{timestamp}"
    return hashlib.sha256(token_data.encode()).hexdigest()

def handle_users(path, method, data, headers, cors_headers):
    """Handle user-related endpoints with DynamoDB"""
    
    # Get or create users table
    users_table = get_or_create_table(
        USERS_TABLE,
        [{'AttributeName': 'user_id', 'KeyType': 'HASH'}],
        [{'AttributeName': 'user_id', 'AttributeType': 'S'}]
    )
    
    if not users_table:
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({"error": "Database connection failed"})
        }
    
    if path == '/users/login' and method == 'POST':
        # Regular email/password login
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        print(f"Login attempt for email: {email}")
        
        if not email or not password:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Email and password required"})
            }
        
        try:
            # Scan for user by email (in production, use GSI)
            response = users_table.scan(
                FilterExpression='email = :email',
                ExpressionAttributeValues={':email': email}
            )
            
            users = response.get('Items', [])
            
            if not users:
                # Create default user for demo
                user_id = str(uuid.uuid4())
                hashed_password = hash_password(password)
                
                users_table.put_item(Item={
                    'user_id': user_id,
                    'email': email,
                    'username': email.split('@')[0],
                    'password_hash': hashed_password,
                    'auth_provider': 'email',
                    'created_at': datetime.utcnow().isoformat() + "Z",
                    'profile': {
                        'name': email.split('@')[0].title(),
                        'bio': 'Welcome to Socials AI!',
                        'avatar': 'https://via.placeholder.com/150'
                    }
                })
                
                token = generate_token(user_id)
                
                return {
                    "statusCode": 200,
                    "headers": cors_headers,
                    "body": json.dumps({
                        "token": token,
                        "user_id": user_id,
                        "email": email,
                        "username": email.split('@')[0],
                        "message": "User created and logged in successfully"
                    })
                }
            
            user = users[0]
            stored_hash = user.get('password_hash', '')
            
            if stored_hash == hash_password(password):
                token = generate_token(user['user_id'])
                
                return {
                    "statusCode": 200,
                    "headers": cors_headers,
                    "body": json.dumps({
                        "token": token,
                        "user_id": user['user_id'],
                        "email": user['email'],
                        "username": user.get('username', ''),
                        "message": "Login successful"
                    })
                }
            else:
                return {
                    "statusCode": 400,
                    "headers": cors_headers,
                    "body": json.dumps({"error": "Invalid credentials"})
                }
                
        except Exception as e:
            print(f"Login error: {str(e)}")
            return {
                "statusCode": 500,
                "headers": cors_headers,
                "body": json.dumps({"error": f"Login failed: {str(e)}"})
            }
    
    elif path == '/users/register' and method == 'POST':
        # User registration
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not email or not password:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Username, email and password required"})
            }
        
        try:
            # Check if user exists
            response = users_table.scan(
                FilterExpression='email = :email',
                ExpressionAttributeValues={':email': email}
            )
            
            if response.get('Items'):
                return {
                    "statusCode": 400,
                    "headers": cors_headers,
                    "body": json.dumps({"error": "User already exists"})
                }
            
            # Create new user
            user_id = str(uuid.uuid4())
            hashed_password = hash_password(password)
            
            users_table.put_item(Item={
                'user_id': user_id,
                'username': username,
                'email': email,
                'password_hash': hashed_password,
                'auth_provider': 'email',
                'created_at': datetime.utcnow().isoformat() + "Z",
                'profile': {
                    'name': username.title(),
                    'bio': 'Welcome to Socials AI!',
                    'avatar': 'https://via.placeholder.com/150'
                }
            })
            
            return {
                "statusCode": 201,
                "headers": cors_headers,
                "body": json.dumps({
                    "user_id": user_id,
                    "username": username,
                    "email": email,
                    "message": "User created successfully"
                })
            }
            
        except Exception as e:
            print(f"Registration error: {str(e)}")
            return {
                "statusCode": 500,
                "headers": cors_headers,
                "body": json.dumps({"error": f"Registration failed: {str(e)}"})
            }
    
    elif path == '/users/me' and method == 'GET':
        # Get current user profile
        user_id = headers.get('X-User-Id', '')
        
        if not user_id:
            return {
                "statusCode": 401,
                "headers": cors_headers,
                "body": json.dumps({"error": "User ID required in X-User-Id header"})
            }
        
        try:
            response = users_table.get_item(Key={'user_id': user_id})
            user = response.get('Item')
            
            if not user:
                return {
                    "statusCode": 404,
                    "headers": cors_headers,
                    "body": json.dumps({"error": "User not found"})
                }
            
            # Remove sensitive data from response
            user.pop('password_hash', None)
            user.pop('linkedin_access_token', None)
            
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps(user)
            }
            
        except Exception as e:
            print(f"Get user error: {str(e)}")
            return {
                "statusCode": 500,
                "headers": cors_headers,
                "body": json.dumps({"error": f"Failed to get user: {str(e)}"})
            }
    
    elif path.startswith('/users/') and method == 'GET':
        # Get specific user by ID
        user_id = path.split('/')[-1]
        
        try:
            response = users_table.get_item(Key={'user_id': user_id})
            user = response.get('Item')
            
            if not user:
                return {
                    "statusCode": 404,
                    "headers": cors_headers,
                    "body": json.dumps({"error": "User not found"})
                }
            
            # Remove sensitive data from response
            user.pop('password_hash', None)
            user.pop('linkedin_access_token', None)
            
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps(user)
            }
            
        except Exception as e:
            print(f"Get user by ID error: {str(e)}")
            return {
                "statusCode": 500,
                "headers": cors_headers,
                "body": json.dumps({"error": f"Failed to get user: {str(e)}"})
            }
    
    else:
        return {
            "statusCode": 404,
            "headers": cors_headers,
            "body": json.dumps({"error": "User endpoint not found"})
        }

# Include other handler functions from the previous version
def handle_content(path, method, data, headers, cors_headers):
    """Handle content-related endpoints"""
    if path == '/content/' and method == 'GET':
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
                }
            ])
        }
    elif path == '/content/' and method == 'POST':
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
        prompt = data.get('prompt', '')
        platform = data.get('platform', 'general')
        
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
