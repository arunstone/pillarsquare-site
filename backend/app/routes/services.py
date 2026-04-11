from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from slugify import slugify

from ..database import get_db
from ..auth import require_admin
from ..models.service import Service
from ..schemas.service import ServiceOut, ServiceCreate, ServiceUpdate
from ..schemas.common import PaginatedResponse

router = APIRouter()


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedResponse[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)):
    items = (await db.scalars(select(Service).order_by(Service.sort_order))).all()
    return {"items": items, "total": len(items), "page": 1, "size": len(items), "pages": 1}


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.post("", response_model=ServiceOut, status_code=201, dependencies=[Depends(require_admin)])
async def create_service(data: ServiceCreate, db: AsyncSession = Depends(get_db)):
    service = Service(**data.model_dump(), slug=slugify(data.title))
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service


@router.patch("/{service_id}", response_model=ServiceOut, dependencies=[Depends(require_admin)])
async def update_service(service_id: int, data: ServiceUpdate, db: AsyncSession = Depends(get_db)):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(service, field, value)
    await db.commit()
    await db.refresh(service)
    return service


@router.delete("/{service_id}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_service(service_id: int, db: AsyncSession = Depends(get_db)):
    service = await db.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    await db.delete(service)
    await db.commit()
