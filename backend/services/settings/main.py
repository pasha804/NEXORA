from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from common.database import get_db, engine
from common.models import Base, User, UserPrivacySettings, UserNotificationSettings, UserAccountSettings

# ... existing imports ...
Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/settings")

class PrivacyUpdate(BaseModel):
    profile_visibility: Optional[str] = None
    allow_messages: Optional[str] = None
    allow_tagging: Optional[bool] = None
    show_activity_status: Optional[bool] = None
    show_battle_history: Optional[bool] = None
    show_skill_levels: Optional[bool] = None

class NotificationUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    battle_notifications: Optional[bool] = None
    message_notifications: Optional[bool] = None
    community_notifications: Optional[bool] = None
    marketing_notifications: Optional[bool] = None

class AccountUpdate(BaseModel):
    two_factor_enabled: Optional[bool] = None
    language: Optional[str] = None
    theme_mode: Optional[str] = None
    content_filter_level: Optional[str] = None

@app.get("/")
def get_settings(db: Session = Depends(get_db), authorization: str = Header(...)):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    if not user_id: raise HTTPException(status_code=401, detail="Invalid Token")
    
    privacy = db.query(UserPrivacySettings).filter(UserPrivacySettings.user_id == user_id).first()
    notifications = db.query(UserNotificationSettings).filter(UserNotificationSettings.user_id == user_id).first()
    account = db.query(UserAccountSettings).filter(UserAccountSettings.user_id == user_id).first()
    
    return {
        "privacy": privacy,
        "notifications": notifications,
        "account": account
    }

@app.put("/privacy")
def update_privacy(data: PrivacyUpdate, db: Session = Depends(get_db), authorization: str = Header(...)):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    settings = db.query(UserPrivacySettings).filter(UserPrivacySettings.user_id == user_id).first()
    
    if not settings:
        settings = UserPrivacySettings(user_id=user_id)
        db.add(settings)
    
    if data.profile_visibility: settings.profile_visibility = data.profile_visibility
    if data.allow_messages: settings.allow_messages = data.allow_messages
    if data.allow_tagging is not None: settings.allow_tagging = data.allow_tagging
    if data.show_activity_status is not None: settings.show_activity_status = data.show_activity_status
    if data.show_battle_history is not None: settings.show_battle_history = data.show_battle_history
    if data.show_skill_levels is not None: settings.show_skill_levels = data.show_skill_levels
    
    db.commit()
    return {"status": "updated"}

@app.put("/notifications")
def update_notifications(data: NotificationUpdate, db: Session = Depends(get_db), authorization: str = Header(...)):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    settings = db.query(UserNotificationSettings).filter(UserNotificationSettings.user_id == user_id).first()
    
    if not settings:
        settings = UserNotificationSettings(user_id=user_id)
        db.add(settings)
        
    if data.email_notifications is not None: settings.email_notifications = data.email_notifications
    if data.battle_notifications is not None: settings.battle_notifications = data.battle_notifications
    if data.message_notifications is not None: settings.message_notifications = data.message_notifications
    if data.community_notifications is not None: settings.community_notifications = data.community_notifications
    if data.marketing_notifications is not None: settings.marketing_notifications = data.marketing_notifications
    
    db.commit()
    return {"status": "updated"}

@app.put("/account")
def update_account(data: AccountUpdate, db: Session = Depends(get_db), authorization: str = Header(...)):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    settings = db.query(UserAccountSettings).filter(UserAccountSettings.user_id == user_id).first()
    
    if not settings:
        settings = UserAccountSettings(user_id=user_id)
        db.add(settings)
        
    if data.two_factor_enabled is not None: settings.two_factor_enabled = data.two_factor_enabled
    if data.language: settings.language = data.language
    if data.theme_mode: settings.theme_mode = data.theme_mode
    if data.content_filter_level: settings.content_filter_level = data.content_filter_level
    
    db.commit()
    return {"status": "updated"}
