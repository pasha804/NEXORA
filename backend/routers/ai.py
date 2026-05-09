from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from common.database import get_db
import auth as auth_module
from common.models import User
from common import models
import schemas
from datetime import datetime

router = APIRouter(prefix="/ai", tags=["AI Coach"])


# ==================== SKILL ANALYSIS ====================
@router.get("/skill-analysis")
async def get_skill_analysis(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns comprehensive skill analysis including radar chart data,
    skill levels, AI ratings, and improvement suggestions.
    """
    # Get real user skills
    user_skills = db.query(models.UserSkill).filter(
        models.UserSkill.user_id == current_user.id
    ).all()
    
    # Calculate radar chart data from real skills
    # Group by category if possible, or just use top 6 skills
    radar_skills = []
    if not user_skills:
        # Generic starting points if no skills
        radar_skills = [
            {"skill": "Programming", "level": 10, "maxLevel": 100},
            {"skill": "Design", "level": 10, "maxLevel": 100},
            {"skill": "Communication", "level": 10, "maxLevel": 100},
            {"skill": "Logic", "level": 10, "maxLevel": 100},
            {"skill": "Collaboration", "level": 10, "maxLevel": 100},
            {"skill": "Creativity", "level": 10, "maxLevel": 100},
        ]
    else:
        # Use existing skills for radar
        for s in user_skills[:6]:
            radar_skills.append({
                "skill": s.skill_name,
                "level": min(s.skill_level * 10 + (s.xp // 1000), 100),
                "maxLevel": 100
            })
        # Fills nodes to 6 for a balanced radar
        while len(radar_skills) < 6:
            radar_skills.append({"skill": "-", "level": 0, "maxLevel": 100})

    skill_breakdown = []
    for s in user_skills:
        skill_breakdown.append({
            "skill": s.skill_name,
            "level": s.skill_level,
            "aiScore": min(s.skill_level * 10 + 20, 95),
            "suggestion": f"Continue practicing {s.skill_name} and complete challenges.",
            "color": "neon-blue" if s.verified else "muted"
        })

    return {
        "radar_skills": radar_skills,
        "skill_breakdown": skill_breakdown,
        "overall_score": sum(s["level"] for s in radar_skills) // 6 if radar_skills else 0,
        "user_level": current_user.level,
        "xp_points": current_user.xp_points
    }


# ==================== LEARNING ROADMAP ====================
@router.get("/roadmap")
async def get_learning_roadmap(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Generates a personalized learning roadmap based on user's skill gaps
    and career goals.
    """
    # Simple dynamic roadmap based on top trending skills user doesn't have
    from routers.skills import get_trending_skills
    trending = await get_trending_skills(db)
    user_skills = [s.skill_name for s in current_user.skills]
    
    needed = [s["skill_name"] for s in trending if s["skill_name"] not in user_skills][:3]
    
    weeks = []
    if not needed:
        weeks = [
            {
                "week": 1,
                "title": "Master Your Current Skills",
                "status": "current",
                "tasks": [{"title": "Complete 5 challenges", "completed": False, "type": "practice"}]
            }
        ]
    else:
        for i, skill in enumerate(needed):
            weeks.append({
                "week": i + 1,
                "title": f"Master {skill}",
                "status": "current" if i == 0 else "upcoming",
                "tasks": [
                    {"title": f"Learn {skill} basics", "completed": False, "type": "learning"},
                    {"title": f"Build {skill} project", "completed": False, "type": "project"}
                ]
            })

    return {
        "weeks": weeks,
        "estimated_completion": f"{len(weeks)} weeks",
        "total_tasks": len(weeks) * 2,
        "completed_tasks": 0
    }


# ==================== CAREER PREDICTION ====================
@router.get("/career-predict")
async def predict_career_paths(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    AI-predicted career directions based on user's skill profile.
    """
    # Logic: map skill categories to career paths
    has_programming = any("prog" in s.skill_name.lower() for s in current_user.skills)
    has_design = any("design" in s.skill_name.lower() for s in current_user.skills)
    
    career_paths = []
    if has_programming:
        career_paths.append({
            "title": "Software Engineer",
            "compatibilityScore": 85,
            "requiredSkills": ["Problem Solving", "System Design"],
            "timeToMastery": "6 months",
            "marketDemand": "High",
            "avgSalary": "$90k - $150k",
            "description": "Focus on scalable architecture and clean code."
        })
    if has_design:
        career_paths.append({
            "title": "Product Designer",
            "compatibilityScore": 80,
            "requiredSkills": ["UI/UX", "User Research"],
            "timeToMastery": "4 months",
            "marketDemand": "Medium",
            "avgSalary": "$80k - $130k",
            "description": "Create intuitive user journeys and beautiful interfaces."
        })
    
    if not career_paths:
        return {"career_paths": [], "user_profile": current_user.username, "message": "Add more skills to get career predictions."}
        
    return {"career_paths": career_paths, "user_profile": current_user.username}


# ==================== AI RECOMMENDATIONS ====================
@router.get("/recommendations")
async def get_recommendations(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Personalized recommendations for courses, collaborations, battles, and projects.
    """
    # Use trending skills for recommendations
    from routers.skills import get_trending_skills
    trending = await get_trending_skills(db)
    user_skills = [s.skill_name for s in current_user.skills]
    
    recommendations = []
    for s in trending:
        if s["skill_name"] not in user_skills:
            recommendations.append({
                "id": f"rec_{s['skill_name']}",
                "type": "skill",
                "title": f"Master {s['skill_name']}",
                "description": f"Trending skill with {s['engagement_volume']} active learners.",
                "matchScore": 90,
                "tags": [s["skill_name"], "Trending"]
            })
            if len(recommendations) >= 4:
                break
                
    return {"recommendations": recommendations}


# ==================== DAILY MISSIONS ====================
@router.get("/daily-missions")
async def get_daily_missions(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Auto-generated daily improvement tasks tailored to user needs.
    """
    # Logic: missions based on user skills and activity
    missions = [
        {
            "id": "m1",
            "title": "Participate in 1 PvP Battle",
            "description": "Test your speed and logic against others.",
            "xpReward": 100,
            "completed": False
        }
    ]
    
    # Add skill-specific mission if user has skills
    if current_user.skills:
        skill = current_user.skills[0].skill_name
        missions.append({
            "id": "m2",
            "title": f"Practice {skill}",
            "description": f"Master the fundamentals of {skill}.",
            "xpReward": 50,
            "completed": False
        })
    else:
        missions.append({
            "id": "m2",
            "title": "Add a new skill",
            "description": "Start your journey by adding your first skill.",
            "xpReward": 50,
            "completed": False
        })
    
    # Check for completed missions (simplified logic for now)
    # In a real app, this would check a 'UserMissionProgress' table
    
    return {"missions": missions, "totalXP": sum(m["xpReward"] for m in missions), "completedCount": 0}


@router.get("/alerts")
async def get_ai_alerts(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Return AI coach alerts for SmartAlerts panel."""
    pvp_rating = db.query(models.PvPRating).filter(
        models.PvPRating.user_id == current_user.id
    ).first()
    social_stats = db.query(models.UserSocialStats).filter(
        models.UserSocialStats.user_id == current_user.id
    ).first()

    streak_days = social_stats.streak_days if social_stats else 0
    wins = pvp_rating.wins if pvp_rating else 0
    matches = pvp_rating.matches_played if pvp_rating else 0
    win_rate = round((wins / matches) * 100) if matches else 0
    now = datetime.utcnow().isoformat()

    alerts = [
        {
            "id": "focus_tip",
            "type": "tip",
            "title": "Focus window detected",
            "message": "Your best performance comes from uninterrupted 45-minute practice blocks.",
            "timestamp": now,
            "read": False,
            "actionText": "Start now"
        },
        {
            "id": "streak_status",
            "type": "success" if streak_days >= 3 else "warning",
            "title": "Consistency signal",
            "message": f"Current learning streak: {streak_days} day(s). Keep momentum alive today.",
            "timestamp": now,
            "read": False,
            "actionText": "View goals"
        },
        {
            "id": "pvp_health",
            "type": "info" if matches == 0 else ("success" if win_rate >= 50 else "warning"),
            "title": "PvP performance pulse",
            "message": "No PvP history yet. Play your first match to calibrate coaching."
            if matches == 0 else f"PvP win rate this cycle: {win_rate}% across {matches} matches.",
            "timestamp": now,
            "read": False,
            "actionText": "Open PvP"
        }
    ]
    return {"alerts": alerts}


@router.post("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    current_user: User = Depends(auth_module.get_current_user)
):
    """Acknowledge a SmartAlert. Persisting is optional for now."""
    return {"ok": True, "alert_id": alert_id, "user_id": current_user.id}


# ==================== GOALS & ACHIEVEMENTS ====================

@router.get("/goals", response_model=List[schemas.UserGoalResponse])
async def get_user_goals(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch active and completed goals for the current user."""
    goals = db.query(models.UserGoal).filter(
        models.UserGoal.user_id == current_user.id
    ).order_by(models.UserGoal.created_at.desc()).all()
    return goals

@router.post("/goals", response_model=schemas.UserGoalResponse)
async def create_user_goal(
    goal_data: schemas.UserGoalCreate,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new personal goal."""
    new_goal = models.UserGoal(
        user_id=current_user.id,
        title=goal_data.title,
        category=goal_data.category,
        target=goal_data.target,
        reward=goal_data.reward,
        progress=0.0,
        completed=False
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)
    return new_goal

@router.get("/achievements", response_model=List[schemas.AchievementResponse])
async def get_achievements(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch user achievements and locked milestones."""
    # Get earned achievements
    user_achs = db.query(models.UserAchievement).filter(
        models.UserAchievement.user_id == current_user.id
    ).all()
    earned_ids = [ua.achievement_id for ua in user_achs]
    
    # Get all achievements to show locked ones too
    all_achs = db.query(models.Achievement).all()
    
    # Get badges as well (treat as achievements for UI)
    badges = db.query(models.SkillBadge).filter(
        models.SkillBadge.user_id == current_user.id
    ).all()
    
    results = []
    for ach in all_achs:
        is_unlocked = ach.id in earned_ids
        unlocked_date = next((ua.earned_at for ua in user_achs if ua.achievement_id == ach.id), None)
        
        results.append(schemas.AchievementResponse(
            id=ach.id,
            title=ach.name,
            description=ach.description,
            icon=ach.icon,
            category=ach.category,
            xp_reward=ach.xp_reward,
            rarity=ach.rarity,
            unlocked=is_unlocked,
            unlocked_date=unlocked_date
        ))
        
    # Map badges to achievements structure
    for badge in badges:
        results.append(schemas.AchievementResponse(
            id=1000 + badge.id, # Avoid ID collision
            title=f"{badge.skill_name} Badge",
            description=f"Verified {badge.skill_name} skill via {badge.verification_method}",
            icon="🎖️",
            category="skill",
            xp_reward=100,
            rarity=badge.verification_level.lower() if badge.verification_level else "common",
            unlocked=True,
            unlocked_date=badge.issued_at
        ))
        
    return results


@router.get("/goals-tracker", response_model=schemas.GoalsTrackerResponse)
async def get_goals_tracker_data(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Unified endpoint for the GoalsTracker component."""
    goals = await get_user_goals(current_user, db)
    achievements = await get_achievements(current_user, db)
    missions_data = await get_daily_missions(current_user, db)
    
    return {
        "goals": goals,
        "achievements": achievements,
        "daily_missions": missions_data["missions"]
    }


# ==================== PERFORMANCE ANALYTICS ====================
@router.get("/performance-analytics")
async def get_performance_analytics(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns comprehensive analytics for the AI Coach page.
    """
    # Get real PvP stats
    pvp_rating = db.query(models.PvPRating).filter(
        models.PvPRating.user_id == current_user.id
    ).first()
    
    # Get social stats (for streak, etc)
    social_stats = db.query(models.UserSocialStats).filter(
        models.UserSocialStats.user_id == current_user.id
    ).first()
    
    # Calculate career readiness (simulated logic based on skills and XP)
    skill_count = len(current_user.skills)
    readiness = min(40 + (skill_count * 5) + (current_user.xp_points // 1000), 100)
    
    analytics = {
        "xp_growth": [
            {"date": "Current", "xp": current_user.xp_points},
        ],
        "battle_stats": {
            "total_matches": pvp_rating.matches_played if pvp_rating else 0,
            "wins": pvp_rating.wins if pvp_rating else 0,
            "losses": pvp_rating.losses if pvp_rating else 0,
            "win_rate": round((pvp_rating.wins / pvp_rating.matches_played * 100), 1) if pvp_rating and pvp_rating.matches_played > 0 else 0,
            "current_streak": pvp_rating.current_streak if pvp_rating else 0
        },
        "skill_progression": [
            {"skill": s.skill_name, "week1": 0, "week4": s.skill_level}
            for s in current_user.skills[:3]
        ],
        "weekly_stats": {
            "lessons_completed": 0, # Should be real if we had a lesson table
            "lessons_target": 10,
            "battles_won": pvp_rating.wins if pvp_rating else 0,
            "battles_target": 7,
            "streak": social_stats.streak_days if social_stats else 0,
            "xp_earned": current_user.xp_points
        },
        "coaching_stats": {
            "total_hours": round(current_user.xp_points / 200, 1),
            "skills_improved": skill_count,
            "recommendations_used": 0,
            "career_readiness": f"{readiness}%"
        },
        "focus_tip": {
            "tip": "Your performance peaks when you tackle new challenges. Schedule your deep work coding matches during your most energetic hours for maximum progress.",
            "recommendation": "Block 'Focus Time' for your next PvP battle."
        }
    }
    
    return analytics


# ==================== AI CHAT ====================
@router.post("/chat")
async def ai_chat(
    message: dict,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Conversational AI coach endpoint.
    Body: {"message": "user message", "context": {}}
    Returns AI response based on user context.
    """
    user_message = message.get("message", "")
    
    # Use real user data to contextualize response
    user_level = current_user.level or 1
    top_skill = current_user.skills[0].skill_name if current_user.skills else "Programming"
    
    responses = [
        f"Based on your level {user_level} status and focus in {top_skill}, I recommend focusing on advanced architecture patterns today.",
        f"I see you're making great progress in {top_skill}! Would you like to try a challenge to test your knowledge?",
        "That's a great question! Let's break down how we can apply this to your current projects.",
        "Your growth trajectory is looking excellent. Have you considered exploring related technologies to broaden your skill base?",
        f"As a level {user_level} learner, you're at the perfect stage to start mentoring others or leading small projects."
    ]
    
    import random
    ai_response = random.choice(responses)
    
    return {
        "response": ai_response,
        "context": {"user_level": user_level, "primary_skill": top_skill},
        "suggested_actions": ["Take a quiz", "Start a micro-lesson", "Practice challenge"]
    }


# ==================== INDUSTRY TRENDS ====================
@router.get("/industry-trends")
async def get_industry_trends(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Provides trending skills, salary data, and job demand predictions.
    """
    trends = {
        "trending_skills": [
            {"skill": "AI/ML Engineering", "growth": "+45%", "demand": "Very High"},
            {"skill": "React & Next.js", "growth": "+32%", "demand": "High"},
            {"skill": "TypeScript", "growth": "+28%", "demand": "High"},
            {"skill": "Cloud (AWS/Azure)", "growth": "+40%", "demand": "Very High"},
            {"skill": "Rust", "growth": "+55%", "demand": "Medium"},
        ],
        "salary_trends": {
            "Frontend": "$95k - $140k",
            "Backend": "$100k - $150k",
            "Full Stack": "$110k - $165k",
            "DevOps": "$105k - $155k",
            "AI/ML": "$130k - $200k"
        },
        "job_demand_forecast": {
            "next_6_months": "High demand for React/TypeScript developers",
            "next_year": "AI integration skills will be essential",
            "emerging_tech": ["Edge Computing", "Web3", "AI Copilots"]
        }
    }
    
    return trends
