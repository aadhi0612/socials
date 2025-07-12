"""
OAuth-based social media posting endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query, Request
from fastapi.responses import RedirectResponse
from typing import Dict, Any, List
import logging
from datetime import datetime
import uuid

from ..services.social_platforms.linkedin import LinkedInPlatform
from ..services.aws_config import aws_config
from ..schemas.social_posts import DirectPostRequest, DirectPostResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/oauth-posts", tags=["oauth-social-posts"])

# In-memory storage for OAuth states (use Redis/DynamoDB in production)
oauth_states = {}
user_tokens = {}  # Store user OAuth tokens (use database in production)

@router.get("/auth/linkedin/connect")
async def connect_linkedin(user_id: int, redirect_base: str = "https://socials.dataopslabs.com"):
    """Initiate LinkedIn OAuth connection"""
    try:
        linkedin = LinkedInPlatform()
        
        # Generate unique state for CSRF protection
        state = str(uuid.uuid4())
        oauth_states[state] = {
            "user_id": user_id,
            "platform": "linkedin",
            "redirect_base": redirect_base,
            "created_at": datetime.utcnow()
        }
        
        # Create redirect URI for production
        redirect_uri = f"{redirect_base}/api/v1/oauth-posts/auth/linkedin/callback"
        
        # Get LinkedIn OAuth URL
        oauth_url = linkedin.get_oauth_url(redirect_uri, state)
        
        return {
            "oauth_url": oauth_url,
            "state": state,
            "message": "Redirect user to oauth_url to complete LinkedIn connection"
        }
        
    except Exception as e:
        logger.error(f"LinkedIn OAuth initiation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/auth/linkedin/callback")
async def linkedin_oauth_callback(
    code: str = Query(...),
    state: str = Query(...),
    error: str = Query(None)
):
    """Handle LinkedIn OAuth callback"""
    try:
        # Check for OAuth errors
        if error:
            return RedirectResponse(
                url=f"https://socials.dataopslabs.com/create?error=linkedin_oauth_failed&message={error}",
                status_code=302
            )
        
        # Validate state
        if state not in oauth_states:
            return RedirectResponse(
                url="https://socials.dataopslabs.com/create?error=invalid_oauth_state",
                status_code=302
            )
        
        oauth_data = oauth_states[state]
        user_id = oauth_data["user_id"]
        redirect_base = oauth_data["redirect_base"]
        
        # Exchange code for tokens
        linkedin = LinkedInPlatform()
        redirect_uri = f"{redirect_base}/api/v1/oauth-posts/auth/linkedin/callback"
        
        tokens = linkedin.exchange_code_for_tokens(code, redirect_uri)
        
        # Get user info
        user_info = linkedin.get_user_info(tokens["access_token"])
        
        # Store tokens (in production, store in database)
        user_tokens[user_id] = {
            "platform": "linkedin",
            "access_token": tokens["access_token"],
            "expires_in": tokens.get("expires_in"),
            "user_info": user_info,
            "connected_at": datetime.utcnow()
        }
        
        # Clean up state
        del oauth_states[state]
        
        # Redirect back to frontend with success
        return RedirectResponse(
            url=f"https://socials.dataopslabs.com/create?success=linkedin_connected&name={user_info.get('name', 'LinkedIn User')}",
            status_code=302
        )
        
    except Exception as e:
        logger.error(f"LinkedIn OAuth callback error: {e}")
        return RedirectResponse(
            url=f"https://socials.dataopslabs.com/create?error=linkedin_oauth_failed&message={str(e)}",
            status_code=302
        )

@router.get("/accounts/{user_id}")
async def get_connected_accounts(user_id: int):
    """Get user's connected social media accounts"""
    try:
        accounts = []
        
        if user_id in user_tokens:
            token_data = user_tokens[user_id]
            accounts.append({
                "id": user_id,
                "platform": token_data["platform"],
                "user_info": token_data["user_info"],
                "connected_at": token_data["connected_at"].isoformat(),
                "status": "active"
            })
        
        return {
            "accounts": accounts,
            "total": len(accounts)
        }
        
    except Exception as e:
        logger.error(f"Error getting connected accounts: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/accounts/{account_id}")
async def disconnect_account(account_id: int, user_id: int):
    """Disconnect a social media account"""
    try:
        if user_id in user_tokens:
            del user_tokens[user_id]
            return {"message": "Account disconnected successfully"}
        else:
            raise HTTPException(status_code=404, detail="Account not found")
            
    except Exception as e:
        logger.error(f"Error disconnecting account: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/immediate")
async def post_with_oauth(post_request: DirectPostRequest):
    """Post to social media using OAuth tokens"""
    try:
        results = []
        
        for platform_name in post_request.platforms:
            if platform_name == "linkedin":
                # Find user with LinkedIn token (simplified - in production, get from request)
                linkedin_user = None
                for user_id, token_data in user_tokens.items():
                    if token_data["platform"] == "linkedin":
                        linkedin_user = (user_id, token_data)
                        break
                
                if not linkedin_user:
                    results.append({
                        "platform": "linkedin",
                        "success": False,
                        "error": "LinkedIn account not connected. Please connect your LinkedIn account first."
                    })
                    continue
                
                user_id, token_data = linkedin_user
                linkedin = LinkedInPlatform()
                
                # Create post content
                from ..services.social_platforms.base import PostContent
                content = PostContent(
                    text=post_request.content_text,
                    media_urls=post_request.media_urls or [],
                    media_type=post_request.media_type
                )
                
                # Post to LinkedIn
                result = linkedin.create_post(content, token_data["access_token"])
                
                results.append({
                    "platform": "linkedin",
                    "success": result.success,
                    "platform_post_id": result.post_id if result.success else None,
                    "error": result.error_message if not result.success else None,
                    "posted_at": result.posted_at.isoformat() if result.posted_at else None
                })
            else:
                results.append({
                    "platform": platform_name,
                    "success": False,
                    "error": f"OAuth posting not implemented for {platform_name}"
                })
        
        successful_posts = sum(1 for r in results if r["success"])
        total_posts = len(results)
        
        return DirectPostResponse(
            success=successful_posts > 0,
            results=results,
            message=f"Posted to {successful_posts}/{total_posts} platforms successfully"
        )
        
    except Exception as e:
        logger.error(f"OAuth posting error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/test-linkedin-connection")
async def test_linkedin_connection():
    """Test LinkedIn OAuth setup"""
    try:
        linkedin = LinkedInPlatform()
        creds_test = linkedin.test_connection()
        
        return {
            "linkedin_oauth": creds_test,
            "oauth_url_sample": linkedin.get_oauth_url(
                "https://socials.dataopslabs.com/api/v1/oauth-posts/auth/linkedin/callback",
                "test-state"
            ),
            "message": "LinkedIn OAuth is configured and ready"
        }
        
    except Exception as e:
        logger.error(f"LinkedIn connection test error: {e}")
        return {
            "error": str(e),
            "message": "LinkedIn OAuth configuration issue"
        }
