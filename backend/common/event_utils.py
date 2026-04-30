import os
import json
import redis
from typing import Optional, Dict, Any
from datetime import datetime

_redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

try:
    redis_client = redis.from_url(_redis_url, decode_responses=True)
    redis_client.ping()
except Exception:
    redis_client = None

EVENT_CHANNEL = "nexora_events"

def get_redis():
    return redis_client

def emit_event(event_type: str, data: Dict[str, Any]) -> bool:
    """
    Emit an event to the nexora_events Redis channel.
    
    Event types:
    - skill_verified
    - pvp_skill_result
    - achievement_unlocked
    - post_created
    - follow_created
    - skill_xp_decay
    - match_found
    - match_result
    - new_follower
    """
    if not redis_client:
        print(f"Warning: Redis not available, skipping event: {event_type}")
        return False
    
    try:
        event_data = {
            "event_type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        redis_client.publish(EVENT_CHANNEL, json.dumps(event_data))
        
        if redis_client:
            event_log_key = f"event_log:{event_type}"
            redis_client.lpush(event_log_key, json.dumps(event_data))
            redis_client.expire(event_log_key, 86400)
        
        return True
    except Exception as e:
        print(f"Error emitting event {event_type}: {e}")
        return False

def emit_skill_verified(user_id: int, skill_name: str, verification_level: str):
    return emit_event("skill_verified", {
        "user_id": user_id,
        "skill_name": skill_name,
        "verification_level": verification_level
    })

def emit_pvp_skill_result(winner_id: int, skill_type: str, xp_gained: int):
    return emit_event("pvp_skill_result", {
        "winner_id": winner_id,
        "skill_type": skill_type,
        "xp_gained": xp_gained
    })

def emit_achievement_unlocked(user_id: int, achievement_id: int, achievement_name: str):
    return emit_event("achievement_unlocked", {
        "user_id": user_id,
        "achievement_id": achievement_id,
        "achievement_name": achievement_name
    })

def emit_post_created(user_id: int, post_id: int, skill_tags: list):
    return emit_event("post_created", {
        "user_id": user_id,
        "post_id": post_id,
        "skill_tags": skill_tags
    })

def emit_follow_created(follower_id: int, following_id: int):
    return emit_event("follow_created", {
        "follower_id": follower_id,
        "following_id": following_id
    })

def emit_match_found(player1_id: int, player2_id: int, match_id: str, skill_type: str):
    return emit_event("match_found", {
        "player1_id": player1_id,
        "player2_id": player2_id,
        "match_id": match_id,
        "skill_type": skill_type
    })

def emit_match_result(match_id: str, winner_id: int, loser_id: int, skill_type: str):
    return emit_event("match_result", {
        "match_id": match_id,
        "winner_id": winner_id,
        "loser_id": loser_id,
        "skill_type": skill_type
    })

def emit_new_follower(user_id: int, follower_id: int):
    return emit_event("new_follower", {
        "user_id": user_id,
        "follower_id": follower_id
    })
