"""
JWT Utilities for BuffrSign
Handles JWT token creation, verification, and management for authentication
"""

import jwt
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import HTTPException, status

# JWT Configuration - SECURITY: Use environment variables, never hardcode secrets
JWT_SECRET = os.getenv('JWT_SECRET')
if not JWT_SECRET:
    raise ValueError("JWT_SECRET environment variable is required. Please set it in your .env file.")

JWT_ALGORITHM = "HS256"
JWT_EXPIRY_HOURS = int(os.getenv('JWT_EXPIRY_HOURS', '24'))

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    
    Args:
        data: Dictionary containing token payload
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRY_HOURS)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "iss": "buffrsign-api",
        "aud": "authenticated"
    })
    
    try:
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
        return encoded_jwt
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create JWT token: {str(e)}"
        )

def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode a JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith("Bearer "):
            token = token[7:]
        
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Validate required fields
        required_fields = ["sub", "exp", "iat", "iss", "aud"]
        for field in required_fields:
            if field not in payload:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail=f"Invalid token: missing {field}"
                )
        
        # Check if token is expired
        if datetime.utcnow() > datetime.fromtimestamp(payload["exp"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )

def get_user_from_token(token: str) -> str:
    """
    Extract user email from JWT token
    
    Args:
        token: JWT token string
        
    Returns:
        User email from token subject
    """
    payload = verify_token(token)
    return payload.get("sub", "")

def create_test_token(user_email: str, session_id: str = None) -> str:
    """
    Create a test JWT token for development/testing
    
    Args:
        user_email: User's email address
        session_id: Optional session ID
        
    Returns:
        JWT token string
    """
    data = {
        "sub": user_email,
        "email": user_email,
        "role": "authenticated",
        "session_id": session_id or f"test_session_{user_email}",
        "user_metadata": {
            "full_name": "Test User",
            "account_type": "individual"
        }
    }
    
    return create_access_token(data)

def is_token_blacklisted(token: str) -> bool:
    """
    Check if a token is blacklisted (placeholder for Redis integration)
    
    Args:
        token: JWT token string
        
    Returns:
        True if token is blacklisted, False otherwise
    """
    # This would typically check Redis for blacklisted tokens
    # For now, return False (not blacklisted)
    return False

def blacklist_token(token: str, ttl_seconds: int = 86400) -> bool:
    """
    Blacklist a token (placeholder for Redis integration)
    
    Args:
        token: JWT token string
        ttl_seconds: Time to live in seconds
        
    Returns:
        True if successfully blacklisted
    """
    # This would typically store the token in Redis with TTL
    # For now, return True (successfully blacklisted)
    return True
