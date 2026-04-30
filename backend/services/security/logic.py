from sqlalchemy.orm import Session
from common.models import UserSecurityScore
import re

TOXIC_KEYWORDS = ["scam", "spam", "fake", "bot", "hate", "abuse"] # Placeholder

def analyze_text_toxicity(text: str) -> float:
    """
    Returns a float 0.0 (clean) to 1.0 (toxic).
    Simple keyword mock.
    """
    if not text: return 0.0
    text = text.lower()
    score = 0.0
    for word in TOXIC_KEYWORDS:
        if word in text:
            score += 0.2
    return min(score, 1.0)

def update_security_score(user_id: int, toxicity_delta: float, db: Session):
    score = db.query(UserSecurityScore).filter(UserSecurityScore.user_id == user_id).first()
    
    if not score:
        score = UserSecurityScore(user_id=user_id)
        db.add(score)
    
    # Update running average or accumulation
    # For now, let's just add to penalty score if toxic
    if toxicity_delta > 0.5:
        score.toxicity_score = toxicity_delta
        score.penalty_score += 1 # Strike
    
    db.commit()
    return score
