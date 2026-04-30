"""
Create ALL test users in database - 31 users total
"""
import os
import sys

os.environ.setdefault("DATABASE_URL", "")

import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from common.models import Base, User, Profile, UserSocialStats

ALL_TEST_USERS = [
    # Original 11 users from generate_test_data.py
    {"username": "basha_dev", "email": "basha_dev@nexora.test", "display_name": "Basha Developer", "bio": "Full-stack developer passionate about building the future with JavaScript, React, NodeJS, Python and CSS.", "location": "San Francisco, CA", "xp": 1500, "rank": "Bronze I"},
    {"username": "react_dev", "email": "react_dev@nexora.test", "display_name": "Alex Chen", "bio": "Senior Frontend Developer specializing in React, TypeScript, and modern web technologies. Passionate about building scalable UI components.", "location": "San Francisco, CA", "xp": 4500, "rank": "Gold III"},
    {"username": "python_dev", "email": "python_dev@nexora.test", "display_name": "Sarah Johnson", "bio": "Backend Engineer with expertise in Python, FastAPI, and PostgreSQL. Building high-performance APIs and microservices.", "location": "New York, NY", "xp": 3200, "rank": "Silver I"},
    {"username": "fullstack_dev", "email": "fullstack_dev@nexora.test", "display_name": "Mike Rodriguez", "bio": "Full Stack Developer bridging the gap between frontend and backend. MERN stack enthusiast.", "location": "Austin, TX", "xp": 2800, "rank": "Silver II"},
    {"username": "security_expert", "email": "security_expert@nexora.test", "display_name": "Emily Wong", "bio": "Cybersecurity Specialist focused on ethical hacking, penetration testing, and security compliance.", "location": "Seattle, WA", "xp": 5800, "rank": "Platinum II"},
    {"username": "devops_engineer", "email": "devops_engineer@nexora.test", "display_name": "James Kim", "bio": "DevOps Engineer specializing in CI/CD, containerization, and cloud infrastructure.", "location": "Los Angeles, CA", "xp": 4200, "rank": "Gold II"},
    {"username": "ml_engineer", "email": "ml_engineer@nexora.test", "display_name": "Priya Patel", "bio": "Machine Learning Engineer building intelligent systems. PhD in Computer Science with focus on NLP.", "location": "Boston, MA", "xp": 6500, "rank": "Platinum III"},
    {"username": "data_scientist", "email": "data_scientist@nexora.test", "display_name": "David Lee", "bio": "Data Scientist turning raw data into actionable insights. Expert in statistical analysis and visualization.", "location": "Chicago, IL", "xp": 3100, "rank": "Silver I"},
    {"username": "ui_designer", "email": "ui_designer@nexora.test", "display_name": "Emma Wilson", "bio": "UI Designer creating beautiful, accessible user interfaces. Design systems expert.", "location": "Portland, OR", "xp": 2400, "rank": "Bronze III"},
    {"username": "mobile_dev", "email": "mobile_dev@nexora.test", "display_name": "Carlos Martinez", "bio": "Mobile Developer specializing in Flutter and cross-platform development.", "location": "Miami, FL", "xp": 2600, "rank": "Bronze I"},
    {"username": "cloud_engineer", "email": "cloud_engineer@nexora.test", "display_name": "Lisa Thompson", "bio": "Cloud Engineer specializing in AWS, GCP, and cloud architecture design.", "location": "Denver, CO", "xp": 4800, "rank": "Gold I"},
    
    # Extended 20 users
    {"username": "blockchain_dev", "email": "blockchain_dev@nexora.test", "display_name": "Marcus Johnson", "bio": "Blockchain Developer building decentralized applications. Web3 enthusiast and smart contract developer.", "location": "San Jose, CA", "xp": 5200, "rank": "Gold III"},
    {"username": "ai_researcher", "email": "ai_researcher@nexora.test", "display_name": "Dr. Nina Chen", "bio": "AI Researcher specializing in computer vision and deep learning. Published in top conferences.", "location": "Seattle, WA", "xp": 7200, "rank": "Platinum II"},
    {"username": "rustacean", "email": "rustacean@nexora.test", "display_name": "Alex Rivera", "bio": "Rust Developer building high-performance systems. Memory safety advocate.", "location": "Austin, TX", "xp": 4100, "rank": "Gold I"},
    {"username": "graphql_guru", "email": "graphql_guru@nexora.test", "display_name": "Sarah Kim", "bio": "API Architect specializing in GraphQL. Building scalable data layers.", "location": "New York, NY", "xp": 3800, "rank": "Gold I"},
    {"username": "sre_lead", "email": "sre_lead@nexora.test", "display_name": "Michael Brown", "bio": "Site Reliability Engineering Lead. Building resilient infrastructure.", "location": "San Francisco, CA", "xp": 5500, "rank": "Gold III"},
    {"username": "ux_researcher", "email": "ux_researcher@nexora.test", "display_name": "Jessica Lee", "bio": "UX Researcher understanding user behavior. Data-driven design decisions.", "location": "Los Angeles, CA", "xp": 2800, "rank": "Silver II"},
    {"username": "backend_wizard", "email": "backend_wizard@nexora.test", "display_name": "David Park", "bio": "Backend Wizard specializing in distributed systems and microservices.", "location": "Chicago, IL", "xp": 6200, "rank": "Platinum I"},
    {"username": "ios_ninja", "email": "ios_ninja@nexora.test", "display_name": "Kevin Zhang", "bio": "iOS Developer creating beautiful Apple experiences. SwiftUI enthusiast.", "location": "Cupertino, CA", "xp": 4600, "rank": "Gold II"},
    {"username": "data_engineer", "email": "data_engineer@nexora.test", "display_name": "Amanda Foster", "bio": "Data Engineer building scalable data pipelines and warehouses.", "location": "Boston, MA", "xp": 4900, "rank": "Gold II"},
    {"username": "security_analyst", "email": "security_analyst@nexora.test", "display_name": "Robert Taylor", "bio": "Security Analyst focusing on application security and threat modeling.", "location": "Washington, DC", "xp": 3400, "rank": "Silver II"},
    {"username": "game_dev_pro", "email": "game_dev_pro@nexora.test", "display_name": "Chris Anderson", "bio": "Game Developer building immersive experiences with Unity and Unreal.", "location": "Las Vegas, NV", "xp": 5100, "rank": "Gold III"},
    {"username": "qa_automation", "email": "qa_automation@nexora.test", "display_name": "Maria Garcia", "bio": "QA Automation Engineer building robust testing frameworks.", "location": "Miami, FL", "xp": 2900, "rank": "Silver II"},
    {"username": "tech_writer", "email": "tech_writer@nexora.test", "display_name": "Jennifer White", "bio": "Technical Writer creating clear documentation for complex systems.", "location": "Portland, OR", "xp": 1800, "rank": "Bronze III"},
    {"username": "vim_master", "email": "vim_master@nexora.test", "display_name": "Daniel Smith", "bio": "Vim enthusiast and efficiency advocate. Terminal workflows are the best.", "location": "Denver, CO", "xp": 3200, "rank": "Silver I"},
    {"username": "cloud_architect", "email": "cloud_architect@nexora.test", "display_name": "Patricia Martinez", "bio": "Cloud Architect designing multi-cloud solutions for enterprise.", "location": "Atlanta, GA", "xp": 6800, "rank": "Platinum II"},
    {"username": "agile_coach", "email": "agile_coach@nexora.test", "display_name": "Thomas Wilson", "bio": "Agile Coach helping teams deliver value faster. Scrum Master certified.", "location": "Philadelphia, PA", "xp": 2400, "rank": "Bronze III"},
    {"username": "ml_ops_engineer", "email": "ml_ops_engineer@nexora.test", "display_name": "Lisa Anderson", "bio": "MLOps Engineer building production ML pipelines. MLOps best practices.", "location": "San Diego, CA", "xp": 5700, "rank": "Gold III"},
    {"username": "product_manager", "email": "product_manager@nexora.test", "display_name": "Jennifer Robinson", "bio": "Product Manager defining product strategy and roadmap. User-focused.", "location": "Austin, TX", "xp": 2100, "rank": "Bronze II"},
    {"username": "dev_advocate", "email": "dev_advocate@nexora.test", "display_name": "Brian Clark", "bio": "Developer Advocate bridging engineering and community. Speaker and educator.", "location": "Nashville, TN", "xp": 2600, "rank": "Bronze I"},
    {"username": "database_expert", "email": "database_expert@nexora.test", "display_name": "Emily Davis", "bio": "Database Expert optimizing queries and designing schemas. Performance tuning pro.", "location": "Minneapolis, MN", "xp": 4400, "rank": "Gold II"},
]

def hash_password(password: str) -> str:
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def create_all_users():
    try:
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nexora_dev.db")
        db_url = f"sqlite:///{db_path}"
        print(f"Using database: {db_url}")
        
        engine = create_engine(db_url, connect_args={"check_same_thread": False})
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        db = Session()
        
        hashed_password = hash_password("password123")
        
        # First, delete all existing users to get a clean slate
        existing_count = db.query(User).count()
        if existing_count > 0:
            print(f"Deleting {existing_count} existing users...")
            db.query(UserSocialStats).delete()
            db.query(Profile).delete()
            db.query(User).delete()
            db.commit()
            print("Existing users deleted.")
        
        created_count = 0
        
        for user_data in ALL_TEST_USERS:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=hashed_password,
                display_name=user_data["display_name"],
                bio=user_data["bio"],
                location=user_data["location"],
                xp_points=user_data["xp"],
                level=random.randint(1, 20),
                is_active=True,
                onboarding_completed=True,
                online_status="offline"
            )
            db.add(user)
            db.flush()
            
            # Create profile
            profile = Profile(
                user_id=user.id,
                display_name=user_data["display_name"],
                bio=user_data["bio"]
            )
            db.add(profile)
            
            # Create social stats
            social_stats = UserSocialStats(
                user_id=user.id,
                followers_count=random.randint(5, 100),
                following_count=random.randint(5, 50),
                posts_count=random.randint(0, 20),
                xp_total=user_data["xp"],
                rank_level=user_data["rank"]
            )
            db.add(social_stats)
            
            db.commit()
            created_count += 1
            print(f"Created {created_count}. {user.username}")
        
        print(f"\n{'='*60}")
        print(f"SUCCESS: Created {created_count} users")
        print(f"{'='*60}")
        
        total = db.query(User).count()
        print(f"Total users in database: {total}")
        
        print("\nLogin credentials for all users:")
        print("  Email: (see list above)")
        print("  Password: password123")
        
        db.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_all_users()