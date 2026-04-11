from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timezone
from slugify import slugify

from ..database import get_db
from ..auth import require_admin
from ..models.blog import BlogPost
from ..schemas.blog import BlogPostOut, BlogPostDetailOut, BlogPostCreate, BlogPostUpdate
from ..schemas.common import PaginatedResponse

router = APIRouter()


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[BlogPostOut])
async def list_posts(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    q = select(BlogPost).where(BlogPost.is_published == True)
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    items = (
        await db.scalars(q.order_by(BlogPost.published_at.desc()).offset((page - 1) * size).limit(size))
    ).all()
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}


@router.get("/{slug}", response_model=BlogPostDetailOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    post = await db.scalar(
        select(BlogPost).where(BlogPost.slug == slug, BlogPost.is_published == True)
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.post("", response_model=BlogPostOut, status_code=201, dependencies=[Depends(require_admin)])
async def create_post(data: BlogPostCreate, db: AsyncSession = Depends(get_db)):
    slug = slugify(data.title)
    existing = await db.scalar(select(func.count()).where(BlogPost.slug == slug))
    if existing:
        slug = f"{slug}-{existing}"
    published_at = datetime.now(timezone.utc) if data.is_published else None
    post = BlogPost(**data.model_dump(), slug=slug, published_at=published_at)
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return post


@router.patch("/{post_id}", response_model=BlogPostOut, dependencies=[Depends(require_admin)])
async def update_post(post_id: int, data: BlogPostUpdate, db: AsyncSession = Depends(get_db)):
    post = await db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    updates = data.model_dump(exclude_unset=True)
    if "is_published" in updates and updates["is_published"] and not post.published_at:
        post.published_at = datetime.now(timezone.utc)
    for field, value in updates.items():
        setattr(post, field, value)
    await db.commit()
    await db.refresh(post)
    return post


@router.delete("/{post_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_post(post_id: int, db: AsyncSession = Depends(get_db)):
    post = await db.get(BlogPost, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    await db.delete(post)
    await db.commit()
