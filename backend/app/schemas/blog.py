from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BlogPostOut(BaseModel):
    id: int
    title: str
    slug: str
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    is_published: bool
    published_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class BlogPostDetailOut(BlogPostOut):
    content: Optional[str] = None


class BlogPostCreate(BaseModel):
    title: str
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    is_published: bool = False


class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    featured_image: Optional[str] = None
    is_published: Optional[bool] = None
