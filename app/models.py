import uuid
from datetime import datetime

from sqlalchemy import BigInteger, DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    business_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    owner_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    region_name: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    industry_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    annual_sales: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )