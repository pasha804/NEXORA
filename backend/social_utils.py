from sqlalchemy.orm import Session
from common.models import UserSkill, UserConnection, Skill

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
    from common.models import UserSkill, Follower, UserRank, UserSocialStats
    
    # Get rank info if available
    rank_info = db.query(UserRank).filter(UserRank.user_id == user.id).first()
    rank_name = rank_info.rank if rank_info else "Beginner"
    
    # Get social stats
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user.id).first()
    
    # Calculate AI Match Score based on skill overlap if current_user is available
    # For now, we compare against a common set or just provide a varying but realistic score
    ai_score = 70  # Baseline
    if stats:
        # Higher reputation and wins increase "discovery score"
        ai_score += min(20, (stats.reputation_score / 100))
        ai_score += min(10, (stats.battle_wins / 5))
    
    # Ensure score doesn't exceed 99
    ai_score = min(99, int(ai_score))
    
    # Map skills
    skill_list = []
    if hasattr(user, 'skills'):
        skill_list = [{"id": s.id, "name": s.skill_name, "level": s.skill_level} for s in user.skills]

    return {
        "id": str(user.id),
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
        "xp": user.xp_points, # Mapped to 'xp' for frontend consistency
        "level": user.level,
        "ranking_score": user.ranking_score,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "onboarding_completed": user.onboarding_completed,
        "online_status": getattr(user, 'online_status', 'offline'),
        "account_type": getattr(user, 'account_type', 'standard'),
        "rank": stats.rank_level if stats else rank_name,
        "ai_match_score": ai_score,
        "ai_reason": "Top performer with high community reputation." if ai_score > 90 else "Growing creator in your niche.",
        "skills": skill_list,
        "social_stats": {
            "followers": stats.followers_count if stats else 0,
            "following": stats.following_count if stats else 0,
            "battles_won": stats.battle_wins if stats else 0,
            "reputation_score": stats.reputation_score if stats else 500
        },
        "connections": stats.followers_count if stats else 0,
        "mutual_connections": 0 # Placeholder for future calculation
    }


def post_to_dict(post, db: Session) -> dict:
    from .models import Skill
    skill = db.query(Skill).filter(Skill.id == post.skill_id).first() if post.skill_id else None
    
    return {
        "id": str(post.id),
        "type": "discussion" if not post.media_url else "showcase",
        "title": post.content[:50] + "..." if len(post.content) > 50 else post.content,
        "description": post.content,
        "author": {
            "name": post.author.display_name or post.author.username,
            "avatar": post.author.avatar_url,
            "verified": post.author.is_verified
        },
        "thumbnail": post.media_url,
        "tags": [skill.canonical_name] if skill else [],
        "stats": {
            "views": (post.likes_count + post.comments_count) * 10,  # Simulated views based on engagement
            "likes": post.likes_count,
            "comments": post.comments_count,
            "shares": post.likes_count // 5
        },
        "trendingScore": post.likes_count * 2 + post.comments_count * 5,
        "timeAgo": "Recent",
        "featured": post.likes_count > 50
    }
