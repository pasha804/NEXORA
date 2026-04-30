from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from common.database import get_db
from common.models import Match, MatchSubmission

app = FastAPI(root_path="/spectator")

@app.get("/health")
def health():
    return {"status": "ok", "service": "spectator"}

@app.get("/live_matches")
def get_live_matches(db: Session = Depends(get_db)):
    matches = db.query(Match).filter(Match.status == "active").all()
    return [{"id": m.id, "p1": m.player1_id, "p2": m.player2_id} for m in matches]

@app.get("/match/{match_id}")
def get_match_view(match_id: str, db: Session = Depends(get_db)):
    # In a real system, this might fetch from Redis cache for speed
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
        
    submissions = db.query(MatchSubmission).filter(MatchSubmission.match_id == match_id).all()
    
    return {
        "id": match.id,
        "status": match.status,
        "participants": {
            "p1": match.player1.username,
            "p2": match.player2.username
        },
        "submissions_count": len(submissions)
    }
