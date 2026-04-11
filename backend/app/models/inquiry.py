from sqlalchemy import Column, Integer, String, Text, Enum, DateTime
from sqlalchemy.sql import func
import enum
from ..database import Base


class InquirySource(str, enum.Enum):
    web = "web"
    telegram = "telegram"


class InquiryStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    closed = "closed"


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(50))
    message = Column(Text)
    source = Column(Enum(InquirySource), default=InquirySource.web)
    status = Column(Enum(InquiryStatus), default=InquiryStatus.new)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
