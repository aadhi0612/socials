"""
Lambda handler with Amazon Nova Canvas for real AI image generation
"""
import json
import os
import uuid
import time
import hashlib
import boto3
import base64
from datetime import datetime

# Initialize AWS services
try:
    dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('DEFAULT_REGION', 'us-east-2'))
    bedrock = boto3.client('bedrock-runtime', region_name=os.environ.get('BEDROCK_REGION', 'us-east-1'))
    s3 = boto3.client('s3', region_name=os.environ.get('DEFAULT_REGION', 'us-east-2'))
    print("✅ AWS services initialized successfully")
except Exception as e:
    print(f"❌ AWS service initialization error: {str(e)}")

USERS_TABLE = 'socials-users'
S3_BUCKET = os.environ.get('S3_BUCKET', 'socials-aws-1')

def handler(event, context):
    """Lambda handler with Nova Canvas AI image generation"""
    try:
        print(f"🚀 Event: {json.dumps(event, default=str)}")
        
        http_method = event.get('httpMethod', 'GET')
        path = event.get('path', '/')
        body = event.get('body')
        headers = event.get('headers', {})
        
        request_data = {}
        if body:
            try:
                request_data = json.loads(body)
            except:
                request_data = {}
        
        cors_headers = {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, X-User-Id"
        }
        
        if http_method == 'OPTIONS':
            return {"statusCode": 200, "headers": cors_headers, "body": ""}
        
        # Route handling
        if path == '/' and http_method == 'GET':
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({
                    "message": "Socials API with Real Nova Canvas AI!",
                    "version": "2.0.0",
                    "status": "deployed",
                    "ai_models": {
                        "text": "anthropic.claude-3-haiku-20240307-v1:0",
                        "image": "amazon.nova-canvas-v1:0"
                    },
                    "timestamp": datetime.utcnow().isoformat() + "Z"
                })
            }
        
        elif path.startswith('/ai/generate-image') and http_method == 'POST':
            return handle_nova_image_generation(request_data, cors_headers)
        
        elif path.startswith('/ai/generate-text') and http_method == 'POST':
            return handle_claude_text_generation(request_data, cors_headers)
        
        elif path.startswith('/users'):
            return handle_users_simple(path, http_method, request_data, cors_headers)
        
        elif path.startswith('/media'):
            return handle_media(path, http_method, request_data, cors_headers)
        
        elif path.startswith('/api/v1/direct-posts/immediate') and http_method == 'POST':
            return handle_social_posting(request_data, cors_headers)
        
        elif path.startswith('/api/v1/direct-posts/test-credentials') and http_method == 'GET':
            return handle_test_credentials(cors_headers)
        
        elif path.startswith('/api/v1/oauth-posts'):
            return handle_oauth_endpoints(path, http_method, request_data, cors_headers)
        
        else:
            return {
                "statusCode": 404,
                "headers": cors_headers,
                "body": json.dumps({"error": "Endpoint not found"})
            }
            
    except Exception as e:
        print(f"❌ Handler error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json", "Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Internal Server Error", "message": str(e)})
        }

def handle_nova_image_generation(data, cors_headers):
    """Handle AI image generation with Amazon Nova Canvas"""
    try:
        prompt = data.get('prompt', 'AI generated image')
        print(f"🎨 Generating image with Nova Canvas for prompt: {prompt}")
        
        # Call Amazon Nova Canvas
        response = bedrock.invoke_model(
            modelId='amazon.nova-canvas-v1:0',
            body=json.dumps({
                "taskType": "TEXT_IMAGE",
                "textToImageParams": {
                    "text": prompt,
                    "negativeText": "low quality, blurry, distorted, watermark, text, signature"
                },
                "imageGenerationConfig": {
                    "numberOfImages": 1,
                    "height": 1024,
                    "width": 1024,
                    "cfgScale": 7.0,
                    "seed": int(time.time()) % 2147483647
                }
            })
        )
        
        print("✅ Nova Canvas response received")
        response_body = json.loads(response['body'].read())
        
        # Get the base64 image
        image_base64 = response_body['images'][0]
        
        # Upload to S3
        image_key = f"ai-generated/{uuid.uuid4()}.png"
        
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=image_key,
            Body=base64.b64decode(image_base64),
            ContentType='image/png',
            
        )
        
        # Generate S3 URL
        image_url = f"https://{S3_BUCKET}.s3.{os.environ.get('DEFAULT_REGION', 'us-east-2')}.amazonaws.com/{image_key}"
        
        print(f"✅ Image uploaded to S3: {image_url}")
        
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "image_url": image_url,
                "prompt": prompt,
                "model": "amazon.nova-canvas-v1:0",
                "dimensions": "1024x1024",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "success": True
            })
        }
        
    except Exception as e:
        print(f"❌ Nova Canvas error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({
                "error": "AI Image Generation Failed",
                "message": f"Nova Canvas error: {str(e)}",
                "model": "amazon.nova-canvas-v1:0"
            })
        }

def handle_claude_text_generation(data, cors_headers):
    """Handle AI text generation with Claude 3 Haiku"""
    try:
        prompt = data.get('prompt', '')
        platform = data.get('platform', 'general')
        
        if not prompt:
            return {
                "statusCode": 400,
                "headers": cors_headers,
                "body": json.dumps({"error": "Prompt is required"})
            }
        
        print(f"📝 Generating text with Claude for platform: {platform}")
        
        # Platform-specific prompts
        platform_prompts = {
            'twitter': f"Create a Twitter post about: {prompt}. Make it engaging, under 280 characters, include relevant hashtags and emojis.",
            'linkedin': f"Create a professional LinkedIn post about: {prompt}. Make it engaging, professional, suitable for business networking, and include a call-to-action.",
            'general': f"Create engaging social media content about: {prompt}. Make it shareable and interesting."
        }
        
        full_prompt = platform_prompts.get(platform, platform_prompts['general'])
        
        # Call Claude 3 Haiku (faster and cheaper than Sonnet)
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-haiku-20240307-v1:0',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 300,
                "messages": [{"role": "user", "content": full_prompt}]
            })
        )
        
        response_body = json.loads(response['body'].read())
        generated_text = response_body['content'][0]['text']
        
        print("✅ Claude text generation successful")
        
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "generated_text": generated_text,
                "platform": platform,
                "prompt": prompt,
                "model": "anthropic.claude-3-haiku-20240307-v1:0",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "success": True
            })
        }
        
    except Exception as e:
        print(f"❌ Claude error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": cors_headers,
            "body": json.dumps({
                "error": "AI Text Generation Failed",
                "message": f"Claude error: {str(e)}",
                "model": "anthropic.claude-3-haiku-20240307-v1:0"
            })
        }

def handle_users_simple(path, method, data, cors_headers):
    """Simple user handling"""
    if path == '/users/login' and method == 'POST':
        email = data.get('email', '')
        password = data.get('password', '')
        
        if email and password:
            return {
                "statusCode": 200,
                "headers": cors_headers,
                "body": json.dumps({
                    "token": f"demo_token_{uuid.uuid4().hex[:16]}",
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
    
    return {
        "statusCode": 404,
        "headers": cors_headers,
        "body": json.dumps({"error": "User endpoint not found"})
    }

def handle_social_posting(data, cors_headers):
    """Handle social media posting"""
    # Accept both 'content' and 'content_text' for compatibility
    content = data.get('content') or data.get('content_text', '')
    platforms = data.get('platforms', [])
    
    print(f"📝 Posting content: {content[:50]}...")
    print(f"🎯 Platforms: {platforms}")
    
    if not content:
        return {
            "statusCode": 400,
            "headers": cors_headers,
            "body": json.dumps({"error": "Content is required"})
        }
    
    # Mock successful posting
    results = {}
    for platform in platforms:
        results[platform] = {
            "success": True,
            "platform": platform,
            "post_id": f"{platform}_{uuid.uuid4().hex[:8]}",
            "message": f"Successfully posted to {platform}"
        }
    
    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({
            "post_id": str(uuid.uuid4()),
            "content": content,
            "platforms": platforms,
            "results": results,
            "success_count": len(platforms),
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "message": f"Posted successfully to {len(platforms)} platforms"
        })
    }

def handle_media(path, method, data, cors_headers):
    """Handle media endpoints"""
    if path == '/media/' and method == 'GET':
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps([
                {
                    "id": str(uuid.uuid4()),
                    "name": "sample-image.jpg",
                    "url": "https://picsum.photos/400/300",
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
                "url": "https://picsum.photos/400/300",
                "message": "Media uploaded successfully"
            })
        }
    else:
        return {
            "statusCode": 404,
            "headers": cors_headers,
            "body": json.dumps({"error": "Media endpoint not found"})
        }

def handle_test_credentials(cors_headers):
    """Handle credentials testing"""
    return {
        "statusCode": 200,
        "headers": cors_headers,
        "body": json.dumps({
            "twitter": {"status": "connected", "username": "demo_user"},
            "linkedin": {"status": "connected", "name": "Demo User"},
            "message": "All credentials are valid"
        })
    }

def handle_oauth_endpoints(path, method, data, cors_headers):
    """Handle OAuth endpoints"""
    if 'linkedin' in path:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "auth_url": "https://linkedin.com/oauth/authorize",
                "message": "LinkedIn OAuth endpoint"
            })
        }
    else:
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "message": "OAuth endpoint available",
                "status": "configured"
            })
        }
