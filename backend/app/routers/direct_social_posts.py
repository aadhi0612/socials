"""
Direct social media posting using platform credentials (no OAuth required)
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

from ..database import get_db
from ..services.social_platforms import LinkedInPlatform, TwitterPlatform
from ..services.social_platforms.base import PostContent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/direct-posts", tags=["direct-social-posts"])

class DirectPostRequest(BaseModel):
    content_text: str
    media_urls: Optional[List[str]] = None
    media_type: str = "text"
    platforms: List[str]  # ["linkedin", "twitter"]

class DirectPostResponse(BaseModel):
    success: bool
    results: List[dict]
    message: str

@router.post("/immediate", response_model=DirectPostResponse)
async def post_immediately_direct(
    post_request: DirectPostRequest,
    db: Session = Depends(get_db)
):
    """Post immediately to social media platforms using direct API credentials"""
    
    if not post_request.platforms:
        raise HTTPException(status_code=400, detail="At least one platform must be specified")
    
    # Available platforms
    available_platforms = {
        "linkedin": LinkedInPlatform(),
        "twitter": TwitterPlatform()
    }
    
    results = []
    
    for platform_name in post_request.platforms:
        if platform_name not in available_platforms:
            results.append({
                "platform": platform_name,
                "success": False,
                "error": f"Platform {platform_name} not supported"
            })
            continue
        
        try:
            platform_handler = available_platforms[platform_name]
            
            # Create PostContent object
            content = PostContent(
                text=post_request.content_text,
                media_urls=post_request.media_urls or [],
                media_type=post_request.media_type
            )
            
            # Post using platform-specific method
            if platform_name == "twitter":
                result = await post_to_twitter_direct(platform_handler, content)
            elif platform_name == "linkedin":
                result = await post_to_linkedin_direct(platform_handler, content)
            else:
                result = {
                    "success": False,
                    "error": f"Direct posting not implemented for {platform_name}"
                }
            
            results.append({
                "platform": platform_name,
                "success": result["success"],
                "platform_post_id": result.get("platform_post_id"),
                "error": result.get("error"),
                "posted_at": result.get("posted_at")
            })
            
        except Exception as e:
            logger.error(f"Error posting to {platform_name}: {e}")
            results.append({
                "platform": platform_name,
                "success": False,
                "error": str(e)
            })
    
    successful_posts = sum(1 for r in results if r["success"])
    total_posts = len(results)
    
    return DirectPostResponse(
        success=successful_posts > 0,
        results=results,
        message=f"Posted to {successful_posts}/{total_posts} platforms successfully"
    )

async def post_to_twitter_direct(platform_handler: TwitterPlatform, content: PostContent):
    """Post directly to Twitter using API credentials"""
    try:
        import tweepy
        
        # Create Twitter API client using stored credentials
        client = tweepy.Client(
            bearer_token=platform_handler.bearer_token,
            consumer_key=platform_handler.api_key,
            consumer_secret=platform_handler.api_secret,
            access_token=platform_handler.access_token,
            access_token_secret=platform_handler.access_token_secret,
            wait_on_rate_limit=True
        )
        
        # Post tweet
        if content.media_urls and len(content.media_urls) > 0:
            # For now, just post text - media upload requires additional handling
            response = client.create_tweet(text=content.text)
        else:
            response = client.create_tweet(text=content.text)
        
        return {
            "success": True,
            "platform_post_id": str(response.data['id']),
            "posted_at": datetime.utcnow().isoformat()
        }
        
    except tweepy.Forbidden as e:
        logger.error(f"Twitter posting forbidden: {e}")
        return {
            "success": False,
            "error": "Twitter app needs write permissions. Please check your Twitter Developer App settings and ensure it has 'Read and Write' permissions."
        }
    except tweepy.TweepyException as e:
        logger.error(f"Twitter API error: {e}")
        return {
            "success": False,
            "error": f"Twitter API error: {str(e)}"
        }
    except Exception as e:
        logger.error(f"Twitter posting error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

async def post_to_linkedin_direct(platform_handler: LinkedInPlatform, content: PostContent):
    """Post directly to LinkedIn using API credentials"""
    try:
        import requests
        
        # For LinkedIn, we need a user access token, not just client credentials
        # This is a limitation - LinkedIn requires OAuth for posting
        # For now, return an informative error
        return {
            "success": False,
            "error": "LinkedIn requires OAuth authentication for posting. Please connect your LinkedIn account first."
        }
        
    except Exception as e:
        logger.error(f"LinkedIn posting error: {e}")
        return {
            "success": False,
            "error": str(e)
        }

@router.get("/test-credentials")
async def test_platform_credentials():
    """Test if platform credentials are properly configured"""
    
    results = {}
    
    # Test Twitter credentials
    try:
        twitter_platform = TwitterPlatform()
        import tweepy
        
        client = tweepy.Client(
            bearer_token=twitter_platform.bearer_token,
            consumer_key=twitter_platform.api_key,
            consumer_secret=twitter_platform.api_secret,
            access_token=twitter_platform.access_token,
            access_token_secret=twitter_platform.access_token_secret
        )
        
        # Test by getting user info
        me = client.get_me()
        results["twitter"] = {
            "status": "success",
            "username": me.data.username if me.data else "unknown",
            "message": "Twitter credentials are valid"
        }
        
    except Exception as e:
        results["twitter"] = {
            "status": "error",
            "message": f"Twitter credentials error: {str(e)}"
        }
    
    # Test LinkedIn credentials
    try:
        linkedin_platform = LinkedInPlatform()
        results["linkedin"] = {
            "status": "configured",
            "client_id": linkedin_platform.client_id[:10] + "..." if linkedin_platform.client_id else "Not set",
            "message": "LinkedIn client credentials are configured (OAuth required for posting)"
        }
        
    except Exception as e:
        results["linkedin"] = {
            "status": "error",
            "message": f"LinkedIn credentials error: {str(e)}"
        }
    
    return {
        "credentials_test": results,
        "note": "Twitter can post directly, LinkedIn requires OAuth authentication"
    }

async def post_to_linkedin_direct(platform_handler: LinkedInPlatform, content: PostContent):
    """Post directly to LinkedIn (requires OAuth token - placeholder implementation)"""
    try:
        # LinkedIn requires OAuth tokens for posting
        # This is a placeholder that explains the requirement
        return {
            "success": False,
            "error": "LinkedIn posting requires OAuth authentication. Please connect your LinkedIn account first. Direct API posting is not supported by LinkedIn - OAuth flow is required.",
            "posted_at": datetime.utcnow().isoformat()
        }
        
        # Note: If you have a stored OAuth token, you could use:
        # result = platform_handler.post_content(content, access_token)
        # return {
        #     "success": result.success,
        #     "platform_post_id": result.platform_post_id,
        #     "posted_at": result.posted_at.isoformat() if result.posted_at else None,
        #     "error": result.error_message if not result.success else None
        # }
        
    except Exception as e:
        logger.error(f"LinkedIn posting error: {e}")
        return {
            "success": False,
            "error": str(e)
        }
