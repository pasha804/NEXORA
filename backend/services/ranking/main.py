from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from common.database import get_db
from common.models import User, Leaderboard, PvPRating
import math

app = FastAPI(root_path="/ranking")

class MatchResult(BaseModel):
    winner_id: int
    loser_id: int
    draw: bool = False

@app.get("/health")
def health():
    return {"status": "ok", "service": "ranking"}

def _mmr_to_rank(mmr: int) -> str:
    if mmr >= 2200: return "Grandmaster"
    if mmr >= 1900: return "Master"
    if mmr >= 1600: return "Diamond"
    if mmr >= 1300: return "Platinum"
    if mmr >= 1100: return "Gold"
    if mmr >= 900: return "Silver"
    if mmr >= 700: return "Bronze"
    return "Novice"

@app.post("/update_elo")
def update_elo(result: MatchResult, db: Session = Depends(get_db)):
    winner = db.query(User).filter(User.id == result.winner_id).first()
    loser = db.query(User).filter(User.id == result.loser_id).first()
    
    if not winner or not loser:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get or create PvP ratings
    winner_rating = db.query(PvPRating).filter(PvPRating.user_id == result.winner_id).first()
    loser_rating = db.query(PvPRating).filter(PvPRating.user_id == result.loser_id).first()
    
    if not winner_rating:
        winner_rating = PvPRating(user_id=result.winner_id, mmr=1000)
        db.add(winner_rating)
    if not loser_rating:
        loser_rating = PvPRating(user_id=result.loser_id, mmr=1000)
        db.add(loser_rating)
    
    db.commit()
    db.refresh(winner_rating)
    db.refresh(loser_rating)
        
    K = 32 # K-factor
    
    # ELO Formula using PvP ratings
    expected_winner = 1 / (1 + 10 ** ((loser_rating.mmr - winner_rating.mmr) / 400))
    expected_loser = 1 / (1 + 10 ** ((winner_rating.mmr - loser_rating.mmr) / 400))
    
    # Actual Score
    score_w = 0.5 if result.draw else 1
    score_l = 0.5 if result.draw else 0
    
    # New Ratings
    new_rating_w = winner_rating.mmr + K * (score_w - expected_winner)
    new_rating_l = loser_rating.mmr + K * (score_l - expected_loser)
    
    winner_rating.mmr = int(new_rating_w)
    loser_rating.mmr = int(new_rating_l)
    
    # Update Win/Loss Stats
    winner_rating.matches_played += 1
    loser_rating.matches_played += 1
    
    if result.draw:
        winner_rating.draws += 1
        loser_rating.draws += 1
    else:
        winner_rating.wins += 1
        loser_rating.losses += 1
    
    # Update streaks
    if result.draw:
        winner_rating.current_streak = 0
        loser_rating.current_streak = 0
    else:
        winner_rating.current_streak += 1
        loser_rating.current_streak = 0
    
    # Update highest MMR
    if winner_rating.mmr > winner_rating.highest_mmr:
        winner_rating.highest_mmr = winner_rating.mmr
    
    db.commit()
    
    # Update Leaderboard Table
    _update_leaderboard(db, winner_rating, winner)
    _update_leaderboard(db, loser_rating, loser)
    
    return {
        "winner_new_rating": winner_rating.mmr,
        "loser_new_rating": loser_rating.mmr,
        "winner_rank": _mmr_to_rank(winner_rating.mmr),
        "loser_rank": _mmr_to_rank(loser_rating.mmr)
    }

def _update_leaderboard(db: Session, rating: PvPRating, user: User):
    entry = db.query(Leaderboard).filter(Leaderboard.user_id == rating.user_id, Leaderboard.skill_type == "general").first()
    if not entry:
        entry = Leaderboard(user_id=rating.user_id, skill_type="general", rating=rating.mmr, rank_position=0)
        db.add(entry)
    else:
        entry.rating = rating.mmr
    db.commit()

@app.get("/leaderboard")
def get_leaderboard(db: Session = Depends(get_db)):
    """Get global rankings"""
    ratings = db.query(Leaderboard).order_by(Leaderboard.rating.desc()).limit(100).all()
    results = []
    for i, entry in enumerate(ratings):
        user = db.query(User).filter(User.id == entry.user_id).first()
        if user:
            rating = db.query(PvPRating).filter(PvPRating.user_id == entry.user_id).first()
            results.append({
                "rank": i + 1,
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name or user.username,
                "avatar_url": user.avatar_url,
                "rating": entry.rating,
                "rank_tier": _mmr_to_rank(entry.rating),
                "wins": rating.wins if rating else 0,
                "losses": rating.losses if rating else 0
            })
    return results
