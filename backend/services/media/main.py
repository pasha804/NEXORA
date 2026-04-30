from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Header
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
import secrets
import aiofiles
from PIL import Image
import io

from common.database import get_db, engine
from common.models import Base, User, UserMedia
from common.auth import get_current_user_from_token

Base.metadata.create_all(bind=engine)

app = FastAPI(root_path="/media")

UPLOAD_DIR = os.getenv("MEDIA_ROOT", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    type: str = "image", # image or video
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    if not user_id: raise HTTPException(status_code=401, detail="Invalid Token")
    
    # Generate filename
    ext = file.filename.split(".")[-1]
    filename = f"{secrets.token_hex(8)}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    # Save File
    if type == "image":
        # Resize/Optimize logic with Pillow
        content = await file.read()
        image = Image.open(io.BytesIO(content))
        image.thumbnail((1024, 1024)) # Max size
        image.save(filepath, quality=85)
    else:
        # Save directly (video)
        async with aiofiles.open(filepath, 'wb') as out_file:
            content = await file.read()
            await out_file.write(content)
    
    # Save to DB
    media_url = f"http://localhost:80/media/{filename}" # Construct public URL
    new_media = UserMedia(user_id=user_id, media_url=media_url, media_type=type)
    db.add(new_media)
    
    # Auto-update profile if it's an avatar update? 
    # Frontend can handle calling profile update with new URL.
    
    db.commit()
    
    return {"url": media_url, "id": new_media.id}

@app.get("/{filename}")
async def get_file(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath)
    raise HTTPException(status_code=404, detail="File not found")
