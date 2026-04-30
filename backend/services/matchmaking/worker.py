import time
import json
import os
import redis
from sqlalchemy.orm import Session
from common.database import SessionLocal
from common.models import MatchQueue, Match, QueueStatus, MatchStatus
import uuid

# Helper to find matches
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.from_url(REDIS_URL)

def process_matchmaking():
    print("Matchmaking Worker Started...")
    while True:
        # Simple FIFO Matchmaking for MVP of Master Build
        # In 'Ultra Master', we would implement the Range expansion logic here.
        # Pop 2 users
        
        # Blocking pop to avoid busy wait
        # This is a simplification. A real ELO matcher would use ZRANGE on a Sorted Set.
        # Let's simulate ELO matching by taking a batch.
        
        item1 = redis_client.rpop("match_queue")
        if not item1:
            time.sleep(1)
            continue
            
        player1 = json.loads(item1)
        
        # Verify Player 1 is still waiting in DB
        db = SessionLocal()
        p1_db = db.query(MatchQueue).filter(MatchQueue.user_id == player1['user_id']).first()
        if not p1_db or p1_db.queue_status != QueueStatus.WAITING:
            db.close()
            continue # Skip invalid
            
        # Try to find p2
        item2 = redis_client.rpop("match_queue")
        if not item2:
            # No one else? Push p1 back (at head)
            redis_client.rpush("match_queue", item1) # Put back
            db.close()
            time.sleep(1)
            continue
            
        player2 = json.loads(item2)
        
        # Verify P2
        p2_db = db.query(MatchQueue).filter(MatchQueue.user_id == player2['user_id']).first()
        if not p2_db or p2_db.queue_status != QueueStatus.WAITING:
            redis_client.rpush("match_queue", item1) # Put P1 back
            db.close()
            continue
            
        # ELO Check (Simplified for now, assume match if in queue)
        # Note: In real logic, we'd check abs(p1.rating - p2.rating) < threshold
        
        # CREATE MATCH
        match_id = str(uuid.uuid4())
        new_match = Match(
            id=match_id,
            match_type="1v1",
            skill_type=player1['skill_type'],
            player1_id=player1['user_id'],
            player2_id=player2['user_id'],
            status=MatchStatus.ACTIVE # Auto start
        )
        db.add(new_match)
        
        # Update Queues
        p1_db.queue_status = QueueStatus.MATCHED
        p2_db.queue_status = QueueStatus.MATCHED
        
        db.commit()
        
        # Notify via Redis Pub/Sub (for Notification Service)
        event = {
            "type": "MATCH_FOUND",
            "match_id": match_id,
            "player1_id": player1['user_id'],
            "player2_id": player2['user_id']
        }
        redis_client.publish("pvp_events", json.dumps(event))
        
        print(f"Match Created: {match_id} | P1: {player1['user_id']} vs P2: {player2['user_id']}")
        db.close()

if __name__ == "__main__":
    process_matchmaking()
