from sqlalchemy.orm import Session
from common.models import CreatorMonetization

def add_earnings(user_id: int, amount: float, source: str, db: Session):
    """
    Add earnings to user's wallet.
    """
    monetization = db.query(CreatorMonetization).filter(CreatorMonetization.user_id == user_id).first()
    
    if not monetization:
        monetization = CreatorMonetization(user_id=user_id)
        db.add(monetization)
        
    monetization.total_earnings += amount
    monetization.pending_payout += amount
    
    if source == "tip":
        monetization.tips_received += amount
    elif source == "subscription":
        # logic to increment active_subscriptions if new? simplification for now
        pass
        
    db.commit()
    return monetization
