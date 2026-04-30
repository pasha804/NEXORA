from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from common.database import get_db
from common.models import SocialGraphEdge, User
from pydantic import BaseModel

app = FastAPI(title="Nexora Graph AI Service", root_path="/graph")

# --- Schemas ---
class ConnectionRequest(BaseModel):
    user_id: int
    target_id: int
    rel_type: str

# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok", "service": "graph-ai"}

@app.post("/connect")
def create_connection(req: ConnectionRequest, db: Session = Depends(get_db)):
    """Create a weighted edge between two users in the social graph."""
    edge = SocialGraphEdge(
        user_id=req.user_id,
        connected_user_id=req.target_id,
        relationship_type=req.rel_type,
        weight_score=1.0
    )
    db.add(edge)
    db.commit()
    return {"status": "connected"}

@app.get("/collaborators/{user_id}")
def suggest_collaborators(user_id: int, db: Session = Depends(get_db)):
    """Suggest collaborators based on skill clustering and graph proximity."""
    # Placeholder: find users connected via 'collaborator' or 'follower' paths
    connections = db.query(SocialGraphEdge).filter(
        SocialGraphEdge.user_id == user_id,
        SocialGraphEdge.relationship_type == "collaborator"
    ).limit(5).all()
    
    return connections

@app.get("/experts/{skill_name}")
def find_skill_experts(skill_name: str, db: Session = Depends(get_db)):
    """Find top experts in a specific skill category using graph centrality."""
    # Placeholder: find users with high weight scores in social graph edges
    experts = db.query(SocialGraphEdge).filter(
        SocialGraphEdge.relationship_type == "mentor"
    ).order_by(SocialGraphEdge.weight_score.desc()).limit(5).all()
    
    return experts

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
