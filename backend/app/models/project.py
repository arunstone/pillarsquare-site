from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..database import Base


class ProjectCategory(str, enum.Enum):
    residential = "residential"
    commercial = "commercial"
    renovation = "renovation"


class ProjectStatus(str, enum.Enum):
    completed = "completed"
    ongoing = "ongoing"
    upcoming = "upcoming"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text)
    category = Column(Enum(ProjectCategory), nullable=False)
    location = Column(String(255))
    area_sqft = Column(Integer)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.ongoing)
    featured_image = Column(String(500))
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    images = relationship("ProjectImage", back_populates="project", cascade="all, delete-orphan", order_by="ProjectImage.sort_order")


class ProjectImage(Base):
    __tablename__ = "project_images"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    image_url = Column(String(500), nullable=False)
    caption = Column(String(255))
    sort_order = Column(Integer, default=0)

    project = relationship("Project", back_populates="images")
