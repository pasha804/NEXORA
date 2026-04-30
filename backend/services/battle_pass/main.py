from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from common.database import get_db
from common.models import UserSocialStats, BattlePassSeason, BattlePassTier
from pydantic import BaseModel

app = FastAPI(title="Nexora Battle Pass Service", root_path="/battlepass")

# --- Schemas ---
class TierResponse(BaseModel):
    tier_number: int
    xp_required: int
    reward_data: dict
    is_premium: bool

class SeasonResponse(BaseModel):
    id: int
    name: str
    is_active: bool

# --- Logic ---

def calculate_tier_xp(tier: int, difficulty: float = 1.0):
    """Tier XP Requirement = Base XP (500) * Tier Number * Season Difficulty Multiplier"""
    base_xp = 500
    return int(base_xp * tier * difficulty)

# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok", "service": "battle-pass"}

@app.get("/current_season", response_model=SeasonResponse)
def get_current_season(db: Session = Depends(get_db)):
    season = db.query(BattlePassSeason).filter(BattlePassSeason.is_active == True).first()
    if not season:
        raise HTTPException(status_code=404, detail="No active season found")
    return season

@app.get("/tiers/{season_id}", response_model=List[TierResponse])
def get_season_tiers(season_id: int, db: Session = Depends(get_db)):
    tiers = db.query(BattlePassTier).filter(BattlePassTier.season_id == season_id).order_by(BattlePassTier.tier_number).all()
    return tiers

@app.get("/progress/{user_id}")
def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()
    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    
    current_tier = stats.battle_pass_tier
    season = get_current_season(db)
    
    # Calculate XP progress towards NEXT tier
    next_tier_number = current_tier + 1
    # For now, we use the formula directly since tiers might not be pre-baked in DB
    xp_for_next = calculate_tier_xp(next_tier_number)
    
    # Assuming xp_total is cumulative, we need to know xp at start of current tier
    # Simplified: progress is (current_xp % multiplier_factor)
    current_tier_xp = stats.xp_total % 5000 # Placeholder total capacity per tier
    
    return {
        "user_id": user_id,
        "current_tier": current_tier,
        "xp_total": stats.xp_total,
        "next_tier_xp_required": xp_for_next,
        "season_name": season.name
    }

@app.post("/unlock_tier")
def unlock_tier(user_id: int, db: Session = Depends(get_db)):
    """Check if user has enough XP to unlock next tier and update stats."""
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()
    if not stats:
        raise HTTPException(status_code=404, detail="User stats not found")
    
    next_tier = stats.battle_pass_tier + 1
    xp_required = calculate_tier_xp(next_tier)
    
    # Check if total XP is enough (simplified logic)
    if stats.xp_total >= xp_required:
        stats.battle_pass_tier = next_tier
        db.commit()
        return {"status": "unlocked", "new_tier": next_tier}
    
    return {"status": "locked", "xp_needed": xp_required - stats.xp_total}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
