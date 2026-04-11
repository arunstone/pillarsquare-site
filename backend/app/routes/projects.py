from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from typing import Optional
from slugify import slugify

from ..database import get_db
from ..auth import require_admin
from ..models.project import Project, ProjectImage, ProjectCategory, ProjectStatus
from ..schemas.project import (
    ProjectOut, ProjectDetailOut, ProjectCreate, ProjectUpdate,
    ProjectImageOut, ProjectImageCreate,
)
from ..schemas.common import PaginatedResponse

router = APIRouter()


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[ProjectOut])
async def list_projects(
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    category: Optional[ProjectCategory] = None,
    status: Optional[ProjectStatus] = None,
    featured: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Project)
    if category:
        q = q.where(Project.category == category)
    if status:
        q = q.where(Project.status == status)
    if featured is not None:
        q = q.where(Project.is_featured == featured)

    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    items = (
        await db.scalars(
            q.order_by(Project.created_at.desc())
            .offset((page - 1) * size)
            .limit(size)
        )
    ).all()

    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}


@router.get("/{slug}", response_model=ProjectDetailOut)
async def get_project(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Project).where(Project.slug == slug).options(selectinload(Project.images))
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.post("", response_model=ProjectOut, status_code=201, dependencies=[Depends(require_admin)])
async def create_project(data: ProjectCreate, db: AsyncSession = Depends(get_db)):
    slug = slugify(data.title)
    existing_count = await db.scalar(select(func.count()).where(Project.slug == slug))
    if existing_count:
        slug = f"{slug}-{existing_count}"
    project = Project(**data.model_dump(), slug=slug)
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.patch("/{project_id}", response_model=ProjectOut, dependencies=[Depends(require_admin)])
async def update_project(project_id: int, data: ProjectUpdate, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_project(project_id: int, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    await db.delete(project)
    await db.commit()


@router.post("/{project_id}/images", response_model=ProjectImageOut, status_code=201, dependencies=[Depends(require_admin)])
async def add_project_image(project_id: int, data: ProjectImageCreate, db: AsyncSession = Depends(get_db)):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    img = ProjectImage(**data.model_dump(), project_id=project_id)
    db.add(img)
    await db.commit()
    await db.refresh(img)
    return img


@router.delete("/{project_id}/images/{image_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_project_image(project_id: int, image_id: int, db: AsyncSession = Depends(get_db)):
    img = await db.scalar(
        select(ProjectImage).where(ProjectImage.id == image_id, ProjectImage.project_id == project_id)
    )
    if not img:
        raise HTTPException(status_code=404, detail="Image not found")
    await db.delete(img)
    await db.commit()
