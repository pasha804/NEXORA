import os
import json
import redis
from typing import Optional, Any

_redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

try:
    redis_client = redis.from_url(_redis_url, decode_responses=True)
    redis_client.ping()
except Exception:
    redis_client = None

def get_redis():
    return redis_client

def cache_get(key: str) -> Optional[Any]:
    if not redis_client:
        return None
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None

def cache_set(key: str, value: Any, expire: int = 300):
    if not redis_client:
        return False
    try:
        redis_client.setex(key, expire, json.dumps(value))
        return True
    except Exception:
        return False

def cache_delete(key: str):
    if not redis_client:
        return False
    try:
        redis_client.delete(key)
        return True
    except Exception:
        return False

def cache_delete_pattern(pattern: str):
    if not redis_client:
        return False
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
        return True
    except Exception:
        return False
