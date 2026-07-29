import uuid
from datetime import date, datetime

from sqlalchemy import (
    BigInteger,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
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

    application_start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    application_end_date: Mapped[date | None] = mapped_column(
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


class FundingRequest(Base):
    __tablename__ = "funding_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "business_profiles.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    required_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    funding_purpose: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    self_funding_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    max_monthly_payment: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    optimization_priority: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="비용",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class PortfolioResult(Base):
    __tablename__ = "portfolio_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    funding_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "funding_requests.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    total_required_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    total_funding_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    shortage_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    portfolio_result_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "portfolio_results.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    support_program_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "support_programs.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    item_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    funding_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    priority_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )