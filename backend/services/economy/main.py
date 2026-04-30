from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from common.database import get_db
from common.models import User

app = FastAPI(root_path="/economy")

class RewardRequest(BaseModel):
    user_id: int
    xp_amount: int
    coin_amount: int
    source: str # 'match_win', 'daily_login', etc

@app.get("/health")
def health():
    return {"status": "ok", "service": "economy"}

@app.post("/reward")
def grant_reward(req: RewardRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.xp += req.xp_amount
    user.coins += req.coin_amount
    
    # Check Level Up Logic
    # Level = sqrt(XP) * const or linear?
    # Keeping it simple attribute update for now
    
    db.commit()
    
    return {
        "new_xp": user.xp,
        "new_coins": user.coins,
        "message": f"Granted {req.xp_amount} XP and {req.coin_amount} Coins"
    }
