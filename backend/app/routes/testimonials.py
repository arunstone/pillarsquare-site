from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..auth import require_admin
from ..models.testimonial import Testimonial
from ..schemas.testimonial import TestimonialOut, TestimonialCreate, TestimonialUpdate
from ..schemas.common import PaginatedResponse

router = APIRouter()


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[TestimonialOut])
async def list_testimonials(
    featured_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    q = select(Testimonial)
    if featured_only:
        q = q.where(Testimonial.is_featured == True)
    items = (await db.scalars(q.order_by(Testimonial.created_at.desc()))).all()
    return {"items": items, "total": len(items), "page": 1, "size": len(items), "pages": 1}


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.post("", response_model=TestimonialOut, status_code=201, dependencies=[Depends(require_admin)])
async def create_testimonial(data: TestimonialCreate, db: AsyncSession = Depends(get_db)):
    t = Testimonial(**data.model_dump())
    db.add(t)
    await db.commit()
    await db.refresh(t)
    return t


@router.patch("/{testimonial_id}", response_model=TestimonialOut, dependencies=[Depends(require_admin)])
async def update_testimonial(testimonial_id: int, data: TestimonialUpdate, db: AsyncSession = Depends(get_db)):
    t = await db.get(Testimonial, testimonial_id)
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(t, field, value)
    await db.commit()
    await db.refresh(t)
    return t


@router.delete("/{testimonial_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_testimonial(testimonial_id: int, db: AsyncSession = Depends(get_db)):
    t = await db.get(Testimonial, testimonial_id)
    if not t:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    await db.delete(t)
    await db.commit()
