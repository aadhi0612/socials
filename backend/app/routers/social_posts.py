"""
Social media posting endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import logging

from ..database import get_db
from ..models.social_platforms import ScheduledPost, SocialAccount, PostAnalytics
from ..services.scheduler import post_scheduler

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/posts", tags=["social-posts"])

class PostRequest(BaseModel):
    content_text: str
    media_urls: Optional[List[str]] = None
    media_type: str = "text"
    scheduled_for: Optional[datetime] = None
    social_account_ids: List[int]  # Can post to multiple accounts

class PostResponse(BaseModel):
    id: int
    content_text: str
    media_urls: List[str]
    media_type: str
    scheduled_for: datetime
    status: str
    platform: str
    platform_username: str
    created_at: datetime

@router.post("/schedule")
async def schedule_posts(
    post_request: PostRequest,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Schedule posts across multiple social media platforms"""
    
    if not post_request.social_account_ids:
        raise HTTPException(status_code=400, detail="At least one social account must be specified")
    
    # Validate social accounts belong to user
    accounts = db.query(SocialAccount).filter(
        SocialAccount.id.in_(post_request.social_account_ids),
        SocialAccount.user_id == user_id,
        SocialAccount.is_active == True
    ).all()
    
    if len(accounts) != len(post_request.social_account_ids):
        raise HTTPException(status_code=400, detail="One or more social accounts not found or not owned by user")
    
    scheduled_posts = []
    
    try:
        for account in accounts:
            scheduled_post = post_scheduler.schedule_post(
                db=db,
                user_id=user_id,
                social_account_id=account.id,
                content_text=post_request.content_text,
                media_urls=post_request.media_urls,
                media_type=post_request.media_type,
                scheduled_for=post_request.scheduled_for
            )
            
            scheduled_posts.append({
                "id": scheduled_post.id,
                "platform": account.platform,
                "platform_username": account.platform_username,
                "scheduled_for": scheduled_post.scheduled_for,
                "status": scheduled_post.status
            })
        
        return {
            "success": True,
            "message": f"Scheduled {len(scheduled_posts)} posts",
            "scheduled_posts": scheduled_posts
        }
        
    except Exception as e:
        logger.error(f"Error scheduling posts: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to schedule posts: {str(e)}")

@router.post("/immediate")
async def post_immediately(
    post_request: PostRequest,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Post immediately to social media platforms"""
    
    # Set scheduled_for to now for immediate posting
    post_request.scheduled_for = datetime.utcnow()
    
    # Schedule the posts
    result = await schedule_posts(post_request, user_id, db)
    
    # Execute the posts immediately
    scheduled_post_ids = [post["id"] for post in result["scheduled_posts"]]
    
    execution_results = []
    for post_id in scheduled_post_ids:
        scheduled_post = db.query(ScheduledPost).filter(ScheduledPost.id == post_id).first()
        if scheduled_post:
            success = post_scheduler.execute_post(db, scheduled_post)
            execution_results.append({
                "post_id": post_id,
                "success": success,
                "status": scheduled_post.status,
                "platform_post_id": scheduled_post.platform_post_id,
                "error_message": scheduled_post.error_message
            })
    
    return {
        "success": True,
        "message": "Posts executed immediately",
        "results": execution_results
    }

@router.get("/scheduled")
async def get_scheduled_posts(
    user_id: int = Query(..., description="User ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(50, description="Number of posts to return"),
    db: Session = Depends(get_db)
):
    """Get scheduled posts for a user"""
    
    posts = post_scheduler.get_user_scheduled_posts(db, user_id, status, limit)
    
    post_list = []
    for post in posts:
        # Get social account info
        account = db.query(SocialAccount).filter(SocialAccount.id == post.social_account_id).first()
        
        post_list.append({
            "id": post.id,
            "content_text": post.content_text,
            "media_urls": post.media_urls,
            "media_type": post.media_type,
            "scheduled_for": post.scheduled_for,
            "status": post.status,
            "platform": account.platform if account else "unknown",
            "platform_username": account.platform_username if account else "unknown",
            "platform_post_id": post.platform_post_id,
            "posted_at": post.posted_at,
            "error_message": post.error_message,
            "created_at": post.created_at
        })
    
    return {"posts": post_list}

@router.delete("/{post_id}")
async def cancel_scheduled_post(
    post_id: int,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Cancel a scheduled post"""
    
    success = post_scheduler.cancel_post(db, post_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Scheduled post not found or cannot be cancelled")
    
    return {
        "success": True,
        "message": "Post cancelled successfully"
    }

@router.get("/{post_id}/analytics")
async def get_post_analytics(
    post_id: int,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Get analytics for a posted content"""
    
    # Get the scheduled post
    scheduled_post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id,
        ScheduledPost.user_id == user_id,
        ScheduledPost.status == "posted"
    ).first()
    
    if not scheduled_post:
        raise HTTPException(status_code=404, detail="Posted content not found")
    
    # Get existing analytics from database
    analytics = db.query(PostAnalytics).filter(
        PostAnalytics.scheduled_post_id == post_id
    ).first()
    
    if analytics:
        return {
            "post_id": post_id,
            "platform_post_id": scheduled_post.platform_post_id,
            "likes_count": analytics.likes_count,
            "comments_count": analytics.comments_count,
            "shares_count": analytics.shares_count,
            "impressions": analytics.impressions,
            "reach": analytics.reach,
            "platform_metrics": analytics.platform_metrics,
            "collected_at": analytics.collected_at
        }
    else:
        return {
            "post_id": post_id,
            "platform_post_id": scheduled_post.platform_post_id,
            "message": "Analytics not yet collected for this post"
        }

@router.post("/{post_id}/refresh-analytics")
async def refresh_post_analytics(
    post_id: int,
    user_id: int = Query(..., description="User ID"),
    db: Session = Depends(get_db)
):
    """Refresh analytics for a posted content"""
    
    # Get the scheduled post
    scheduled_post = db.query(ScheduledPost).filter(
        ScheduledPost.id == post_id,
        ScheduledPost.user_id == user_id,
        ScheduledPost.status == "posted"
    ).first()
    
    if not scheduled_post or not scheduled_post.platform_post_id:
        raise HTTPException(status_code=404, detail="Posted content not found")
    
    try:
        # Get social account
        account = db.query(SocialAccount).filter(
            SocialAccount.id == scheduled_post.social_account_id
        ).first()
        
        if not account:
            raise HTTPException(status_code=404, detail="Social account not found")
        
        # Get platform handler and tokens
        from ..services.social_platforms import LinkedInPlatform, InstagramPlatform, TwitterPlatform
        from ..services.aws_secrets import secrets_manager
        
        platforms = {
            "linkedin": LinkedInPlatform(),
            "instagram": InstagramPlatform(),
            "twitter": TwitterPlatform()
        }
        
        platform_handler = platforms.get(account.platform)
        if not platform_handler:
            raise HTTPException(status_code=400, detail=f"Platform {account.platform} not supported")
        
        tokens = secrets_manager.get_secret(account.access_token_secret_arn)
        
        # Fetch analytics from platform
        if account.platform == "twitter":
            analytics_data = platform_handler.get_post_analytics(
                scheduled_post.platform_post_id,
                tokens["access_token"],
                tokens.get("access_token_secret")
            )
        else:
            analytics_data = platform_handler.get_post_analytics(
                scheduled_post.platform_post_id,
                tokens["access_token"]
            )
        
        # Update or create analytics record
        existing_analytics = db.query(PostAnalytics).filter(
            PostAnalytics.scheduled_post_id == post_id
        ).first()
        
        if existing_analytics:
            existing_analytics.likes_count = analytics_data.likes_count
            existing_analytics.comments_count = analytics_data.comments_count
            existing_analytics.shares_count = analytics_data.shares_count
            existing_analytics.impressions = analytics_data.impressions
            existing_analytics.reach = analytics_data.reach
            existing_analytics.platform_metrics = analytics_data.platform_specific
            existing_analytics.collected_at = datetime.utcnow()
        else:
            new_analytics = PostAnalytics(
                scheduled_post_id=post_id,
                likes_count=analytics_data.likes_count,
                comments_count=analytics_data.comments_count,
                shares_count=analytics_data.shares_count,
                impressions=analytics_data.impressions,
                reach=analytics_data.reach,
                platform_metrics=analytics_data.platform_specific
            )
            db.add(new_analytics)
        
        db.commit()
        
        return {
            "success": True,
            "message": "Analytics refreshed successfully",
            "analytics": {
                "likes_count": analytics_data.likes_count,
                "comments_count": analytics_data.comments_count,
                "shares_count": analytics_data.shares_count,
                "impressions": analytics_data.impressions,
                "reach": analytics_data.reach,
                "platform_metrics": analytics_data.platform_specific
            }
        }
        
    except Exception as e:
        logger.error(f"Error refreshing analytics for post {post_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to refresh analytics: {str(e)}")
