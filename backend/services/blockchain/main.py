from fastapi import FastAPI, Depends, Header
from sqlalchemy.orm import Session
from common.database import get_db, engine
from common.models import Base
from services.blockchain.logic import mint_badge_logic
from redis import asyncio as aioredis
import asyncio
import json
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/blockchain")
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
                
                if event == "skill_verified":
                    user_id = payload.get("user_id")
                    skill_name = payload.get("skill_name")
                    if user_id and skill_name:
                        db = next(get_db())
                        result = mint_badge_logic(user_id, skill_name, db)
                        print(f"Minted Mock NFT: {result}")
                        
            except Exception as e:
                print(f"Error processing event: {e}")

@app.get("/")
def health_check():
    return {"status": "blockchain-service running"}
