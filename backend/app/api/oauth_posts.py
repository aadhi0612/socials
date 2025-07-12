"""
OAuth endpoints for social media posting
"""
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from typing import Dict, Any, Optional
from datetime import datetime
import logging
import json
import uuid

from ..services.social_platforms.linkedin import LinkedInPlatform
from ..services.dynamodb_content_service import create_content
from ..schemas.content import ContentCreate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/oauth-posts", tags=["oauth-posts"])

# Platform instances
linkedin_platform = LinkedInPlatform()

# In-memory storage for OAuth states (in production, use Redis or database)
oauth_states = {}

@router.get("/auth/linkedin")
async def linkedin_oauth_start(
    user_id: str = Query(..., description="User ID"),
    redirect_after_auth: str = Query("https://socials.dataopslabs.com", description="Where to redirect after auth")
):
    """Start LinkedIn OAuth flow"""
    
    # Generate state parameter for security
    state = str(uuid.uuid4())
    oauth_states[state] = {
        "user_id": user_id,
        "redirect_after_auth": redirect_after_auth,
        "created_at": datetime.utcnow()
    }
    
    # LinkedIn OAuth URL with correct redirect URI
    redirect_uri = "https://socials.dataopslabs.com/api/v1/oauth-posts/auth/linkedin/callback"
    oauth_url = linkedin_platform.get_oauth_url(redirect_uri, state)
    
    return {
        "oauth_url": oauth_url,
        "state": state,
        "redirect_uri": redirect_uri
    }

@router.get("/auth/linkedin/callback")
async def linkedin_oauth_callback(
    code: str = Query(..., description="OAuth authorization code"),
    state: str = Query(..., description="OAuth state parameter"),
    error: Optional[str] = Query(None, description="OAuth error"),
    error_description: Optional[str] = Query(None, description="OAuth error description")
):
    """Handle LinkedIn OAuth callback"""
    
    if error:
        logger.error(f"LinkedIn OAuth error: {error} - {error_description}")
        return RedirectResponse(
            url=f"https://socials.dataopslabs.com?error=oauth_failed&message={error_description or error}",
            status_code=302
        )
    
    # Validate state parameter
    if state not in oauth_states:
        logger.error(f"Invalid OAuth state: {state}")
        return RedirectResponse(
            url="https://socials.dataopslabs.com?error=invalid_state",
            status_code=302
        )
    
    oauth_data = oauth_states[state]
    user_id = oauth_data["user_id"]
    redirect_after_auth = oauth_data["redirect_after_auth"]
    
    try:
        # Exchange code for tokens
        redirect_uri = "https://socials.dataopslabs.com/api/v1/oauth-posts/auth/linkedin/callback"
        tokens = linkedin_platform.exchange_code_for_tokens(code, redirect_uri)
        
        # Get user info
        user_info = linkedin_platform.get_user_info(tokens["access_token"])
        
        # Get user's LinkedIn pages/organizations
        pages = linkedin_platform.get_user_pages(tokens["access_token"])
        
        # Store tokens and user info (in production, store securely)
        # For now, we'll pass them as URL parameters (not secure for production)
        user_data = {
            "linkedin_user_id": user_info.get("id"),
            "linkedin_name": f"{user_info.get('firstName', {}).get('localized', {}).get('en_US', '')} {user_info.get('lastName', {}).get('localized', {}).get('en_US', '')}",
            "linkedin_email": user_info.get("email", ""),
            "access_token": tokens["access_token"],
            "token_expires_in": tokens.get("expires_in", 5184000),  # Default 60 days
            "pages": pages
        }
        
        # Clean up state
        del oauth_states[state]
        
        # Redirect back to frontend with success
        success_url = f"{redirect_after_auth}?linkedin_auth=success&user_data={json.dumps(user_data)}"
        return RedirectResponse(url=success_url, status_code=302)
        
    except Exception as e:
        logger.error(f"Error in LinkedIn OAuth callback: {e}")
        error_url = f"{redirect_after_auth}?error=oauth_callback_failed&message={str(e)}"
        return RedirectResponse(url=error_url, status_code=302)

@router.post("/linkedin/post")
async def post_to_linkedin(
    request: Dict[str, Any]
):
    """Post content to LinkedIn profile or page"""
    
    try:
        access_token = request.get("access_token")
        content_text = request.get("content_text", "")
        media_urls = request.get("media_urls", [])
        target_urn = request.get("target_urn")  # Optional: for posting to pages
        user_id = request.get("user_id")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="Access token required")
        
        if not content_text and not media_urls:
            raise HTTPException(status_code=400, detail="Content text or media required")
        
        # Create PostContent object
        from ..services.social_platforms.base import PostContent
        post_content = PostContent(
            text=content_text,
            media_urls=media_urls,
            media_type="image" if media_urls else "text"
        )
        
        # Post to LinkedIn
        result = linkedin_platform.post_content(post_content, access_token, target_urn)
        
        if result.success:
            # Store the post in our database
            if user_id:
                try:
                    content_data = ContentCreate(
                        title=content_text[:100] if content_text else "LinkedIn Post",
                        content=content_text,
                        author_id=user_id,
                        platform="linkedin",
                        status="published",
                        media_urls=media_urls,
                        platform_post_id=result.platform_post_id
                    )
                    create_content(content_data)
                except Exception as e:
                    logger.warning(f"Could not store post in database: {e}")
            
            return {
                "success": True,
                "message": "Posted to LinkedIn successfully",
                "platform_post_id": result.platform_post_id,
                "posted_at": result.posted_at.isoformat()
            }
        else:
            return {
                "success": False,
                "error": result.error_message
            }
            
    except Exception as e:
        logger.error(f"Error posting to LinkedIn: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/linkedin/pages")
async def get_linkedin_pages(
    access_token: str = Query(..., description="LinkedIn access token")
):
    """Get LinkedIn pages/organizations that user can manage"""
    
    try:
        pages = linkedin_platform.get_user_pages(access_token)
        return {
            "success": True,
            "pages": pages
        }
    except Exception as e:
        logger.error(f"Error fetching LinkedIn pages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/linkedin/profile")
async def get_linkedin_profile(
    access_token: str = Query(..., description="LinkedIn access token")
):
    """Get LinkedIn user profile information"""
    
    try:
        user_info = linkedin_platform.get_user_info(access_token)
        return {
            "success": True,
            "profile": user_info
        }
    except Exception as e:
        logger.error(f"Error fetching LinkedIn profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/linkedin/validate-token")
async def validate_linkedin_token(
    request: Dict[str, Any]
):
    """Validate LinkedIn access token"""
    
    try:
        access_token = request.get("access_token")
        if not access_token:
            raise HTTPException(status_code=400, detail="Access token required")
        
        is_valid = linkedin_platform.validate_token(access_token)
        return {
            "valid": is_valid
        }
    except Exception as e:
        logger.error(f"Error validating LinkedIn token: {e}")
        raise HTTPException(status_code=500, detail=str(e))
