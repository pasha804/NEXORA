"""
================================================================================
NEXORA — basha_dev LEGENDARY ACCOUNT UPGRADE SCRIPT
================================================================================
Upgrades basha_dev@nexora.test to a maxed Grandmaster showcase account.

Run with:
    docker compose exec core_api python upgrade_basha_dev.py
    OR
    cd backend && python upgrade_basha_dev.py
================================================================================
"""

from sqlalchemy.orm import Session
from common.database import SessionLocal, engine
from common.models import (
    Base, User, Profile, UserSocialStats, UserPrivacySettings,
    UserNotificationSettings, UserSkill, Skill, SkillBadge,
    PvPRating, Leaderboard, Achievement, UserAchievement,
    UserReputation, SkillEndorsement
)
from common.auth import get_password_hash
from datetime import datetime
import json

# ── Config ────────────────────────────────────────────────────────────────────
TARGET_EMAIL    = "basha_dev@nexora.test"
TARGET_USERNAME = "basha_dev"

LEGENDARY_XP      = 999_999
LEGENDARY_LEVEL   = 100
LEGENDARY_RP      = 99_999   # Grandmaster
LEGENDARY_WINS    = 4_700
LEGENDARY_LOSSES  = 300
LEGENDARY_STREAK  = 47
LEGENDARY_MATCHES = 5_000
FOLLOWERS_COUNT   = 250_000
FOLLOWING_COUNT   = 120

LEGENDARY_SKILLS = [
    "React", "FastAPI", "Python", "Docker", "AWS",
    "AI Engineering", "Cybersecurity", "Full Stack Development",
    "TypeScript", "Node.js", "Machine Learning", "System Design",
    "Kubernetes", "PostgreSQL", "GraphQL"
]

LEGENDARY_BIO = (
    "👑 Grandmaster · Nexora Founder · AI Battle King\n\n"
    "Full-stack architect with 10+ years building production systems. "
    "Creator of Nexora — the world's first skill-based competitive developer platform. "
    "Specializing in AI-powered systems, distributed architecture, and competitive programming.\n\n"
    "🏆 #1 Global Leaderboard · 94% Win Rate · 4,700+ PvP Victories\n"
    "⚡ Prestige Master V · Level 100 · 999,999 XP"
)

EXPERIENCE_DATA = [
    {
        "role": "Founder & CEO",
        "company": "Nexora Platform",
        "period": "2024 – Present",
        "description": "Built the world's first skill-based competitive developer social platform from scratch. "
                       "Architected microservices backend, real-time PvP engine, and AI coaching system."
    },
    {
        "role": "Senior AI Engineer",
        "company": "DeepMind",
        "period": "2021 – 2024",
        "description": "Led development of large-scale ML inference systems. "
                       "Reduced model serving latency by 60% through custom CUDA kernels."
    },
    {
        "role": "Staff Software Engineer",
        "company": "Google",
        "period": "2018 – 2021",
        "description": "Core contributor to Google Cloud infrastructure. "
                       "Designed distributed systems handling 10M+ requests/second."
    }
]

EDUCATION_DATA = [
    {
        "degree": "M.Sc. Computer Science (AI Specialization)",
        "school": "MIT",
        "period": "2016 – 2018",
        "description": "Thesis: Reinforcement Learning for Competitive Code Generation"
    },
    {
        "degree": "B.Sc. Computer Engineering",
        "school": "Stanford University",
        "period": "2012 – 2016",
        "description": "Graduated Summa Cum Laude · ACM ICPC World Finalist"
    }
]

PROJECTS_DATA = [
    {
        "title": "Nexora Platform",
        "description": "LinkedIn + Discord + TikTok + AI for developers. "
                       "Real-time PvP battles, skill verification, AI coaching.",
        "link": "https://nexora.dev",
        "tags": ["React", "FastAPI", "PostgreSQL", "Redis", "Socket.IO", "Docker"]
    },
    {
        "title": "NeuralBattle Engine",
        "description": "AI-powered code evaluation engine that judges PvP submissions "
                       "in real-time with 99.7% accuracy.",
        "link": "https://github.com/basha_dev/neural-battle",
        "tags": ["Python", "PyTorch", "FastAPI", "Redis"]
    },
    {
        "title": "SkillGraph AI",
        "description": "Graph neural network that maps developer skill relationships "
                       "and predicts career trajectories.",
        "link": "https://github.com/basha_dev/skillgraph",
        "tags": ["Python", "GNN", "Neo4j", "FastAPI"]
    }
]

ACHIEVEMENT_DEFINITIONS = [
    # Common
    {"name": "First Battle", "description": "Complete your first PvP battle", "category": "pvp", "xp_reward": 50, "rarity": "common", "icon": "⚔️"},
    {"name": "First Win", "description": "Win your first PvP battle", "category": "pvp", "xp_reward": 100, "rarity": "common", "icon": "🏆"},
    {"name": "First Post", "description": "Create your first post", "category": "social", "xp_reward": 25, "rarity": "common", "icon": "📝"},
    {"name": "Profile Complete", "description": "Complete your profile 100%", "category": "milestone", "xp_reward": 100, "rarity": "common", "icon": "✅"},
    # Rare
    {"name": "Win Streak 5", "description": "Win 5 battles in a row", "category": "pvp", "xp_reward": 250, "rarity": "rare", "icon": "🔥"},
    {"name": "100 Followers", "description": "Reach 100 followers", "category": "social", "xp_reward": 200, "rarity": "rare", "icon": "👥"},
    {"name": "Skill Verified", "description": "Get your first skill verified", "category": "skill", "xp_reward": 300, "rarity": "rare", "icon": "✓"},
    {"name": "Level 10", "description": "Reach Level 10", "category": "milestone", "xp_reward": 500, "rarity": "rare", "icon": "⬆️"},
    # Epic
    {"name": "Win Streak 20", "description": "Win 20 battles in a row", "category": "pvp", "xp_reward": 1000, "rarity": "epic", "icon": "⚡"},
    {"name": "1000 Followers", "description": "Reach 1,000 followers", "category": "social", "xp_reward": 750, "rarity": "epic", "icon": "🌟"},
    {"name": "100 Wins", "description": "Win 100 PvP battles", "category": "pvp", "xp_reward": 1500, "rarity": "epic", "icon": "🎯"},
    {"name": "Level 50", "description": "Reach Level 50", "category": "milestone", "xp_reward": 2000, "rarity": "epic", "icon": "💫"},
    # Legendary
    {"name": "Grandmaster", "description": "Reach Grandmaster rank", "category": "pvp", "xp_reward": 5000, "rarity": "legendary", "icon": "👑"},
    {"name": "10K Followers", "description": "Reach 10,000 followers", "category": "social", "xp_reward": 3000, "rarity": "legendary", "icon": "💎"},
    {"name": "1000 Wins", "description": "Win 1,000 PvP battles", "category": "pvp", "xp_reward": 5000, "rarity": "legendary", "icon": "🏅"},
    {"name": "Level 100", "description": "Reach Level 100", "category": "milestone", "xp_reward": 10000, "rarity": "legendary", "icon": "🔱"},
    # Mythic
    {"name": "Nexora Legend", "description": "The ultimate Nexora achievement — reserved for the platform founder", "category": "milestone", "xp_reward": 50000, "rarity": "mythic", "icon": "🌌"},
    {"name": "AI Battle King", "description": "Win 1,000 AI-judged code challenges", "category": "pvp", "xp_reward": 25000, "rarity": "mythic", "icon": "🤖"},
    {"name": "Grandmaster Elite", "description": "Reach 50,000+ RP — top 0.01% of all players", "category": "pvp", "xp_reward": 30000, "rarity": "mythic", "icon": "⭐"},
    {"name": "Founder", "description": "Nexora platform founder — one of a kind", "category": "milestone", "xp_reward": 100000, "rarity": "mythic", "icon": "🚀"},
    {"name": "Top Developer", "description": "Recognized as a top developer by the Nexora community", "category": "skill", "xp_reward": 20000, "rarity": "mythic", "icon": "💻"},
]


def upgrade_basha_dev():
    db = SessionLocal()
    print("=" * 60)
    print("NEXORA — Upgrading basha_dev to LEGENDARY status")
    print("=" * 60)

    # ── 1. Find or create user ────────────────────────────────────
    user = db.query(User).filter(User.email == TARGET_EMAIL).first()
    if not user:
        print(f"User {TARGET_EMAIL} not found. Creating...")
        user = User(
            username=TARGET_USERNAME,
            email=TARGET_EMAIL,
            hashed_password=get_password_hash("password123"),
            display_name="Basha Dev",
            onboarding_completed=True,
            is_active=True,
            is_superuser=True,
        )
        db.add(user)
        db.flush()

    print(f"Found user: {user.username} (ID: {user.id})")

    # ── 2. Max out User table ─────────────────────────────────────
    user.xp_points      = LEGENDARY_XP
    user.level          = LEGENDARY_LEVEL
    user.ranking_score  = LEGENDARY_RP
    user.is_verified    = True
    user.is_superuser   = True
    user.account_type   = "creator"
    user.display_name   = "Basha Dev"
    user.bio            = LEGENDARY_BIO
    user.location       = "San Francisco, CA"
    user.website        = "https://nexora.dev"
    user.online_status  = "online"
    db.flush()
    print("✓ User table updated")

    # ── 3. Max out Profile ────────────────────────────────────────
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.flush()

    profile.display_name            = "Basha Dev"
    profile.bio                     = LEGENDARY_BIO
    profile.experience_level        = "Expert"
    profile.github_url              = "https://github.com/basha_dev"
    profile.linkedin_url            = "https://linkedin.com/in/basha_dev"
    profile.experience_data         = EXPERIENCE_DATA
    profile.education_data          = EDUCATION_DATA
    profile.projects_data           = PROJECTS_DATA
    profile.portfolio_links         = ["https://nexora.dev", "https://github.com/basha_dev"]
    profile.privacy_setting         = "public"
    db.flush()
    print("✓ Profile updated")

    # ── 4. Max out Social Stats ───────────────────────────────────
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user.id).first()
    if not stats:
        stats = UserSocialStats(user_id=user.id)
        db.add(stats)
        db.flush()

    stats.xp_total          = LEGENDARY_XP
    stats.rank_level        = "Grandmaster"
    stats.followers_count   = FOLLOWERS_COUNT
    stats.following_count   = FOLLOWING_COUNT
    stats.battle_wins       = LEGENDARY_WINS
    stats.battle_losses     = LEGENDARY_LOSSES
    stats.streak_days       = 120
    stats.streak_last_updated = datetime.utcnow()
    stats.xp_multiplier     = 2.0   # Max multiplier
    stats.reputation_score  = 9999
    stats.battle_pass_tier  = 50
    db.flush()
    print("✓ Social stats updated")

    # ── 5. Max out PvP Rating ─────────────────────────────────────
    pvp = db.query(PvPRating).filter(PvPRating.user_id == user.id).first()
    if not pvp:
        pvp = PvPRating(user_id=user.id)
        db.add(pvp)
        db.flush()

    pvp.mmr             = LEGENDARY_RP
    pvp.matches_played  = LEGENDARY_MATCHES
    pvp.wins            = LEGENDARY_WINS
    pvp.losses          = LEGENDARY_LOSSES
    pvp.draws           = 0
    pvp.current_streak  = LEGENDARY_STREAK
    pvp.highest_mmr     = LEGENDARY_RP
    db.flush()
    print("✓ PvP rating updated")

    # ── 6. Update Leaderboard ─────────────────────────────────────
    lb = db.query(Leaderboard).filter(
        Leaderboard.user_id == user.id,
        Leaderboard.skill_type == "general"
    ).first()
    if not lb:
        lb = Leaderboard(user_id=user.id, skill_type="general")
        db.add(lb)
        db.flush()
    lb.rating = LEGENDARY_RP
    lb.rank_position = 1
    db.flush()
    print("✓ Leaderboard updated (#1 position)")

    # ── 7. Max out Skills ─────────────────────────────────────────
    # Remove old skills
    db.query(UserSkill).filter(UserSkill.user_id == user.id).delete()
    db.flush()

    for skill_name in LEGENDARY_SKILLS:
        # Get or create canonical skill
        skill = db.query(Skill).filter(Skill.canonical_name == skill_name).first()
        if not skill:
            skill = Skill(canonical_name=skill_name)
            db.add(skill)
            db.flush()

        user_skill = UserSkill(
            user_id=user.id,
            skill_id=skill.id,
            skill_name=skill_name,
            skill_level=5,          # Master level
            xp=99_999,
            endorsement_count=9999,
            is_primary=True,
            skill_integrity_score=1.0,
            verified=True
        )
        db.add(user_skill)

    db.flush()
    print(f"✓ {len(LEGENDARY_SKILLS)} skills set to Master level (verified)")

    # ── 8. Add Skill Badges ───────────────────────────────────────
    db.query(SkillBadge).filter(SkillBadge.user_id == user.id).delete()
    db.flush()

    for skill_name in LEGENDARY_SKILLS[:8]:
        badge = SkillBadge(
            user_id=user.id,
            skill_name=skill_name,
            verification_level="Master",
            verification_method="pvp",
            verification_score=100.0,
            issued_at=datetime.utcnow(),
            date_awarded=datetime.utcnow()
        )
        db.add(badge)

    db.flush()
    print("✓ Skill badges added (Master verification)")

    # ── 9. Seed & Unlock All Achievements ────────────────────────
    for ach_def in ACHIEVEMENT_DEFINITIONS:
        # Create achievement if it doesn't exist
        ach = db.query(Achievement).filter(Achievement.name == ach_def["name"]).first()
        if not ach:
            ach = Achievement(
                name=ach_def["name"],
                description=ach_def["description"],
                icon=ach_def["icon"],
                category=ach_def["category"],
                xp_reward=ach_def["xp_reward"],
                rarity=ach_def["rarity"],
                requirement_type="manual",
                requirement_value=0
            )
            db.add(ach)
            db.flush()

        # Award to basha_dev if not already earned
        existing = db.query(UserAchievement).filter(
            UserAchievement.user_id == user.id,
            UserAchievement.achievement_id == ach.id
        ).first()
        if not existing:
            db.add(UserAchievement(
                user_id=user.id,
                achievement_id=ach.id,
                earned_at=datetime.utcnow()
            ))

    db.flush()
    print(f"✓ {len(ACHIEVEMENT_DEFINITIONS)} achievements unlocked (Common → Mythic)")

    # ── 10. Max out Reputation ────────────────────────────────────
    rep = db.query(UserReputation).filter(UserReputation.user_id == user.id).first()
    if not rep:
        rep = UserReputation(user_id=user.id)
        db.add(rep)
        db.flush()

    rep.reputation_score                = 10000
    rep.trust_level                     = "Legend"
    rep.skill_authority_score           = 100.0
    rep.social_trust_score              = 100.0
    rep.professional_credibility_score  = 100.0
    db.flush()
    print("✓ Reputation maxed (Legend trust level)")

    # ── 11. Settings ──────────────────────────────────────────────
    privacy = db.query(UserPrivacySettings).filter(UserPrivacySettings.user_id == user.id).first()
    if not privacy:
        privacy = UserPrivacySettings(user_id=user.id)
        db.add(privacy)
        db.flush()
    privacy.profile_visibility = "public"
    privacy.show_battle_history = True
    privacy.show_skill_levels = True

    notif = db.query(UserNotificationSettings).filter(UserNotificationSettings.user_id == user.id).first()
    if not notif:
        notif = UserNotificationSettings(user_id=user.id)
        db.add(notif)

    # ── 12. Commit ────────────────────────────────────────────────
    db.commit()
    print()
    print("=" * 60)
    print("✅ basha_dev LEGENDARY UPGRADE COMPLETE")
    print("=" * 60)
    print(f"  Email:      {TARGET_EMAIL}")
    print(f"  Password:   password123")
    print(f"  RP:         {LEGENDARY_RP:,} (Grandmaster)")
    print(f"  Level:      {LEGENDARY_LEVEL}")
    print(f"  XP:         {LEGENDARY_XP:,}")
    print(f"  Wins:       {LEGENDARY_WINS:,}")
    print(f"  Win Rate:   {round(LEGENDARY_WINS / LEGENDARY_MATCHES * 100, 1)}%")
    print(f"  Followers:  {FOLLOWERS_COUNT:,}")
    print(f"  Skills:     {len(LEGENDARY_SKILLS)} (all Master + Verified)")
    print(f"  Achievements: {len(ACHIEVEMENT_DEFINITIONS)} (all rarities)")
    print(f"  Leaderboard: #1 Global")
    print("=" * 60)
    db.close()


if __name__ == "__main__":
    upgrade_basha_dev()
