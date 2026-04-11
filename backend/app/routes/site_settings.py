from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..auth import require_admin
from ..models.site_settings import SiteSetting
from ..schemas.site_settings import SiteSettingOut, SiteSettingUpsert

router = APIRouter()


# ── Public ────────────────────────────────────────────────────────────────────

@router.get("", response_model=dict[str, str | None])
async def get_settings(db: AsyncSession = Depends(get_db)):
    items = (await db.scalars(select(SiteSetting))).all()
    return {s.key: s.value for s in items}


# ── Admin ─────────────────────────────────────────────────────────────────────

@router.put("/{key}", response_model=SiteSettingOut, dependencies=[Depends(require_admin)])
async def upsert_setting(key: str, data: SiteSettingUpsert, db: AsyncSession = Depends(get_db)):
    setting = await db.scalar(select(SiteSetting).where(SiteSetting.key == key))
    if setting:
        setting.value = data.value
    else:
        setting = SiteSetting(key=key, value=data.value)
        db.add(setting)
    await db.commit()
    await db.refresh(setting)
    return setting


@router.delete("/{key}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_setting(key: str, db: AsyncSession = Depends(get_db)):
    setting = await db.scalar(select(SiteSetting).where(SiteSetting.key == key))
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    await db.delete(setting)
    await db.commit()
