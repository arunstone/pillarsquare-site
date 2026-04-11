from sqlalchemy import Column, Integer, String, Text
from ..database import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    icon_name = Column(String(100))
    sort_order = Column(Integer, default=0)
