from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional

from common.database import get_db
from common.models import User, UserSocialStats, DailyQuest, UserQuestStatus
from pydantic import BaseModel, ConfigDict

app = FastAPI(title="Nexora Gamification Service", root_path="/gamification")

# --- Schemas ---
class DailyQuestSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str
    quest_type: str
    xp_reward: int
    difficulty_score: float
    created_at: datetime


class XPRequest(BaseModel):
    user_id: int
    amount: int
    source_type: str # social, competitive, contribution, streak_bonus

class StreakInfo(BaseModel):
    user_id: int
    streak_days: int
    multiplier: float

# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok", "service": "gamification"}

@app.post("/reward_xp")
def reward_xp(request: XPRequest, db: Session = Depends(get_db)):
    """Reward XP to a user based on source and current multiplier."""
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == request.user_id).first()
    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    
    # Apply multiplier (except for bonus XP itself)
    final_amount = request.amount
    if request.source_type != "streak_bonus":
        final_amount = int(request.amount * (stats.xp_multiplier or 1.0))
    
    stats.xp_total += final_amount
    
    # Level up logic (simplified: 1000 XP per level for now)
    new_level = (stats.xp_total // 1000) + 1
    # stats.level = new_level # Note: level is on User model or Stats? 
    # Let's assume level is synced later or we update User Social Stats
    
    db.commit()
    return {"user_id": request.user_id, "awarded": final_amount, "total_xp": stats.xp_total}

@app.post("/update_streak")
def update_streak(user_id: int, db: Session = Depends(get_db)):
    """Update user streak based on daily activity."""
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()
    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    
    now = datetime.utcnow()
    last_updated = stats.streak_last_updated
    
    if last_updated:
        # If updated today, do nothing
        if last_updated.date() == now.date():
            return {"status": "already_updated", "streak": stats.streak_days}
        
        # If updated yesterday, increment
        if last_updated.date() == (now - timedelta(days=1)).date():
            stats.streak_days += 1
        else:
            # Streak broken
            stats.streak_days = 1
    else:
        stats.streak_days = 1
        
    stats.streak_last_updated = now
    
    # Update multiplier logic: 1.0 + (streak // 7) * 0.1 (capped at 2.0)
    stats.xp_multiplier = min(2.0, 1.0 + (stats.streak_days // 7) * 0.1)
    
    db.commit()
    return {"user_id": user_id, "streak": stats.streak_days, "multiplier": stats.xp_multiplier}

@app.get("/daily_quests/{user_id}", response_model=List[DailyQuestSchema])
def get_daily_quests(user_id: int, db: Session = Depends(get_db)):
    """Fetch daily quests for the user. Generates new ones if none exist for today."""
    # Simplified: return all available quests for now
    quests = db.query(DailyQuest).all()
    
    # In a real app, we would filter by date and user specific status
    return quests

@app.post("/complete_quest")
def complete_quest(user_id: int, quest_id: int, db: Session = Depends(get_db)):
    """Mark a daily quest as completed and reward XP."""
    quest = db.query(DailyQuest).filter(DailyQuest.id == quest_id).first()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    # Check if already completed today
    status = db.query(UserQuestStatus).filter(
        UserQuestStatus.user_id == user_id, 
        UserQuestStatus.quest_id == quest_id
    ).first()
    
    if status and status.is_completed:
        return {"status": "already_completed"}
    
    if not status:
        status = UserQuestStatus(user_id=user_id, quest_id=quest_id)
        db.add(status)
        
    status.is_completed = True
    status.completed_at = datetime.utcnow()
    
    # Reward XP
    reward_xp(XPRequest(user_id=user_id, amount=quest.xp_reward, source_type="quest"), db)
    
    db.commit()
    return {"status": "success", "reward": quest.xp_reward}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
