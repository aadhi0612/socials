"""
Instagram API integration using Facebook Graph API
"""
import requests
import os
from typing import Dict, Any
from urllib.parse import urlencode
from datetime import datetime
import logging
import time

from .base import BaseSocialPlatform, PostContent, PostResult, PostAnalytics

logger = logging.getLogger(__name__)

class InstagramPlatform(BaseSocialPlatform):
    """Instagram API integration via Facebook Graph API"""
    
    def __init__(self):
        super().__init__("instagram")
        self.base_url = "https://graph.facebook.com/v18.0"
        self.auth_url = "https://www.facebook.com/v18.0/dialog/oauth"
        self.token_url = "https://graph.facebook.com/v18.0/oauth/access_token"
        
        # Try to get platform credentials from AWS Secrets Manager, fallback to env
        try:
            from ..aws_secrets import secrets_manager
            creds = secrets_manager.get_platform_credentials("instagram")
            self.app_id = creds["app_id"]
            self.app_secret = creds["app_secret"]
        except Exception as e:
            logger.warning(f"Could not load Instagram credentials from AWS: {e}")
            # Fallback to environment variables - Instagram credentials would need to be added
            self.app_id = os.getenv("INSTAGRAM_APP_ID")
            self.app_secret = os.getenv("INSTAGRAM_APP_SECRET")
    
    def get_oauth_url(self, redirect_uri: str, state: str = None) -> str:
        """Generate Instagram OAuth authorization URL"""
        params = {
            "client_id": self.app_id,
            "redirect_uri": redirect_uri,
            "scope": "instagram_basic,instagram_content_publish,pages_show_list",
            "response_type": "code",
        }
        if state:
            params["state"] = state
        
        return f"{self.auth_url}?{urlencode(params)}"
    
    def exchange_code_for_tokens(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for Instagram access tokens"""
        # Step 1: Get short-lived token
        params = {
            "client_id": self.app_id,
            "client_secret": self.app_secret,
            "redirect_uri": redirect_uri,
            "code": code
        }
        
        response = requests.get(self.token_url, params=params)
        response.raise_for_status()
        token_data = response.json()
        
        # Step 2: Exchange for long-lived token
        long_lived_params = {
            "grant_type": "fb_exchange_token",
            "client_id": self.app_id,
            "client_secret": self.app_secret,
            "fb_exchange_token": token_data["access_token"]
        }
        
        long_lived_response = requests.get(self.token_url, params=long_lived_params)
        long_lived_response.raise_for_status()
        long_lived_data = long_lived_response.json()
        
        return {
            "access_token": long_lived_data["access_token"],
            "token_type": long_lived_data.get("token_type", "bearer"),
            "expires_in": long_lived_data.get("expires_in", 5184000)  # ~60 days
        }
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh Instagram access token"""
        # Instagram uses long-lived tokens that can be refreshed
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": self.app_id,
            "client_secret": self.app_secret,
            "fb_exchange_token": refresh_token
        }
        
        response = requests.get(self.token_url, params=params)
        response.raise_for_status()
        
        return response.json()
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get Instagram user information"""
        # First get Facebook user info
        params = {"access_token": access_token}
        response = requests.get(f"{self.base_url}/me", params=params)
        response.raise_for_status()
        user_data = response.json()
        
        # Get Instagram business accounts
        accounts_params = {
            "access_token": access_token,
            "fields": "instagram_business_account"
        }
        accounts_response = requests.get(f"{self.base_url}/me/accounts", params=accounts_params)
        accounts_response.raise_for_status()
        accounts_data = accounts_response.json()
        
        # Find Instagram business account
        instagram_account_id = None
        for account in accounts_data.get("data", []):
            if "instagram_business_account" in account:
                instagram_account_id = account["instagram_business_account"]["id"]
                break
        
        return {
            "facebook_user_id": user_data["id"],
            "instagram_account_id": instagram_account_id,
            "name": user_data.get("name"),
        }
    
    def post_content(self, content: PostContent, access_token: str) -> PostResult:
        """Post content to Instagram"""
        try:
            # Get Instagram business account ID
            user_info = self.get_user_info(access_token)
            ig_account_id = user_info.get("instagram_account_id")
            
            if not ig_account_id:
                return PostResult(
                    success=False,
                    error_message="No Instagram Business account found"
                )
            
            # Step 1: Create media container
            if content.media_urls and content.media_type == "image":
                # For image posts
                container_params = {
                    "image_url": content.media_urls[0],  # Instagram API supports one image per post
                    "caption": content.text,
                    "access_token": access_token
                }
            else:
                # Text-only posts are not supported on Instagram
                return PostResult(
                    success=False,
                    error_message="Instagram requires media content (images/videos)"
                )
            
            container_response = requests.post(
                f"{self.base_url}/{ig_account_id}/media",
                data=container_params
            )
            container_response.raise_for_status()
            container_data = container_response.json()
            creation_id = container_data["id"]
            
            # Wait a moment for media processing
            time.sleep(2)
            
            # Step 2: Publish the media
            publish_params = {
                "creation_id": creation_id,
                "access_token": access_token
            }
            
            publish_response = requests.post(
                f"{self.base_url}/{ig_account_id}/media_publish",
                data=publish_params
            )
            publish_response.raise_for_status()
            publish_data = publish_response.json()
            
            return PostResult(
                success=True,
                platform_post_id=publish_data["id"],
                posted_at=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Error posting to Instagram: {e}")
            return PostResult(
                success=False,
                error_message=str(e)
            )
    
    def get_post_analytics(self, post_id: str, access_token: str) -> PostAnalytics:
        """Get Instagram post analytics"""
        try:
            params = {
                "fields": "like_count,comments_count,impressions,reach",
                "access_token": access_token
            }
            
            response = requests.get(f"{self.base_url}/{post_id}/insights", params=params)
            
            if response.status_code == 200:
                data = response.json()
                insights = {item["name"]: item["values"][0]["value"] for item in data.get("data", [])}
                
                return PostAnalytics(
                    likes_count=insights.get("like_count", 0),
                    comments_count=insights.get("comments_count", 0),
                    impressions=insights.get("impressions", 0),
                    reach=insights.get("reach", 0),
                    platform_specific=insights
                )
            else:
                # Fallback to basic media info
                media_params = {
                    "fields": "like_count,comments_count",
                    "access_token": access_token
                }
                media_response = requests.get(f"{self.base_url}/{post_id}", params=media_params)
                
                if media_response.status_code == 200:
                    media_data = media_response.json()
                    return PostAnalytics(
                        likes_count=media_data.get("like_count", 0),
                        comments_count=media_data.get("comments_count", 0),
                        platform_specific=media_data
                    )
                
                return PostAnalytics()
                
        except Exception as e:
            logger.error(f"Error getting Instagram analytics: {e}")
            return PostAnalytics()
    
    def validate_token(self, access_token: str) -> bool:
        """Validate Instagram access token"""
        try:
            params = {"access_token": access_token}
            response = requests.get(f"{self.base_url}/me", params=params)
            return response.status_code == 200
        except:
            return False
