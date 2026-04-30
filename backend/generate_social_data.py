#!/usr/bin/env python
"""
NEXORA SOCIAL TEST DATA GENERATOR
Creates followers, posts, and notifications for test users
"""
import os
import random
import sys
from datetime import datetime, timedelta

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from common.models import User, UserSkill, SkillPost, Follower, Notification
from common.database import DATABASE_URL


def generate_social_data():
    """Generate social test data"""
    
    # Connect to database
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    print("Creating social test data...")
    
    # Get all test users
    users = db.query(User).filter(User.email.like('%@nexora.test')).order_by(User.id).all()
    print(f"Found {len(users)} test users")
    
    # Post content templates
    post_templates = [
        "Just built a new {skill} project! So excited!",
        "Learning {skill} has been amazing. The possibilities are endless!",
        "Working on improving my {skill} skills.",
        "Just deployed my app using {skill}!",
        "Excited about {skill}!",
        "The {skill} ecosystem is evolving fast.",
        "Building something cool with {skill}.",
    ]
    
    # Create posts for each user
    for user in users:
        print(f"\nProcessing {user.username}...")
        
        # Add posts
        for i in range(3):
            user_skill = db.query(UserSkill).filter(UserSkill.user_id == user.id).first()
            skill_name = user_skill.skill_name if user_skill else "development"
            
            post_content = random.choice(post_templates).format(skill=skill_name)
            
            post = SkillPost(
                user_id=user.id,
                content=post_content,
                likes_count=random.randint(0, 20),
                comments_count=random.randint(0, 10),
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
            )
            db.add(post)
            print(f"  Created post: {post_content[:40]}...")
        
        # Add followers (users don't follow themselves)
        other_users = [u for u in users if u.id != user.id]
        followers_count = random.randint(2, 5)
        followers_to_add = random.sample(other_users, min(followers_count, len(other_users)))
        
        for follower in followers_to_add:
            # Check if not already following
            existing = db.query(Follower).filter(
                Follower.follower_id == follower.id,
                Follower.following_id == user.id
            ).first()
            
            if existing is None:
                follow = Follower(
                    follower_id=follower.id,
                    following_id=user.id,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30))
                )
                db.add(follow)
                print(f"  {follower.username} follows {user.username}")
                
                # Create notification for the user being followed
                notif = Notification(
                    user_id=user.id,
                    type="NEW_FOLLOWER",
                    title="New Follower",
                    message=f"{follower.username} started following you",
                    related_id=str(follower.id)
                )
                db.add(notif)
    
    db.commit()
    print("\n✅ Social test data created!")
    
    # Verify
    print("\n=== VERIFICATION ===")
    print(f"Total posts: {db.query(SkillPost).count()}")
    print(f"Total followers: {db.query(Follower).count()}")
    print(f"Total notifications: {db.query(Notification).count()}")
    
    print("\n=== USER STATS ===")
    for user in users:
        posts = db.query(SkillPost).filter(SkillPost.user_id == user.id).count()
        followers = db.query(Follower).filter(Follower.following_id == user.id).count()
        print(f"{user.username}: {posts} posts, {followers} followers")
    
    db.close()


if __name__ == "__main__":
    generate_social_data()
