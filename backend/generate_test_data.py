"""
Comprehensive Test Data Generator for Nexora
Creates 10 fully populated test users with real data
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random

os.environ.setdefault("DATABASE_URL", "postgresql://nexora:nexora123@localhost:5432/nexora_db")

from common.models import (
    Base,
    User,
    UserSkill,
    Skill,
    Profile,
    UserSocialStats,
    Follower,
    SkillPost,
    PostLike,
    PostComment,
    Notification,
    UserConnection,
    ConnectionRequest,
    UserProject,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

TEST_USERS = [
    {
        "username": "react_dev",
        "email": "react_dev@nexora.test",
        "display_name": "Alex Chen",
        "bio": "Senior Frontend Developer specializing in React, TypeScript, and modern web technologies. Passionate about building scalable UI components and mentoring junior developers.",
        "location": "San Francisco, CA",
        "experience_level": "Senior",
        "skills": ["React", "JavaScript", "TypeScript", "CSS", "Next.js"],
        "github_url": "https://github.com/react-dev",
        "linkedin_url": "https://linkedin.com/in/react-dev",
        "website": "https://alexchen.dev",
        "xp": 4500,
        "rank": "Gold III",
        "projects": [
            {"name": "E-Commerce Dashboard", "description": "A comprehensive dashboard for e-commerce analytics", "link": "https://github.com/react-dev/ecommerce-dashboard", "tech": "React, TypeScript, Chart.js"},
            {"name": "Task Management App", "description": "Real-time collaborative task management application", "link": "https://github.com/react-dev/task-app", "tech": "React, Node.js, Socket.io"}
        ]
    },
    {
        "username": "python_dev",
        "email": "python_dev@nexora.test",
        "display_name": "Sarah Johnson",
        "bio": "Backend Engineer with expertise in Python, FastAPI, and PostgreSQL. Building high-performance APIs and microservices.",
        "location": "New York, NY",
        "experience_level": "Mid-Level",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"],
        "github_url": "https://github.com/python-dev",
        "linkedin_url": "https://linkedin.com/in/python-dev",
        "website": "https://sarahjohnson.dev",
        "xp": 3200,
        "rank": "Silver I",
        "projects": [
            {"name": "REST API Framework", "description": "Lightweight REST API framework for Python", "link": "https://github.com/python-dev/api-framework", "tech": "Python, FastAPI, Pydantic"},
            {"name": "Data Pipeline", "description": "ETL pipeline for real-time data processing", "link": "https://github.com/python-dev/data-pipeline", "tech": "Python, Apache Kafka, PostgreSQL"}
        ]
    },
    {
        "username": "fullstack_dev",
        "email": "fullstack_dev@nexora.test",
        "display_name": "Mike Rodriguez",
        "bio": "Full Stack Developer bridging the gap between frontend and backend. MERN stack enthusiast.",
        "location": "Austin, TX",
        "experience_level": "Mid-Level",
        "skills": ["React", "NodeJS", "MongoDB", "Express", "JavaScript"],
        "github_url": "https://github.com/fullstack-dev",
        "linkedin_url": "https://linkedin.com/in/fullstack-dev",
        "website": "https://mikedev.io",
        "xp": 2800,
        "rank": "Silver II",
        "projects": [
            {"name": "Social Media App", "description": "Full-featured social media platform", "link": "https://github.com/fullstack-dev/social-app", "tech": "React, Node.js, MongoDB"},
            {"name": "Blog Platform", "description": "CMS-powered blogging platform", "link": "https://github.com/fullstack-dev/blog-platform", "tech": "React, Express, MongoDB"}
        ]
    },
    {
        "username": "security_expert",
        "email": "security_expert@nexora.test",
        "display_name": "Emily Wong",
        "bio": "Cybersecurity Specialist focused on ethical hacking, penetration testing, and security compliance.",
        "location": "Seattle, WA",
        "experience_level": "Expert",
        "skills": ["Cybersecurity", "Penetration Testing", "Network Security", "Linux", "Python"],
        "github_url": "https://github.com/security-expert",
        "linkedin_url": "https://linkedin.com/in/security-expert",
        "website": "https://emilywong.security",
        "xp": 5800,
        "rank": "Platinum II",
        "projects": [
            {"name": "Security Scanner", "description": "Automated vulnerability scanner for web applications", "link": "https://github.com/security-expert/scanner", "tech": "Python, Selenium, Nmap"},
            {"name": "Encryption Tool", "description": "End-to-end encryption utility", "link": "https://github.com/security-expert/encrypt-tool", "tech": "Python, Cryptography"}
        ]
    },
    {
        "username": "devops_engineer",
        "email": "devops_engineer@nexora.test",
        "display_name": "James Kim",
        "bio": "DevOps Engineer specializing in CI/CD, containerization, and cloud infrastructure.",
        "location": "Los Angeles, CA",
        "experience_level": "Senior",
        "skills": ["DevOps", "Docker", "Kubernetes", "AWS", "Terraform"],
        "github_url": "https://github.com/devops-engineer",
        "linkedin_url": "https://linkedin.com/in/devops-engineer",
        "website": "https://jameskim.dev",
        "xp": 4200,
        "rank": "Gold II",
        "projects": [
            {"name": "CI/CD Pipeline", "description": "Automated deployment pipeline template", "link": "https://github.com/devops-engineer/cicd-pipeline", "tech": "GitHub Actions, Docker, Kubernetes"},
            {"name": "Infrastructure as Code", "description": "Terraform modules for AWS infrastructure", "link": "https://github.com/devops-engineer/terraform-modules", "tech": "Terraform, AWS, Ansible"}
        ]
    },
    {
        "username": "ml_engineer",
        "email": "ml_engineer@nexora.test",
        "display_name": "Priya Patel",
        "bio": "Machine Learning Engineer building intelligent systems. PhD in Computer Science with focus on NLP.",
        "location": "Boston, MA",
        "experience_level": "Expert",
        "skills": ["Machine Learning", "Python", "TensorFlow", "NLP", "Data Science"],
        "github_url": "https://github.com/ml-engineer",
        "linkedin_url": "https://linkedin.com/in/ml-engineer",
        "website": "https://priyapatel.ai",
        "xp": 6500,
        "rank": "Platinum III",
        "projects": [
            {"name": "Sentiment Analyzer", "description": "NLP model for sentiment analysis", "link": "https://github.com/ml-engineer/sentiment-analyzer", "tech": "Python, TensorFlow, BERT"},
            {"name": "Image Classifier", "description": "Deep learning image classification system", "link": "https://github.com/ml-engineer/image-classifier", "tech": "Python, PyTorch, CNN"}
        ]
    },
    {
        "username": "data_scientist",
        "email": "data_scientist@nexora.test",
        "display_name": "David Lee",
        "bio": "Data Scientist turning raw data into actionable insights. Expert in statistical analysis and visualization.",
        "location": "Chicago, IL",
        "experience_level": "Mid-Level",
        "skills": ["Data Science", "Python", "Pandas", "SQL", "Tableau"],
        "github_url": "https://github.com/data-scientist",
        "linkedin_url": "https://linkedin.com/in/data-scientist",
        "website": "https://davidlee.io",
        "xp": 3100,
        "rank": "Silver I",
        "projects": [
            {"name": "Analytics Dashboard", "description": "Interactive business intelligence dashboard", "link": "https://github.com/data-scientist/analytics-dash", "tech": "Python, Dash, Plotly"},
            {"name": "Predictive Model", "description": "Sales forecasting ML model", "link": "https://github.com/data-scientist/forecasting", "tech": "Python, Scikit-learn, Pandas"}
        ]
    },
    {
        "username": "ui_designer",
        "email": "ui_designer@nexora.test",
        "display_name": "Emma Wilson",
        "bio": "UI Designer creating beautiful, accessible user interfaces. Design systems expert.",
        "location": "Portland, OR",
        "experience_level": "Mid-Level",
        "skills": ["UI Design", "Figma", "CSS", "React", "Design Systems"],
        "github_url": "https://github.com/ui-designer",
        "linkedin_url": "https://linkedin.com/in/ui-designer",
        "website": "https://emmawilson.design",
        "xp": 2400,
        "rank": "Bronze III",
        "projects": [
            {"name": "Design System", "description": "Comprehensive component library", "link": "https://github.com/ui-designer/design-system", "tech": "Figma, Storybook, CSS"},
            {"name": "Mobile UI Kit", "description": "React Native UI components", "link": "https://github.com/ui-designer/mobile-kit", "tech": "React Native, Figma"}
        ]
    },
    {
        "username": "mobile_dev",
        "email": "mobile_dev@nexora.test",
        "display_name": "Carlos Martinez",
        "bio": "Mobile Developer specializing in Flutter and cross-platform development.",
        "location": "Miami, FL",
        "experience_level": "Mid-Level",
        "skills": ["Flutter", "Dart", "Firebase", "Android", "iOS"],
        "github_url": "https://github.com/mobile-dev",
        "linkedin_url": "https://linkedin.com/in/mobile-dev",
        "website": "https://carlosmartinez.app",
        "xp": 2600,
        "rank": "Bronze I",
        "projects": [
            {"name": "Fitness App", "description": "Cross-platform fitness tracking application", "link": "https://github.com/mobile-dev/fitness-app", "tech": "Flutter, Firebase"},
            {"name": "E-Wallet", "description": "Mobile payment application", "link": "https://github.com/mobile-dev/ewallet", "tech": "Flutter, Stripe"}
        ]
    },
    {
        "username": "cloud_engineer",
        "email": "cloud_engineer@nexora.test",
        "display_name": "Lisa Thompson",
        "bio": "Cloud Engineer specializing in AWS, GCP, and cloud architecture design.",
        "location": "Denver, CO",
        "experience_level": "Senior",
        "skills": ["AWS", "GCP", "Terraform", "Docker", "Kubernetes"],
        "github_url": "https://github.com/cloud-engineer",
        "linkedin_url": "https://linkedin.com/in/cloud-engineer",
        "website": "https://lisathompson.cloud",
        "xp": 4800,
        "rank": "Gold I",
        "projects": [
            {"name": "Serverless API", "description": "AWS Lambda-based REST API", "link": "https://github.com/cloud-engineer/serverless-api", "tech": "AWS Lambda, API Gateway, DynamoDB"},
            {"name": "Cloud Monitoring", "description": "Multi-cloud monitoring solution", "link": "https://github.com/cloud-engineer/monitoring", "tech": "Prometheus, Grafana, AWS"}
        ]
    }
]

SAMPLE_POSTS = [
    "Just finished building a new React component library! Check it out. #React #WebDev",
    "Excited to announce I've completed my AWS Solutions Architect certification!",
    "Working on a new machine learning project using TensorFlow. The results are amazing!",
    "Just deployed my first Kubernetes cluster. DevOps journey continues!",
    "Anyone else excited about the new CSS features in 2024? Container queries are game-changing!",
    "Just finished debugging a tricky SQL query. Performance improved by 10x!",
    "Proud to share my latest open-source contribution to the FastAPI ecosystem.",
    "Great conference talk today about building scalable systems. So much to learn!",
    "Just launched my portfolio website. Feedback welcome!",
    "Working on integrating AI into my Flutter app. The possibilities are endless!"
]

def ensure_skill(db, skill_name):
    skill = db.query(Skill).filter(Skill.canonical_name == skill_name).first()
    if not skill:
        skill = Skill(canonical_name=skill_name)
        db.add(skill)
        db.flush()
    return skill

def create_test_users():
    engine = create_engine(os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/nexora_master"))
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        hashed_password = pwd_context.hash("password123")
        
        # Create skills
        all_skills = set()
        for user_data in TEST_USERS:
            for skill in user_data["skills"]:
                all_skills.add(skill)
        
        for skill_name in all_skills:
            ensure_skill(db, skill_name)
        
        db.commit()
        
        created_users = []
        
        # Create users
        for user_data in TEST_USERS:
            existing_user = db.query(User).filter(User.username == user_data["username"]).first()
            if existing_user:
                print(f"User {user_data['username']} already exists, skipping...")
                created_users.append(existing_user)
                continue
            
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=hashed_password,
                display_name=user_data["display_name"],
                bio=user_data["bio"],
                location=user_data["location"],
                is_active=True,
                online_status="offline"
            )
            db.add(user)
            db.flush()
            
            # Create profile with extended fields
            profile = Profile(
                user_id=user.id,
                display_name=user_data["display_name"],
                bio=user_data["bio"],
                experience_level=user_data.get("experience_level"),
                github_url=user_data.get("github_url"),
                linkedin_url=user_data.get("linkedin_url"),
                portfolio_links=[user_data.get("website")] if user_data.get("website") else [],
            )
            db.add(profile)
            
            # Create social stats
            social_stats = UserSocialStats(
                user_id=user.id,
                followers_count=0,
                following_count=0,
                posts_count=0,
                xp_total=user_data["xp"],
                rank_level=user_data["rank"]
            )
            db.add(social_stats)
            
            # Add skills
            for skill_name in user_data["skills"]:
                skill = ensure_skill(db, skill_name)
                user_skill = UserSkill(
                    user_id=user.id,
                    skill_id=skill.id,
                    skill_name=skill.canonical_name,
                    skill_level=random.randint(2, 5),
                    xp=random.randint(500, 2000),
                    is_primary=True,
                    verified=random.choice([True, False])
                )
                db.add(user_skill)
            
            db.commit()
            db.refresh(user)
            created_users.append(user)
            print(f"Created user: {user.username} with {len(user_data['skills'])} skills")
        
        # Create followers (random connections)
        for i, user in enumerate(created_users):
            # Follow 2-4 random other users
            potential_follows = [u for u in created_users if u.id != user.id]
            follow_count = random.randint(2, min(4, len(potential_follows)))
            follow_targets = random.sample(potential_follows, follow_count)
            
            for target in follow_targets:
                existing = db.query(Follower).filter(
                    Follower.follower_id == user.id,
                    Follower.following_id == target.id
                ).first()
                
                if not existing:
                    follow = Follower(follower_id=user.id, following_id=target.id)
                    db.add(follow)
                    
                    # Create notification
                    notif = Notification(
                        user_id=target.id,
                        type="NEW_FOLLOWER",
                        title="New Follower",
                        message=f"{user.display_name or user.username} started following you",
                        related_id=str(user.id)
                    )
                    db.add(notif)
        
        db.commit()
        print(f"\nCreated {len(created_users)} followers")
        
        # Create posts (without likes for now)
        for user in created_users:
            post_count = random.randint(1, 3)
            for i in range(post_count):
                content = random.choice(SAMPLE_POSTS)
                skill_post = SkillPost(
                    user_id=user.id,
                    content=content,
                    likes_count=0,
                    comments_count=0,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                )
                db.add(skill_post)
        
        db.commit()
        print(f"Created posts for all users")

        # Create projects for each user
        for user, user_data in zip(created_users, TEST_USERS):
            for proj in user_data.get("projects", [])[:2]:
                project = UserProject(
                    user_id=user.id,
                    project_name=proj["name"],
                    project_description=proj["description"],
                    project_link=proj["link"],
                    tech_stack=[tech.strip() for tech in proj["tech"].split(",")],
                )
                db.add(project)
        db.commit()
        print("Created projects for all users")
        
        # Fetch posts fresh from database
        all_posts = db.query(SkillPost).all()
        
        # Create likes on posts
        for post in all_posts:
            # Randomly like 1-3 other users' posts
            potential_likers = [u for u in created_users if u.id != post.user_id]
            like_count = random.randint(1, min(3, len(potential_likers)))
            likers = random.sample(potential_likers, like_count)
            
            for liker in likers:
                existing_like = db.query(PostLike).filter(
                    PostLike.post_id == post.id,
                    PostLike.user_id == liker.id
                ).first()
                
                if not existing_like:
                    post_like = PostLike(post_id=post.id, user_id=liker.id)
                    db.add(post_like)
                    
                    # Create notification
                    notif = Notification(
                        user_id=post.user_id,
                        type="POST_LIKE",
                        title="Post Liked",
                        message=f"{liker.display_name or liker.username} liked your post",
                        related_id=str(post.id)
                    )
                    db.add(notif)
        
        db.commit()
        print(f"Created post likes")
        
        # Update follower counts
        for user in created_users:
            followers_count = db.query(Follower).filter(Follower.following_id == user.id).count()
            following_count = db.query(Follower).filter(Follower.follower_id == user.id).count()
            posts_count = db.query(SkillPost).filter(SkillPost.user_id == user.id).count()
            
            stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user.id).first()
            if stats:
                stats.followers_count = followers_count
                stats.following_count = following_count
                stats.posts_count = posts_count
        
        db.commit()
        print("Updated follower counts")
        
        # Create some connections for messaging testing
        user1 = created_users[0]  # react_dev
        user4 = created_users[3]  # security_expert (different skills)
        
        # Connect them so they can message
        connection = UserConnection(user1_id=user1.id, user2_id=user4.id)
        db.add(connection)
        db.commit()
        print(f"Connected {user1.username} with {user4.username} for messaging tests")
        
        print("\n" + "="*60)
        print("✅ ALL TEST DATA CREATED SUCCESSFULLY!")
        print("="*60)
        print(f"\nTotal users: {len(created_users)}")
        print(f"Total skills: {len(all_skills)}")
        print(f"Posts created for each user: 1-3")
        print(f"Followers: Random connections between users")
        print(f"Notifications: Generated for follows and likes")
        print("\n📋 TEST CREDENTIALS:")
        print("   Username: See table below")
        print("   Password: password123")
        print("\n📱 SKILL-BASED MESSAGING TEST:")
        print("   - react_dev ↔ ui_designer = CAN message (both have React)")
        print("   - react_dev ↔ security_expert = CANNOT message (different skills)")
        print("   - But we connected react_dev and security_expert!")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
