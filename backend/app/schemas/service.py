from pydantic import BaseModel
from typing import Optional


class ServiceOut(BaseModel):
    id: int
    title: str
    slug: str
    description: Optional[str] = None
    icon_name: Optional[str] = None
    sort_order: int

    model_config = {"from_attributes": True}


class ServiceCreate(BaseModel):
    title: str
    description: Optional[str] = None
    icon_name: Optional[str] = None
    sort_order: int = 0


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    icon_name: Optional[str] = None
    sort_order: Optional[int] = None
