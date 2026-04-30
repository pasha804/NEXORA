from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Float, JSON, Enum, Text
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()

class MatchStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    FINISHED = "finished"
    CANCELLED = "cancelled"

class QueueStatus(str, enum.Enum):
    WAITING = "waiting"
    MATCHED = "matched"
    CANCELLED = "cancelled"

class PrivacyLevel(str, enum.Enum):
    PUBLIC = "public"
    FOLLOWERS = "followers"
    PRIVATE = "private"

# ==========================================
# 1. USERS & PROFILE
# ==========================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    
    # Authenticated fields
    hashed_password = Column(String, nullable=False)
    
    # Profile Data
    display_name = Column(String, nullable=True)
    full_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(Text, nullable=True)  # Changed to Text for base64 images
    banner_url = Column(Text, nullable=True)  # Changed to Text for large URLs
    location = Column(String, nullable=True)
    website = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)

    # Gamification & Skills (Backwards Compatibility with nexora_core)
    xp_points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    ranking_score = Column(Integer, default=1000)
    
    # Permissions
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)

    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    onboarding_completed = Column(Boolean, default=False)
    online_status = Column(String, default="offline")  # online, offline, away
    
    # Relationships
    profile = relationship("Profile", uselist=False, back_populates="user")
    stats = relationship("UserSocialStats", uselist=False, back_populates="user")
    skills = relationship("UserSkill", back_populates="user")
    presence = relationship("UserPresence", uselist=False, back_populates="user")
    notifications = relationship("UserNotificationSettings", uselist=False, back_populates="user")
    account_settings = relationship("UserAccountSettings", uselist=False, back_populates="user")
    privacy_settings = relationship("UserPrivacySettings", uselist=False, back_populates="user")
    media = relationship("UserMedia", back_populates="user")
    projects = relationship("UserProject", backref="user")
    resumes = relationship("UserResume", backref="user", order_by="desc(UserResume.uploaded_at)")
    
    # Phase 2 Relationships
    reputation = relationship("UserReputation", uselist=False, back_populates="user")
    security_score = relationship("UserSecurityScore", uselist=False, back_populates="user")
    badges = relationship("SkillBadge", back_populates="user")
    ai_insights = relationship("AiProfileInsights", uselist=False, back_populates="user")
    monetization = relationship("CreatorMonetization", uselist=False, back_populates="user")
    external_accounts = relationship("ExternalAccounts", uselist=False, back_populates="user")
    
    # Social Feed & Activity Relationships
    posts = relationship("Post", back_populates="author")
    skill_posts = relationship("SkillPost", back_populates="author")
    activities = relationship("UserActivity", back_populates="user")
    interests = relationship("UserInterest", back_populates="user")
    reels = relationship("Reel", back_populates="creator")
    
    # PvP Relationships
    pvp_ratings = relationship("PvPRating", back_populates="user")
    pvp_matches = relationship("PvPMatch", foreign_keys="PvPMatch.player1_id")

    # Follow System (Self-Referencing Many-to-Many)
    followers = relationship(
        "Follower",
        foreign_keys="Follower.following_id",
        back_populates="following_user"
    )
    following = relationship(
        "Follower",
        foreign_keys="Follower.follower_id",
        back_populates="follower_user"
    )
    
    # Achievements
    achievements = relationship("UserAchievement", back_populates="user")

    # Legacy PvP Relationships
    matches_p1 = relationship("Match", foreign_keys="Match.player1_id", back_populates="player1")
    matches_p2 = relationship("Match", foreign_keys="Match.player2_id", back_populates="player2")
    submissions = relationship("MatchSubmission", back_populates="user")
    queue_entry = relationship("MatchQueue", back_populates="user", uselist=False)
    
    # Messaging & Notifications
    user_notifications = relationship("Notification", back_populates="user", foreign_keys="Notification.user_id")
    chat_rooms_user1 = relationship("ChatRoom", foreign_keys="ChatRoom.user1_id")
    chat_rooms_user2 = relationship("ChatRoom", foreign_keys="ChatRoom.user2_id")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id")
    received_messages = relationship("Message", foreign_keys="Message.receiver_id")
    
    # Connection System
    connection_requests_sent = relationship("ConnectionRequest", foreign_keys="ConnectionRequest.sender_id")
    connection_requests_received = relationship("ConnectionRequest", foreign_keys="ConnectionRequest.receiver_id")
    connections_as_user1 = relationship("UserConnection", foreign_keys="UserConnection.user1_id")
    connections_as_user2 = relationship("UserConnection", foreign_keys="UserConnection.user2_id")

    # Account Type
    account_type = Column(String, default="standard") # standard, pro, creator, admin

class Profile(Base):
    __tablename__ = "profiles"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    display_name = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(Text, nullable=True)  # Changed to Text for base64 images
    banner_url = Column(Text, nullable=True)  # Profile banner
    learning_goals = Column(Text, nullable=True)
    collaboration_preference = Column(String, nullable=True)
    privacy_setting = Column(String, default="public")
    # Extended profile fields
    experience_level = Column(String, nullable=True)  # e.g., Junior, Mid, Senior
    portfolio_links = Column(JSON, default=list)  # list of URLs
    github_url = Column(String, nullable=True)
    
    # LinkedIn-Style Professional Sections
    experience_data = Column(JSON, default=list) # Array of experience objects
    education_data = Column(JSON, default=list)  # Array of education objects
    projects_data = Column(JSON, default=list)   # Array of project objects
    linkedin_url = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)  # latest resume URL (optional convenience)

    user = relationship("User", back_populates="profile")


class UserProject(Base):
    __tablename__ = "user_projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    project_name = Column(String, nullable=False)
    project_description = Column(Text, nullable=True)
    project_link = Column(String, nullable=True)
    project_image = Column(String, nullable=True)
    tech_stack = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class UserResume(Base):
    __tablename__ = "user_resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    file_url = Column(String, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

class UserSocialStats(Base):
    __tablename__ = "user_social_stats"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    followers_count = Column(Integer, default=0)
    following_count = Column(Integer, default=0)
    posts_count = Column(Integer, default=0)
    reels_count = Column(Integer, default=0)
    
    # PvP Stats
    battle_wins = Column(Integer, default=0)
    battle_losses = Column(Integer, default=0)
    xp_total = Column(Integer, default=0)
    rank_level = Column(String, default="Bronze V")
    
    # Gamification & Growth (Phase 3)
    streak_days = Column(Integer, default=0)
    streak_last_updated = Column(DateTime(timezone=True), nullable=True)
    battle_pass_tier = Column(Integer, default=1)
    xp_multiplier = Column(Float, default=1.0)
    reputation_score = Column(Integer, default=500)
    
    user = relationship("User", back_populates="stats")

class Follower(Base):
    __tablename__ = "followers"
    
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"))
    following_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    follower_user = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following_user = relationship("User", foreign_keys=[following_id], back_populates="followers")

class UserSkill(Base):
    __tablename__ = "user_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    # Normalized skill reference
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True, index=True)
    skill_name = Column(String, nullable=False)
    skill_level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    endorsement_count = Column(Integer, default=0)
    is_primary = Column(Boolean, default=False)
    skill_integrity_score = Column(Float, default=1.0)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="skills")


class SkillEndorsement(Base):
    __tablename__ = "skill_endorsements"

    id = Column(Integer, primary_key=True, index=True)
    endorser_user_id = Column(Integer, ForeignKey("users.id"), index=True)
    target_user_id = Column(Integer, ForeignKey("users.id"), index=True)
    skill_name = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class UserInterest(Base):
    __tablename__ = "user_interests"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    interest_tag = Column(String, nullable=False)
    
    user = relationship("User", back_populates="interests")

class UserMedia(Base):
    __tablename__ = "user_media"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    media_url = Column(String, nullable=False)
    media_type = Column(String, default="image") # image, video
    thumbnail_url = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="media")

# ==========================================
# 2. SETTINGS & CONFIG
# ==========================================
class UserPrivacySettings(Base):
    __tablename__ = "user_privacy_settings"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    profile_visibility = Column(String, default=PrivacyLevel.PUBLIC)
    allow_messages = Column(String, default="everyone") # everyone, followers, none
    allow_tagging = Column(Boolean, default=True)
    show_activity_status = Column(Boolean, default=True)
    show_battle_history = Column(Boolean, default=True)
    show_skill_levels = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="privacy_settings")

class UserNotificationSettings(Base):
    __tablename__ = "user_notification_settings"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    email_notifications = Column(Boolean, default=True)
    battle_notifications = Column(Boolean, default=True)
    message_notifications = Column(Boolean, default=True)
    community_notifications = Column(Boolean, default=True)
    marketing_notifications = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="notifications")

class UserAccountSettings(Base):
    __tablename__ = "user_account_settings"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)

    two_factor_enabled = Column(Boolean, default=False)
    language = Column(String, default="en")
    theme_mode = Column(String, default="system") # light, dark, system
    content_filter_level = Column(String, default="standard") # strict, standard, off
    
    user = relationship("User", back_populates="account_settings")

# ... existing models ...

# ==========================================
# 4. PHASE 2: ADVANCED ECOSYSTEM
# ==========================================

class UserReputation(Base):
    __tablename__ = "user_reputation"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    reputation_score = Column(Integer, default=500) # 0 - 10000
    trust_level = Column(String, default="Neutral") # Unverified, Neutral, Trusted, Elite, Legend
    
    # Factor Scores
    skill_authority_score = Column(Float, default=0.0)
    social_trust_score = Column(Float, default=0.0)
    professional_credibility_score = Column(Float, default=0.0)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="reputation")

class UserSecurityScore(Base):
    __tablename__ = "user_security_score"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    toxicity_score = Column(Float, default=0.0)
    spam_probability = Column(Float, default=0.0)
    bot_probability = Column(Float, default=0.0)
    penalty_score = Column(Integer, default=0)
    
    is_shadowbanned = Column(Boolean, default=False)
    
    user = relationship("User", back_populates="security_score")

class SkillBadge(Base):
    __tablename__ = "skill_badges"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    skill_name = Column(String, nullable=False)
    verification_level = Column(String, default="Basic") # Basic, Intermediate, Expert, Master
    verification_method = Column(String, nullable=True)  # pvp, challenge, ai, community
    verification_score = Column(Float, default=0.0)
    
    # Blockchain / NFT
    token_id = Column(String, nullable=True)
    transaction_hash = Column(String, nullable=True)
    wallet_address = Column(String, nullable=True)
    
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    date_awarded = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="badges")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    description = Column(Text, nullable=False)
    icon = Column(String, nullable=True)
    category = Column(String, nullable=False)  # social, skill, pvp, content, milestone
    xp_reward = Column(Integer, default=0)
    rarity = Column(String, default="common")  # common, rare, epic, legendary
    requirement_type = Column(String, nullable=True)  # followers, posts, wins, streak
    requirement_value = Column(Integer, default=0)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    earned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    achievement = relationship("Achievement")
    user = relationship("User")

class SkillTrendingData(Base):
    __tablename__ = "skill_trending_data"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True, index=True)
    skill_name = Column(String, unique=True, index=True, nullable=False)
    trend_score = Column(Float, default=0.0)
    engagement_volume = Column(Integer, default=0)
    growth_rate = Column(Float, default=0.0)
    window_start = Column(DateTime(timezone=True), nullable=True)
    window_end = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SkillCategory(Base):
    __tablename__ = "skill_categories"

    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    canonical_name = Column(String, unique=True, nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("skill_categories.id"), nullable=True)
    aliases = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SkillProof(Base):
    __tablename__ = "skill_proofs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), index=True)
    proof_type = Column(String, nullable=False)
    proof_url = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserRank(Base):
    __tablename__ = "user_rank"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    total_skill_xp = Column(Integer, default=0)
    rank = Column(String, default="Beginner")
    rank_points = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SkillLeaderboard(Base):
    __tablename__ = "skill_leaderboards"

    skill_id = Column(Integer, ForeignKey("skills.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    skill_xp = Column(Integer, default=0)
    rank_position = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class SkillRelationship(Base):
    __tablename__ = "skill_relationships"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), index=True)
    related_skill_id = Column(Integer, ForeignKey("skills.id"), index=True)
    relationship_strength = Column(Float, default=1.0)


class SkillActivityLog(Base):
    __tablename__ = "skill_activity_log"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    action_type = Column(String, nullable=False)  # xp_gain, verified, endorsement_received, etc.
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True, index=True)
    # Use activity_metadata: 'metadata' is reserved by SQLAlchemy Declarative API.
    activity_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AiProfileInsights(Base):
    __tablename__ = "ai_profile_insights"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    # Stored as JSON strings since they are complex objects
    growth_suggestions = Column(Text, nullable=True) 
    career_prediction = Column(Text, nullable=True)
    collab_recommendations = Column(Text, nullable=True)
    skill_gap_analysis = Column(Text, nullable=True)
    
    generated_at = Column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="ai_insights")

class CreatorMonetization(Base):
    __tablename__ = "creator_monetization"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    
    total_earnings = Column(Float, default=0.0)
    pending_payout = Column(Float, default=0.0)
    
    active_subscriptions = Column(Integer, default=0)
    tips_received = Column(Float, default=0.0)
    
    stripe_account_id = Column(String, nullable=True)
    
    user = relationship("User", back_populates="monetization")

class ExternalAccounts(Base):
    __tablename__ = "external_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    platform = Column(String, nullable=False) # github, linkedin, twitter, behance
    platform_username = Column(String, nullable=False)
    profile_url = Column(String, nullable=True)
    
    is_verified = Column(Boolean, default=False)
    
    # Cached stats from external platform
    imported_stats = Column(Text, nullable=True) # JSON
    
    user = relationship("User", back_populates="external_accounts")
class MatchQueue(Base):
    __tablename__ = "match_queue"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    skill_type = Column(String, default="general")
    queue_status = Column(String, default=QueueStatus.WAITING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="queue_entry")

class Match(Base):
    __tablename__ = "matches"
    id = Column(String, primary_key=True, index=True)
    player1_id = Column(Integer, ForeignKey("users.id"))
    player2_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default=MatchStatus.PENDING)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    player1 = relationship("User", foreign_keys=[player1_id], back_populates="matches_p1")
    player2 = relationship("User", foreign_keys=[player2_id], back_populates="matches_p2")
    submissions = relationship("MatchSubmission", back_populates="match")

class MatchSubmission(Base):
    __tablename__ = "match_submissions"
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(String, ForeignKey("matches.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    result = Column(JSON)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    match = relationship("Match", back_populates="submissions")
    user = relationship("User", back_populates="submissions")

# ==========================================
# PVP ARENA MODELS (Production)
# ==========================================

class PvPMatch(Base):
    __tablename__ = "pvp_matches"
    
    id = Column(String, primary_key=True, index=True)
    player1_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    player2_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    battle_type = Column(String, default="code_challenge")  # code_challenge, knowledge_quiz, problem_solving, timed_challenge
    status = Column(String, default="waiting")  # waiting, in_progress, completed, forfeited
    match_status = Column(String, default="pending")  # pending, ready, active, finished
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    spectator_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    player1 = relationship("User", foreign_keys=[player1_id])
    player2 = relationship("User", foreign_keys=[player2_id])
    winner = relationship("User", foreign_keys=[winner_id])
    skill = relationship("Skill")
    results = relationship("PvPMatchResult", back_populates="match")
    history = relationship("PvPMatchHistory", back_populates="match")

class PvPMatchResult(Base):
    __tablename__ = "pvp_match_results"
    
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(String, ForeignKey("pvp_matches.id"))
    player_id = Column(Integer, ForeignKey("users.id"))
    score = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    completion_time = Column(Integer, default=0)  # seconds
    result = Column(String, default="pending")  # pending, win, loss, draw
    xp_gained = Column(Integer, default=0)
    mmr_change = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    match = relationship("PvPMatch", back_populates="results")
    player = relationship("User")

class PvPMatchHistory(Base):
    __tablename__ = "pvp_match_history"
    
    id = Column(Integer, primary_key=True, index=True)
    match_id = Column(String, ForeignKey("pvp_matches.id"))
    player1_id = Column(Integer, ForeignKey("users.id"))
    player2_id = Column(Integer, ForeignKey("users.id"))
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    battle_type = Column(String)
    player1_score = Column(Integer, default=0)
    player2_score = Column(Integer, default=0)
    match_score = Column(JSON)  # detailed scoring
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    match = relationship("PvPMatch", back_populates="history")
    player1 = relationship("User", foreign_keys=[player1_id])
    player2 = relationship("User", foreign_keys=[player2_id])
    winner = relationship("User", foreign_keys=[winner_id])

class PvPRating(Base):
    __tablename__ = "pvp_ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)  # per-skill MMR
    mmr = Column(Integer, default=1000)
    matches_played = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    draws = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    highest_mmr = Column(Integer, default=1000)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User")

class PvPChallenge(Base):
    __tablename__ = "pvp_challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    difficulty = Column(String)  # Easy, Medium, Hard
    category = Column(String)
    time_limit_minutes = Column(Integer, default=15)
    xp_reward = Column(Integer, default=100)
    initial_code = Column(Text)
    test_cases = Column(JSON)  # Array of test cases
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class PvPMatchmakingQueue(Base):
    __tablename__ = "pvp_matchmaking_queue"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    battle_type = Column(String, default="code_challenge")
    rank = Column(String, default="Novice")  # derived from MMR
    skill_xp = Column(Integer, default=0)
    mmr = Column(Integer, default=1000)
    queue_status = Column(String, default="waiting")  # waiting, matched, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")

class SkillPost(Base):
    __tablename__ = "skill_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    media_url = Column(String, nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=True)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    author = relationship("User", back_populates="skill_posts")
    likes = relationship("PostLike", back_populates="post")
    comments = relationship("PostComment", back_populates="post")


class PostLike(Base):
    __tablename__ = "post_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("skill_posts.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    post = relationship("SkillPost", back_populates="likes")


class PostComment(Base):
    __tablename__ = "post_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_id = Column(Integer, ForeignKey("skill_posts.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    post = relationship("SkillPost", back_populates="comments")

class Leaderboard(Base):
    __tablename__ = "leaderboard"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    skill_type = Column(String, primary_key=True)
    rating = Column(Integer)
    rank_position = Column(Integer)

class Rivalry(Base):
    __tablename__ = "rivalries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    rival_user_id = Column(Integer, ForeignKey("users.id"))
    win_streak = Column(Integer, default=0)

class Tournament(Base):
    __tablename__ = "tournaments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(Text, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, default="pending")  # pending, active, completed
    max_participants = Column(Integer, default=16)
    prize_pool = Column(Integer, default=0)
    participants = relationship("TournamentParticipant", back_populates="tournament")
    matches = relationship("TournamentMatch", back_populates="tournament")

class TournamentParticipant(Base):
    __tablename__ = "tournament_participants"
    tournament_id = Column(Integer, ForeignKey("tournaments.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    seed_number = Column(Integer, nullable=True)
    points = Column(Integer, default=0)
    matches_played = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    tournament = relationship("Tournament", back_populates="participants")

class TournamentMatch(Base):
    __tablename__ = "tournament_matches"
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    round_number = Column(Integer, default=1)
    match_number = Column(Integer, default=1)
    player1_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    player2_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    winner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    player1_score = Column(Integer, default=0)
    player2_score = Column(Integer, default=0)
    status = Column(String, default="pending")  # pending, in_progress, completed
    scheduled_time = Column(DateTime(timezone=True), nullable=True)
    tournament = relationship("Tournament", back_populates="matches")
    player1 = relationship("User", foreign_keys=[player1_id])
    player2 = relationship("User", foreign_keys=[player2_id])
    winner = relationship("User", foreign_keys=[winner_id])

class TournamentReward(Base):
    __tablename__ = "tournament_rewards"
    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    rank = Column(Integer, nullable=False)
    xp_reward = Column(Integer, default=0)
    badge_name = Column(String, nullable=True)
    badge_icon = Column(String, nullable=True)


# ==========================================
# 6. ULTRA GROWTH & VIRALITY MODELS
# ==========================================

class CreatorMetrics(Base):
    __tablename__ = "creator_metrics"

    creator_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    engagement_score = Column(Float, default=0.0)
    content_quality_score = Column(Float, default=0.0)
    authority_level = Column(Integer, default=1)
    monetization_earnings = Column(Float, default=0.0)
    viral_velocity = Column(Float, default=0.0)
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    creator = relationship("User")


class SocialGraphEdge(Base):
    __tablename__ = "social_graph_edges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    connected_user_id = Column(Integer, ForeignKey("users.id"))
    relationship_type = Column(String, nullable=False) # collaborator, mentor, rival, follower
    weight_score = Column(Float, default=1.0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DailyQuest(Base):
    __tablename__ = "daily_quests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    quest_type = Column(String, nullable=False) # pvp, social, learning, contribution
    xp_reward = Column(Integer, default=100)
    
    # AI Generation Metadata
    difficulty_score = Column(Float, default=1.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserQuestStatus(Base):
    __tablename__ = "user_quest_status"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quest_id = Column(Integer, ForeignKey("daily_quests.id"))
    progress = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)


class BattlePassSeason(Base):
    __tablename__ = "battle_pass_seasons"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # e.g., "Frontend Mastery Season"
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    is_active = Column(Boolean, default=True)


class BattlePassTier(Base):
    __tablename__ = "battle_pass_tiers"

    id = Column(Integer, primary_key=True, index=True)
    season_id = Column(Integer, ForeignKey("battle_pass_seasons.id"))
    tier_number = Column(Integer, nullable=False)
    xp_required = Column(Integer, nullable=False)
    
    # Rewards JSON
    reward_data = Column(JSON, default={}) # {type: "badge", id: "...", aura: "..."}
    is_premium = Column(Boolean, default=False)


# ==========================================
# 5. SOCIAL FEED & ACTIVITY MODELS
# ==========================================

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(Integer, ForeignKey("users.id"))
    post_type = Column(String, default="text") # text, skill, pvp, reel, community
    content = Column(Text, nullable=False)
    media_url = Column(String, nullable=True)
    
    # Metadata
    skill_tags = Column(JSON, default=[])
    reference_id = Column(String, nullable=True) # ID of reel, match, or community
    
    # Engagement
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    author = relationship("User", back_populates="posts")


class UserActivity(Base):
    __tablename__ = "user_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    activity_type = Column(String, nullable=False) # like, comment, share, view, pvp_join, skill_update
    reference_id = Column(String, nullable=True) # ID of the post, reel, etc.
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="activities")


class FeedCache(Base):
    __tablename__ = "feed_cache"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    feed_snapshot = Column(JSON, default=[])
    generated_at = Column(DateTime(timezone=True), server_default=func.now())

class PlatformMetrics(Base):
    __tablename__ = "platform_metrics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    total_users = Column(Integer, default=0)
    active_users_24h = Column(Integer, default=0)
    active_users_7d = Column(Integer, default=0)
    new_users_24h = Column(Integer, default=0)
    
    total_posts = Column(Integer, default=0)
    new_posts_24h = Column(Integer, default=0)
    
    total_pvp_matches = Column(Integer, default=0)
    matches_played_24h = Column(Integer, default=0)
    
    total_skills = Column(Integer, default=0)
    verified_skills = Column(Integer, default=0)
    
    platform_revenue = Column(Float, default=0.0)
    avg_session_duration = Column(Integer, default=0)


# ==========================================
# MESSAGING & NOTIFICATIONS MODELS
# ==========================================

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False, index=True)  # NEW_MESSAGE, NEW_FOLLOWER, MATCH_FOUND, MATCH_RESULT, ACHIEVEMENT_UNLOCKED, SKILL_VERIFIED
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    related_id = Column(String, nullable=True)  # ID of related entity (post_id, match_id, etc.)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="user_notifications")


class ChatRoom(Base):
    __tablename__ = "chat_rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user1 = relationship("User", foreign_keys=[user1_id])
    user2 = relationship("User", foreign_keys=[user2_id])


class Message(Base):
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("chat_rooms.id"), nullable=False, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message_text = Column(Text, nullable=False)
    message_type = Column(String, default="text")  # text, image, file, code
    media_url = Column(String, nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    room = relationship("ChatRoom")
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class UserPresence(Base):
    __tablename__ = "user_presence"
    
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    is_online = Column(Boolean, default=False, index=True)
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User")


# ==========================================
# CONNECTION SYSTEM MODELS
# ==========================================

class ConnectionRequest(Base):
    __tablename__ = "connection_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    status = Column(String, default="pending")  # pending, accepted, rejected
    message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class UserConnection(Base):
    __tablename__ = "user_connections"
    
    id = Column(Integer, primary_key=True, index=True)
    user1_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    user2_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user1 = relationship("User", foreign_keys=[user1_id])
    user2 = relationship("User", foreign_keys=[user2_id])


# ==========================================
# POST MEDIA MODEL
# ==========================================

class PostMedia(Base):
    __tablename__ = "post_media"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False, index=True)
    media_url = Column(String, nullable=False)
    media_type = Column(String, default="image")  # image, video, file, code_snippet
    thumbnail_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    post = relationship("Post")


class UserGoal(Base):
    __tablename__ = "user_goals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String, nullable=False)
    category = Column(String, default="skill") # skill, career, project, learning
    progress = Column(Float, default=0.0)
    target = Column(Float, default=100.0)
    completed = Column(Boolean, default=False)
    reward = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User")

class Reel(Base):
    __tablename__ = "reels"

    id = Column(String, primary_key=True, index=True)
    creator_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=True)
    description = Column(String, nullable=True)
    video_url = Column(String, nullable=False)
    thumbnail_url = Column(String, nullable=True)
    caption = Column(Text, nullable=True)
    type = Column(String, default="showcase") # showcase, skill-tutorial, ai-learning
    skill_tags = Column(JSON, default=[])
    
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship("User", back_populates="reels")
    likes = relationship("ReelLike", back_populates="reel", cascade="all, delete-orphan")

class ReelLike(Base):
    __tablename__ = "reel_likes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    reel_id = Column(String, ForeignKey("reels.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reel = relationship("Reel", back_populates="likes")

class Community(Base):
    __tablename__ = "communities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    slug = Column(String, unique=True, index=True)
    description = Column(Text, nullable=True)
    logo_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    theme_color = Column(String, default="#3b82f6")
    privacy = Column(String, default="public")
    tags = Column(JSON, default=[])
    member_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    creator_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("CommunityMember", back_populates="community")
    posts = relationship("CommunityPost", back_populates="community")

class CommunityMember(Base):
    __tablename__ = "community_members"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String, default="member") # member, moderator, admin
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    community = relationship("Community", back_populates="members")
    user = relationship("User")

class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(Integer, primary_key=True, index=True)
    community_id = Column(Integer, ForeignKey("communities.id"))
    author_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    type = Column(String, default="discussion") # discussion, announcement, project
    media_urls = Column(JSON, default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    community = relationship("Community", back_populates="posts")
    author = relationship("User")
