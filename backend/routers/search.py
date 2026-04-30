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
    category: Optional[str] = Query(None, description="Filter by skill category"),
    sort: Optional[str] = Query("newest", description="Sort: newest, xp_high, most_followed, most_active"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(auth_module.get_current_user_optional)
):
    """Search users by username or display name, with skill/category filtering"""
    from sqlalchemy import desc, or_
    from common.models import UserSkill, Skill, SkillCategory, Follower
    
    # 1. Base query with outer joins to include all users regardless of skills
    # We use distinct() to prevent duplicate users when they have multiple skills
    query = db.query(User).outerjoin(UserSkill).outerjoin(Skill).outerjoin(SkillCategory)
    
    # 2. Exclude current user from results
    if current_user:
        query = query.filter(User.id != current_user.id)
    
    # 3. Apply Filters
    filters = []
    
    # Text search across multiple fields (inclusive OR)
    if q:
        search_pattern = f"%{q}%"
        filters.append(
            or_(
                User.username.ilike(search_pattern),
                User.display_name.ilike(search_pattern),
                User.bio.ilike(search_pattern),
                UserSkill.skill_name.ilike(search_pattern),
                Skill.canonical_name.ilike(search_pattern)
            )
        )
    
    # Explicit skill name filter
    if skill:
        skill_pattern = f"%{skill}%"
        filters.append(
            or_(
                UserSkill.skill_name.ilike(skill_pattern),
                Skill.canonical_name.ilike(skill_pattern)
            )
        )
        
    # Category filter (e.g. Frontend, Backend)
    if category:
        filters.append(SkillCategory.category_name.ilike(f"%{category}%"))
        
    for f in filters:
        query = query.filter(f)
        
    # 4. Finalizing Query (Unique users only)
    query = query.distinct()
    
    # 5. Get Total Count
    total = query.count()
    
    # 6. Apply Sorting
    if sort == "xp_high":
        query = query.order_by(desc(User.xp_points))
    elif sort == "newest":
        query = query.order_by(desc(User.created_at))
    elif sort == "most_followed":
        # Placeholder for complex followed sort, default to last_seen
        query = query.order_by(desc(User.last_seen))
    else:
        query = query.order_by(desc(User.last_seen))
        
    # 7. Pagination
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()
    
    # 8. Transform to Response Format
    users_data = []
    for user in users:
        u_dict = user_to_dict(user, db)
        # Add social context
        u_dict["follower_count"] = db.query(Follower).filter(Follower.following_id == user.id).count()
        u_dict["following_count"] = db.query(Follower).filter(Follower.follower_id == user.id).count()
        users_data.append(u_dict)
        
    return {
        "users": users_data,
        "total": total,
        "page": page,
        "limit": limit,
        "has_next": (offset + limit) < total,
        "has_prev": page > 1
    }
