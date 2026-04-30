from common.celery_config import celery_app
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
r = redis.from_url(REDIS_URL)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://nexora:nexora123@postgres:5432/nexora_db")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

@celery_app.task(name="skill_trending_update")
def update_skill_trending():
    """
    Updates trending skills based on recent activity.
    Runs periodically to calculate trend scores.
    """
    from common.models import Skill, SkillActivityLog, SkillTrendingData
    
    db = SessionLocal()
    try:
        skills = db.query(Skill).all()
        
        for skill in skills:
            recent_activity = db.query(SkillActivityLog).filter(
                SkillActivityLog.skill_id == skill.id,
                SkillActivityLog.created_at >= func.now() - timedelta(days=7)
            ).count()
            
            trending = db.query(SkillTrendingData).filter(
                SkillTrendingData.skill_id == skill.id
            ).first()
            
            if not trending:
                trending = SkillTrendingData(
                    skill_id=skill.id,
                    skill_name=skill.canonical_name,
                    trend_score=0.0
                )
                db.add(trending)
            
            trending.engagement_volume = recent_activity
            trending.trend_score = recent_activity * 1.5
            trending.growth_rate = (recent_activity / 7.0) * 100 if recent_activity > 0 else 0
        
        db.commit()
        return "Skill trending updated"
    except Exception as e:
        db.rollback()
        return f"Error: {e}"
    finally:
        db.close()


@celery_app.task(name="leaderboard_recalculation")
def recalculate_leaderboards():
    """
    Recalculates global and skill-specific leaderboards.
    """
    from common.models import UserSkill, User, SkillLeaderboard, Skill
    from sqlalchemy import desc
    
    db = SessionLocal()
    try:
        skills = db.query(Skill).all()
        
        for skill in skills:
            leaderboard = db.query(UserSkill).filter(
                UserSkill.skill_id == skill.id
            ).order_by(desc(UserSkill.xp)).limit(100).all()
            
            for rank, user_skill in enumerate(leaderboard, 1):
                entry = db.query(SkillLeaderboard).filter(
                    SkillLeaderboard.skill_id == skill.id,
                    SkillLeaderboard.user_id == user_skill.user_id
                ).first()
                
                if not entry:
                    entry = SkillLeaderboard(
                        skill_id=skill.id,
                        user_id=user_skill.user_id
                    )
                    db.add(entry)
                
                entry.skill_xp = user_skill.xp
                entry.rank_position = rank
        
        db.commit()
        return "Leaderboards recalculated"
    except Exception as e:
        db.rollback()
        return f"Error: {e}"
    finally:
        db.close()


@celery_app.task(name="xp_decay")
def apply_xp_decay():
    """
    Applies XP decay to inactive skills.
    Skills not used for 30+ days lose some XP.
    """
    from common.models import UserSkill
    from datetime import timedelta
    
    db = SessionLocal()
    try:
        inactive_skills = db.query(UserSkill).filter(
            UserSkill.last_updated < func.now() - timedelta(days=30),
            UserSkill.xp > 0
        ).all()
        
        for user_skill in inactive_skills:
            decay_amount = int(user_skill.xp * 0.05)
            user_skill.xp = max(0, user_skill.xp - decay_amount)
        
        db.commit()
        return f"XP decay applied to {len(inactive_skills)} skills"
    except Exception as e:
        db.rollback()
        return f"Error: {e}"
    finally:
        db.close()


@celery_app.task(name="achievement_evaluation")
def evaluate_achievements():
    """
    Evaluates user achievements based on recent activity.
    """
    from common.models import User, Achievement, UserAchievement
    from datetime import timedelta
    
    db = SessionLocal()
    try:
        achievements = db.query(Achievement).all()
        users = db.query(User).all()
        
        for user in users:
            for achievement in achievements:
                existing = db.query(UserAchievement).filter(
                    UserAchievement.user_id == user.id,
                    UserAchievement.achievement_id == achievement.id
                ).first()
                
                if existing:
                    continue
                
                should_award = False
                
                if achievement.requirement_type == "followers":
                    from common.models import Follower
                    count = db.query(Follower).filter(
                        Follower.following_id == user.id
                    ).count()
                    should_award = count >= achievement.requirement_value
                
                elif achievement.requirement_type == "posts":
                    from common.models import Post, SkillPost
                    post_count = db.query(Post).filter(
                        Post.author_id == user.id
                    ).count()
                    skill_post_count = db.query(SkillPost).filter(
                        SkillPost.user_id == user.id
                    ).count()
                    should_award = (post_count + skill_post_count) >= achievement.requirement_value
                
                elif achievement.requirement_type == "wins":
                    from common.models import PvPMatchResult
                    wins = db.query(PvPMatchResult).filter(
                        PvPMatchResult.player_id == user.id,
                        PvPMatchResult.result == "win"
                    ).count()
                    should_award = wins >= achievement.requirement_value
                
                if should_award:
                    user_achievement = UserAchievement(
                        user_id=user.id,
                        achievement_id=achievement.id
                    )
                    db.add(user_achievement)
        
        db.commit()
        return "Achievements evaluated"
    except Exception as e:
        db.rollback()
        return f"Error: {e}"
    finally:
        db.close()


@celery_app.task(name="notification_dispatch")
def dispatch_notifications():
    """
    Processes queued notifications for delivery.
    """
    from common.models import Notification
    from datetime import timedelta
    
    db = SessionLocal()
    try:
        pending = db.query(Notification).filter(
            Notification.created_at >= func.now() - timedelta(hours=1)
        ).limit(1000).all()
        
        for notif in pending:
            payload = {
                "id": notif.id,
                "type": notif.type,
                "title": notif.title,
                "message": notif.message,
                "related_id": notif.related_id,
                "is_read": notif.is_read,
                "created_at": notif.created_at.isoformat() if notif.created_at else None,
            }
            r.publish(f"notifications:{notif.user_id}", json.dumps(payload))
        
        return f"Dispatched {len(pending)} notifications"
    except Exception as e:
        return f"Error: {e}"
    finally:
        db.close()


from datetime import timedelta
from sqlalchemy.sql import func
