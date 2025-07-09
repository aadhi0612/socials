"""
Post scheduling service for managing and executing scheduled social media posts
"""
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..models.social_platforms import ScheduledPost, SocialAccount
from ..database import get_db
from .social_platforms import LinkedInPlatform, InstagramPlatform, TwitterPlatform
from .aws_secrets import secrets_manager

logger = logging.getLogger(__name__)

class PostScheduler:
    """Service for managing scheduled posts"""
    
    def __init__(self):
        self.platforms = {
            "linkedin": LinkedInPlatform(),
            "instagram": InstagramPlatform(),
            "twitter": TwitterPlatform()
        }
    
    def schedule_post(
        self,
        db: Session,
        user_id: int,
        social_account_id: int,
        content_text: str,
        media_urls: List[str] = None,
        media_type: str = "text",
        scheduled_for: datetime = None
    ) -> ScheduledPost:
        """Schedule a new post"""
        
        if scheduled_for is None:
            scheduled_for = datetime.utcnow()
        
        scheduled_post = ScheduledPost(
            user_id=user_id,
            social_account_id=social_account_id,
            content_text=content_text,
            media_urls=media_urls or [],
            media_type=media_type,
            scheduled_for=scheduled_for,
            status="scheduled"
        )
        
        db.add(scheduled_post)
        db.commit()
        db.refresh(scheduled_post)
        
        logger.info(f"Scheduled post {scheduled_post.id} for {scheduled_for}")
        return scheduled_post
    
    def get_due_posts(self, db: Session, buffer_minutes: int = 5) -> List[ScheduledPost]:
        """Get posts that are due for posting (within buffer time)"""
        
        current_time = datetime.utcnow()
        buffer_time = current_time + timedelta(minutes=buffer_minutes)
        
        due_posts = db.query(ScheduledPost).filter(
            and_(
                ScheduledPost.status == "scheduled",
                ScheduledPost.scheduled_for <= buffer_time
            )
        ).all()
        
        return due_posts
    
    def execute_post(self, db: Session, scheduled_post: ScheduledPost) -> bool:
        """Execute a scheduled post"""
        
        try:
            # Get social account details
            social_account = db.query(SocialAccount).filter(
                SocialAccount.id == scheduled_post.social_account_id
            ).first()
            
            if not social_account or not social_account.is_active:
                self._mark_post_failed(db, scheduled_post, "Social account not found or inactive")
                return False
            
            # Get platform handler
            platform = self.platforms.get(social_account.platform)
            if not platform:
                self._mark_post_failed(db, scheduled_post, f"Platform {social_account.platform} not supported")
                return False
            
            # Get user tokens from AWS Secrets Manager
            try:
                tokens = secrets_manager.get_secret(social_account.access_token_secret_arn)
            except Exception as e:
                self._mark_post_failed(db, scheduled_post, f"Failed to retrieve tokens: {str(e)}")
                return False
            
            # Validate token before posting
            access_token = tokens.get("access_token")
            if not access_token:
                self._mark_post_failed(db, scheduled_post, "Access token not found")
                return False
            
            # Check if token is still valid
            token_valid = False
            if social_account.platform == "twitter":
                token_valid = platform.validate_token(
                    access_token, 
                    tokens.get("access_token_secret")
                )
            else:
                token_valid = platform.validate_token(access_token)
            
            if not token_valid:
                self._mark_post_failed(db, scheduled_post, "Access token is invalid or expired")
                return False
            
            # Prepare post content
            from .social_platforms.base import PostContent
            post_content = PostContent(
                text=scheduled_post.content_text,
                media_urls=scheduled_post.media_urls,
                media_type=scheduled_post.media_type
            )
            
            # Execute the post
            if social_account.platform == "twitter":
                result = platform.post_content(
                    post_content, 
                    access_token, 
                    tokens.get("access_token_secret")
                )
            else:
                result = platform.post_content(post_content, access_token)
            
            if result.success:
                # Mark as posted
                scheduled_post.status = "posted"
                scheduled_post.platform_post_id = result.platform_post_id
                scheduled_post.posted_at = result.posted_at or datetime.utcnow()
                scheduled_post.error_message = None
                
                db.commit()
                logger.info(f"Successfully posted scheduled post {scheduled_post.id}")
                return True
            else:
                self._mark_post_failed(db, scheduled_post, result.error_message)
                return False
                
        except Exception as e:
            logger.error(f"Error executing scheduled post {scheduled_post.id}: {e}")
            self._mark_post_failed(db, scheduled_post, str(e))
            return False
    
    def _mark_post_failed(self, db: Session, scheduled_post: ScheduledPost, error_message: str):
        """Mark a post as failed"""
        scheduled_post.status = "failed"
        scheduled_post.error_message = error_message
        scheduled_post.updated_at = datetime.utcnow()
        db.commit()
        logger.error(f"Post {scheduled_post.id} failed: {error_message}")
    
    def cancel_post(self, db: Session, post_id: int, user_id: int) -> bool:
        """Cancel a scheduled post"""
        
        scheduled_post = db.query(ScheduledPost).filter(
            and_(
                ScheduledPost.id == post_id,
                ScheduledPost.user_id == user_id,
                ScheduledPost.status == "scheduled"
            )
        ).first()
        
        if not scheduled_post:
            return False
        
        scheduled_post.status = "cancelled"
        scheduled_post.updated_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Cancelled scheduled post {post_id}")
        return True
    
    def get_user_scheduled_posts(
        self, 
        db: Session, 
        user_id: int, 
        status: str = None,
        limit: int = 50
    ) -> List[ScheduledPost]:
        """Get scheduled posts for a user"""
        
        query = db.query(ScheduledPost).filter(ScheduledPost.user_id == user_id)
        
        if status:
            query = query.filter(ScheduledPost.status == status)
        
        return query.order_by(ScheduledPost.scheduled_for.desc()).limit(limit).all()
    
    def run_scheduler_job(self):
        """Main scheduler job - should be called periodically"""
        
        logger.info("Running post scheduler job")
        
        # Get database session
        db = next(get_db())
        
        try:
            # Get due posts
            due_posts = self.get_due_posts(db)
            
            if not due_posts:
                logger.info("No posts due for execution")
                return
            
            logger.info(f"Found {len(due_posts)} posts due for execution")
            
            # Execute each post
            success_count = 0
            for post in due_posts:
                if self.execute_post(db, post):
                    success_count += 1
            
            logger.info(f"Successfully executed {success_count}/{len(due_posts)} posts")
            
        except Exception as e:
            logger.error(f"Error in scheduler job: {e}")
        finally:
            db.close()

# Global scheduler instance
post_scheduler = PostScheduler()
