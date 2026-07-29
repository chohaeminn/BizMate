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