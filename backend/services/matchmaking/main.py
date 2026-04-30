from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy.orm import Session
import redis
import json
import os
import time

# Import from common (assuming Docker build handles pythonpath)
from common.database import get_db
from common.models import User, MatchQueue, QueueStatus

app = FastAPI(root_path="/matchmaking")

# Auto-Run Migrations on Startup
from common.database import engine
from common.models import Base
Base.metadata.create_all(bind=engine)
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.from_url(REDIS_URL)

class QueueRequest(BaseModel):
    user_id: int
    skill_type: str = "general"

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "matchmaking"}

@app.post("/queue/join")
def join_queue(req: QueueRequest, db: Session = Depends(get_db)):
    # 1. Validate User
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Check if already in queue DB
    existing_entry = db.query(MatchQueue).filter(MatchQueue.user_id == req.user_id).first()
    if existing_entry:
        if existing_entry.queue_status == QueueStatus.MATCHED:
             # Clean up old match info if they are re-queuing? 
             # For now, just return existing status
             return {"status": "already_matched", "message": "You have a pending match!"}
        
    # 3. Add to Redis List for the Worker
    queue_item = {
        "user_id": req.user_id,
        "skill_type": req.skill_type,
        "rating": user.skill_rating,
        "timestamp": time.time()
    }
    
    # We use a sorted set in Redis for matchmaking implementation? 
    # Or just a simple list for the worker to process?
    # List is easier for FIFO, but Sorted Set is better for ELO matching.
    # Let's push to a Redis List 'matchmaking_queue'
    redis_client.lpush("match_queue", json.dumps(queue_item))
    
    # 4. Record in DB
    if not existing_entry:
        new_entry = MatchQueue(
            user_id=req.user_id, 
            skill_type=req.skill_type, 
            rating_snapshot=user.skill_rating,
            queue_status=QueueStatus.WAITING
        )
        db.add(new_entry)
    else:
        existing_entry.queue_status = QueueStatus.WAITING
        existing_entry.skill_type = req.skill_type
        
    db.commit()
    
    return {"status": "queued", "estimated_wait": 30}

@app.post("/queue/cancel")
def cancel_queue(req: QueueRequest, db: Session = Depends(get_db)):
    # Remove from DB
    entry = db.query(MatchQueue).filter(MatchQueue.user_id == req.user_id).first()
    if entry:
        db.delete(entry)
        db.commit()
    
    # Note: Removing from Redis List specifically is hard without scanning.
    # The worker should verify if user is still in DB before creating match.
    
    return {"status": "cancelled"}
