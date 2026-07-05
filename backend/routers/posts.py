from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

from common.database import get_db
from common.models import User, SkillPost, PostLike, PostComment, Notification, Follower
import auth as auth_module
from common.realtime_utils import emit_realtime_notification
from pydantic import BaseModel

router = APIRouter(prefix="/posts", tags=["Posts"])

class PostCreate(BaseModel):
    content: str
    post_type: str = "text"
    skill_id: Optional[str] = None
    media_url: Optional[str] = None
    skill_tags: Optional[List[str]] = None

class CommentCreate(BaseModel):
    content: str

@router.post("/create")
async def create_skill_post(
    data: PostCreate,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    new_post = SkillPost(
        user_id=current_user.id,
        skill_id=data.skill_id,
        content=data.content,
        media_url=data.media_url,
        post_type=data.post_type,
        skill_tags=data.skill_tags or [],
        likes_count=0,
        comments_count=0
    )
    db.add(new_post)
    db.commit()
    return {"message": "Post created", "post_id": new_post.id}

@router.get("/feed")
async def get_posts_feed(
    skip: int = 0,
    limit: int = 20,
    current_user: Optional[User] = Depends(auth_module.get_current_user_optional),
    db: Session = Depends(get_db)
):
    posts = db.query(SkillPost).order_by(SkillPost.created_at.desc()).offset(skip).limit(limit).all()

    current_user_id = current_user.id if current_user else None

    results = []
    for p in posts:
        author = db.query(User).filter(User.id == p.user_id).first()
        if not author:
            continue

        is_liked = False
        is_following = False
        if current_user_id:
            is_liked = db.query(PostLike).filter(
                PostLike.user_id == current_user_id, PostLike.post_id == p.id
            ).first() is not None
            if p.user_id != current_user_id:
                is_following = db.query(Follower).filter(
                    Follower.follower_id == current_user_id, Follower.following_id == p.user_id
                ).first() is not None

        results.append({
            "id": p.id,
            "content": p.content,
            "media_url": p.media_url,
            "skill_id": p.skill_id,
            "post_type": p.post_type or "text",
            "skill_tags": p.skill_tags or [],
            "likes_count": p.likes_count,
            "comments_count": p.comments_count,
            "is_liked": is_liked,
            "is_following_author": is_following,
            "author": {
                "id": author.id,
                "username": author.username,
                "display_name": author.display_name or author.username,
                "avatar_url": author.avatar_url
            },
            "created_at": p.created_at.isoformat() if p.created_at else None
        })
    return results

@router.post("/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(SkillPost).filter(SkillPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_like = db.query(PostLike).filter(
        (PostLike.user_id == current_user.id) & (PostLike.post_id == post_id)
    ).first()

    if existing_like:
        db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
        db.commit()
        return {"message": "Post unliked", "liked": False}

    new_like = PostLike(user_id=current_user.id, post_id=post_id)
    db.add(new_like)
    post.likes_count += 1

    if post.user_id != current_user.id:
        notification = Notification(
            user_id=post.user_id,
            type="POST_LIKE",
            title="Post Liked",
            message=f"{current_user.display_name or current_user.username} liked your post",
            related_id=str(post_id)
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        await emit_realtime_notification(notification)
    else:
        db.commit()

    return {"message": "Post liked", "liked": True}

@router.post("/{post_id}/comment")
async def comment_on_post(
    post_id: int,
    data: CommentCreate,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(SkillPost).filter(SkillPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    new_comment = PostComment(
        user_id=current_user.id,
        post_id=post_id,
        content=data.content
    )
    db.add(new_comment)
    post.comments_count += 1

    if post.user_id != current_user.id:
        notification = Notification(
            user_id=post.user_id,
            type="POST_COMMENT",
            title="Post Commented",
            message=f"{current_user.display_name or current_user.username} commented on your post: {data.content[:50]}",
            related_id=str(post_id)
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        await emit_realtime_notification(notification)
    else:
        db.commit()

    return {"message": "Comment added"}
