from pydantic import BaseModel, field_serializer, field_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

# ==================== USER SCHEMAS ====================
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    username: Optional[str] = None
    display_name: Optional[str] = None  # alias accepted from frontend

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional['UserResponse'] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    display_name: Optional[str] = None
    username: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    experience_level: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_links: Optional[list[str]] = None
    experience_data: Optional[list[dict]] = None
    education_data: Optional[list[dict]] = None
    projects_data: Optional[list[dict]] = None
    xp: Optional[int] = None
    level: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool = True

    # Gamification fields (mapped from DB column names)
    xp: int = 0
    level: int = 1
    rank: str = "Novice"

    # Social counts (default 0 until follow system is built)
    followers_count: int = 0
    following_count: int = 0

    # Nested / derived data (empty defaults ensure frontend doesn't crash)
    skills: List[dict] = []
    interests: List[str] = []
    onboarding_completed: bool = False

    created_at: Optional[datetime] = None

    @field_serializer('created_at')
    def serialize_created_at(self, v: Optional[datetime]) -> Optional[str]:
        return v.isoformat() if v else None
    location: Optional[str] = None
    website: Optional[str] = None
    experience_level: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_links: List[str] = []
    experience_data: List[dict] = []
    education_data: List[dict] = []
    projects_data: List[dict] = []

    @classmethod
    def from_orm_user(cls, user) -> "UserResponse":
        """Map a SQLAlchemy User model to this response schema."""
        display_name = user.display_name or (user.profile.display_name if hasattr(user, 'profile') and user.profile else None) or user.full_name or user.username
        
        # Get stats for rank if available
        stats = getattr(user, 'stats', None)
        rank = stats.rank_level if stats and stats.rank_level else _level_to_rank(user.level or 1)
        
        return cls(
            id=user.id,
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            display_name=display_name,
            avatar_url=user.avatar_url,
            banner_url=user.banner_url or (getattr(user.profile, "banner_url", None) if hasattr(user, 'profile') and user.profile else None),
            bio=user.bio,
            is_active=user.is_active,
            xp=user.xp_points or 0, # Map xp_points to xp for frontend
            level=user.level or 1,
            rank=rank,
            followers_count=stats.followers_count if stats else 0,
            following_count=stats.following_count if stats else 0,
            skills=[{"id": s.id, "name": s.skill_name, "level": s.skill_level} for s in (user.skills or [])],
            interests=[i.interest_tag for i in (user.interests or [])],
            onboarding_completed=user.onboarding_completed or False,
            created_at=user.created_at if user.created_at else None,
            location=user.location,
            website=user.website,
            experience_level=getattr(user.profile, "experience_level", None) if hasattr(user, 'profile') and user.profile else None,
            github_url=getattr(user.profile, "github_url", None) if hasattr(user, 'profile') and user.profile else None,
            linkedin_url=getattr(user.profile, "linkedin_url", None) if hasattr(user, 'profile') and user.profile else None,
            portfolio_links=getattr(user.profile, "portfolio_links", []) if hasattr(user, 'profile') and user.profile else [],
            experience_data=getattr(user.profile, "experience_data", []) if hasattr(user, 'profile') and user.profile else [],
            education_data=getattr(user.profile, "education_data", []) if hasattr(user, 'profile') and user.profile else [],
            projects_data=getattr(user.profile, "projects_data", []) if hasattr(user, 'profile') and user.profile else [],
        )

    model_config = {"from_attributes": True}


def _level_to_rank(level: int) -> str:
    if level >= 50: return "Grandmaster"
    if level >= 30: return "Master"
    if level >= 20: return "Diamond"
    if level >= 10: return "Gold"
    if level >= 5:  return "Silver"
    if level >= 2:  return "Bronze"
    return "Novice"



# ==================== PvP SCHEMAS ====================

class PvPChallenge(BaseModel):
    id: int
    title: str
    description: str
    difficulty: str
    category: str
    time_limit_minutes: int
    xp_reward: int
    initial_code: Optional[str] = None
    test_cases: List[dict] = []

    class Config:
        from_attributes = True

class PvPMatch(BaseModel):
    id: str
    player1_id: int
    player2_id: Optional[int] = None
    status: str
    challenge_id: Optional[int] = None
    winner_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True

class PvPSubmission(BaseModel):
    id: int
    match_id: str
    player_id: int
    code_content: str
    status: str
    ai_score: int
    final_score: int
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== AI COACH SCHEMAS ====================

class SkillAnalysisResponse(BaseModel):
    """Response schema for skill analysis endpoint"""
    radar_skills: List[dict]  # [{"skill": str, "level": int, "maxLevel": int}]
    skill_breakdown: List[dict]  # [{"skill": str, "level": int, "aiScore": int, "suggestion": str, "color": str}]
    overall_score: int
    user_level: int
    xp_points: int

class RoadmapWeek(BaseModel):
    """Single week in learning roadmap"""
    week: int
    title: str
    status: str  # "completed", "current", "upcoming"
    tasks: List[dict]  # [{"title": str, "completed": bool, "type": str}]

class RoadmapResponse(BaseModel):
    """Response schema for learning roadmap"""
    weeks: List[RoadmapWeek]
    estimated_completion: str
    total_tasks: int
    completed_tasks: int

class CareerPath(BaseModel):
    """Single career path prediction"""
    title: str
    compatibilityScore: int
    requiredSkills: List[str]
    timeToMastery: str
    marketDemand: str  # "High", "Medium", "Low"
    avgSalary: str
    description: str

class CareerPredictionResponse(BaseModel):
    """Response schema for career predictions"""
    career_paths: List[CareerPath]
    user_profile: str

class Recommendation(BaseModel):
    """Single AI recommendation"""
    id: str
    type: str  # "course", "collaboration", "battle", "project"
    title: str
    description: str
    matchScore: int
    tags: List[str]

class RecommendationsResponse(BaseModel):
    """Response schema for recommendations"""
    recommendations: List[Recommendation]

class DailyMission(BaseModel):
    """Single daily mission"""
    id: str
    title: str
    description: str
    xpReward: int
    completed: bool

class DailyMissionsResponse(BaseModel):
    """Response schema for daily missions"""
    missions: List[DailyMission]
    totalXP: int
    completedCount: int

class PerformanceAnalyticsResponse(BaseModel):
    """Response schema for performance analytics"""
    xp_growth: List[dict]  # [{"date": str, "xp": int}]
    battle_stats: dict  # {"total_matches": int, "wins": int, "losses": int, "win_rate": float, "current_streak": int}
    skill_progression: List[dict]  # [{"skill": str, "week1": int, "week2": int, "week3": int, "week4": int}]
    weekly_improvement: int

class ChatRequest(BaseModel):
    """Request schema for AI chat"""
    message: str
    context: Optional[dict] = {}

class ChatResponse(BaseModel):
    """Response schema for AI chat"""
    response: str
    context: dict
    suggested_actions: List[str]

class IndustryTrendsResponse(BaseModel):
    """Response schema for industry trends"""
    trending_skills: List[dict]  # [{"skill": str, "growth": str, "demand": str}]
    salary_trends: dict  # role -> salary range mapping
    job_demand_forecast: dict  # forecast data


# ==================== REELS & COMMUNITIES ====================

class ReelBase(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    video_url: str
    thumbnail_url: Optional[str] = None
    caption: Optional[str] = None
    type: str = "showcase"
    skill_tags: List[str] = []

class ReelCreate(ReelBase):
    pass

class ReelResponse(ReelBase):
    id: str
    creator_id: int
    likes_count: int
    comments_count: int
    created_at: datetime
    creator: Optional[UserResponse] = None
    is_liked: bool = False

    class Config:
        from_attributes = True

class Reel(ReelResponse):
    pass

class CommunityBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    theme_color: str = "#3b82f6"
    privacy: str = "public"
    tags: List[str] = []

class CommunityCreate(CommunityBase):
    pass

class CommunityResponse(CommunityBase):
    id: int
    member_count: int
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Community(CommunityResponse):
    pass

class CommunityPost(BaseModel):
    id: int
    community_id: int
    author_id: int
    title: Optional[str] = None
    content: str
    type: str = "discussion"
    media_urls: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

class CommunityMember(BaseModel):
    id: int
    community_id: int
    user_id: int
    role: str = "member"
    joined_at: datetime
    
    class Config:
        from_attributes = True


# ==================== SOCIAL FEED SCHEMAS ====================

class PostBase(BaseModel):
    post_type: str = "text"
    content: str
    media_url: Optional[str] = None
    skill_tags: List[str] = []
    reference_id: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    author_id: int
    likes_count: int
    comments_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserActivityBase(BaseModel):
    activity_type: str
    reference_id: Optional[str] = None

class UserActivityResponse(UserActivityBase):
    id: int
    user_id: int
    timestamp: datetime

    class Config:
        from_attributes = True

class FeedResponse(BaseModel):
    posts: List[PostResponse]
    next_cursor: Optional[int] = None


# ==================== ULTRA GROWTH & GAMIFICATION SCHEMAS ====================

class UserProgressResponse(BaseModel):
    user_id: int
    xp_total: int
    streak_days: int
    battle_pass_tier: int
    xp_multiplier: float
    reputation_score: int
    rank_level: str

    class Config:
        from_attributes = True

class CreatorMetricsResponse(BaseModel):
    creator_id: int
    engagement_score: float
    content_quality_score: float
    authority_level: int
    monetization_earnings: float
    viral_velocity: float

    class Config:
        from_attributes = True

class DailyQuestResponse(BaseModel):
    id: int
    title: str
    description: str
    quest_type: str
    xp_reward: int
    difficulty_score: float

    class Config:
        from_attributes = True

class BattlePassTierResponse(BaseModel):
    tier_number: int
    xp_required: int
    reward_data: dict
    is_premium: bool

    class Config:
        from_attributes = True

class BattlePassSeasonResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    tiers: List[BattlePassTierResponse] = []

    class Config:
        from_attributes = True


# ==================== PAGINATION SCHEMAS ====================

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    limit: int
    has_next: bool
    has_prev: bool


# ==================== NOTIFICATION SCHEMAS ====================

class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: str
    title: str
    message: str
    related_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    user_id: int
    type: str
    title: str
    message: str
    related_id: Optional[str] = None


# ==================== MESSAGING SCHEMAS ====================

class ChatRoomResponse(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    last_message_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    id: int
    room_id: int
    sender_id: int
    receiver_id: int
    message_text: str
    message_type: str
    media_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    recipient_id: int
    text: str
    message_type: str = "text"


class RoomCreate(BaseModel):
    recipient_id: int


# ==================== CONNECTION SCHEMAS ====================

class ConnectionRequestResponse(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    status: str
    message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConnectionRequestCreate(BaseModel):
    receiver_id: int
    message: Optional[str] = None


class ConnectionResponse(BaseModel):
    id: int
    user1_id: int
    user2_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== PRESENCE SCHEMAS ====================

class PresenceResponse(BaseModel):
    user_id: int
    is_online: bool
    last_seen: datetime

    class Config:
        from_attributes = True


# ==================== SEARCH SCHEMAS ====================

class SearchResponse(BaseModel):
    users: List[dict] = []
    skills: List[dict] = []
    posts: List[dict] = []


# ==================== GOAL & ACHIEVEMENT SCHEMAS ====================

class UserGoalBase(BaseModel):
    title: str
    category: str = "skill"
    target: float = 100.0
    reward: Optional[str] = None

class UserGoalCreate(UserGoalBase):
    pass

class UserGoalResponse(UserGoalBase):
    id: int
    user_id: int
    progress: float
    completed: bool
    created_at: datetime

    class Config:
        from_attributes = True

class AchievementResponse(BaseModel):
    id: int
    title: str
    description: str
    icon: Optional[str] = None
    category: str
    xp_reward: int
    rarity: str
    unlocked: bool = False
    unlocked_date: Optional[datetime] = None

    class Config:
        from_attributes = True

class GoalsTrackerResponse(BaseModel):
    goals: List[UserGoalResponse]
    achievements: List[AchievementResponse]
    daily_missions: List[DailyMission]
