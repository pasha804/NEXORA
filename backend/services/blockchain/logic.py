from sqlalchemy.orm import Session
from common.models import SkillBadge
import uuid
import hashlib

def mint_badge_logic(user_id: int, skill_name: str, db: Session):
    """
    Simulates minting an NFT on Polygon.
    """
    badge = db.query(SkillBadge).filter(
        SkillBadge.user_id == user_id, 
        SkillBadge.skill_name == skill_name
    ).first()
    
    if not badge:
        return None
    
    # Mock Token ID and Hash
    token_id = str(uuid.uuid4())
    tx_hash = "0x" + hashlib.sha256(token_id.encode()).hexdigest()
    wallet = f"0xMockWallet{user_id}"
    
    badge.token_id = token_id
    badge.transaction_hash = tx_hash
    badge.wallet_address = wallet
    
    db.commit()
    return {"token_id": token_id, "tx_hash": tx_hash}
