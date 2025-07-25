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
    bedrock = boto3.client(
        "bedrock-runtime",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_BEDROCK_REGION"),
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
    bedrock = boto3.client(
        "bedrock-runtime",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_BEDROCK_REGION"),
    )
    try:
        # Use the correct request format for Nova Canvas
        native_request = {
            "taskType": "TEXT_IMAGE",
            "textToImageParams": {
                "text": request.prompt
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
        
        # Create the data URL for the frontend
        image_url = f"data:image/png;base64,{base64_image}" if base64_image else ""
        print("Returning image_url:", image_url)
        
        return {"image_url": image_url}
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e)) 