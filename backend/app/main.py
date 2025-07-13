import os
import re
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.api import user, content, ai, community, media
from app.api.oauth import router as oauth_router
from app.api.social_accounts import router as social_accounts_router

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure allowed origins for production - TEMPORARILY ALLOW ALL
allowed_origins = ["*"]  # Allow all origins for demo

# Configure CORS - Add this BEFORE including routers
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

def get_cors_headers(origin: str = None):
    """Get CORS headers for the given origin"""
    # Allow all origins for demo
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Credentials": "false",  # Must be false when origin is *
    }

# Custom exception handlers to ensure CORS headers are always included
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    origin = request.headers.get("origin")
    headers = get_cors_headers(origin)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    origin = request.headers.get("origin")
    headers = get_cors_headers(origin)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
        headers=headers
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin")
    headers = get_cors_headers(origin)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "message": str(exc)},
        headers=headers
    )

# Add explicit OPTIONS handler for preflight requests
@app.options("/{path:path}")
async def options_handler(request: Request, path: str):
    origin = request.headers.get("origin")
    headers = get_cors_headers(origin)
    return JSONResponse(content={}, headers=headers)

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