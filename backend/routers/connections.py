from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from common.database import get_db
from common.models import User, ConnectionRequest, UserConnection, Notification
import auth as auth_module
import schemas
from pydantic import BaseModel

router = APIRouter(prefix="/connections", tags=["Connections"])

class ConnectionRequestSchema(BaseModel):
    receiver_id: int
    message: str = None  # type: ignore

@router.post("/request")
async def send_connection_request(
    data: ConnectionRequestSchema,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    if data.receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot connect with yourself")
    
    # Check if a request already exists
    existing = db.query(ConnectionRequest).filter(
        (ConnectionRequest.sender_id == current_user.id) & 
        (ConnectionRequest.receiver_id == data.receiver_id) &
        (ConnectionRequest.status == "pending")
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Connection request already pending")
    
    # Check if already connected
    connected = db.query(UserConnection).filter(
        ((UserConnection.user1_id == current_user.id) & (UserConnection.user2_id == data.receiver_id)) |
        ((UserConnection.user1_id == data.receiver_id) & (UserConnection.user2_id == current_user.id))
    ).first()
    
    if connected:
        raise HTTPException(status_code=400, detail="Users are already connected")

    new_request = ConnectionRequest(
        sender_id=current_user.id,
        receiver_id=data.receiver_id,
        message=data.message,
        status="pending"
    )
    db.add(new_request)
    
    # Create notification for receiver
    notification = Notification(
        user_id=data.receiver_id,
        type="CONNECTION_REQUEST",
        title="New Connection Request",
        message=f"{current_user.display_name or current_user.username} sent you a connection request",
        related_id=str(current_user.id)
    )
    db.add(notification)
    
    db.commit()
    return {"message": "Connection request sent"}

@router.post("/accept")
async def accept_connection_request(
    request_id: int,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    conn_request = db.query(ConnectionRequest).filter(
        (ConnectionRequest.id == request_id) & (ConnectionRequest.receiver_id == current_user.id)
    ).first()
    
    if not conn_request:
        raise HTTPException(status_code=404, detail="Connection request not found")
    
    if conn_request.status != "pending":
        raise HTTPException(status_code=400, detail="Request is already processed")

    conn_request.status = "accepted"
    
    # Add to connections table
    new_connection = UserConnection(
        user1_id=conn_request.sender_id,
        user2_id=conn_request.receiver_id
    )
    db.add(new_connection)
    
    # Notify sender
    notification = Notification(
        user_id=conn_request.sender_id,
        type="CONNECTION_ACCEPTED",
        title="Connection Accepted",
        message=f"{current_user.display_name or current_user.username} accepted your connection request",
        related_id=str(current_user.id)
    )
    db.add(notification)
    
    db.commit()
    return {"message": "Connection accepted"}

@router.post("/reject")
async def reject_connection_request(
    request_id: int,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    conn_request = db.query(ConnectionRequest).filter(
        (ConnectionRequest.id == request_id) & (ConnectionRequest.receiver_id == current_user.id)
    ).first()
    
    if not conn_request:
        raise HTTPException(status_code=404, detail="Connection request not found")
    
    conn_request.status = "rejected"
    db.commit()
    return {"message": "Connection request rejected"}

@router.get("/pending")
async def get_pending_requests(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    requests = db.query(ConnectionRequest).filter(
        (ConnectionRequest.receiver_id == current_user.id) & (ConnectionRequest.status == "pending")
    ).all()
    
    return requests
