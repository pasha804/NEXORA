from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from typing import Optional
from common import database, models
import schemas
import auth as auth_module
import os
import uuid

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

get_db = database.get_db

@router.get("/me", response_model=schemas.UserResponse)
async def read_users_me(current_user: models.User = Depends(auth_module.get_current_user)):
    """Get current authenticated user"""
    return schemas.UserResponse.from_orm_user(current_user)

@router.patch("/me", response_model=schemas.UserResponse)
async def update_user_profile(
    update_data: schemas.UserUpdate,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    update_dict = update_data.model_dump(exclude_unset=True)
    
    # Ensure profile exists
    profile = current_user.profile
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)
        db.flush()
    
    # Handle display_name update - propagate to both User and Profile
    if 'display_name' in update_dict:
        display_name = update_dict['display_name']
        current_user.display_name = display_name
        profile.display_name = display_name
    
    # Handle avatar_url - propagate to both User and Profile
    if 'avatar_url' in update_dict:
        avatar_url = update_dict['avatar_url']
        current_user.avatar_url = avatar_url
        profile.avatar_url = avatar_url
    
    # Handle banner_url - propagate to both User and Profile
    if 'banner_url' in update_dict:
        banner_url = update_dict['banner_url']
        current_user.banner_url = banner_url
        profile.banner_url = banner_url
    
    # Handle bio - propagate to both User and Profile
    if 'bio' in update_dict:
        bio = update_dict['bio']
        current_user.bio = bio
        profile.bio = bio
    
    # Handle other fields
    json_fields = {'portfolio_links', 'experience_data', 'education_data', 'projects_data'}
    profile_fields = {'experience_level', 'github_url', 'linkedin_url'} | json_fields

    for field, value in update_dict.items():
        if field in ['display_name', 'avatar_url', 'banner_url', 'bio']:
            continue
        elif field in ['location', 'website']:
            setattr(current_user, field, value)
        elif field == 'xp':
            setattr(current_user, 'xp_points', value)
        elif field in profile_fields:
            setattr(profile, field, value)
            # JSON mutable columns must be flagged so SQLAlchemy tracks the change
            if field in json_fields:
                flag_modified(profile, field)
        else:
            setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    db.refresh(profile)

    return schemas.UserResponse.from_orm_user(current_user)

@router.get("/me/completeness")
async def get_profile_completeness(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Get profile completeness score"""
    score = 0
    max_score = 100
    missing_fields = []
    
    # Check profile image (15%)
    profile = getattr(current_user, 'profile', None)
    if profile and profile.avatar_url:
        score += 15
    else:
        missing_fields.append("profile picture")
    
    # Check display name (10%)
    if current_user.display_name or (profile and profile.display_name):
        score += 10
    else:
        missing_fields.append("display name")
    
    # Check bio (15%)
    if profile and profile.bio:
        score += 15
    elif current_user.bio:
        score += 15
    else:
        missing_fields.append("bio")
    
    # Check skills (20%)
    skills = db.query(models.UserSkill).filter(models.UserSkill.user_id == current_user.id).count()
    if skills > 0:
        score += min(20, skills * 5)  # Max 20 points, 5 per skill
    else:
        missing_fields.append("skills")
    
    # Check interests (10%)
    interests = db.query(models.UserInterest).filter(models.UserInterest.user_id == current_user.id).count()
    if interests > 0:
        score += 10
    else:
        missing_fields.append("interests")
    
    # Check verified skills (15%)
    verified_skills = db.query(models.UserSkill).filter(
        models.UserSkill.user_id == current_user.id,
        models.UserSkill.verified == True
    ).count()
    score += min(15, verified_skills * 5)  # Max 15 points
    
    # Check PvP participation (15%)
    pvp_rating = db.query(models.PvPRating).filter(
        models.PvPRating.user_id == current_user.id
    ).first()
    if pvp_rating and pvp_rating.matches_played > 0:
        score += 15
    else:
        missing_fields.append("PvP participation")
    
    return {
        "completeness": score,
        "missing_fields": missing_fields,
        "recommendations": _get_completeness_recommendations(missing_fields)
    }

def _get_completeness_recommendations(missing_fields):
    recommendations = []
    if "profile picture" in missing_fields:
        recommendations.append("Add a profile picture to make your profile stand out")
    if "display name" in missing_fields:
        recommendations.append("Set a display name to personalize your profile")
    if "bio" in missing_fields:
        recommendations.append("Write a bio to tell others about yourself")
    if "skills" in missing_fields:
        recommendations.append("Add your skills to find compatible opponents")
    if "interests" in missing_fields:
        recommendations.append("Select interests to personalize your feed")
    if "PvP participation" in missing_fields:
        recommendations.append("Join a PvP battle to test your skills")
    return recommendations

@router.get("/{username}", response_model=schemas.UserResponse)
async def get_user_by_username(
    username: str,
    db: Session = Depends(get_db)
):
    """Get user profile by username"""
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/{user_id}/achievements")
async def get_user_achievements(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all achievements for a user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_achievements = db.query(models.UserAchievement).filter(
        models.UserAchievement.user_id == user_id
    ).all()
    
    all_achievements = db.query(models.Achievement).all()
    earned_ids = {ua.achievement_id for ua in user_achievements}
    
    return {
        "earned": [
            {
                "id": ua.achievement.id,
                "name": ua.achievement.name,
                "description": ua.achievement.description,
                "icon": ua.achievement.icon,
                "category": ua.achievement.category,
                "rarity": ua.achievement.rarity,
                "xp_reward": ua.achievement.xp_reward,
                "earned_at": ua.earned_at.isoformat() if ua.earned_at else None
            }
            for ua in user_achievements
        ],
        "available": [
            {
                "id": a.id,
                "name": a.name,
                "description": a.description,
                "icon": a.icon,
                "category": a.category,
                "rarity": a.rarity,
                "xp_reward": a.xp_reward,
                "requirement_type": a.requirement_type,
                "requirement_value": a.requirement_value
            }
            for a in all_achievements if a.id not in earned_ids
        ]
    }

@router.post("/me/achievements/check")
async def check_and_award_achievements(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Check and award achievements based on user activity"""
    awarded = []
    
    user_achievements = db.query(models.UserAchievement).filter(
        models.UserAchievement.user_id == current_user.id
    ).all()
    earned_ids = {ua.achievement_id for ua in user_achievements}
    
    all_achievements = db.query(models.Achievement).all()
    
    stats = db.query(models.UserSocialStats).filter(
        models.UserSocialStats.user_id == current_user.id
    ).first()
    
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
            user_achievement = models.UserAchievement(
                user_id=current_user.id,
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
    
    db.commit()
    
    return {
        "checked": len(all_achievements),
        "awarded": awarded
    }

@router.get("/{user_id}/stats")
async def get_user_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed stats for a user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    stats = db.query(models.UserSocialStats).filter(
        models.UserSocialStats.user_id == user_id
    ).first()
    
    followers_count = db.query(models.Follower).filter(
        models.Follower.following_id == user_id
    ).count()
    
    following_count = db.query(models.Follower).filter(
        models.Follower.follower_id == user_id
    ).count()
    
    posts_count = db.query(models.Post).filter(
        models.Post.author_id == user_id
    ).count()
    
    skill_count = db.query(models.UserSkill).filter(
        models.UserSkill.user_id == user_id
    ).count()
    
    verified_skill_count = db.query(models.UserSkill).filter(
        models.UserSkill.user_id == user_id,
        models.UserSkill.verified == True
    ).count()
    
    pvp_rating = db.query(models.PvPRating).filter(
        models.PvPRating.user_id == user_id
    ).first()
    
    achievements = db.query(models.UserAchievement).filter(
        models.UserAchievement.user_id == user_id
    ).count()
    
    return {
        "user_id": user_id,
        "username": user.username,
        "display_name": user.display_name,
        "social": {
            "followers": followers_count,
            "following": following_count,
            "posts": posts_count,
            "skills": skill_count,
            "verified_skills": verified_skill_count
        },
        "pvp": {
            "rating": pvp_rating.rating if pvp_rating else 1000,
            "wins": stats.battle_wins if stats else 0,
            "losses": stats.battle_losses if stats else 0,
            "matches_played": pvp_rating.matches_played if pvp_rating else 0
        } if pvp_rating or stats else None,
        "gamification": {
            "xp": user.xp_points,
            "level": user.level,
            "rank": stats.rank_level if stats else "Bronze V",
            "streak_days": stats.streak_days if stats else 0,
            "reputation_score": stats.reputation_score if stats else 500,
            "achievements": achievements
        } if stats or user else None,
        "profile": {
            "is_verified": user.is_verified,
            "account_type": user.account_type,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    }

@router.get("/analytics/platform")
async def get_platform_analytics(
    db: Session = Depends(get_db)
):
    """Get platform-wide analytics"""
    from datetime import datetime, timedelta
    
    now = datetime.utcnow()
    yesterday = now - timedelta(days=1)
    week_ago = now - timedelta(days=7)
    
    total_users = db.query(models.User).count()
    new_users_24h = db.query(models.User).filter(
        models.User.created_at >= yesterday
    ).count()
    
    total_posts = db.query(models.Post).count()
    new_posts_24h = db.query(models.Post).filter(
        models.Post.created_at >= yesterday
    ).count()
    
    total_skills = db.query(models.UserSkill).count()
    verified_skills = db.query(models.UserSkill).filter(
        models.UserSkill.verified == True
    ).count()
    
    total_pvp = db.query(models.PvPMatch).count()
    matches_24h = db.query(models.PvPMatch).filter(
        models.PvPMatch.created_at >= yesterday
    ).count()
    
    avg_session = 0
    return {
        "overview": {
            "total_users": total_users,
            "new_users_24h": new_users_24h,
            "total_posts": total_posts,
            "new_posts_24h": new_posts_24h,
            "total_skills": total_skills,
            "verified_skills": verified_skills,
            "total_pvp_matches": total_pvp,
            "matches_24h": matches_24h
        },
        "engagement": {
            "avg_session_duration_minutes": avg_session
        }
    }

@router.get("/{user_id}/reputation")
async def get_user_reputation(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Get user reputation score
    
    Factors:
    - Verified skills (30%)
    - Endorsements (20%)
    - PvP wins (20%)
    - Achievements (15%)
    - Followers (15%)
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    stats = db.query(models.UserSocialStats).filter(
        models.UserSocialStats.user_id == user_id
    ).first()
    
    verified_skills = db.query(models.UserSkill).filter(
        models.UserSkill.user_id == user_id,
        models.UserSkill.verified == True
    ).count()
    
    endorsements = db.query(models.SkillEndorsement).filter(
        models.SkillEndorsement.target_user_id == user_id
    ).count()
    
    achievements = db.query(models.UserAchievement).filter(
        models.UserAchievement.user_id == user_id
    ).count()
    
    followers_count = db.query(models.Follower).filter(
        models.Follower.following_id == user_id
    ).count()
    
    max_verified = 50
    max_endorsements = 100
    max_wins = 100
    max_achievements = 20
    max_followers = 100
    
    verified_score = min(verified_skills / max_verified, 1.0) * 30
    endorsement_score = min(endorsements / max_endorsements, 1.0) * 20
    wins_score = min((stats.battle_wins if stats else 0) / max_wins, 1.0) * 20
    achievement_score = min(achievements / max_achievements, 1.0) * 15
    followers_score = min(followers_count / max_followers, 1.0) * 15
    
    total_score = int(verified_score + endorsement_score + wins_score + achievement_score + followers_score)
    
    tier = "Bronze"
    if total_score >= 90:
        tier = "Diamond"
    elif total_score >= 75:
        tier = "Platinum"
    elif total_score >= 60:
        tier = "Gold"
    elif total_score >= 40:
        tier = "Silver"
    
    return {
        "user_id": user_id,
        "username": user.username,
        "reputation_score": total_score,
        "tier": tier,
        "breakdown": {
            "verified_skills": {
                "count": verified_skills,
                "score": round(verified_score, 1),
                "max": 30
            },
            "endorsements": {
                "count": endorsements,
                "score": round(endorsement_score, 1),
                "max": 20
            },
            "pvp_wins": {
                "count": stats.battle_wins if stats else 0,
                "score": round(wins_score, 1),
                "max": 20
            },
            "achievements": {
                "count": achievements,
                "score": round(achievement_score, 1),
                "max": 15
            },
            "followers": {
                "count": followers_count,
                "score": round(followers_score, 1),
                "max": 15
            }
        }
    }


@router.post("/profile/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db),
):
    """Upload or replace the current user's resume/CV."""
    allowed_content_types = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    if file.content_type not in allowed_content_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type for resume upload.",
        )

    base_dir = os.path.join(os.path.dirname(__file__), "..", "media", "resumes")
    user_dir = os.path.join(base_dir, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1] or ".pdf"
    filename = f"{uuid.uuid4().hex}{ext}"
    full_path = os.path.join(user_dir, filename)

    contents = await file.read()
    with open(full_path, "wb") as f:
        f.write(contents)

    relative_url = f"/media/resumes/{current_user.id}/{filename}"

    resume = models.UserResume(
        user_id=current_user.id,
        file_url=relative_url,
    )
    db.add(resume)

    profile = current_user.profile
    if not profile:
        profile = models.Profile(user_id=current_user.id)
        db.add(profile)
    profile.resume_url = relative_url

    db.commit()

    return {"file_url": relative_url}


@router.get("/profile/resume/{user_id}")
async def get_resume_metadata(
    user_id: int,
    db: Session = Depends(get_db),
):
    """Get the latest resume metadata for a user (URL and timestamp)."""
    resume = (
        db.query(models.UserResume)
        .filter(models.UserResume.user_id == user_id)
        .order_by(models.UserResume.uploaded_at.desc())
        .first()
    )
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    return {
        "user_id": user_id,
        "file_url": resume.file_url,
        "uploaded_at": resume.uploaded_at,
    }
