from sqlalchemy.orm import Session
from common.models import UserReputation, UserSocialStats, UserSecurityScore, User

def calculate_reputation(user_id: int, db: Session) -> int:
    """
    Formula:
    Reputation Score = 
    (Skill XP * 0.35) + 
    (Followers * 2) + 
    (Social Trust * 0.20) + 
    (Professional Feedback * 0.15) - 
    (Penalty Score * 50)
    
    Capped at 10,000.
    """
    
    # Fetch Data
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()
    security = db.query(UserSecurityScore).filter(UserSecurityScore.user_id == user_id).first()
    # badges = ... (System 2)
    
    # Defaults
    xp = stats.xp_total if stats else 0
    followers = stats.followers_count if stats else 0
    penalty = security.penalty_score if security else 0
    
    # Simple Formula for V1
    # XP contributes max 3500 (assuming 10k XP is a lot)
    score_xp = min(xp * 0.35, 3500)
    
    # Followers contribute max 2500 (1250 followers)
    score_social = min(followers * 2, 2500)
    
    # Base Trust (New users start with 500)
    score_base = 500
    
    # Penalty
    score_penalty = penalty * 50
    
    total_score = score_base + score_xp + score_social - score_penalty
    total_score = max(0, min(10000, total_score)) # Clamp 0-10000
    
    return int(total_score)

def update_user_reputation(user_id: int, db: Session):
    reputation = db.query(UserReputation).filter(UserReputation.user_id == user_id).first()
    
    if not reputation:
        reputation = UserReputation(user_id=user_id)
        db.add(reputation)
    
    new_score = calculate_reputation(user_id, db)
    reputation.reputation_score = new_score
    
    # Determine Tier
    if new_score < 1000: reputation.trust_level = "Neutral"
    elif new_score < 3000: reputation.trust_level = "Trusted"
    elif new_score < 7000: reputation.trust_level = "Elite"
    else: reputation.trust_level = "Legend"
    
    db.commit()
    return new_score
