from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TestimonialOut(BaseModel):
    id: int
    client_name: str
    client_role: Optional[str] = None
    content: str
    rating: int
    is_featured: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TestimonialCreate(BaseModel):
    client_name: str
    client_role: Optional[str] = None
    content: str
    rating: int = Field(default=5, ge=1, le=5)
    is_featured: bool = False


class TestimonialUpdate(BaseModel):
    client_name: Optional[str] = None
    client_role: Optional[str] = None
    content: Optional[str] = None
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    is_featured: Optional[bool] = None
