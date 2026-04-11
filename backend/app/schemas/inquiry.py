from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from ..models.inquiry import InquirySource, InquiryStatus


class InquiryCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    source: InquirySource = InquirySource.web


class InquiryOut(BaseModel):
    id: int
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    message: Optional[str] = None
    source: InquirySource
    status: InquiryStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class InquiryStatusUpdate(BaseModel):
    status: InquiryStatus
