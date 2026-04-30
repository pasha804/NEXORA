from sqlalchemy.orm import Session
from common.models import UserSkill, UserConnection, Skill, Follower

def get_user_skill_ids(db: Session, user_id: int):
    """Fetch all skill IDs for a user"""
    skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    return {s.skill_id for s in skills}

def get_user_skill_names(db: Session, user_id: int):
    """Fetch all skill names for a user"""
    skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    return {s.skill_name for s in skills if s.skill_name}

def are_users_connected(db: Session, user1_id: int, user2_id: int):
    """Check if a direct connection exists between two users"""
    connection = db.query(UserConnection).filter(
        ((UserConnection.user1_id == user1_id) & (UserConnection.user2_id == user2_id)) |
        ((UserConnection.user1_id == user2_id) & (UserConnection.user2_id == user1_id))
    ).first()
    return connection is not None

def are_users_following(db: Session, user1_id: int, user2_id: int):
    """Check if user1 is following user2"""
    follow = db.query(Follower).filter(
        Follower.follower_id == user1_id,
        Follower.following_id == user2_id
    ).first()
    return follow is not None

def can_users_message(db: Session, sender_id: int, receiver_id: int):
    """
    Nexora Messaging Rule:
    1. Users with same skill can message instantly.
    2. Users with different skills must be connected (via connection request).
    
    Note: Following does NOT automatically grant messaging rights.
    Users must share a skill OR have an accepted connection.
    """
    if sender_id == receiver_id:
        return True
    
    if are_users_connected(db, sender_id, receiver_id):
        return True
    
    sender_skills = get_user_skill_ids(db, sender_id)
    receiver_skills = get_user_skill_ids(db, receiver_id)
    
    if sender_skills and receiver_skills:
        overlap = sender_skills.intersection(receiver_skills)
        if len(overlap) > 0:
            return True
    
    sender_skill_names = get_user_skill_names(db, sender_id)
    receiver_skill_names = get_user_skill_names(db, receiver_id)
    
    if sender_skill_names and receiver_skill_names:
        name_overlap = sender_skill_names.intersection(receiver_skill_names)
        if len(name_overlap) > 0:
            return True
    
    return False

def get_messaging_status(db: Session, sender_id: int, receiver_id: int) -> dict:
    """
    Returns detailed messaging status between two users.
    Used for UI to show why messaging is/isn't allowed.
    """
    if sender_id == receiver_id:
        return {
            "can_message": True,
            "reason": "self_message"
        }
    
    if are_users_connected(db, sender_id, receiver_id):
        return {
            "can_message": True,
            "reason": "connected",
            "shared_skills": list(get_user_skill_names(db, sender_id).intersection(get_user_skill_names(db, receiver_id)))
        }
    
    sender_skills = get_user_skill_names(db, sender_id)
    receiver_skills = get_user_skill_names(db, receiver_id)
    
    shared = sender_skills.intersection(receiver_skills)
    
    if shared:
        return {
            "can_message": True,
            "reason": "shared_skills",
            "shared_skills": list(shared)
        }
    
    return {
        "can_message": False,
        "reason": "no_connection",
        "sender_skills": list(sender_skills)[:5],
        "receiver_skills": list(receiver_skills)[:5]
    }
