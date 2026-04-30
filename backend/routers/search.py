from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from social_utils import user_to_dict
from typing import List, Optional

from common.database import get_db
from common.models import User, Skill, SkillPost, Post, UserSkill
import auth as auth_module
from common.redis_utils import cache_get, cache_set

router = APIRouter(prefix="/search", tags=["Search"])


def _skill_to_dict(skill: Skill, db: Session) -> dict:
    from common.models import SkillCategory
    category = db.query(SkillCategory).filter(SkillCategory.id == skill.category_id).first() if skill.category_id else None
    return {
        "id": skill.id,
        "name": skill.canonical_name, # Frontend expects 'name'
        "canonical_name": skill.canonical_name,
        "category": category.category_name if category else "General",
        "description": category.description if category else f"Master {skill.canonical_name} on Nexora.",
        "difficulty": "Intermediate", # Default for now
        "popularity": 80,
        "marketDemand": "High",
        "avgSalary": "$100k+",
        "timeToMaster": "4 months",
        "trendDirection": "up",
        "trendPercentage": 15,
        "gradient": "from-blue-600 to-indigo-700",
        "icon": skill.canonical_name[0]
    }

def _post_to_dict(post: SkillPost, db: Session) -> dict:
    author = db.query(User).filter(User.id == post.user_id).first()
    return {
        "id": post.id,
        "content": post.content,
        "author_id": post.user_id,
        "author": {
            "username": author.username,
            "display_name": author.display_name,
            "avatar_url": author.avatar_url
        } if author else None,
        "media_url": post.media_url,
        "likes_count": post.likes_count,
        "comments_count": post.comments_count,
        "created_at": post.created_at.isoformat() if post.created_at else None
    }

def _classic_post_to_dict(post: Post, db: Session) -> dict:
    author = db.query(User).filter(User.id == post.author_id).first()
    return {
        "id": post.id,
        "content": post.content,
        "author_id": post.author_id,
        "author": {
            "username": author.username,
            "display_name": author.display_name,
            "avatar_url": author.avatar_url
        } if author else None,
        "media_url": post.media_url,
        "likes_count": post.likes_count,
        "comments_count": post.comments_count,
        "created_at": post.created_at.isoformat() if post.created_at else None,
        "post_type": post.post_type
    }


@router.get("/")
async def unified_search(
    q: Optional[str] = Query(None),
    type: Optional[str] = Query(None, description="Filter by type: users, skills, posts"),
    limit: int = Query(20, ge=1, le=50),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(auth_module.get_current_user_optional)
):
    """
    Search across:
    1. Users (username, display_name, bio, location)
    2. Skills (name, category)
    3. Posts (content)
    """
    if not q:
        query = db.query(User)
        if current_user:
            query = query.filter(User.id != current_user.id)
        
        users = query.order_by(desc(User.last_seen)).limit(limit).all()
        skills = db.query(Skill).limit(limit).all()
        posts = db.query(SkillPost).order_by(desc(SkillPost.created_at)).limit(limit).all()
        
        return {
            "users": [user_to_dict(u, db) for u in users],
            "skills": [_skill_to_dict(s, db) for s in skills],
            "posts": [_post_to_dict(p, db) for p in posts]
        }
    
    search_pattern = f"%{q}%"
    search_lower = q.lower()
    
    results = {}
    
    if not type or type == "users":
        query = db.query(User)
        if current_user:
            query = query.filter(User.id != current_user.id)
            
        users = query.filter(
            or_(
                User.username.ilike(search_pattern),
                User.display_name.ilike(search_pattern),
                User.bio.ilike(search_pattern),
                User.location.ilike(search_pattern)
            )
        ).offset(offset).limit(limit).all()
        results["users"] = [user_to_dict(u, db) for u in users]
    
    if not type or type == "skills":
        skills = db.query(Skill).filter(
            or_(
                Skill.canonical_name.ilike(search_pattern),
                Skill.canonical_name.ilike(f"%{search_lower}%")
            )
        ).offset(offset).limit(limit).all()
        results["skills"] = [_skill_to_dict(s, db) for s in skills]
    
    if not type or type == "posts":
        posts = db.query(SkillPost).filter(
            SkillPost.content.ilike(search_pattern)
        ).offset(offset).limit(limit).all()
        results["posts"] = [_post_to_dict(p, db) for p in posts]
        
        posts_classic = db.query(Post).filter(
            Post.content.ilike(search_pattern)
        ).offset(offset).limit(limit).all()
        
        if "posts" not in results:
            results["posts"] = []
        results["posts"].extend([_classic_post_to_dict(p, db) for p in posts_classic])
    
    return results


@router.get("/skills")
async def search_skills(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search skills by name or category"""
    query = db.query(Skill)
    
    if q:
        q_lower = q.lower()
        query = query.filter(
            or_(
                Skill.canonical_name.ilike(f"%{q}%"),
                Skill.canonical_name.ilike(f"%{q_lower}%")
            )
        )
    
    if category:
        query = query.filter(Skill.category_id == category)
    
    skills = query.limit(limit).all()
    
    return {
        "skills": [_skill_to_dict(s, db) for s in skills]
    }


@router.get("/users")
async def search_users(
    q: Optional[str] = Query(None),
    skill: Optional[str] = Query(None, description="Filter by skill name"),
    category: Optional[str] = Query(None, description="Filter by skill category (Frontend, Backend, AI/ML, DevOps, Design, Mobile)"),
    sort: Optional[str] = Query("newest", description="Sort: newest, xp_high, most_followed, most_active"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(auth_module.get_current_user_optional)
):
    """Search users by username or display name, with skill/category filtering"""
    from sqlalchemy import desc, asc
    
    # Import additional models for skill filtering
    from common.models import UserSkill, Skill, Follower, UserSocialStats
    
    query = db.query(User)
    
    if current_user:
        query = query.filter(User.id != current_user.id)
    
    # Base filters
    filters = []
    
    # Text search (username, display_name, bio)
    if q:
        search_pattern = f"%{q}%"
        filters.append(
            or_(
                User.username.ilike(search_pattern),
                User.display_name.ilike(search_pattern),
                User.bio.ilike(search_pattern)
            )
        )
    
    # Skill filter - find users with specific skill
    if skill:
        skill_pattern = f"%{skill}%"
        
        # Subquery to find matching skill IDs
        matching_skill_ids = db.query(Skill.id).filter(
            Skill.canonical_name.ilike(skill_pattern)
        )
        
        user_ids_with_skill = db.query(UserSkill.user_id).filter(
            or_(
                UserSkill.skill_name.ilike(skill_pattern),
                UserSkill.skill_id.in_(matching_skill_ids)
            )
        ).all()
        
        user_ids_with_skill = [u.user_id for u in user_ids_with_skill]
        if user_ids_with_skill:
            query = query.filter(User.id.in_(user_ids_with_skill))
        else:
            # No users have this skill
            return {"users": [], "total": 0, "page": page, "limit": limit, "has_next": False, "has_prev": False}
    
    # Category filter - find users with skills in a category
    if category:
        from common.models import SkillCategory
        cat = db.query(SkillCategory).filter(
            or_(
                SkillCategory.category_name.ilike(f"%{category}%"),
                SkillCategory.slug.ilike(f"%{category.lower()}%")
            )
        ).first()
        
        if cat:
            skill_ids_in_category = db.query(Skill.id).filter(
                Skill.category_id == cat.id
            ).all()
            skill_ids_in_category = [s.id for s in skill_ids_in_category]
            
            if skill_ids_in_category:
                user_ids_in_category = db.query(UserSkill.user_id).filter(
                    UserSkill.skill_id.in_(skill_ids_in_category)
                ).all()
                user_ids_in_category = [u.user_id for u in user_ids_in_category]
                
                if user_ids_in_category:
                    query = query.filter(User.id.in_(user_ids_in_category))
                else:
                    return {"users": [], "total": 0, "page": page, "limit": limit, "has_next": False, "has_prev": False}
    
    # Apply text filters if any
    if filters:
        for f in filters:
            query = query.filter(f)
    
    # Get total count before sorting/pagination
    total = query.count()
    
    # Apply sorting
    if sort == "xp_high":
        query = query.order_by(desc(User.xp_points))
    elif sort == "most_followed":
        # This is a separate query - we'll do basic sorting by last_seen for now
        query = query.order_by(desc(User.last_seen))
    elif sort == "newest":
        query = query.order_by(desc(User.created_at))
    else:
        query = query.order_by(desc(User.last_seen))
    
    # Apply pagination
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()
    
    # Get follower counts for each user (for display)
    follower_counts = {}
    following_counts = {}
    for user in users:
        follower_counts[user.id] = db.query(Follower).filter(Follower.following_id == user.id).count()
        following_counts[user.id] = db.query(Follower).filter(Follower.follower_id == user.id).count()
    
    # Build response with follower data
    users_data = []
    for user in users:
        user_dict = user_to_dict(user, db)
        user_dict["follower_count"] = follower_counts.get(user.id, 0)
        user_dict["following_count"] = following_counts.get(user.id, 0)
        users_data.append(user_dict)
    
    return {
        "users": users_data,
        "total": total,
        "page": page,
        "limit": limit,
        "has_next": (offset + limit) < total,
        "has_prev": page > 1
    }
