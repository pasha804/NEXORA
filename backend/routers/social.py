from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, func
from typing import List, Optional

from common.database import get_db
from common import models
from common.models import User, UserSkill, Skill, SkillPost, PvPMatch, Follower, UserSocialStats, UserAchievement, Achievement, Notification
import auth as auth_module
from common.redis_utils import cache_get, cache_set
from common.event_utils import emit_follow_created, emit_achievement_unlocked
from common.realtime_utils import emit_realtime_notification
from social_utils import user_to_dict

router = APIRouter(prefix="/social", tags=["Social"])

def _check_and_award_achievements(db: Session, user_id: int) -> List[dict]:
    """Check and award achievements after an action"""
    awarded = []
    
    user_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id
    ).all()
    earned_ids = {ua.achievement_id for ua in user_achievements}
    
    all_achievements = db.query(Achievement).all()
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()
    
    for achievement in all_achievements:
        if achievement.id in earned_ids:
            continue
        
        earned = False
        
        if achievement.requirement_type == "followers":
            if stats and stats.followers_count >= achievement.requirement_value:
                earned = True
        elif achievement.requirement_type == "posts":
            if stats and stats.posts_count >= achievement.requirement_value:
                earned = True
        elif achievement.requirement_type == "wins":
            if stats and stats.battle_wins >= achievement.requirement_value:
                earned = True
        elif achievement.requirement_type == "streak":
            if stats and stats.streak_days >= achievement.requirement_value:
                earned = True
        
        if earned:
            user_achievement = UserAchievement(
                user_id=user_id,
                achievement_id=achievement.id
            )
            db.add(user_achievement)
            
            if stats:
                stats.xp_total += achievement.xp_reward
            
            awarded.append({
                "id": achievement.id,
                "name": achievement.name,
                "xp_reward": achievement.xp_reward
            })
            
            emit_achievement_unlocked(user_id, achievement.id, achievement.name)
    
    if awarded:
        db.commit()
    
    return awarded

@router.post("/follow/{user_id}")
async def follow_user(
    user_id: int,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    existing = db.query(Follower).filter(
        Follower.follower_id == current_user.id,
        Follower.following_id == user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    follow = Follower(follower_id=current_user.id, following_id=user_id)
    db.add(follow)
    
    current_stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == current_user.id).first()
    if current_stats:
        current_stats.following_count += 1
    
    target_stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()
    if target_stats:
        target_stats.followers_count += 1
    
    db.commit()
    
    # Create follow notification for target user
    follow_notification = Notification(
        user_id=user_id,
        type="NEW_FOLLOWER",
        title="New Follower",
        message=f"{current_user.display_name or current_user.username} started following you",
        related_id=str(current_user.id)
    )
    db.add(follow_notification)
    db.commit()
    db.refresh(follow_notification)
    await emit_realtime_notification(follow_notification)
    
    emit_follow_created(current_user.id, user_id)
    
    achievements = _check_and_award_achievements(db, user_id)
    
    result = {"message": "Successfully followed user", "following_id": user_id}
    if achievements:
        result["achievements_unlocked"] = achievements
    
    return result

@router.post("/unfollow/{user_id}")
async def unfollow_user(
    user_id: int,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    follow = db.query(Follower).filter(
        Follower.follower_id == current_user.id,
        Follower.following_id == user_id
    ).first()
    
    if not follow:
        raise HTTPException(status_code=400, detail="Not following this user")
    
    db.delete(follow)
    
    current_stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == current_user.id).first()
    if current_stats and current_stats.following_count > 0:
        current_stats.following_count -= 1
    
    target_stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()
    if target_stats and target_stats.followers_count > 0:
        target_stats.followers_count -= 1
    
    db.commit()
    
    return {"message": "Successfully unfollowed user", "unfollowed_id": user_id}

@router.get("/followers/{user_id}")
async def get_followers(
    user_id: int,
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
    current_user: Optional[User] = Depends(auth_module.get_current_user_optional)
):
    """Get followers list with enriched profile data"""
    follower_rows = db.query(Follower).filter(
        Follower.following_id == user_id
    ).offset(offset).limit(limit).all()

    follower_ids = [f.follower_id for f in follower_rows]
    users = db.query(User).filter(User.id.in_(follower_ids)).all() if follower_ids else []

    result = []
    for u in users:
        stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == u.id).first()
        skills = db.query(models.UserSkill).filter(models.UserSkill.user_id == u.id).limit(3).all()
        is_following_back = False
        if current_user:
            is_following_back = db.query(Follower).filter(
                Follower.follower_id == current_user.id,
                Follower.following_id == u.id
            ).first() is not None

        result.append({
            "id": u.id,
            "username": u.username,
            "display_name": u.display_name or u.username,
            "avatar_url": u.avatar_url,
            "bio": u.bio,
            "is_verified": u.is_verified,
            "rank": stats.rank_level if stats else "Novice",
            "level": u.level or 1,
            "xp": u.xp_points or 0,
            "followers_count": stats.followers_count if stats else 0,
            "skills": [{"name": s.skill_name, "level": s.skill_level} for s in skills],
            "is_following": is_following_back,
        })

    return result


@router.get("/following/{user_id}")
async def get_following(
    user_id: int,
    db: Session = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
    current_user: Optional[User] = Depends(auth_module.get_current_user_optional)
):
    """Get following list with enriched profile data"""
    following_rows = db.query(Follower).filter(
        Follower.follower_id == user_id
    ).offset(offset).limit(limit).all()

    following_ids = [f.following_id for f in following_rows]
    users = db.query(User).filter(User.id.in_(following_ids)).all() if following_ids else []

    result = []
    for u in users:
        stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == u.id).first()
        skills = db.query(models.UserSkill).filter(models.UserSkill.user_id == u.id).limit(3).all()
        is_following_back = False
        if current_user:
            is_following_back = db.query(Follower).filter(
                Follower.follower_id == current_user.id,
                Follower.following_id == u.id
            ).first() is not None

        result.append({
            "id": u.id,
            "username": u.username,
            "display_name": u.display_name or u.username,
            "avatar_url": u.avatar_url,
            "bio": u.bio,
            "is_verified": u.is_verified,
            "rank": stats.rank_level if stats else "Novice",
            "level": u.level or 1,
            "xp": u.xp_points or 0,
            "followers_count": stats.followers_count if stats else 0,
            "skills": [{"name": s.skill_name, "level": s.skill_level} for s in skills],
            "is_following": is_following_back,
        })

    return result


@router.delete("/followers/{follower_id}")
async def remove_follower(
    follower_id: int,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a follower from your followers list"""
    follow = db.query(Follower).filter(
        Follower.follower_id == follower_id,
        Follower.following_id == current_user.id
    ).first()

    if not follow:
        raise HTTPException(status_code=404, detail="Follower not found")

    db.delete(follow)

    # Update counts
    their_stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == follower_id).first()
    if their_stats and their_stats.following_count > 0:
        their_stats.following_count -= 1

    my_stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == current_user.id).first()
    if my_stats and my_stats.followers_count > 0:
        my_stats.followers_count -= 1

    db.commit()
    return {"message": "Follower removed"}

@router.get("/is-following/{user_id}")
async def check_following(
    user_id: int,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    is_following = db.query(Follower).filter(
        Follower.follower_id == current_user.id,
        Follower.following_id == user_id
    ).first() is not None
    
    return {"is_following": is_following}

@router.get("/recommendations")
async def get_follow_recommendations(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
    limit: int = 20
):
    """
    Follow Recommendation Engine
    
    Recommends users based on:
    1. Shared skills (highest weight)
    2. Users followed by people you follow
    3. PvP opponents
    4. Skill category overlap
    
    Uses weighted scoring algorithm.
    """
    cache_key = f"follow_recommendations:{current_user.id}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    
    my_skill_ids = [s.skill_id for s in db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()]
    my_following_ids = [f.following_id for f in db.query(Follower).filter(Follower.follower_id == current_user.id).all()]
    my_following_ids.append(current_user.id)
    
    all_users = db.query(User).filter(~User.id.in_(my_following_ids)).all()
    
    recommendations = []
    for user in all_users:
        score = 0
        
        user_skill_ids = [s.skill_id for s in db.query(UserSkill).filter(UserSkill.user_id == user.id).all()]
        
        shared_skills = set(my_skill_ids) & set(user_skill_ids)
        score += len(shared_skills) * 10
        
        user_following = [f.following_id for f in db.query(Follower).filter(Follower.follower_id == user.id).all()]
        mutuals = set(my_following_ids) & set(user_following)
        score += len(mutuals) * 5
        
        pvp_matches = db.query(PvPMatch).filter(
            ((PvPMatch.player1_id == current_user.id) & (PvPMatch.player2_id == user.id)) |
            ((PvPMatch.player2_id == current_user.id) & (PvPMatch.player1_id == user.id))
        ).count()
        score += pvp_matches * 3
        
        if user.is_verified:
            score += 2
        
        if score > 0:
            recommendations.append({
                "id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "avatar_url": user.avatar_url,
                "is_verified": user.is_verified,
                "score": score,
                "reasons": {
                    "shared_skills": len(shared_skills),
                    "mutual_follows": len(mutuals),
                    "pvp_matches": pvp_matches
                }
            })
    
    recommendations.sort(key=lambda x: x["score"], reverse=True)
    recommendations = recommendations[:limit]
    
    cache_set(cache_key, recommendations, expire=300)
    
    return recommendations

@router.get("/recommended")
async def get_recommended_users(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Recommendation Logic:
    1. Users sharing the same skills
    2. Users in the same skill categories
    3. Fallback: Recently active users
    """
    # Get current user skills
    my_skill_ids = [s.skill_id for s in db.query(UserSkill).filter(UserSkill.user_id == current_user.id).all()]
    
    # Query users who have these skills (excluding self)
    recommended = []
    if my_skill_ids:
        recommended = db.query(User).join(UserSkill).filter(
            (UserSkill.skill_id.in_(my_skill_ids)) & (User.id != current_user.id)
        ).distinct().limit(10).all()

        # If not enough, get users with skills in same categories
        if len(recommended) < 5:
            my_category_ids = [sk.category_id for sk in db.query(Skill).filter(Skill.id.in_(my_skill_ids)).all() if sk.category_id]
            if my_category_ids:
                more = db.query(User).join(UserSkill).join(Skill).filter(
                    (Skill.category_id.in_(my_category_ids)) & (User.id != current_user.id) & (~User.id.in_([u.id for u in recommended]))
                ).distinct().limit(10 - len(recommended)).all()
                recommended.extend(more)

    # Fallback if no matching skills or user has no skills
    if len(recommended) < 5:
        existing_ids = [u.id for u in recommended] + [current_user.id]
        more_active = db.query(User).filter(
            ~User.id.in_(existing_ids)
        ).order_by(desc(User.last_seen)).limit(10 - len(recommended)).all()
        recommended.extend(more_active)

    return [user_to_dict(u, db) for u in recommended]

@router.get("/trending-skills")
async def get_trending_skills(db: Session = Depends(get_db)):
    cached = cache_get("trending_skills")
    if cached:
        return cached
    
    trending = db.query(
        Skill.id, Skill.canonical_name, func.count(UserSkill.id).label("count")
    ).join(UserSkill, Skill.id == UserSkill.skill_id).group_by(Skill.id).order_by(desc("count")).limit(6).all()
    
    result = [
        {"id": t.id, "name": t.canonical_name, "icon_url": None, "user_count": t.count} 
        for t in trending
    ]
    
    cache_set("trending_skills", result, expire=300)
    
    return result

@router.get("/home-feed")
async def get_home_feed_data(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    cache_key = f"home_feed:{current_user.id}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    
    recommended = await get_recommended_users(current_user, db)
    trending = await get_trending_skills(db)
    
    # 4. Global Activity (Alternative to personal feed if empty)
    try:
        from social_utils import post_to_dict, match_to_dict
        recent_posts_objs = db.query(models.Post).order_by(models.Post.created_at.desc()).limit(10).all()
        live_matches_objs = db.query(models.PvPMatch).filter(models.PvPMatch.status == "in_progress").limit(5).all()
        
        recent_posts = [post_to_dict(p, db) for p in recent_posts_objs]
        live_matches = [match_to_dict(m, db) for m in live_matches_objs]
    except Exception as e:
        print(f"Error fetching global feed: {e}")
        recent_posts = []
        live_matches = []

    result = {
        "trending": trending,
        "recommended_users": recommended,
        "recent_posts": recent_posts,
        "live_matches": live_matches
    }
    
    cache_set(cache_key, result, expire=120)
    
    return result

@router.get("/activity/global")
async def get_global_activity(
    db: Session = Depends(get_db),
    limit: int = 50
):
    """
    Global Activity Stream
    
    Returns recent activities across the platform:
    - skill_verified
    - battle_won
    - achievement_unlocked
    - post_created
    - follow_created
    """
    cache_key = f"global_activity"
    cached = cache_get(cache_key)
    if cached:
        return cached
    
    activities = []
    
    recent_matches = db.query(PvPMatch).filter(
        PvPMatch.status == "completed"
    ).order_by(PvPMatch.end_time.desc()).limit(20).all()
    
    for match in recent_matches:
        if match.winner_id:
            winner = db.query(User).filter(User.id == match.winner_id).first()
            if winner:
                activities.append({
                    "type": "battle_won",
                    "user_id": winner.id,
                    "username": winner.username,
                    "display_name": winner.display_name,
                    "skill_type": match.skill_id,
                    "timestamp": match.end_time.isoformat() if match.end_time else None
                })
    
    recent_achievements = db.query(UserAchievement).order_by(
        UserAchievement.earned_at.desc()
    ).limit(20).all()
    
    for ua in recent_achievements:
        user = db.query(User).filter(User.id == ua.user_id).first()
        if user and ua.achievement:
            activities.append({
                "type": "achievement_unlocked",
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "achievement_name": ua.achievement.name,
                "timestamp": ua.earned_at.isoformat() if ua.earned_at else None
            })
    
    recent_posts = db.query(SkillPost).order_by(
        SkillPost.created_at.desc()
    ).limit(20).all()
    
    for post in recent_posts:
        author = db.query(User).filter(User.id == post.author_id).first()
        if author:
            activities.append({
                "type": "post_created",
                "user_id": author.id,
                "username": author.username,
                "display_name": author.display_name,
                "post_id": post.id,
                "timestamp": post.created_at.isoformat() if post.created_at else None
            })
    
    activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    activities = activities[:limit]
    
    cache_set(cache_key, activities, expire=60)
    
    return activities

@router.get("/feed/trending")
async def get_trending_feed(
    db: Session = Depends(get_db),
    limit: int = 20
):
    """
    Trending Feed Logic:
    1. Posts with highest engagement (likes + comments)
    2. Recent posts (within last 7 days)
    """
    from social_utils import post_to_dict
    
    trending_posts = db.query(SkillPost).order_by(
        desc(SkillPost.likes_count * 2 + SkillPost.comments_count * 5)
    ).limit(limit).all()
    
    return {
        "posts": [post_to_dict(p, db) for p in trending_posts]
    }
@router.get("/trending/all")
async def get_all_trends(db: Session = Depends(get_db)):
    """
    Unified trending data for the discovery strip.
    Returns trending hashtags, skills, communities, creators, and arenas.
    """
    # 1. Trending Skills (from DB)
    trending_skills = db.query(
        Skill.canonical_name, func.count(UserSkill.id).label("count")
    ).join(UserSkill).group_by(Skill.canonical_name).order_by(desc("count")).limit(5).all()
    skills = [s.canonical_name for s in trending_skills] or ["Python", "JavaScript", "React", "AI", "Rust"]

    # 2. Trending Posts / Hashtags (from DB)
    posts = db.query(SkillPost).order_by(SkillPost.created_at.desc()).limit(50).all()
    tags = ["#Code", "#Build", "#Ship", "#Growth"]
    if posts:
        # Just use some keywords from content
        tags = list(set([f"#{p.content.split()[0]}" for p in posts if p.content]))[:5]

    # 3. Trending Creators (top ranked users)
    creators = db.query(User).join(UserSocialStats).order_by(desc(UserSocialStats.reputation_score)).limit(5).all()
    creator_names = [f"@{u.username}" for u in creators] or ["@nexora", "@admin"]

    # 4. Trending Arenas (PVP matches counting by skill)
    arenas = db.query(
        Skill.canonical_name, func.count(PvPMatch.id).label("count")
    ).join(PvPMatch, PvPMatch.skill_id == Skill.id).group_by(Skill.canonical_name).order_by(desc("count")).limit(5).all()
    arena_names = [f"{a.canonical_name} Arena" for a in arenas] or ["Logic Duel", "Quick Build"]

    return {
        "posts": tags,
        "skills": skills,
        "communities": ["Skill Forge", "Dev Masters", "AI Builders"],
        "creators": creator_names,
        "arenas": arena_names
    }
