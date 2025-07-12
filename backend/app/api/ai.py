from fastapi import APIRouter, HTTPException, Body
import boto3
import os
from dotenv import load_dotenv
import json
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["ai"])

class PromptRequest(BaseModel):
    prompt: str

class ImagePromptRequest(BaseModel):
    prompt: str

@router.post("/generate-text")
def generate_text(request: PromptRequest):
    load_dotenv()
    
    # In Lambda, use IAM roles instead of explicit credentials
    bedrock = boto3.client(
        "bedrock-runtime",
        region_name=os.getenv("AWS_BEDROCK_REGION", "us-east-1"),
    )
    
    try:
        response = bedrock.invoke_model(
            modelId="amazon.nova-pro-v1:0",  # or "amazon.nova-lite-v1:0" for a lighter model
            contentType="application/json",
            accept="application/json",
            body=json.dumps({
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "text": request.prompt
                            }
                        ]
                    }
                ]
            })
        )
        result = response['body'].read().decode('utf-8')
        print("Raw model response:", result)  # Debug log
        data = json.loads(result)
        print("Parsed data:", data)
        generated_text = ""
        try:
            if "output" in data:
                message = data["output"].get("message", {})
                content = message.get("content", [])
                if content and isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict) and "text" in block:
                            generated_text = block["text"]
                            break
        except Exception as e:
            print("Error parsing model response:", e)
        return {"generated_text": generated_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-image")
def generate_image(request: ImagePromptRequest):
    load_dotenv()
    
    # In Lambda, use IAM roles instead of explicit credentials
    bedrock = boto3.client(
        "bedrock-runtime",
        region_name=os.getenv("AWS_BEDROCK_REGION", "us-east-1"),
    )
    s3 = boto3.client(
        "s3",
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-2"),
    )
    
    def get_short_name(prompt, max_words=6, max_length=30):
        clean = ''.join(c if c.isalnum() or c.isspace() else '' for c in prompt)
        words = ' '.join(clean.split()[:max_words])
        if len(words) > max_length:
            words = words[:max_length].strip()
        return words or 'ai_image'
    
    try:
        # Use the correct request format for Nova Canvas
        native_request = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": request.prompt  # Use the actual user prompt
            },
            "imageGenerationConfig": {
                "numberOfImages": 1,
                "quality": "standard",
                "height": 512,
                "width": 512,
                "seed": 0  # You can make this random if needed
            }
        }
        
        response = bedrock.invoke_model(
            modelId="amazon.nova-canvas-v1:0",
            contentType="application/json",
            accept="application/json",
            body=json.dumps(native_request)
        )
        
        result = response['body'].read().decode('utf-8')
        print("Raw model response:", result)  # Debug log
        
        data = json.loads(result)
        print("Parsed data:", data)
        
        # Extract base64 image data directly from the images array
        base64_image = ""
        if "images" in data and len(data["images"]) > 0:
            base64_image = data["images"][0]
        
        if not base64_image:
            raise HTTPException(status_code=500, detail="No image generated")
        
        # Upload directly to S3
        import base64
        import uuid
        
        # Decode base64 image
        image_data = base64.b64decode(base64_image)
        
        # Generate unique filename
        image_id = str(uuid.uuid4())
        s3_key = f"ai-generated/{image_id}.png"
        bucket = os.getenv("AWS_S3_BUCKET", "socials-aws-1")
        
        # Upload to S3
        s3.put_object(
            Bucket=bucket,
            Key=s3_key,
            Body=image_data,
            ContentType="image/png",
            Metadata={
                "prompt": request.prompt,
                "generated_by": "amazon-nova-canvas"
            }
        )
        
        # Generate S3 URL
        region = os.getenv("AWS_DEFAULT_REGION", "us-east-2")
        s3_url = f"https://{bucket}.s3.{region}.amazonaws.com/{s3_key}"
        
        # Generate a descriptive name from the prompt
        name = f"AI: {get_short_name(request.prompt)}"
        
        return {
            "id": image_id,
            "url": s3_url,
            "name": name,
            "prompt": request.prompt,  # Return the actual user prompt
            "description": request.prompt,  # Use prompt as description
            "type": "image",
            "ai_generated": True,
            "message": "AI image generated and uploaded successfully"
        }
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 