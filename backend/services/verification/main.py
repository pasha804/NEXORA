from fastapi import FastAPI, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from common.database import get_db, engine
from common.models import Base
from services.verification.logic import verify_skill_logic
from pydantic import BaseModel
from redis import asyncio as aioredis
import asyncio
import json
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/verification")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

class VerificationRequest(BaseModel):
    skill_name: str
    method: str = "ai_test" # or 'github', 'peer'
    ai_score: float | None = None

@app.post("/verify/{user_id}")
async def verify_skill(
    user_id: int, 
    data: VerificationRequest, 
    db: Session = Depends(get_db)
):
    success = verify_skill_logic(
        user_id=user_id,
        skill_name=data.skill_name,
        db=db,
        method=data.method,
        ai_score=data.ai_score,
    )
    
    if success:
        # Emit Event for Blockchain Service to Mint Badge
        redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
        await redis.publish("nexora_events", json.dumps({
            "event": "skill_verified",
            "data": {
                "user_id": user_id,
                "skill_name": data.skill_name,
                "verification_level": "Verified"
            }
        }))
        return {"status": "verified", "minting_status": "pending"}
    
    return {"status": "failed"}

@app.get("/")
def health_check():
    return {"status": "verification-service running"}
