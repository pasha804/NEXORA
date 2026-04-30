from fastapi import FastAPI, Depends, Header
from sqlalchemy.orm import Session
from common.database import get_db, engine
from common.models import Base
from services.reputation.logic import update_user_reputation
from redis import asyncio as aioredis
import asyncio
import json
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/reputation")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(redis_listener())

async def redis_listener():
    redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
    pubsub = redis.pubsub()
    await pubsub.subscribe("nexora_events")
    
    async for message in pubsub.listen():
        if message["type"] == "message":
            try:
                data = json.loads(message["data"])
                event = data.get("event")
                payload = data.get("data")
                
                # Handle Social Updates (Follow/Unfollow)
                if event == "social_update":
                    target_id = payload.get("target_user_id")
                    if target_id:
                        # Create new DB session manually since we are in async task
                        db = next(get_db()) 
                        update_user_reputation(target_id, db)
                        
                # Handle Profile Updates (could affect completion score)
                elif event == "profile_update":
                    user_id = payload.get("user_id")
                    if user_id:
                         db = next(get_db())
                         update_user_reputation(user_id, db)
                
                # Handle Security Updates (Penalties)
                elif event == "security_update":
                    user_id = payload.get("user_id")
                    if user_id:
                        db = next(get_db())
                        update_user_reputation(user_id, db)
                         
            except Exception as e:
                print(f"Error processing event: {e}")

@app.get("/")
def health_check():
    return {"status": "reputation-service running"}

@app.get("/{user_id}")
def get_reputation(user_id: int, db: Session = Depends(get_db)):
    from common.models import UserReputation
    rep = db.query(UserReputation).filter(UserReputation.user_id == user_id).first()
    if not rep:
        return {"reputation_score": 500, "trust_level": "Neutral"}
    return rep

