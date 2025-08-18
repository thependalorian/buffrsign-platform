"""
Authentication Router for BuffrSign
Handles user login, logout, and JWT token management
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime, timedelta
import bcrypt
from typing import Dict, Any, Optional

from ..services.redis_service import redis_service
from ..utils.jwt_utils import create_access_token, verify_token, get_user_from_token, create_test_token

# Initialize router
router = APIRouter(prefix="/auth", tags=["authentication"])

# Security scheme
security = HTTPBearer()

# Mock user database (replace with actual database)
users_db = {
    "test@buffrsign.com": {
        "id": "user_001",
        "email": "test@buffrsign.com",
        "password_hash": bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()),
        "full_name": "Test User",
        "account_type": "individual",
        "is_verified": True
    }
}

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: Dict[str, Any]

@router.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest, req: Request):
    """User login endpoint"""
    # Check for failed login attempts
    failed_attempts_key = f"failed_login:{request.email}"
    failed_attempts = redis_service.cache_get(failed_attempts_key) or 0
    
    if failed_attempts >= 5:
        raise HTTPException(
            status_code=429,
            detail="Too many failed login attempts. Please try again later."
        )
    
    # Authenticate user
    user = users_db.get(request.email)
    if not user or not bcrypt.checkpw(request.password.encode('utf-8'), user['password_hash']):
        # Increment failed attempts
        redis_service.cache_set(failed_attempts_key, failed_attempts + 1, ttl=3600)
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    
    # Clear failed attempts on successful login
    redis_service.cache_delete(failed_attempts_key)
    
    # Create session
    session_data = {
        "user_id": user["id"],
        "email": user["email"],
        "account_type": user["account_type"],
        "login_time": datetime.utcnow().isoformat()
    }
    session_id = redis_service.create_session(user["id"], session_data)
    
    # Generate JWT
    access_token_expires = timedelta(hours=24)
    access_token = create_access_token(
        data={"sub": user["email"], "session_id": session_id}, 
        expires_delta=access_token_expires
    )
    
    # Cache user data
    redis_service.cache_set(f"user:{user['id']}", user, ttl=3600)
    
    # Log user activity to Supabase
    redis_service.log_user_activity(
        user_id=user['id'],
        activity_type='login',
        activity_data={'session_id': session_id},
        ip_address=req.client.host if hasattr(req, 'client') else None,
        user_agent=req.headers.get('User-Agent'),
        session_id=session_id
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=86400,
        user={
            "id": user["id"],
            "email": user["email"],
            "full_name": user["full_name"],
            "account_type": user["account_type"],
            "is_verified": user["is_verified"]
        }
    )

@router.post("/logout")
async def logout(req: Request, credentials: HTTPAuthorizationCredentials = Depends(security)):
    """User logout endpoint"""
    token = credentials.credentials
    
    # Verify token and get user
    try:
        payload = verify_token(token)
        user_email = payload.get("sub")
    except HTTPException:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # Blacklist token
    redis_service.blacklist_token(token, 86400)  # 24 hours
    
    # Delete session
    user = users_db.get(user_email)
    if user:
        # Find and delete user sessions
        session_pattern = f"session:*_{user['id']}_*"
        redis_service.cache_invalidate_pattern(session_pattern)
        
        # Log user activity to Supabase
        redis_service.log_user_activity(
            user_id=user['id'],
            activity_type='logout',
            activity_data={'token_blacklisted': True},
            ip_address=req.client.host if hasattr(req, 'client') else None,
            user_agent=req.headers.get('User-Agent')
        )
    
    return {"message": "Logged out successfully"}

@router.post("/test-token")
async def create_test_token_endpoint(email: str = "test@buffrsign.com"):
    """Create a test JWT token for development/testing"""
    if email not in users_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    token = create_test_token(email)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_email": email
    }

@router.get("/verify")
async def verify_token_endpoint(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token endpoint"""
    try:
        payload = verify_token(credentials.credentials)
        return {
            "valid": True,
            "user_email": payload.get("sub"),
            "expires_at": datetime.fromtimestamp(payload.get("exp")).isoformat(),
            "payload": payload
        }
    except HTTPException as e:
        return {
            "valid": False,
            "error": e.detail
        }