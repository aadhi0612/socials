"""
Database models for social media platforms and user authentication
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    social_accounts = relationship("SocialAccount", back_populates="user")
    scheduled_posts = relationship("ScheduledPost", back_populates="user")

class SocialAccount(Base):
    __tablename__ = "social_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    platform = Column(String)  # 'linkedin', 'instagram', 'twitter'
    platform_user_id = Column(String)  # Platform-specific user ID
    platform_username = Column(String)  # Display name on platform
    
    # OAuth tokens stored as references to AWS Secrets Manager
    access_token_secret_arn = Column(String)  # ARN to secret in AWS Secrets Manager
    refresh_token_secret_arn = Column(String, nullable=True)
    token_expires_at = Column(DateTime, nullable=True)
    
    # Account metadata
    account_type = Column(String)  # 'personal', 'business', 'page'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="social_accounts")
    scheduled_posts = relationship("ScheduledPost", back_populates="social_account")

class ScheduledPost(Base):
    __tablename__ = "scheduled_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    social_account_id = Column(Integer, ForeignKey("social_accounts.id"))
    
    # Post content
    content_text = Column(Text)
    media_urls = Column(JSON)  # List of media URLs
    media_type = Column(String)  # 'image', 'video', 'carousel'
    
    # Scheduling
    scheduled_for = Column(DateTime)
    status = Column(String, default="scheduled")  # 'scheduled', 'posted', 'failed', 'cancelled'
    
    # Post results
    platform_post_id = Column(String, nullable=True)  # ID returned by platform after posting
    posted_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="scheduled_posts")
    social_account = relationship("SocialAccount", back_populates="scheduled_posts")
    analytics = relationship("PostAnalytics", back_populates="scheduled_post")

class PostAnalytics(Base):
    __tablename__ = "post_analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    scheduled_post_id = Column(Integer, ForeignKey("scheduled_posts.id"))
    
    # Common metrics across platforms
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    impressions = Column(Integer, default=0)
    reach = Column(Integer, default=0)
    
    # Platform-specific metrics stored as JSON
    platform_metrics = Column(JSON)
    
    # Tracking
    collected_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    scheduled_post = relationship("ScheduledPost", back_populates="analytics")
