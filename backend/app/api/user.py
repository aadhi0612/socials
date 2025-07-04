from fastapi import APIRouter, Depends, HTTPException, Request, Body
from app.schemas.user import UserOut, UserUpdate, UserListOut, UserCreate
from app.services.dynamodb_service import get_user_by_id, list_users, update_user, get_user_item_by_id, get_user_item_by_email
import bcrypt
import uuid
import jwt
from datetime import datetime, timedelta

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
        'id': str(uuid.uuid4()),
        'name': user.name,
        'email': user.email,
        'password': hashed_pw,
        'role': 'Viewer',
        'is_active': True
    }
    table.put_item(Item=item)
    item['user_id'] = item['id']
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