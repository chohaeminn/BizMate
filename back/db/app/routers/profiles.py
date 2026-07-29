import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BusinessProfile
from app.schemas import (
    BusinessProfileCreate,
    BusinessProfileResponse,
    BusinessProfileUpdate,
)


router = APIRouter(
    prefix="/business-profiles",
    tags=["Business Profiles"],
)


DbSession = Annotated[Session, Depends(get_db)]


@router.post(
    "",
    response_model=BusinessProfileResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_business_profile(
    profile_data: BusinessProfileCreate,
    db: DbSession,
):
    new_profile = BusinessProfile(
        business_name=profile_data.business_name,
        owner_name=profile_data.owner_name,
        region_name=profile_data.region_name,
        industry_name=profile_data.industry_name,
        annual_sales=profile_data.annual_sales,
    )

    db.add(new_profile)
    db.commit()
    db.refresh(new_profile)

    return new_profile


@router.get(
    "",
    response_model=list[BusinessProfileResponse],
)
def get_business_profiles(
    db: DbSession,
):
    statement = select(BusinessProfile).order_by(
        BusinessProfile.created_at.desc()
    )

    profiles = db.scalars(statement).all()

    return profiles


@router.get(
    "/{profile_id}",
    response_model=BusinessProfileResponse,
)
def get_business_profile(
    profile_id: uuid.UUID,
    db: DbSession,
):
    profile = db.get(BusinessProfile, profile_id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사업자 정보를 찾을 수 없습니다.",
        )

    return profile


@router.patch(
    "/{profile_id}",
    response_model=BusinessProfileResponse,
)
def update_business_profile(
    profile_id: uuid.UUID,
    profile_data: BusinessProfileUpdate,
    db: DbSession,
):
    profile = db.get(BusinessProfile, profile_id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사업자 정보를 찾을 수 없습니다.",
        )

    update_data = profile_data.model_dump(exclude_unset=True)

    for field_name, value in update_data.items():
        setattr(profile, field_name, value)

    db.commit()
    db.refresh(profile)

    return profile


@router.delete(
    "/{profile_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_business_profile(
    profile_id: uuid.UUID,
    db: DbSession,
):
    profile = db.get(BusinessProfile, profile_id)

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사업자 정보를 찾을 수 없습니다.",
        )

    db.delete(profile)
    db.commit()

    return Response(status_code=status.HTTP_204_NO_CONTENT)