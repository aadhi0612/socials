from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class PostEngagement(BaseModel):
    likes: int
    comments: int
    shares: int

class CommunityPost(BaseModel):
    id: int
    community: str
    platform: str
    content: str
    image_url: Optional[str] = None
    post_url: str
    published_at: datetime
    engagement: PostEngagement
    tags: List[str]

class Event(BaseModel):
    id: int
    title: str
    description: str
    date: str
    time: str
    location: str
    organizer: str
    attendees: int
    max_attendees: int
    registration_url: str
    tags: List[str]

# Mock data for community posts
MOCK_POSTS = [
    CommunityPost(
        id=1,
        community="AWS User Group Madurai",
        platform="linkedin",
        content="🚀 Excited to announce our upcoming AWS Community Day! Join us for hands-on workshops, expert talks, and networking opportunities. #AWS #Cloud #Community",
        image_url="https://via.placeholder.com/400x200/1f2937/f59e0b?text=AWS+Community+Day",
        post_url="https://linkedin.com/posts/aws-madurai-123",
        published_at=datetime(2025, 7, 4, 10, 30),
        engagement=PostEngagement(likes=45, comments=12, shares=8),
        tags=["AWS", "Community", "Workshop"]
    ),
    CommunityPost(
        id=2,
        community="AWS User Group Madurai",
        platform="twitter",
        content="Just wrapped up an amazing session on AWS Lambda best practices! Thanks to everyone who joined. 🙌 #ServerlessComputing #AWS",
        post_url="https://twitter.com/awsmadurai/status/123",
        published_at=datetime(2025, 7, 3, 15, 45),
        engagement=PostEngagement(likes=23, comments=5, shares=12),
        tags=["AWS", "Lambda", "Serverless"]
    ),
    CommunityPost(
        id=3,
        community="DevOps Community Chennai",
        platform="instagram",
        content="Behind the scenes of our DevOps workshop! Great energy and fantastic questions from the participants. 📸✨",
        image_url="https://via.placeholder.com/400x400/1f2937/8b5cf6?text=DevOps+Workshop",
        post_url="https://instagram.com/p/devops-chennai-123",
        published_at=datetime(2025, 7, 2, 18, 20),
        engagement=PostEngagement(likes=67, comments=18, shares=4),
        tags=["DevOps", "Workshop", "Chennai"]
    ),
    CommunityPost(
        id=4,
        community="React Bangalore",
        platform="linkedin",
        content="New blog post: 'Building Scalable React Applications with Next.js 14'. Check out the latest features and performance improvements! 🔗",
        post_url="https://linkedin.com/posts/react-bangalore-456",
        published_at=datetime(2025, 7, 1, 9, 15),
        engagement=PostEngagement(likes=89, comments=24, shares=15),
        tags=["React", "Next.js", "JavaScript"]
    ),
    CommunityPost(
        id=5,
        community="AI/ML Hyderabad",
        platform="twitter",
        content="Fascinating discussion on transformer models and their applications in NLP. The future of AI is here! 🤖 #MachineLearning #AI",
        post_url="https://twitter.com/aimlhyd/status/456",
        published_at=datetime(2025, 6, 30, 14, 30),
        engagement=PostEngagement(likes=156, comments=32, shares=28),
        tags=["AI", "ML", "NLP", "Transformers"]
    ),
    CommunityPost(
        id=6,
        community="AWS User Group Madurai",
        platform="instagram",
        content="Team photo from our successful AWS certification bootcamp! Congratulations to all the new AWS certified professionals! 🎉",
        image_url="https://via.placeholder.com/400x400/1f2937/f59e0b?text=AWS+Certification",
        post_url="https://instagram.com/p/aws-madurai-456",
        published_at=datetime(2025, 6, 29, 16, 45),
        engagement=PostEngagement(likes=78, comments=15, shares=6),
        tags=["AWS", "Certification", "Achievement"]
    )
]

# Mock data for events
MOCK_EVENTS = [
    Event(
        id=1,
        title="AWS Community Day Chennai 2025",
        description="Join us for a full day of AWS sessions, networking, and hands-on workshops. Learn from AWS experts and community leaders.",
        date="2025-08-15",
        time="09:00 AM - 06:00 PM",
        location="Chennai, Tamil Nadu",
        organizer="AWS User Group Chennai",
        attendees=245,
        max_attendees=500,
        registration_url="https://example.com/register",
        tags=["AWS", "Cloud", "Networking", "Workshop"]
    ),
    Event(
        id=2,
        title="DevOps Meetup Bangalore",
        description="Monthly DevOps meetup focusing on CI/CD best practices, containerization, and cloud-native technologies.",
        date="2025-07-20",
        time="02:00 PM - 05:00 PM",
        location="Bangalore, Karnataka",
        organizer="DevOps Community Bangalore",
        attendees=89,
        max_attendees=150,
        registration_url="https://example.com/register",
        tags=["DevOps", "CI/CD", "Docker", "Kubernetes"]
    ),
    Event(
        id=3,
        title="React & Next.js Workshop",
        description="Hands-on workshop covering React fundamentals, Next.js features, and modern web development practices.",
        date="2025-07-25",
        time="10:00 AM - 04:00 PM",
        location="Mumbai, Maharashtra",
        organizer="React Mumbai",
        attendees=67,
        max_attendees=100,
        registration_url="https://example.com/register",
        tags=["React", "Next.js", "JavaScript", "Frontend"]
    ),
    Event(
        id=4,
        title="AI/ML Community Meetup",
        description="Explore the latest trends in AI and Machine Learning with industry experts and researchers.",
        date="2025-08-05",
        time="11:00 AM - 03:00 PM",
        location="Hyderabad, Telangana",
        organizer="AI/ML Hyderabad",
        attendees=156,
        max_attendees=200,
        registration_url="https://example.com/register",
        tags=["AI", "ML", "Data Science", "Python"]
    )
]

@router.get("/posts", response_model=List[CommunityPost])
async def get_community_posts(
    community: Optional[str] = Query(None, description="Filter by community name"),
    platform: Optional[str] = Query(None, description="Filter by platform (linkedin, twitter, instagram)"),
    limit: int = Query(10, description="Number of posts to return"),
    offset: int = Query(0, description="Number of posts to skip")
):
    """Get community posts with optional filtering"""
    try:
        posts = MOCK_POSTS.copy()
        
        # Apply filters
        if community:
            posts = [post for post in posts if community.lower() in post.community.lower()]
        
        if platform:
            posts = [post for post in posts if post.platform.lower() == platform.lower()]
        
        # Sort by published date (newest first)
        posts.sort(key=lambda x: x.published_at, reverse=True)
        
        # Apply pagination
        paginated_posts = posts[offset:offset + limit]
        
        return paginated_posts
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching community posts: {str(e)}")

@router.get("/posts/stats")
async def get_posts_stats():
    """Get statistics about community posts"""
    try:
        total_posts = len(MOCK_POSTS)
        communities = list(set(post.community for post in MOCK_POSTS))
        platforms = list(set(post.platform for post in MOCK_POSTS))
        total_engagement = sum(
            post.engagement.likes + post.engagement.comments + post.engagement.shares 
            for post in MOCK_POSTS
        )
        
        return {
            "total_posts": total_posts,
            "total_communities": len(communities),
            "total_platforms": len(platforms),
            "total_engagement": total_engagement,
            "communities": communities,
            "platforms": platforms
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching posts stats: {str(e)}")

@router.get("/events", response_model=List[Event])
async def get_upcoming_events(
    limit: int = Query(10, description="Number of events to return"),
    offset: int = Query(0, description="Number of events to skip")
):
    """Get upcoming events"""
    try:
        events = MOCK_EVENTS.copy()
        
        # Sort by date (upcoming first)
        events.sort(key=lambda x: x.date)
        
        # Apply pagination
        paginated_events = events[offset:offset + limit]
        
        return paginated_events
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")

@router.get("/communities")
async def get_communities():
    """Get list of all communities"""
    try:
        communities = list(set(post.community for post in MOCK_POSTS))
        community_stats = []
        
        for community in communities:
            community_posts = [post for post in MOCK_POSTS if post.community == community]
            total_engagement = sum(
                post.engagement.likes + post.engagement.comments + post.engagement.shares 
                for post in community_posts
            )
            
            community_stats.append({
                "name": community,
                "total_posts": len(community_posts),
                "total_engagement": total_engagement,
                "platforms": list(set(post.platform for post in community_posts))
            })
        
        # Sort by total posts (most active first)
        community_stats.sort(key=lambda x: x["total_posts"], reverse=True)
        
        return community_stats
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching communities: {str(e)}")
