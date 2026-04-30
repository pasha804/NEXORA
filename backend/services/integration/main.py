from fastapi import FastAPI, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from common.database import get_db, engine
from common.models import Base, ExternalAccounts
from services.integration.logic import link_platform_logic
from pydantic import BaseModel
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/integration")

class ConnectRequest(BaseModel):
    platform: str
    username: str

@app.post("/connect/{user_id}")
def connect_platform(user_id: int, data: ConnectRequest, db: Session = Depends(get_db)):
    account = link_platform_logic(user_id, data.platform, data.username, db)
    return {"status": "connected", "platform": account.platform, "stats": account.imported_stats}

@app.get("/{user_id}")
def get_integrations(user_id: int, db: Session = Depends(get_db)):
    accounts = db.query(ExternalAccounts).filter(ExternalAccounts.user_id == user_id).all()
    return accounts

@app.get("/")
def health_check():
    return {"status": "integration-service running"}
