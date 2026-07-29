import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


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