import os
from typing import Tuple, Optional
import requests

"""
OAuth utility functions for LinkedIn, Twitter, and Instagram.
Handles generating authorization URLs, exchanging codes for tokens, and preparing callback logic.
"""

# LinkedIn

def get_linkedin_auth_url(state: str) -> str:
    client_id = os.getenv('LINKEDIN_CLIENT_ID')
    redirect_uri = os.getenv('LINKEDIN_REDIRECT_URI')
    scopes = 'r_liteprofile r_emailaddress w_member_social'
    base_url = 'https://www.linkedin.com/oauth/v2/authorization'
    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': scopes,
        'state': state,
    }
    from urllib.parse import urlencode
    return f"{base_url}?{urlencode(params)}"

def exchange_linkedin_code_for_token(code: str, redirect_uri: str) -> Tuple[str, Optional[str]]:
    client_id = os.getenv('LINKEDIN_CLIENT_ID')
    client_secret = os.getenv('LINKEDIN_CLIENT_SECRET')
    token_url = 'https://www.linkedin.com/oauth/v2/accessToken'
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'client_secret': client_secret,
    }
    resp = requests.post(token_url, data=data, headers={'Content-Type': 'application/x-www-form-urlencoded'})
    resp.raise_for_status()
    token_data = resp.json()
    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token')
    if not access_token:
        raise Exception('Failed to obtain LinkedIn access token')
    return access_token, refresh_token

# Twitter (OAuth 2.0 Authorization Code with PKCE is recommended)
def get_twitter_auth_url(state: str) -> str:
    client_id = os.getenv('TWITTER_CLIENT_ID')
    redirect_uri = os.getenv('TWITTER_REDIRECT_URI')
    scopes = 'tweet.read tweet.write users.read offline.access'
    base_url = 'https://twitter.com/i/oauth2/authorize'
    params = {
        'response_type': 'code',
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': scopes,
        'state': state,
        'code_challenge': state,  # For demo, use state as code_challenge (in production, use PKCE)
        'code_challenge_method': 'plain',
    }
    from urllib.parse import urlencode
    return f"{base_url}?{urlencode(params)}"

def exchange_twitter_code_for_token(code: str, redirect_uri: str) -> Tuple[str, Optional[str]]:
    client_id = os.getenv('TWITTER_CLIENT_ID')
    client_secret = os.getenv('TWITTER_CLIENT_SECRET')
    token_url = 'https://api.twitter.com/2/oauth2/token'
    data = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': redirect_uri,
        'client_id': client_id,
        'code_verifier': '',  # Should match code_challenge (PKCE)
    }
    # Twitter requires Basic Auth header
    import base64
    basic_auth = base64.b64encode(f"{client_id}:{client_secret}".encode()).decode()
    headers = {
        'Authorization': f'Basic {basic_auth}',
        'Content-Type': 'application/x-www-form-urlencoded',
    }
    resp = requests.post(token_url, data=data, headers=headers)
    resp.raise_for_status()
    token_data = resp.json()
    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token')
    if not access_token:
        raise Exception('Failed to obtain Twitter access token')
    return access_token, refresh_token

# Instagram (Basic Display API)
def get_instagram_auth_url(state: str) -> str:
    client_id = os.getenv('INSTAGRAM_CLIENT_ID')
    redirect_uri = os.getenv('INSTAGRAM_REDIRECT_URI')
    scopes = 'user_profile,user_media'
    base_url = 'https://api.instagram.com/oauth/authorize'
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': scopes,
        'response_type': 'code',
        'state': state,
    }
    from urllib.parse import urlencode
    return f"{base_url}?{urlencode(params)}"

def exchange_instagram_code_for_token(code: str, redirect_uri: str) -> Tuple[str, Optional[str]]:
    client_id = os.getenv('INSTAGRAM_CLIENT_ID')
    client_secret = os.getenv('INSTAGRAM_CLIENT_SECRET')
    token_url = 'https://api.instagram.com/oauth/access_token'
    data = {
        'client_id': client_id,
        'client_secret': client_secret,
        'grant_type': 'authorization_code',
        'redirect_uri': redirect_uri,
        'code': code,
    }
    resp = requests.post(token_url, data=data)
    resp.raise_for_status()
    token_data = resp.json()
    access_token = token_data.get('access_token')
    refresh_token = token_data.get('refresh_token')
    if not access_token:
        raise Exception('Failed to obtain Instagram access token')
    return access_token, refresh_token 