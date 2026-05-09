from sqlalchemy.orm import Session
from common.models import User, UserSocialStats, UserRank, Skill, UserSkill, Post, PvPMatch, UserConnection
from typing import Optional, List, Dict, Any

def get_user_skills(db: Session, user_id: int):
    """Fetch all skill IDs for a user"""
    skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    return {s.skill_id for s in skills}

def are_users_connected(db: Session, user1_id: int, user2_id: int):
    """Check if a direct connection exists between two users"""
    connection = db.query(UserConnection).filter(
        ((UserConnection.user1_id == user1_id) & (UserConnection.user2_id == user2_id)) |
        ((UserConnection.user1_id == user2_id) & (UserConnection.user2_id == user1_id))
    ).first()
    return connection is not None

def can_users_message(db: Session, sender_id: int, receiver_id: int):
    """
    Nexora Messaging Rule:
    1. Users with same skill can message instantly.
    2. Users with different skills must be connected.
    """
    # 1. Check direct connection
    if are_users_connected(db, sender_id, receiver_id):
        return True
    
    # 2. Check skill overlap
    sender_skills = get_user_skills(db, sender_id)
    receiver_skills = get_user_skills(db, receiver_id)
    
    overlap = sender_skills.intersection(receiver_skills)
    return len(overlap) > 0

def user_to_dict(user, db: Session) -> dict:
    """Converts a User model to a dictionary for the frontend."""
    from common.models import UserRank, UserSocialStats
    
    # Get rank info if available
    rank_info = db.query(UserRank).filter(UserRank.user_id == user.id).first()
    rank_name = rank_info.rank if rank_info else "Beginner"
    
    # Get social stats
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user.id).first()
    
    ai_score = 70  # Baseline
    if stats:
        ai_score += min(20, (stats.reputation_score / 100))
        ai_score += min(10, (stats.battle_wins / 5))
    
    ai_score = min(99, int(ai_score))
    
    # Map skills
    skill_list = []
    if hasattr(user, 'skills') and user.skills:
        skill_list = [{"id": s.id, "name": s.skill_name, "level": s.skill_level} for s in user.skills]

    return {
        "id": user.id,  # Keep as int — frontend uses it in API calls
        "username": user.username,
        "email": user.email,
        "display_name": user.display_name or user.username,
        "full_name": user.full_name,
        "bio": user.bio,
        "avatar_url": user.avatar_url,
        "banner_url": user.banner_url,
        "location": user.location or "The Nexus",
        "website": user.website,
        "is_verified": user.is_verified,
        "xp": user.xp_points,
        "level": user.level,
        "ranking_score": user.ranking_score,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "onboarding_completed": user.onboarding_completed,
        "online_status": getattr(user, 'online_status', 'offline'),
        "rank": stats.rank_level if stats else rank_name,
        "ai_match_score": ai_score,
        "ai_reason": "Top performer with high community reputation." if ai_score > 90 else "Growing creator in your niche.",
        "skills": skill_list,
        "location": user.location,
        "website": user.website,
        "experience_level": getattr(user.profile, "experience_level", None) if user.profile else None,
        "github_url": getattr(user.profile, "github_url", None) if user.profile else None,
        "linkedin_url": getattr(user.profile, "linkedin_url", None) if user.profile else None,
        "portfolio_links": getattr(user.profile, "portfolio_links", []) if user.profile else [],
        "experience_data": getattr(user.profile, "experience_data", []) if user.profile else [],
        "education_data": getattr(user.profile, "education_data", []) if user.profile else [],
        "projects_data": getattr(user.profile, "projects_data", []) if user.profile else [],
        "social_stats": {
            "followers": stats.followers_count if stats else 0,
            "following": stats.following_count if stats else 0,
            "battles_won": stats.battle_wins if stats else 0,
            "reputation_score": stats.reputation_score if stats else 500,
            "followers_count": stats.followers_count if stats else 0, # Add count fields for redundancy
            "following_count": stats.following_count if stats else 0
        },
        "followers_count": stats.followers_count if stats else 0,
        "following_count": stats.following_count if stats else 0
    }

def post_to_dict(post: Post, db: Session) -> dict:
    """Converts a social Post model to a dictionary for the frontend."""
    author = db.query(User).filter(User.id == post.author_id).first()
    return {
        "id": post.id,
        "content": post.content,
        "author": {
            "username": author.username if author else "unknown",
            "display_name": author.display_name if author else "User",
            "avatar_url": author.avatar_url if author else None
        },
        "media_url": post.media_url,
        "likes_count": post.likes_count,
        "comments_count": post.comments_count,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "post_type": post.post_type
    }

def match_to_dict(match: PvPMatch, db: Session) -> dict:
    """Converts a PvPMatch model to a dictionary for the frontend."""
    p1 = db.query(User).filter(User.id == match.player1_id).first()
    p2 = db.query(User).filter(User.id == match.player2_id).first()
    
    return {
        "id": match.id,
        "status": match.status,
        "player1": {
            "username": p1.username if p1 else "unknown",
            "avatar_url": p1.avatar_url if p1 else None
        },
        "player2": {
            "username": p2.username if p2 else "unknown",
            "avatar_url": p2.avatar_url if p2 else None
        } if p2 else None,
        "skill_id": match.skill_id,
        "battle_type": match.battle_type,
        "start_time": match.start_time.isoformat() if match.start_time else None
    }
