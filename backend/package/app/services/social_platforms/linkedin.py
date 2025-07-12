"""
LinkedIn API integration
"""
import requests
import json
import os
from typing import Dict, Any, List
from urllib.parse import urlencode
from datetime import datetime
import logging

from .base import BaseSocialPlatform, PostContent, PostResult, PostAnalytics

logger = logging.getLogger(__name__)

class LinkedInPlatform(BaseSocialPlatform):
    """LinkedIn API integration"""
    
    def __init__(self):
        super().__init__("linkedin")
        self.base_url = "https://api.linkedin.com/v2"
        self.auth_url = "https://www.linkedin.com/oauth/v2/authorization"
        self.token_url = "https://www.linkedin.com/oauth/v2/accessToken"
        
        # Try to get platform credentials from AWS Secrets Manager, fallback to env
        try:
            from ..aws_secrets import secrets_manager
            creds = secrets_manager.get_platform_credentials("linkedin")
            self.client_id = creds["client_id"]
            self.client_secret = creds["client_secret"]
            logger.info("LinkedIn credentials loaded from AWS Secrets Manager")
        except Exception as e:
            logger.debug(f"Using LinkedIn credentials from environment variables")
            # Fallback to environment variables or direct values
            self.client_id = os.getenv("LINKEDIN_CLIENT_ID", "86vkop6nen6kvi")
            self.client_secret = os.getenv("LINKEDIN_CLIENT_SECRET", "WPL_AP1.AL44Zi3CwnFkpAz2.1uCXAw==")
    
    def get_oauth_url(self, redirect_uri: str, state: str = None) -> str:
        """Generate LinkedIn OAuth authorization URL"""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "scope": "r_liteprofile r_emailaddress w_member_social",
        }
        if state:
            params["state"] = state
        
        return f"{self.auth_url}?{urlencode(params)}"
    
    def exchange_code_for_tokens(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for LinkedIn access tokens"""
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri,
            "client_id": self.client_id,
            "client_secret": self.client_secret,
        }
        
        response = requests.post(self.token_url, data=data)
        response.raise_for_status()
        
        return response.json()
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """LinkedIn tokens are typically long-lived, refresh not commonly needed"""
        # LinkedIn access tokens are typically valid for 60 days
        # Refresh tokens are not commonly used in LinkedIn OAuth flow
        raise NotImplementedError("LinkedIn typically uses long-lived tokens")
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get LinkedIn user profile information"""
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # Get basic profile
        profile_response = requests.get(
            f"{self.base_url}/people/~:(id,firstName,lastName,profilePicture(displayImage~:playableStreams))",
            headers=headers
        )
        profile_response.raise_for_status()
        
        return profile_response.json()
    
    def upload_media(self, media_url: str, access_token: str) -> str:
        """Upload image to LinkedIn and return asset URN"""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        # Get user URN first
        user_info = self.get_user_info(access_token)
        person_urn = f"urn:li:person:{user_info['id']}"
        
        # Step 1: Register upload
        register_data = {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": person_urn,
                "serviceRelationships": [
                    {
                        "relationshipType": "OWNER",
                        "identifier": "urn:li:userGeneratedContent"
                    }
                ]
            }
        }
        
        register_response = requests.post(
            f"{self.base_url}/assets?action=registerUpload",
            headers=headers,
            json=register_data
        )
        register_response.raise_for_status()
        
        upload_info = register_response.json()
        asset_urn = upload_info["value"]["asset"]
        upload_url = upload_info["value"]["uploadMechanism"]["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"]["uploadUrl"]
        
        # Step 2: Upload image
        # Download image from media_url
        image_response = requests.get(media_url)
        image_response.raise_for_status()
        
        upload_headers = {"Authorization": f"Bearer {access_token}"}
        upload_response = requests.put(upload_url, headers=upload_headers, data=image_response.content)
        upload_response.raise_for_status()
        
        return asset_urn
    
    def post_content(self, content: PostContent, access_token: str) -> PostResult:
        """Post content to LinkedIn"""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            }
            
            # Get user info
            user_info = self.get_user_info(access_token)
            person_urn = f"urn:li:person:{user_info['id']}"
            
            # Prepare post data
            post_data = {
                "author": person_urn,
                "lifecycleState": "PUBLISHED",
                "specificContent": {
                    "com.linkedin.ugc.ShareContent": {
                        "shareCommentary": {
                            "text": content.text
                        },
                        "shareMediaCategory": "NONE"
                    }
                },
                "visibility": {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
                }
            }
            
            # Handle media if present
            if content.media_urls and content.media_type == "image":
                media_assets = []
                for media_url in content.media_urls:
                    asset_urn = self.upload_media(media_url, access_token)
                    media_assets.append({
                        "status": "READY",
                        "description": {
                            "text": content.text
                        },
                        "media": asset_urn,
                        "title": {
                            "text": "Image"
                        }
                    })
                
                post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
                post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = media_assets
            
            # Post to LinkedIn
            response = requests.post(
                f"{self.base_url}/ugcPosts",
                headers=headers,
                json=post_data
            )
            response.raise_for_status()
            
            result = response.json()
            post_id = result.get("id")
            
            return PostResult(
                success=True,
                platform_post_id=post_id,
                posted_at=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Error posting to LinkedIn: {e}")
            return PostResult(
                success=False,
                error_message=str(e)
            )
    
    def get_post_analytics(self, post_id: str, access_token: str) -> PostAnalytics:
        """Get LinkedIn post analytics"""
        headers = {"Authorization": f"Bearer {access_token}"}
        
        try:
            # LinkedIn analytics require special permissions and different endpoints
            # This is a simplified version - full implementation would use Social Actions API
            response = requests.get(
                f"{self.base_url}/socialActions/{post_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                return PostAnalytics(
                    likes_count=data.get("numLikes", 0),
                    comments_count=data.get("numComments", 0),
                    shares_count=data.get("numShares", 0),
                    platform_specific=data
                )
            else:
                return PostAnalytics()
                
        except Exception as e:
            logger.error(f"Error getting LinkedIn analytics: {e}")
            return PostAnalytics()
    
    def validate_token(self, access_token: str) -> bool:
        """Validate LinkedIn access token"""
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            response = requests.get(f"{self.base_url}/people/~", headers=headers)
            return response.status_code == 200
        except:
            return False
