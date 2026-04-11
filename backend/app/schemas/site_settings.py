from pydantic import BaseModel
from typing import Optional


class SiteSettingOut(BaseModel):
    key: str
    value: Optional[str] = None

    model_config = {"from_attributes": True}


class SiteSettingUpsert(BaseModel):
    key: str
    value: Optional[str] = None
