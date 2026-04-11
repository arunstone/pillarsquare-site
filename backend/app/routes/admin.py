import os
import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel

from ..database import get_db
from ..auth import create_access_token, require_admin
from ..config import settings
from ..models.inquiry import Inquiry, InquiryStatus, InquirySource
from ..schemas.inquiry import InquiryOut, InquiryStatusUpdate

router = APIRouter()

UPLOAD_DIR = "/app/uploads"


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
async def admin_login(body: LoginRequest):
    if body.email != settings.ADMIN_EMAIL or body.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": body.email, "role": "admin"})
    return {"access_token": token}


# ── Upload ────────────────────────────────────────────────────────────────────

class UploadResponse(BaseModel):
    url: str
    filename: str


@router.post("/upload", response_model=UploadResponse, dependencies=[Depends(require_admin)])
async def upload_file(file: UploadFile = File(...)):
    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="File type not allowed")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin"
    filename = f"{uuid.uuid4().hex}.{ext}"
    dest = os.path.join(UPLOAD_DIR, filename)

    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 20 MB)")

    with open(dest, "wb") as f:
        f.write(contents)

    return {"url": f"/uploads/{filename}", "filename": filename}


# ── Inquiries ─────────────────────────────────────────────────────────────────

@router.get("/inquiries", response_model=list[InquiryOut], dependencies=[Depends(require_admin)])
async def list_inquiries(
    status: Optional[InquiryStatus] = None,
    source: Optional[InquirySource] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    q = select(Inquiry)
    if status:
        q = q.where(Inquiry.status == status)
    if source:
        q = q.where(Inquiry.source == source)
    if date_from:
        q = q.where(Inquiry.created_at >= date_from)
    if date_to:
        from datetime import datetime, timezone, timedelta
        end = datetime.combine(date_to, datetime.max.time()).replace(tzinfo=timezone.utc)
        q = q.where(Inquiry.created_at <= end)

    items = (
        await db.scalars(q.order_by(Inquiry.created_at.desc()).offset((page - 1) * size).limit(size))
    ).all()
    return items


@router.patch("/inquiries/{inquiry_id}", response_model=InquiryOut, dependencies=[Depends(require_admin)])
async def update_inquiry_status(
    inquiry_id: int,
    data: InquiryStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    inquiry = await db.get(Inquiry, inquiry_id)
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    inquiry.status = data.status
    await db.commit()
    await db.refresh(inquiry)
    return inquiry
