import uuid
from datetime import datetime

from sqlalchemy import BigInteger, Date, DateTime, String, Text
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


class SupportProgram(Base):
    __tablename__ = "support_programs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    organization_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    region_name: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    target_industry: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    support_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    support_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    application_start_date: Mapped[Date | None] = mapped_column(
        Date,
        nullable=True,
    )

    application_end_date: Mapped[Date | None] = mapped_column(
        Date,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    source_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )