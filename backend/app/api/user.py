from fastapi import APIRouter, Depends, HTTPException, Request, Body, status, Cookie, Header
from app.schemas.user import UserOut, UserUpdate, UserListOut, UserCreate
from app.services.dynamodb_service import get_user_by_id, list_users, update_user, get_user_item_by_id, get_user_item_by_email
import bcrypt
import uuid
import jwt
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
import boto3
import os
from uuid import uuid4
from urllib.parse import quote_plus
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(tags=["users"])

# Dynamic dependency for current user using X-User-Id header
def get_current_user(request: Request):
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="X-User-Id header missing")
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id, "role": user.role}

SECRET_KEY = "social-media-secret-key"  # Use a secure, random key in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/", response_model=UserOut)
def create_user(user: UserCreate):
    from app.services.dynamodb_service import table
    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    item = {
        'id': user.id or str(uuid.uuid4()),
        'name': user.name,
        'email': user.email,
        'password': hashed_pw,
        'role': 'Viewer',
        'is_active': True,
    }
    if user.profile_pic_url:
        item['profile_pic_url'] = user.profile_pic_url
    table.put_item(Item=item)
    item['user_id'] = item['id']
    if user.profile_pic_url:
        item['profile_pic_url'] = user.profile_pic_url
    return UserOut(**item)

@router.post("/login")
def login(email: str = Body(...), password: str = Body(...)):
    user = get_user_item_by_email(email)
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # Create JWT token
    token = create_access_token({"user_id": user['id'], "role": user['role'], "email": user['email']})
    return {
        "message": "Login successful",
        "user_id": user['id'],
        "role": user['role'],
        "token": token
    }

@router.get("/me", response_model=UserOut)
def read_current_user(current_user=Depends(get_current_user)):
    user = get_user_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/me", response_model=UserOut)
def update_current_user(user_update: UserUpdate, current_user=Depends(get_current_user)):
    user = update_user(current_user["user_id"], user_update)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- JWT Auth Dependency (move this up) ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")

def get_current_user_jwt(
    token: str = Header(None, alias="Authorization"),
    cookie_token: str = Cookie(None, alias="token")
):
    # Support 'Bearer <token>' in header
    if token and token.startswith("Bearer "):
        token = token.split(" ", 1)[1]
    elif not token:
        token = cookie_token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token: no user_id")
        # Optionally, fetch user from DB here
        return {"user_id": user_id, "role": payload.get("role")}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

@router.put("/me/profile-pic", response_model=UserOut)
def update_profile_pic(profile_pic_url: str = Body(..., embed=True), current_user=Depends(get_current_user_jwt)):
    from app.services.dynamodb_service import update_user
    user_update = UserUpdate(profile_pic_url=profile_pic_url)
    user = update_user(current_user["user_id"], user_update)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=UserListOut)
def get_all_users(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin" and current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    users = list_users()
    return UserListOut(users=users)

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, current_user=Depends(get_current_user)):
    # Allow users to fetch their own profile, or admins to fetch any
    if current_user["user_id"] != user_id and current_user["role"].lower() != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/profile-pic-upload")
async def get_profile_pic_upload_url(request: Request):
    data = await request.json()
    user_id = data.get('user_id')
    if not user_id:
        # If registering, generate a new user_id
        user_id = str(uuid4())
    key = f"users/{user_id}/profile.jpg"
    
    # Use IAM role credentials in Lambda, fall back to env vars for local development
    if os.getenv('AWS_LAMBDA_FUNCTION_NAME'):
        # Running in Lambda - use IAM role
        s3 = boto3.client("s3", region_name="us-east-2")
        bucket = "socials-media-098493093308"
    else:
        # Local development - use environment variables
        s3 = boto3.client(
            "s3",
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_DEFAULT_REGION"),
        )
        bucket = os.getenv("AWS_S3_BUCKET")
    
    if not bucket:
        raise HTTPException(status_code=500, detail="AWS_S3_BUCKET environment variable not set")
    url = s3.generate_presigned_url(
        ClientMethod="put_object",
        Params={"Bucket": bucket, "Key": key, "ContentType": "image/jpeg"},
        ExpiresIn=600,
    )
    return {"url": url, "key": key, "user_id": user_id}