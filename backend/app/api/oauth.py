from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from app.services.social_platforms.oauth import (
    get_linkedin_auth_url, exchange_linkedin_code_for_token,
    get_twitter_auth_url, exchange_twitter_code_for_token,
    get_instagram_auth_url, exchange_instagram_code_for_token
)
from app.services.aws_secrets import set_user_platform_token
from app.api.user import get_current_user_jwt
import os
import secrets

router = APIRouter()

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# LinkedIn
@router.get('/auth/linkedin/login')
def linkedin_login(request: Request, current_user=Depends(get_current_user_jwt)):
    state = secrets.token_urlsafe(16)
    # Store state in session/cookie if needed for CSRF protection
    auth_url = get_linkedin_auth_url(state)
    return RedirectResponse(auth_url)

@router.get('/auth/linkedin/callback')
def linkedin_callback(request: Request, code: str = '', state: str = '', current_user=Depends(get_current_user_jwt)):
    # TODO: Validate state
    redirect_uri = os.getenv('LINKEDIN_REDIRECT_URI')
    access_token, refresh_token = exchange_linkedin_code_for_token(code, redirect_uri)
    set_user_platform_token(current_user['user_id'], 'linkedin', access_token)
    return RedirectResponse(f'{FRONTEND_URL}/social-accounts')

# Twitter
@router.get('/auth/twitter/login')
def twitter_login(request: Request, current_user=Depends(get_current_user_jwt)):
    state = secrets.token_urlsafe(16)
    auth_url = get_twitter_auth_url(state)
    return RedirectResponse(auth_url)

@router.get('/auth/twitter/callback')
def twitter_callback(request: Request, code: str = '', state: str = '', current_user=Depends(get_current_user_jwt)):
    redirect_uri = os.getenv('TWITTER_REDIRECT_URI')
    access_token, refresh_token = exchange_twitter_code_for_token(code, redirect_uri)
    set_user_platform_token(current_user['user_id'], 'twitter', access_token)
    return RedirectResponse(f'{FRONTEND_URL}/social-accounts')

# Instagram
@router.get('/auth/instagram/login')
def instagram_login(request: Request, current_user=Depends(get_current_user_jwt)):
    state = secrets.token_urlsafe(16)
    auth_url = get_instagram_auth_url(state)
    return RedirectResponse(auth_url)

@router.get('/auth/instagram/callback')
def instagram_callback(request: Request, code: str = '', state: str = '', current_user=Depends(get_current_user_jwt)):
    redirect_uri = os.getenv('INSTAGRAM_REDIRECT_URI')
    access_token, refresh_token = exchange_instagram_code_for_token(code, redirect_uri)
    set_user_platform_token(current_user['user_id'], 'instagram', access_token)
    return RedirectResponse(f'{FRONTEND_URL}/social-accounts') 