from sqlalchemy.orm import Session
from common.models import ExternalAccounts
import json

def link_platform_logic(user_id: int, platform: str, username: str, db: Session):
    """
    Mock logic to link external account and scrape stats.
    """
    existing = db.query(ExternalAccounts).filter(
        ExternalAccounts.user_id == user_id,
        ExternalAccounts.platform == platform
    ).first()
    
    if existing:
        return existing
        
    # Mock Scrape Data
    stats = {}
    if platform == "github":
        stats = {"repos": 42, "stars": 150, "contributions": 1200}
    elif platform == "linkedin":
        stats = {"connections": 500, "endorsements": 25}
        
    account = ExternalAccounts(
        user_id=user_id,
        platform=platform,
        platform_username=username,
        is_verified=True, # Mock successful auth
        imported_stats=json.dumps(stats),
        profile_url=f"https://{platform}.com/{username}"
    )
    
    db.add(account)
    db.commit()
    return account
