import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


# =====================================================
# Business Profile
# =====================================================

class BusinessProfileCreate(BaseModel):
    business_name: str = Field(
        min_length=1,
        max_length=100,
    )

    owner_name: str = Field(
        min_length=1,
        max_length=50,
    )

    region_name: str | None = Field(
        default=None,
        max_length=50,
    )

    industry_name: str | None = Field(
        default=None,
        max_length=100,
    )

    annual_sales: int = Field(
        default=0,
        ge=0,
    )


class BusinessProfileUpdate(BaseModel):
    business_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    owner_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    region_name: str | None = Field(
        default=None,
        max_length=50,
    )

    industry_name: str | None = Field(
        default=None,
        max_length=100,
    )

    annual_sales: int | None = Field(
        default=None,
        ge=0,
    )


class BusinessProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    business_name: str
    owner_name: str
    region_name: str | None
    industry_name: str | None
    annual_sales: int
    created_at: datetime


# =====================================================
# Support Program
# =====================================================

class SupportProgramCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    organization_name: str = Field(
        min_length=1,
        max_length=100,
    )

    region_name: str | None = Field(
        default=None,
        max_length=50,
    )

    target_industry: str | None = Field(
        default=None,
        max_length=100,
    )

    support_type: str | None = Field(
        default=None,
        max_length=50,
    )

    support_amount: int = Field(
        default=0,
        ge=0,
    )

    application_start_date: date | None = None
    application_end_date: date | None = None
    description: str | None = None
    source_url: str | None = None


class SupportProgramUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    organization_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=100,
    )

    region_name: str | None = Field(
        default=None,
        max_length=50,
    )

    target_industry: str | None = Field(
        default=None,
        max_length=100,
    )

    support_type: str | None = Field(
        default=None,
        max_length=50,
    )

    support_amount: int | None = Field(
        default=None,
        ge=0,
    )

    application_start_date: date | None = None
    application_end_date: date | None = None
    description: str | None = None
    source_url: str | None = None


class SupportProgramResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    organization_name: str
    region_name: str | None
    target_industry: str | None
    support_type: str | None
    support_amount: int
    application_start_date: date | None
    application_end_date: date | None
    description: str | None
    source_url: str | None
    created_at: datetime


# =====================================================
# Recommendation
# =====================================================

class RecommendationResponse(BaseModel):
    score: int
    reason: str
    program: SupportProgramResponse


# =====================================================
# Funding Request
# =====================================================

class FundingRequestCreate(BaseModel):
    profile_id: uuid.UUID

    required_amount: int = Field(
        gt=0,
    )

    funding_purpose: str = Field(
        min_length=1,
        max_length=50,
    )

    self_funding_amount: int = Field(
        default=0,
        ge=0,
    )

    max_monthly_payment: int = Field(
        default=0,
        ge=0,
    )

    optimization_priority: str = Field(
        default="비용",
        min_length=1,
        max_length=30,
    )


class FundingRequestUpdate(BaseModel):
    required_amount: int | None = Field(
        default=None,
        gt=0,
    )

    funding_purpose: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    self_funding_amount: int | None = Field(
        default=None,
        ge=0,
    )

    max_monthly_payment: int | None = Field(
        default=None,
        ge=0,
    )

    optimization_priority: str | None = Field(
        default=None,
        min_length=1,
        max_length=30,
    )


class FundingRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    profile_id: uuid.UUID
    required_amount: int
    funding_purpose: str
    self_funding_amount: int
    max_monthly_payment: int
    optimization_priority: str
    created_at: datetime


# =====================================================
# Portfolio
# =====================================================

class PortfolioItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    portfolio_result_id: uuid.UUID
    support_program_id: uuid.UUID | None
    item_name: str
    funding_type: str
    amount: int
    reason: str | None
    priority_order: int
    created_at: datetime


class PortfolioResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    funding_request_id: uuid.UUID
    total_required_amount: int
    total_funding_amount: int
    shortage_amount: int
    summary: str | None
    created_at: datetime


class PortfolioGenerateResponse(BaseModel):
    portfolio: PortfolioResultResponse
    items: list[PortfolioItemResponse]

    # =====================================================
# Tax Schedule
# =====================================================

class TaxScheduleCreate(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=300,
    )

    note: str | None = None

    schedule_date: date


class TaxScheduleUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=300,
    )

    note: str | None = None

    schedule_date: date | None = None


class TaxScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    note: str | None
    schedule_date: date
    created_at: datetime