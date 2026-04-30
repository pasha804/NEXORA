from sqlalchemy.orm import Session
from sqlalchemy import text
from common.database import SessionLocal, engine
from common.models import Base, User, UserSocialStats, UserPrivacySettings, UserNotificationSettings, Post, Achievement
# Import all other models to register them with Base.metadata
import common.models as models 

from common.auth import get_password_hash
import random

ACHIEVEMENTS = [
    {"name": "First Steps", "description": "Complete your profile setup", "category": "milestone", "xp_reward": 50, "rarity": "common", "requirement_type": None, "requirement_value": 0},
    {"name": "Social Butterfly", "description": "Follow 5 users", "category": "social", "xp_reward": 100, "rarity": "common", "requirement_type": "followers", "requirement_value": 5},
    {"name": "Popular", "description": "Get 10 followers", "category": "social", "xp_reward": 200, "rarity": "rare", "requirement_type": "followers", "requirement_value": 10},
    {"name": "Influencer", "description": "Get 50 followers", "category": "social", "xp_reward": 500, "rarity": "epic", "requirement_type": "followers", "requirement_value": 50},
    {"name": "Star", "description": "Get 100 followers", "category": "social", "xp_reward": 1000, "rarity": "legendary", "requirement_type": "followers", "requirement_value": 100},
    {"name": "Content Creator", "description": "Create 5 posts", "category": "content", "xp_reward": 100, "rarity": "common", "requirement_type": "posts", "requirement_value": 5},
    {"name": "Prolific Writer", "description": "Create 25 posts", "category": "content", "xp_reward": 300, "rarity": "rare", "requirement_type": "posts", "requirement_value": 25},
    {"name": "Voice of Nexora", "description": "Create 100 posts", "category": "content", "xp_reward": 750, "rarity": "epic", "requirement_type": "posts", "requirement_value": 100},
    {"name": "First Victory", "description": "Win your first PvP battle", "category": "pvp", "xp_reward": 100, "rarity": "common", "requirement_type": "wins", "requirement_value": 1},
    {"name": "Battle Hardened", "description": "Win 10 PvP battles", "category": "pvp", "xp_reward": 300, "rarity": "rare", "requirement_type": "wins", "requirement_value": 10},
    {"name": "Warrior", "description": "Win 50 PvP battles", "category": "pvp", "xp_reward": 750, "rarity": "epic", "requirement_type": "wins", "requirement_value": 50},
    {"name": "Legend", "description": "Win 100 PvP battles", "category": "pvp", "xp_reward": 1500, "rarity": "legendary", "requirement_type": "wins", "requirement_value": 100},
    {"name": "Consistent", "description": "Maintain a 3-day streak", "category": "milestone", "xp_reward": 75, "rarity": "common", "requirement_type": "streak", "requirement_value": 3},
    {"name": "Dedicated", "description": "Maintain a 7-day streak", "category": "milestone", "xp_reward": 200, "rarity": "rare", "requirement_type": "streak", "requirement_value": 7},
    {"name": "Unstoppable", "description": "Maintain a 30-day streak", "category": "milestone", "xp_reward": 1000, "rarity": "epic", "requirement_type": "streak", "requirement_value": 30},
]

def seed_db():
    print("Dropping existing tables with CASCADE for safety...")
    # For Postgres, we often need CASCADE to handle foreign key dependencies across services
    with engine.connect() as conn:
        # Get all table names from metadata
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(text(f'DROP TABLE IF EXISTS "{table.name}" CASCADE'))
        conn.commit()
    
    print("Recreating all tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    print("Seeding users...")
    users = []
    for i in range(1, 6):
        user = User(
            username=f"user{i}",
            email=f"user{i}@example.com",
            hashed_password=get_password_hash("password123"),
            display_name=f"Nexora Pro {i}",
            bio=f"Bio for user {i}. Passionate about building the future of skill sharing.",
            xp_points=random.randint(100, 5000),
            level=random.randint(1, 15),
            onboarding_completed=True
        )
        db.add(user)
        db.flush() # Flush to get the user.id before adding interests
        
        # Add a few interests for each user
        user_interests = ["AI", "Web Dev", "Blockchain", "UI/UX", "GameDev", "Data Science", "Cybersecurity", "Cloud Computing"]
        for tag in random.sample(user_interests, 3):
            interest = models.UserInterest(user_id=user.id, interest_tag=tag)
            db.add(interest)
        
        users.append(user)
    db.commit()

    print("Initializing social data...")
    for user in users:
        db.add(UserSocialStats(user_id=user.id))
        db.add(UserPrivacySettings(user_id=user.id))
        db.add(UserNotificationSettings(user_id=user.id))
        
        # Add some posts
        for j in range(3):
            post = Post(
                author_id=user.id,
                content=f"Hello Nexora! This is my post number {j+1}. Just finished a new skill forge.",
                post_type="text"
            )
            db.add(post)
    
    db.commit()
    
    print("Seeding achievements...")
    for ach_data in ACHIEVEMENTS:
        achievement = Achievement(**ach_data)
        db.add(achievement)
    
    db.commit()
    print("Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_db()
