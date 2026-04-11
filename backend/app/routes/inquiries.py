import os
from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks, Header
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, field_validator
from typing import Optional

from ..database import get_db
from ..models.inquiry import Inquiry
from ..schemas.inquiry import InquiryOut, InquiryCreate
from ..services.notification import notify_admin_new_inquiry

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class InquiryCreatePublic(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    message: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name is required")
        return v

    @field_validator("phone")
    @classmethod
    def phone_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("phone is required")
        return v


class TelegramInquiryPayload(BaseModel):
    name: str
    phone: str
    project_type: Optional[str] = None
    message: Optional[str] = None
    telegram_chat_id: Optional[str] = None
    telegram_username: Optional[str] = None


@router.post("/webhook/telegram-inquiry", status_code=201)
async def telegram_inquiry_webhook(
    data: TelegramInquiryPayload,
    x_webhook_secret: Optional[str] = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    expected = os.getenv("WEBHOOK_SECRET")
    if not expected or x_webhook_secret != expected:
        raise HTTPException(status_code=401, detail="Invalid or missing X-Webhook-Secret")

    parts = []
    if data.project_type:
        parts.append(f"Project type: {data.project_type}")
    if data.message:
        parts.append(data.message)
    if data.telegram_username:
        parts.append(f"Telegram: @{data.telegram_username}")
    if data.telegram_chat_id:
        parts.append(f"Chat ID: {data.telegram_chat_id}")

    inquiry = Inquiry(
        name=data.name,
        phone=data.phone,
        message="\n".join(parts) if parts else None,
        source="telegram",
    )
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    return {"success": True, "inquiry_id": inquiry.id}


@router.post("", response_model=InquiryOut, status_code=201)
@limiter.limit("5/hour")
async def create_inquiry(
    request: Request,
    data: InquiryCreatePublic,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    inquiry = Inquiry(
        name=data.name,
        phone=data.phone,
        email=data.email,
        message=data.message,
    )
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    background_tasks.add_task(notify_admin_new_inquiry, inquiry)
    return inquiry
