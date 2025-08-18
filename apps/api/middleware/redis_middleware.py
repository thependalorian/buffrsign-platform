from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from ..services.redis_service import redis_service
import time
import json
from datetime import datetime

class RedisMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Rate limiting
        client_ip = request.client.host
        user_id = None
        
        # Extract user ID from request if available
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                # This would need proper JWT decoding in production
                # user_id = decode_jwt(auth_header.split(" ")[1])["user_id"]
                pass
            except:
                pass
        
        rate_limit_key = f"api:{client_ip}"
        rate_limit = redis_service.check_rate_limit(rate_limit_key, 100, 3600)  # 100 requests per hour
        
        # Log rate limit event to Supabase
        window_start = datetime.now()
        window_end = datetime.fromtimestamp(window_start.timestamp() + 3600)
        
        redis_service.log_rate_limit_event(
            identifier=client_ip,
            limit_type="api_rate_limit",
            request_count=rate_limit.get("current", 0),
            window_start=window_start,
            window_end=window_end,
            is_blocked=not rate_limit["allowed"],
            ip_address=client_ip,
            user_id=user_id
        )
        
        if not rate_limit["allowed"]:
            return Response(
                content=json.dumps({
                    "error": "Rate limit exceeded",
                    "retry_after": 3600
                }),
                status_code=429,
                headers={"Content-Type": "application/json"}
            )
        
        # Add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = "100"
        response.headers["X-RateLimit-Remaining"] = str(rate_limit["remaining"])
        
        return response
