from common.celery_config import celery_app
from common.database import SessionLocal
from common.models import MatchQueue, Match, QueueStatus, MatchStatus
import redis
import json
import os
import uuid
import time

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
r = redis.from_url(REDIS_URL)

@celery_app.task(name="process_matchmaking_queue")
def process_matchmaking_queue():
    """
    Background worker that pairs users in the queue.
    Runs periodically or on-demand.
    """
    db = SessionLocal()
    try:
        # 1. Fetch all elements from Redis list
        # We can implement a more advanced ELO matching here.
        # For now, simple FIFO pairing.
        queue_key = "match_queue"
        queue_len = r.llen(queue_key)
        
        if queue_len < 2:
            return "Not enough players in queue."

        # Pop 2 players
        p1_data = json.loads(r.rpop(queue_key))
        p2_data = json.loads(r.rpop(queue_key))

        # 2. Create Match in DB
        match_id = str(uuid.uuid4())
        new_match = Match(
            id=match_id,
            player1_id=p1_data["user_id"],
            player2_id=p2_data["user_id"],
            status=MatchStatus.ACTIVE
        )
        db.add(new_match)
        
        # 3. Update Queue Status in DB
        db.query(MatchQueue).filter(MatchQueue.user_id.in_([p1_data["user_id"], p2_data["user_id"]])).update(
            {"queue_status": QueueStatus.MATCHED}
        )
        
        db.commit()

        # 4. Notify Players (via Notifications Service)
        from services.notifications.tasks import send_notification
        send_notification.delay(p1_data["user_id"], f"Match found! Match ID: {match_id}", "matchmaking")
        send_notification.delay(p2_data["user_id"], f"Match found! Match ID: {match_id}", "matchmaking")

        return f"Match created: {match_id} between {p1_data['user_id']} and {p2_data['user_id']}"
    except Exception as e:
        db.rollback()
        return f"Error in matchmaking: {str(e)}"
    finally:
        db.close()
