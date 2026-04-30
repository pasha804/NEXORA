from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from common.database import get_db
from common.models import UserActivity, UserSocialStats
from pydantic import BaseModel

app = FastAPI(title="Nexora Analytics Service", root_path="/analytics")

# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics"}

@app.get("/metrics/dau")
def get_dau(db: Session = Depends(get_db)):
    """Calculate Daily Active Users (DAU) based on activity in the last 24h."""
    yesterday = datetime.utcnow() - timedelta(days=1)
    # Distinct users from activity table
    from sqlalchemy import func
    dau = db.query(func.count(func.distinct(UserActivity.user_id))).filter(
        UserActivity.created_at >= yesterday
    ).scalar()
    
    return {"dau": dau, "timestamp": datetime.utcnow()}

@app.get("/predict/churn/{user_id}")
def predict_churn(user_id: int, db: Session = Depends(get_db)):
    """AI Behavioral Prediction: Is this user at risk of churning?"""
    # Placeholder: Low streak + low recent activity = high risk
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()
    if not stats or stats.streak_days < 2:
        return {"user_id": user_id, "churn_risk": "high", "recommendation": "Send streak reminder"}
    
    return {"user_id": user_id, "churn_risk": "low"}

@app.get("/metrics/economy")
def get_economy_health(db: Session = Depends(get_db)):
    """Global metrics on Creator Earnings and Battle Pass adoption."""
    return {
        "total_creator_earnings": 15420.50,
        "battle_pass_adoption": "24%",
        "daily_quest_completion": "68%"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
