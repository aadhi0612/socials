from fastapi import APIRouter, Depends, HTTPException
from app.services.aws_secrets import get_user_platform_token, delete_user_platform_token
from app.api.user import get_current_user_jwt

router = APIRouter()

PLATFORMS = ['LinkedIn', 'Twitter', 'Instagram']

@router.get('/api/social-accounts')
def get_social_accounts_status(current_user=Depends(get_current_user_jwt)):
    user_id = current_user['user_id']
    status = {}
    for platform in PLATFORMS:
        token = get_user_platform_token(user_id, platform.lower())
        status[platform] = bool(token)
    return status

@router.post('/api/social-accounts/{platform}/disconnect')
def disconnect_social_account(platform: str, current_user=Depends(get_current_user_jwt)):
    user_id = current_user['user_id']
    if platform.capitalize() not in PLATFORMS:
        raise HTTPException(status_code=400, detail='Unsupported platform')
    delete_user_platform_token(user_id, platform.lower())
    return {'success': True} 