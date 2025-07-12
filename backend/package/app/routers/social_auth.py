"""
Social media authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
import logging

from ..database import get_db
from ..models.social_platforms import User, SocialAccount
from ..services.social_platforms import LinkedInPlatform, InstagramPlatform, TwitterPlatform
from ..services.aws_secrets import secrets_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["social-auth"])

# Platform instances
platforms = {
    "linkedin": LinkedInPlatform(),
    "instagram": InstagramPlatform(), 
    "twitter": TwitterPlatform()
}

@router.get("/{platform}/oauth-url")
async def get_oauth_url(
    platform: str,
    redirect_uri: str = Query(..., description="OAuth redirect URI"),
    state: str = Query(None, description="Optional state parameter"),
    db: Session = Depends(get_db)
):
    """Get OAuth authorization URL for a platform"""
    
    if platform not in platforms:
        raise HTTPException(status_code=400, detail=f"Platform {platform} not supported")
    
    try:
        platform_handler = platforms[platform]
        oauth_url = platform_handler.get_oauth_url(redirect_uri, state)
        
        return {
            "oauth_url": oauth_url,
            "platform": platform,
            "redirect_uri": redirect_uri
        }
    except Exception as e:
        logger.error(f"Error generating OAuth URL for {platform}: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate OAuth URL")

@router.post("/{platform}/callback")
async def oauth_callback(
    platform: str,
    code: str = Query(..., description="OAuth authorization code"),
    redirect_uri: str = Query(..., description="OAuth redirect URI"),
    user_id: int = Query(..., description="User ID"),
    oauth_token: str = Query(None, description="OAuth token (for Twitter)"),
    oauth_verifier: str = Query(None, description="OAuth verifier (for Twitter)"),
    db: Session = Depends(get_db)
):
    """Handle OAuth callback and store user tokens"""
    
    if platform not in platforms:
        raise HTTPException(status_code=400, detail=f"Platform {platform} not supported")
    
    try:
        platform_handler = platforms[platform]
        
        # Exchange code for tokens
        if platform == "twitter":
            if not oauth_token or not oauth_verifier:
                raise HTTPException(status_code=400, detail="Twitter OAuth requires oauth_token and oauth_verifier")
            tokens = platform_handler.exchange_code_for_tokens(oauth_token, oauth_verifier, redirect_uri)
        else:
            tokens = platform_handler.exchange_code_for_tokens(code, redirect_uri)
        
        # Get user info from platform
        if platform == "twitter":
            user_info = platform_handler.get_user_info(
                tokens["access_token"], 
                tokens.get("access_token_secret")
            )
        else:
            user_info = platform_handler.get_user_info(tokens["access_token"])
        
        # Store tokens in AWS Secrets Manager
        token_secret_arn = secrets_manager.store_user_tokens(user_id, platform, tokens)
        
        # Check if social account already exists
        existing_account = db.query(SocialAccount).filter(
            SocialAccount.user_id == user_id,
            SocialAccount.platform == platform,
            SocialAccount.platform_user_id == str(user_info.get("id") or user_info.get("facebook_user_id"))
        ).first()
        
        if existing_account:
            # Update existing account
            existing_account.access_token_secret_arn = token_secret_arn
            existing_account.platform_username = user_info.get("username") or user_info.get("name")
            existing_account.is_active = True
            existing_account.last_used = datetime.utcnow()
            social_account = existing_account
        else:
            # Create new social account
            social_account = SocialAccount(
                user_id=user_id,
                platform=platform,
                platform_user_id=str(user_info.get("id") or user_info.get("facebook_user_id")),
                platform_username=user_info.get("username") or user_info.get("name"),
                access_token_secret_arn=token_secret_arn,
                account_type="personal",  # Default, can be updated later
                is_active=True
            )
            db.add(social_account)
        
        db.commit()
        db.refresh(social_account)
        
        return {
            "success": True,
            "message": f"Successfully connected {platform} account",
            "social_account_id": social_account.id,
            "platform": platform,
            "platform_username": social_account.platform_username
        }
        
    except Exception as e:
        logger.error(f"Error in OAuth callback for {platform}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to connect {platform} account: {str(e)}")

@router.get("/accounts/{user_id}")
async def get_user_social_accounts(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all connected social accounts for a user"""
    
    accounts = db.query(SocialAccount).filter(
        SocialAccount.user_id == user_id,
        SocialAccount.is_active == True
    ).all()
    
    account_list = []
    for account in accounts:
        # Validate token status
        try:
            tokens = secrets_manager.get_secret(account.access_token_secret_arn)
            platform_handler = platforms[account.platform]
            
            if account.platform == "twitter":
                token_valid = platform_handler.validate_token(
                    tokens["access_token"],
                    tokens.get("access_token_secret")
                )
            else:
                token_valid = platform_handler.validate_token(tokens["access_token"])
        except:
            token_valid = False
        
        account_list.append({
            "id": account.id,
            "platform": account.platform,
            "platform_username": account.platform_username,
            "account_type": account.account_type,
            "is_active": account.is_active,
            "token_valid": token_valid,
            "connected_at": account.created_at,
            "last_used": account.last_used
        })
    
    return {"accounts": account_list}

@router.delete("/accounts/{account_id}")
async def disconnect_social_account(
    account_id: int,
    user_id: int = Query(..., description="User ID for authorization"),
    db: Session = Depends(get_db)
):
    """Disconnect a social media account"""
    
    account = db.query(SocialAccount).filter(
        SocialAccount.id == account_id,
        SocialAccount.user_id == user_id
    ).first()
    
    if not account:
        raise HTTPException(status_code=404, detail="Social account not found")
    
    try:
        # Delete tokens from AWS Secrets Manager
        secrets_manager.delete_secret(account.access_token_secret_arn)
        
        # Mark account as inactive
        account.is_active = False
        db.commit()
        
        return {
            "success": True,
            "message": f"Successfully disconnected {account.platform} account"
        }
        
    except Exception as e:
        logger.error(f"Error disconnecting account {account_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to disconnect account")
