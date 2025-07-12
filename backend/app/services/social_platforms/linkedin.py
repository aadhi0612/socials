"""
LinkedIn API integration with OAuth and Page support
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
    """LinkedIn API integration with OAuth and Page support"""
    
    def __init__(self):
        super().__init__("linkedin")
        self.base_url = "https://api.linkedin.com/v2"
        self.auth_url = "https://www.linkedin.com/oauth/v2/authorization"
        self.token_url = "https://www.linkedin.com/oauth/v2/accessToken"
        
        # Use the provided credentials
        self.client_id = os.getenv("LINKEDIN_CLIENT_ID", "86vkop6nen6kvi")
        self.client_secret = os.getenv("LINKEDIN_CLIENT_SECRET", "WPL_AP1.AL44Zi3CwnFkpAz2.1uCXAw==")
    
    def get_oauth_url(self, redirect_uri: str, state: str = None) -> str:
        """Generate LinkedIn OAuth authorization URL with enhanced permissions"""
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            # Enhanced scopes for profile, pages, and posting
            "scope": "r_liteprofile r_emailaddress w_member_social r_organization_social w_organization_social",
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
        profile_data = profile_response.json()
        
        # Get email address
        try:
            email_response = requests.get(
                f"{self.base_url}/emailAddress?q=members&projection=(elements*(handle~))",
                headers=headers
            )
            if email_response.status_code == 200:
                email_data = email_response.json()
                if email_data.get("elements"):
                    profile_data["email"] = email_data["elements"][0]["handle~"]["emailAddress"]
        except Exception as e:
            logger.warning(f"Could not fetch email: {e}")
        
        return profile_data
    
    def get_user_pages(self, access_token: str) -> List[Dict[str, Any]]:
        """Get LinkedIn pages/organizations that user can manage"""
        headers = {"Authorization": f"Bearer {access_token}"}
        
        try:
            # Get organizations where user has admin access
            response = requests.get(
                f"{self.base_url}/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&projection=(elements*(organization~(id,name,logoV2(original~:playableStreams))))",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                pages = []
                
                for element in data.get("elements", []):
                    org = element.get("organization~", {})
                    if org:
                        page_info = {
                            "id": org.get("id"),
                            "name": org.get("name"),
                            "type": "organization",
                            "logo_url": None
                        }
                        
                        # Extract logo URL if available
                        logo_data = org.get("logoV2", {}).get("original~", {})
                        if logo_data.get("elements"):
                            page_info["logo_url"] = logo_data["elements"][0].get("identifiers", [{}])[0].get("identifier")
                        
                        pages.append(page_info)
                
                return pages
            else:
                logger.warning(f"Could not fetch LinkedIn pages: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching LinkedIn pages: {e}")
            return []
    
    def upload_media(self, media_url: str, access_token: str, owner_urn: str = None) -> str:
        """Upload image to LinkedIn and return asset URN"""
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        # If no owner_urn provided, use user's URN
        if not owner_urn:
            user_info = self.get_user_info(access_token)
            owner_urn = f"urn:li:person:{user_info['id']}"
        
        # Step 1: Register upload
        register_data = {
            "registerUploadRequest": {
                "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                "owner": owner_urn,
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
    
    def post_content(self, content: PostContent, access_token: str, target_urn: str = None) -> PostResult:
        """Post content to LinkedIn (profile or page)"""
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "X-Restli-Protocol-Version": "2.0.0"
            }
            
            # Determine author URN (user or organization)
            if target_urn:
                author_urn = target_urn
            else:
                # Default to user's profile
                user_info = self.get_user_info(access_token)
                author_urn = f"urn:li:person:{user_info['id']}"
            
            # Prepare post data
            post_data = {
                "author": author_urn,
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
                    asset_urn = self.upload_media(media_url, access_token, author_urn)
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
