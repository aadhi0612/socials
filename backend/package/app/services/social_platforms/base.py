"""
Base class for social media platform integrations
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class PostContent:
    """Standardized post content structure"""
    text: str
    media_urls: List[str] = None
    media_type: str = "text"  # 'text', 'image', 'video', 'carousel'
    scheduled_for: datetime = None

@dataclass
class PostResult:
    """Result of posting to a platform"""
    success: bool
    platform_post_id: Optional[str] = None
    error_message: Optional[str] = None
    posted_at: Optional[datetime] = None

@dataclass
class PostAnalytics:
    """Analytics data from a platform"""
    likes_count: int = 0
    comments_count: int = 0
    shares_count: int = 0
    impressions: int = 0
    reach: int = 0
    platform_specific: Dict[str, Any] = None

class BaseSocialPlatform(ABC):
    """Base class for all social media platform integrations"""
    
    def __init__(self, platform_name: str):
        self.platform_name = platform_name
    
    @abstractmethod
    def get_oauth_url(self, redirect_uri: str, state: str = None) -> str:
        """Generate OAuth authorization URL"""
        pass
    
    @abstractmethod
    def exchange_code_for_tokens(self, code: str, redirect_uri: str) -> Dict[str, Any]:
        """Exchange authorization code for access tokens"""
        pass
    
    @abstractmethod
    def refresh_access_token(self, refresh_token: str) -> Dict[str, Any]:
        """Refresh expired access token"""
        pass
    
    @abstractmethod
    def post_content(self, content: PostContent, access_token: str) -> PostResult:
        """Post content to the platform"""
        pass
    
    @abstractmethod
    def get_post_analytics(self, post_id: str, access_token: str) -> PostAnalytics:
        """Get analytics for a specific post"""
        pass
    
    @abstractmethod
    def validate_token(self, access_token: str) -> bool:
        """Validate if access token is still valid"""
        pass
    
    def upload_media(self, media_url: str, access_token: str) -> str:
        """Upload media to platform (if required). Override in subclasses."""
        return media_url
    
    def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from platform. Override in subclasses."""
        return {}
