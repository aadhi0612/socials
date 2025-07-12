import os
import re
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import user, content, ai, community, media
from .database import create_tables
from .routers import social_auth, social_posts, direct_social_posts, oauth_social_posts

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Socials API",
    description="Full-stack social media application with cross-platform posting, scheduling, and analytics",
    version="1.0.0"
)

# For development, allow specific origins
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.29.208:5173",  # Your local network frontend
    "http://localhost:5174",       # Alternative port
    "http://127.0.0.1:5174",
    "http://192.168.29.208:5174",  # Your local network frontend on port 5174
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

# Configure CORS - Add this BEFORE including routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add explicit OPTIONS handler for preflight requests
@app.options("/{path:path}")
async def options_handler(request: Request, path: str):
    origin = request.headers.get("Origin", "")
    if origin in allowed_origins:
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
            }
        )
    return JSONResponse(
        content={},
        status_code=400,
        headers={
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
        }
    )

# Include existing routers
app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(content.router)
app.include_router(ai.router)
app.include_router(community.router, prefix="/community", tags=["community"])
app.include_router(media.router)

# Include new social media routers
app.include_router(social_auth.router, prefix="/api/v1")
app.include_router(social_posts.router, prefix="/api/v1")

# Include direct posting router (no OAuth required)
from .routers import direct_social_posts
app.include_router(direct_social_posts.router, prefix="/api/v1")

# Include OAuth-based posting router (with proper authentication)
from .routers import oauth_social_posts
app.include_router(oauth_social_posts.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    """Create database tables on startup"""
    logger.info("Creating database tables...")
    try:
        create_tables()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

@app.get("/")
def read_root():
    return {
        "message": "Socials API is running!",
        "version": "1.0.0",
        "features": [
            "Original social media features",
            "Multi-platform posting (LinkedIn, Instagram, Twitter/X)",
            "Post scheduling and automation",
            "OAuth authentication",
            "Analytics collection",
            "Secure credential storage with AWS Secrets Manager"
        ],
        "endpoints": {
            "social_auth": "/api/v1/auth",
            "social_posts": "/api/v1/posts",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2025-07-09T09:00:00Z"}