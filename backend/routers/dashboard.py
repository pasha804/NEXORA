from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from common import database, models
import auth as auth_module
import datetime

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"]
)

get_db = database.get_db

def _mmr_to_rank(mmr: int) -> str:
    if mmr >= 2200: return "Grandmaster"
    if mmr >= 1900: return "Master"
    if mmr >= 1600: return "Diamond"
    if mmr >= 1300: return "Platinum"
    if mmr >= 1100: return "Gold"
    if mmr >= 900: return "Silver"
    if mmr >= 700: return "Bronze"
    return "Novice"

@router.get("")
async def get_dashboard_data(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get aggregated dashboard data for the current user"""
    
    # Get user's profile
    profile = getattr(current_user, 'profile', None)
    stats = getattr(current_user, 'stats', None)
    
    # Get display name from profile or user
    display_name = None
    if profile and profile.display_name:
        display_name = profile.display_name
    elif current_user.display_name:
        display_name = current_user.display_name
    else:
        display_name = current_user.username
    
    # User Stats from database
    user_stats = {
        "id": current_user.id,
        "username": current_user.username,
        "display_name": display_name,
        "level": current_user.level,
        "xp": current_user.xp_points,
        "avatar_url": profile.avatar_url if profile else current_user.avatar_url,
        "ranking_score": current_user.ranking_score
    }
    
    # Get user's skills
    user_skills = db.query(models.UserSkill).filter(
        models.UserSkill.user_id == current_user.id
    ).all()
    
    # Get user's PvP stats
    pvp_rating = db.query(models.PvPRating).filter(
        models.PvPRating.user_id == current_user.id
    ).first()
    
    # Calculate competitive stats from actual data
    matches_played = pvp_rating.matches_played if pvp_rating else 0
    wins = pvp_rating.wins if pvp_rating else 0
    losses = pvp_rating.losses if pvp_rating else 0
    draws = pvp_rating.draws if pvp_rating else 0
    
    win_rate = 0.0
    if matches_played > 0:
        win_rate = round((wins / matches_played) * 100, 1)
    
    current_rank = _mmr_to_rank(pvp_rating.mmr) if pvp_rating else "Novice"
    
    # Get user's badges/achievements
    badges = db.query(models.SkillBadge).filter(
        models.SkillBadge.user_id == current_user.id
    ).all()
    
    # Get recent activity
    recent_activity = db.query(models.UserActivity).filter(
        models.UserActivity.user_id == current_user.id
    ).order_by(models.UserActivity.created_at.desc()).limit(10).all()
    
    activity_feed = []
    for activity in recent_activity:
        activity_feed.append({
            "id": activity.id,
            "type": activity.activity_type,
            "content": activity.description,
            "timestamp": activity.created_at.isoformat() if activity.created_at else None
        })
    
    # If no activity, show skill-based content
    if not activity_feed:
        activity_feed = [
            {
                "id": 1,
                "type": "skill",
                "content": f"You have {len(user_skills)} skills registered",
                "timestamp": datetime.datetime.utcnow().isoformat()
            }
        ]
    
    # AI Recommendations - based on user's skills
    ai_recommendations = []
    
    # Get trending skills user doesn't have
    trending = db.query(
        models.Skill,
        func.count(models.UserSkill.id).label("user_count")
    ).outerjoin(
        models.UserSkill, models.Skill.id == models.UserSkill.skill_id
    ).group_by(
        models.Skill.id
    ).order_by(
        func.count(models.UserSkill.id).desc()
    ).limit(5).all()
    
    user_skill_names = [s.skill_name for s in user_skills]
    for skill, count in trending:
        if skill.canonical_name not in user_skill_names:
            ai_recommendations.append({
                "type": "skill",
                "title": f"Learn {skill.canonical_name}",
                "description": f"{count} users have this skill - trending now!"
            })
            if len(ai_recommendations) >= 3:
                break
    
    # Competitive Snapshot - real data
    competitive_stats = {
        "rank": current_rank,
        "win_rate": win_rate,
        "total_matches": matches_played,
        "wins": wins,
        "losses": losses,
        "draws": draws,
        "current_streak": pvp_rating.current_streak if pvp_rating else 0,
        "mmr": pvp_rating.mmr if pvp_rating else 1000
    }
    
    # Get user's interests
    interests = db.query(models.UserInterest).filter(
        models.UserInterest.user_id == current_user.id
    ).all()
    
    # Get live PvP matches
    live_matches = db.query(models.PvPMatch).filter(
        models.PvPMatch.status == "in_progress"
    ).limit(5).all()
    
    return {
        "user": user_stats,
        "skills": [
            {
                "name": s.skill_name,
                "level": s.skill_level,
                "xp": s.xp,
                "verified": s.verified
            } for s in user_skills
        ],
        "interests": [i.interest_tag for i in interests],
        "badges": [
            {
                "id": b.id,
                "skill_name": b.skill_name,
                "verification_method": b.verification_method
            } for b in badges
        ],
        "activity_feed": activity_feed,
        "ai_recommendations": ai_recommendations,
        "competitive_stats": competitive_stats,
        "live_matches": [
            {
                "id": m.id,
                "player1": m.player1.username if m.player1 else "Unknown",
                "player2": m.player2.username if m.player2 else "Waiting..."
            } for m in live_matches
        ]
    }
