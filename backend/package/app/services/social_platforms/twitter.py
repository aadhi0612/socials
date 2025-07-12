"""
Twitter/X API integration with secure credential management
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
    """Twitter/X API integration with Secrets Manager support"""
    
    def __init__(self):
        super().__init__("twitter")
        self._credentials = None
        self._client = None
    
    def _get_credentials(self) -> Dict[str, str]:
        """Get Twitter credentials from Secrets Manager or environment"""
        if not self._credentials:
            try:
                from ..aws_secrets import secrets_manager
                social_creds = secrets_manager.get_social_media_credentials()
                self._credentials = social_creds.get("twitter", {})
                logger.info("✅ Twitter credentials loaded from Secrets Manager")
            except Exception as e:
                logger.warning(f"⚠️ Failed to load from Secrets Manager, using env vars: {e}")
                # Fallback to environment variables
                self._credentials = {
                    "api_key": os.getenv("X_API_KEY"),
                    "api_key_secret": os.getenv("X_API_KEY_SECRET"),
                    "bearer_token": os.getenv("X_BEARER_TOKEN"),
                    "access_token": os.getenv("X_ACCESS_TOKEN"),
                    "access_token_secret": os.getenv("X_ACCESS_TOKEN_SECRET")
                }
        
        return self._credentials
    
    def _get_client(self) -> tweepy.Client:
        """Get authenticated Twitter client"""
        if not self._client:
            creds = self._get_credentials()
            
            self._client = tweepy.Client(
                bearer_token=creds.get("bearer_token"),
                consumer_key=creds.get("api_key"),
                consumer_secret=creds.get("api_key_secret"),
                access_token=creds.get("access_token"),
                access_token_secret=creds.get("access_token_secret"),
                wait_on_rate_limit=True
            )
        
        return self._client
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Twitter API connection and credentials"""
        try:
            client = self._get_client()
            me = client.get_me()
            
            if me.data:
                return {
                    "status": "success",
                    "username": me.data.username,
                    "message": "Twitter credentials are valid",
                    "user_id": str(me.data.id)
                }
            else:
                return {
                    "status": "error",
                    "message": "Failed to get user information"
                }
        except tweepy.Forbidden as e:
            return {
                "status": "error",
                "message": f"Twitter API access forbidden: {str(e)}"
            }
        except tweepy.Unauthorized as e:
            return {
                "status": "error",
                "message": f"Twitter API unauthorized: {str(e)}"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Twitter credentials error: {str(e)}"
            }
    
    def create_post(self, content: PostContent) -> PostResult:
        """Create a post on Twitter"""
        try:
            client = self._get_client()
            
            # Post tweet
            response = client.create_tweet(text=content.text)
            
            if response.data:
                return PostResult(
                    success=True,
                    platform="twitter",
                    post_id=str(response.data['id']),
                    url=f"https://twitter.com/user/status/{response.data['id']}",
                    posted_at=datetime.utcnow()
                )
            else:
                return PostResult(
                    success=False,
                    platform="twitter",
                    error="Failed to create tweet - no response data"
                )
                
        except tweepy.Forbidden as e:
            logger.error(f"Twitter posting forbidden: {e}")
            return PostResult(
                success=False,
                platform="twitter",
                error="Twitter app needs write permissions. Please check your Twitter Developer App settings."
            )
        except tweepy.TweepyException as e:
            logger.error(f"Twitter API error: {e}")
            return PostResult(
                success=False,
                platform="twitter",
                error=f"Twitter API error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Twitter posting error: {e}")
            return PostResult(
                success=False,
                platform="twitter",
                error=str(e)
            )
    
    def get_post_analytics(self, post_id: str) -> PostAnalytics:
        """Get analytics for a Twitter post"""
        try:
            client = self._get_client()
            
            # Get tweet metrics
            tweet = client.get_tweet(
                post_id,
                tweet_fields=['public_metrics', 'created_at']
            )
            
            if tweet.data and tweet.data.public_metrics:
                metrics = tweet.data.public_metrics
                return PostAnalytics(
                    post_id=post_id,
                    platform="twitter",
                    views=metrics.get('impression_count', 0),
                    likes=metrics.get('like_count', 0),
                    shares=metrics.get('retweet_count', 0),
                    comments=metrics.get('reply_count', 0),
                    engagement_rate=self._calculate_engagement_rate(metrics),
                    retrieved_at=datetime.utcnow()
                )
            else:
                return PostAnalytics(
                    post_id=post_id,
                    platform="twitter",
                    error="Failed to retrieve analytics"
                )
                
        except Exception as e:
            logger.error(f"Twitter analytics error: {e}")
            return PostAnalytics(
                post_id=post_id,
                platform="twitter",
                error=str(e)
            )
    
    def _calculate_engagement_rate(self, metrics: Dict[str, int]) -> float:
        """Calculate engagement rate from Twitter metrics"""
        impressions = metrics.get('impression_count', 0)
        if impressions == 0:
            return 0.0
        
        engagements = (
            metrics.get('like_count', 0) +
            metrics.get('retweet_count', 0) +
            metrics.get('reply_count', 0) +
            metrics.get('quote_count', 0)
        )
        
        return (engagements / impressions) * 100
    
    def get_oauth_url(self, redirect_uri: str, state: str) -> str:
        """Get OAuth authorization URL for Twitter"""
        # Twitter OAuth 2.0 PKCE implementation
        # This would require additional setup for OAuth flow
        raise NotImplementedError("Twitter OAuth not implemented yet")
    
    def exchange_code_for_tokens(self, code: str, redirect_uri: str, code_verifier: str = None) -> Dict[str, str]:
        """Exchange OAuth code for access tokens"""
        # Twitter OAuth 2.0 implementation
        raise NotImplementedError("Twitter OAuth not implemented yet")
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information using access token"""
        # Implementation for getting user info
        raise NotImplementedError("Twitter user info not implemented yet")
            logger.info("Twitter credentials loaded from AWS Secrets Manager")
        except Exception as e:
            logger.debug(f"Using Twitter credentials from environment variables")
            # Fallback to environment variables or direct values
            self.api_key = os.getenv("X_API_KEY", "vNcWNgCRzODA5PnuVxzNXIpeX")
            self.api_secret = os.getenv("X_API_KEY_SECRET", "E4Gy99uyAKoG9NI4Wbe3OwhlPCBuTNeiM9mwH03WKc3KSK7Mfz")
            self.bearer_token = os.getenv("X_BEARER_TOKEN", "AAAAAAAAAAAAAAAAAAAAAIsiygEAAAAAWn00eQ%2Ft7sqNq4ID4yphWMLb8F8%3DUNkmlQaQ5MU7NzBTDq1MXP0yOGzhXWoFllVSlMy5aO0K2X4OIS")
            self.access_token = os.getenv("X_ACCESS_TOKEN", "1259751874137186304-1fSNa4hp1RyR7MwvrCujUAwsZ9EUQa")
            self.access_token_secret = os.getenv("X_ACCESS_TOKEN_SECRET", "EYUbEKfGKjxesy8vL4yKfTcS7eMTYjdKMFTPgl8r9L9tY")
    
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
