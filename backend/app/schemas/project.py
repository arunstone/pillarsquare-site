from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from ..models.project import ProjectCategory, ProjectStatus


class ProjectImageOut(BaseModel):
    id: int
    image_url: str
    caption: Optional[str] = None
    sort_order: int

    model_config = {"from_attributes": True}


class ProjectOut(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str] = None
    category: ProjectCategory
    location: Optional[str] = None
    area_sqft: Optional[int] = None
    status: ProjectStatus
    featured_image: Optional[str] = None
    is_featured: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectDetailOut(ProjectOut):
    images: List[ProjectImageOut] = []


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: ProjectCategory
    location: Optional[str] = None
    area_sqft: Optional[int] = None
    status: ProjectStatus = ProjectStatus.ongoing
    featured_image: Optional[str] = None
    is_featured: bool = False


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ProjectCategory] = None
    location: Optional[str] = None
    area_sqft: Optional[int] = None
    status: Optional[ProjectStatus] = None
    featured_image: Optional[str] = None
    is_featured: Optional[bool] = None


class ProjectImageCreate(BaseModel):
    image_url: str
    caption: Optional[str] = None
    sort_order: int = 0
