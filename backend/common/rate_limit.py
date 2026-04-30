import time
from typing import Optional
from fastapi import HTTPException, status, Request
import redis
import os

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

_redis_client: Optional[redis.Redis] = None

def get_redis() -> redis.Redis:
    global _redis_client
    if _redis_client is None:
        try:
            _redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        except Exception:
            _redis_client = None
    return _redis_client

RATE_LIMITS = {
    "messages": (30, 60),      # 30 requests per minute
    "posts": (10, 60),         # 10 requests per minute
    "pvp_matches": (10, 3600), # 10 requests per hour
    "search": (60, 60),        # 60 requests per minute
    "default": (100, 60),     # 100 requests per minute
}

def check_rate_limit(key: str, limit_type: str = "default") -> bool:
    redis_client = get_redis()
    if redis_client is None:
        return True
    
    limit, window = RATE_LIMITS.get(limit_type, RATE_LIMITS["default"])
    current_time = int(time.time())
    window_key = f"rate_limit:{key}:{limit_type}:{current_time // window}"
    
    try:
        pipe = redis_client.pipeline()
        pipe.incr(window_key)
        pipe.expire(window_key, window)
        results = pipe.execute()
        
        current_count = results[0]
        return current_count <= limit
    except Exception:
        return True

def get_rate_limit_headers(limit_type: str = "default") -> dict:
    limit, window = RATE_LIMITS.get(limit_type, RATE_LIMITS["default"])
    return {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Window": str(window)
    }

async def rate_limit_middleware(request: Request, call_next):
    if not request.url.path.startswith("/"):
        return await call_next(request)
    
    client_ip = request.client.host if request.client else "unknown"
    path = request.url.path
    
    if "/messages" in path:
        limit_type = "messages"
    elif "/posts" in path:
        limit_type = "posts"
    elif "/pvp" in path:
        limit_type = "pvp_matches"
    elif "/search" in path:
        limit_type = "search"
    else:
        limit_type = "default"
    
    key = f"{client_ip}:{path}"
    
    if not check_rate_limit(key, limit_type):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again later."
        )
    
    response = await call_next(request)
    return response
