from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from common import database, models
import schemas
import auth as auth_module

router = APIRouter(
    prefix="/communities",
    tags=["communities"]
)

get_db = database.get_db

@router.get("/me", response_model=List[schemas.Community])
def get_my_communities(db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    # Join CommunityMember to get the communities the user has joined
    membership = db.query(models.CommunityMember).filter(models.CommunityMember.user_id == current_user.id).all()
    community_ids = [m.community_id for m in membership]
    
    if not community_ids:
        return []
    
    return db.query(models.Community).filter(models.Community.id.in_(community_ids)).all()

@router.get("/", response_model=List[schemas.Community])
def list_communities(q: str = "", skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    query = db.query(models.Community)
    if q.strip():
        query = query.filter(models.Community.name.ilike(f"%{q}%"))
    return query.order_by(models.Community.member_count.desc()).offset(skip).limit(limit).all()

@router.get("/discover", response_model=List[schemas.Community])
def discover_communities(db: Session = Depends(get_db)):
    # Return featured or most popular communities
    return db.query(models.Community).order_by(models.Community.member_count.desc()).limit(10).all()

@router.get("/{slug}", response_model=schemas.Community)
def get_community(slug: str, db: Session = Depends(get_db)):
    community = db.query(models.Community).filter(models.Community.slug == slug).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    return community

@router.post("/", response_model=schemas.Community)
def create_community(community: schemas.CommunityCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    # Check slug uniqueness
    slug = community.name.lower().replace(" ", "-") # Simple slugify
    existing = db.query(models.Community).filter(models.Community.slug == slug).first()
    if existing:
         raise HTTPException(status_code=400, detail="Community name already taken")

    db_community = models.Community(
        **community.model_dump(),
        slug=slug,
        creator_id=current_user.id,
        member_count=1
    )
    db.add(db_community)
    db.flush() # Get the ID before committing
    
    # Creator automatically becomes an admin member
    member = models.CommunityMember(
        community_id=db_community.id,
        user_id=current_user.id,
        role="admin"
    )
    db.add(member)
    
    db.commit()
    db.refresh(db_community)
    return db_community

@router.post("/{slug}/join", response_model=bool)
def join_community(slug: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    community = db.query(models.Community).filter(models.Community.slug == slug).first()
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
    
    # Check if already a member
    existing = db.query(models.CommunityMember).filter(
        models.CommunityMember.community_id == community.id,
        models.CommunityMember.user_id == current_user.id
    ).first()
    
    if existing:
        return True
    
    member = models.CommunityMember(
        community_id=community.id,
        user_id=current_user.id
    )
    db.add(member)
    community.member_count += 1
    db.commit()
    return True

@router.get("/{slug}/feed", response_model=List[schemas.CommunityPost])
def get_community_feed(slug: str, skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    community = db.query(models.Community).filter(models.Community.slug == slug).first()
    if not community:
          raise HTTPException(status_code=404, detail="Community not found")
    
    return db.query(models.CommunityPost).filter(models.CommunityPost.community_id == community.id)\
        .order_by(models.CommunityPost.created_at.desc()).offset(skip).limit(limit).all()
