import os
import re
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api import user, content, ai, community, media
from app.api.oauth import router as oauth_router
from app.api.social_accounts import router as social_accounts_router

# Load environment variables
load_dotenv()

app = FastAPI()

# For development, allow all origins to fix CORS issues
# In production, you should specify exact origins
allowed_origins = ["*"]  # Allow all origins for development

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
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

app.include_router(user.router, prefix="/users", tags=["users"])
app.include_router(content.router)
app.include_router(ai.router)
app.include_router(community.router, prefix="/community", tags=["community"])
app.include_router(media.router)
app.include_router(oauth_router)
app.include_router(social_accounts_router)

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}