"""
Twitter/X API integration
"""
import tweepy
import requests
import os
from typing import Dict, Any
from urllib.parse import urlencode
from datetime import datetime
import logging

from .base import BaseSocialPlatform, PostContent, PostResult, PostAnalytics

logger = logging.getLogger(__name__)

class TwitterPlatform(BaseSocialPlatform):
    """Twitter/X API integration"""
    
    def __init__(self):
        super().__init__("twitter")
        
        # Try to get platform credentials from AWS Secrets Manager, fallback to env
        try:
            from ..aws_secrets import secrets_manager
            creds = secrets_manager.get_platform_credentials("twitter")
            self.api_key = creds["api_key"]
            self.api_secret = creds["api_secret"]
            self.bearer_token = creds.get("bearer_token")
        except Exception as e:
            logger.warning(f"Could not load Twitter credentials from AWS: {e}")
            # Fallback to environment variables or direct values
            self.api_key = os.getenv("X_API_KEY", "vNcWNgCRzODA5PnuVxzNXIpeX")
            self.api_secret = os.getenv("X_API_KEY_SECRET", "E4Gy99uyAKoG9NI4Wbe3OwhlPCBuTNeiM9mwH03WKc3KSK7Mfz")
            self.bearer_token = os.getenv("X_BEARER_TOKEN", "AAAAAAAAAAAAAAAAAAAAAIsiygEAAAAAWn00eQ%2Ft7sqNq4ID4yphWMLb8F8%3DUNkmlQaQ5MU7NzBTDq1MXP0yOGzhXWoFllVSlMy5aO0K2X4OIS")
    
    def get_oauth_url(self, redirect_uri: str, state: str = None) -> str:
        """Generate Twitter OAuth authorization URL"""
        # Using OAuth 1.0a flow
        auth = tweepy.OAuth1UserHandler(
            self.api_key,
            self.api_secret,
            callback=redirect_uri
        )
        
        try:
            redirect_url = auth.get_authorization_url()
            return redirect_url
        except tweepy.TweepyException as e:
            logger.error(f"Error getting Twitter OAuth URL: {e}")
            raise
    
    def exchange_code_for_tokens(self, oauth_token: str, oauth_verifier: str, redirect_uri: str = None) -> Dict[str, Any]:
        """Exchange OAuth verifier for Twitter access tokens"""
        auth = tweepy.OAuth1UserHandler(
            self.api_key,
            self.api_secret
        )
        
        try:
            auth.request_token = {"oauth_token": oauth_token, "oauth_token_secret": ""}
            access_token, access_token_secret = auth.get_access_token(oauth_verifier)
            
            return {
                "access_token": access_token,
                "access_token_secret": access_token_secret,
                "oauth_token": oauth_token,
                "oauth_verifier": oauth_verifier
            }
        except tweepy.TweepyException as e:
            logger.error(f"Error exchanging Twitter OAuth tokens: {e}")
            raise
    
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Twitter OAuth 1.0a tokens don't expire, no refresh needed"""
        raise NotImplementedError("Twitter OAuth 1.0a tokens don't require refresh")
    
    def get_user_info(self, access_token: str, access_token_secret: str = None) -> Dict[str, Any]:
        """Get Twitter user information"""
        auth = tweepy.OAuth1UserHandler(
            self.api_key,
            self.api_secret,
            access_token,
            access_token_secret
        )
        
        api = tweepy.API(auth)
        
        try:
            user = api.verify_credentials()
            return {
                "id": user.id,
                "username": user.screen_name,
                "name": user.name,
                "profile_image_url": user.profile_image_url,
                "followers_count": user.followers_count,
                "following_count": user.friends_count
            }
        except tweepy.TweepyException as e:
            logger.error(f"Error getting Twitter user info: {e}")
            raise
    
    def upload_media(self, media_url: str, access_token: str, access_token_secret: str = None) -> str:
        """Upload media to Twitter"""
        auth = tweepy.OAuth1UserHandler(
            self.api_key,
            self.api_secret,
            access_token,
            access_token_secret
        )
        
        api = tweepy.API(auth)
        
        try:
            # Download media from URL
            response = requests.get(media_url)
            response.raise_for_status()
            
            # Upload to Twitter
            media = api.media_upload(filename="temp_media", file=response.content)
            return media.media_id
        except Exception as e:
            logger.error(f"Error uploading media to Twitter: {e}")
            raise
    
    def post_content(self, content: PostContent, access_token: str, access_token_secret: str = None) -> PostResult:
        """Post content to Twitter"""
        try:
            auth = tweepy.OAuth1UserHandler(
                self.api_key,
                self.api_secret,
                access_token,
                access_token_secret
            )
            
            api = tweepy.API(auth)
            
            # Handle media uploads
            media_ids = []
            if content.media_urls and content.media_type == "image":
                for media_url in content.media_urls[:4]:  # Twitter allows max 4 images
                    media_id = self.upload_media(media_url, access_token, access_token_secret)
                    media_ids.append(media_id)
            
            # Post tweet
            if media_ids:
                tweet = api.update_status(status=content.text, media_ids=media_ids)
            else:
                tweet = api.update_status(status=content.text)
            
            return PostResult(
                success=True,
                platform_post_id=str(tweet.id),
                posted_at=datetime.utcnow()
            )
            
        except tweepy.TweepyException as e:
            logger.error(f"Error posting to Twitter: {e}")
            return PostResult(
                success=False,
                error_message=str(e)
            )
        except Exception as e:
            logger.error(f"Unexpected error posting to Twitter: {e}")
            return PostResult(
                success=False,
                error_message=str(e)
            )
    
    def get_post_analytics(self, post_id: str, access_token: str, access_token_secret: str = None) -> PostAnalytics:
        """Get Twitter post analytics"""
        auth = tweepy.OAuth1UserHandler(
            self.api_key,
            self.api_secret,
            access_token,
            access_token_secret
        )
        
        api = tweepy.API(auth)
        
        try:
            tweet = api.get_status(post_id)
            
            return PostAnalytics(
                likes_count=tweet.favorite_count,
                comments_count=0,  # Twitter API doesn't provide reply count easily
                shares_count=tweet.retweet_count,
                platform_specific={
                    "retweet_count": tweet.retweet_count,
                    "favorite_count": tweet.favorite_count,
                    "created_at": tweet.created_at.isoformat(),
                    "lang": tweet.lang
                }
            )
            
        except tweepy.TweepyException as e:
            logger.error(f"Error getting Twitter analytics: {e}")
            return PostAnalytics()
    
    def validate_token(self, access_token: str, access_token_secret: str = None) -> bool:
        """Validate Twitter access token"""
        try:
            auth = tweepy.OAuth1UserHandler(
                self.api_key,
                self.api_secret,
                access_token,
                access_token_secret
            )
            
            api = tweepy.API(auth)
            api.verify_credentials()
            return True
        except:
            return False
