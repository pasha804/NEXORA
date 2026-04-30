from fastapi import FastAPI, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from common.database import get_db, engine
from common.models import Base, UserSecurityScore
from services.security.logic import analyze_text_toxicity, update_security_score
from pydantic import BaseModel
from redis import asyncio as aioredis
import asyncio
import json
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/security")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

class TextAnalysisRequest(BaseModel):
    text: str
    context: str = "profile_bio" # or 'message', 'comment'

@app.post("/analyze/{user_id}")
async def analyze_content(
    user_id: int, 
    data: TextAnalysisRequest, 
    db: Session = Depends(get_db)
):
    score = analyze_text_toxicity(data.text)
    
    if score > 0.1:
        updated_record = update_security_score(user_id, score, db)
        
        # Emit Event if penalty increased
        if score > 0.5:
            redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
            await redis.publish("nexora_events", json.dumps({
                "event": "security_update",
                "data": {
                    "user_id": user_id,
                    "penalty_score": updated_record.penalty_score
                }
            }))
            
    return {"toxicity_score": score, "flagged": score > 0.5}

@app.get("/{user_id}")
def get_security_score(user_id: int, db: Session = Depends(get_db)):
    score = db.query(UserSecurityScore).filter(UserSecurityScore.user_id == user_id).first()
    if not score:
        # Return clean default
        return {
            "toxicity_score": 0.0,
            "spam_probability": 0.0,
            "penalty_score": 0,
            "is_shadowbanned": False
        }
    return score

@app.get("/")
def health_check():
    return {"status": "security-service running"}
