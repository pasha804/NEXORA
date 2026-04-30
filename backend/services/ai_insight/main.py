from fastapi import FastAPI, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from common.database import get_db, engine
from common.models import Base, AiProfileInsights
from services.ai_insight.logic import generate_insights_logic
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/ai-insight")

@app.post("/generate/{user_id}")
def generate_insights(user_id: int, db: Session = Depends(get_db)):
    insights = generate_insights_logic(user_id, db)
    return {"status": "generated", "career_prediction": insights.career_prediction}

@app.get("/{user_id}")
def get_insights(user_id: int, db: Session = Depends(get_db)):
    insights = db.query(AiProfileInsights).filter(AiProfileInsights.user_id == user_id).first()
    if not insights:
        # Auto-generate if missing
        insights = generate_insights_logic(user_id, db)
    
    return insights

@app.get("/")
def health_check():
    return {"status": "ai-insight-service running"}
