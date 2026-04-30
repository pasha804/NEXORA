from fastapi import FastAPI, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from common.database import get_db, engine
from common.models import Base, CreatorMonetization
from services.monetization.logic import add_earnings
from pydantic import BaseModel
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/monetization")

class TipRequest(BaseModel):
    amount: float
    source: str = "tip"

@app.post("/tip/{user_id}")
def send_tip(user_id: int, data: TipRequest, db: Session = Depends(get_db)):
    # In real app, verify payment first
    updated_record = add_earnings(user_id, data.amount, data.source, db)
    return {"status": "success", "new_balance": updated_record.pending_payout}

@app.get("/{user_id}")
def get_monetization_stats(user_id: int, db: Session = Depends(get_db)):
    stats = db.query(CreatorMonetization).filter(CreatorMonetization.user_id == user_id).first()
    if not stats:
        return {"total_earnings": 0.0, "active_subscriptions": 0}
    return stats

@app.get("/")
def health_check():
    return {"status": "monetization-service running"}
