import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BusinessProfile, FundingRequest
from app.schemas import (
    FundingRequestCreate,
    FundingRequestResponse,
    FundingRequestUpdate,
)

router = APIRouter(
    prefix="/funding-requests",
    tags=["Funding Requests"],
)


@router.post(
    "",
    response_model=FundingRequestResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_funding_request(
    request_data: FundingRequestCreate,
    db: Session = Depends(get_db),
):
    profile = db.get(
        BusinessProfile,
        request_data.profile_id,
    )

    if profile is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사업자 프로필을 찾을 수 없습니다.",
        )

    funding_request = FundingRequest(
        **request_data.model_dump(),
    )

    db.add(funding_request)
    db.commit()
    db.refresh(funding_request)

    return funding_request


@router.get(
    "",
    response_model=list[FundingRequestResponse],
)
def get_funding_requests(
    db: Session = Depends(get_db),
):
    statement = select(FundingRequest).order_by(
        FundingRequest.created_at.desc(),
    )

    return db.scalars(statement).all()


@router.get(
    "/{funding_request_id}",
    response_model=FundingRequestResponse,
)
def get_funding_request(
    funding_request_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    funding_request = db.get(
        FundingRequest,
        funding_request_id,
    )

    if funding_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="자금 요청을 찾을 수 없습니다.",
        )

    return funding_request


@router.patch(
    "/{funding_request_id}",
    response_model=FundingRequestResponse,
)
def update_funding_request(
    funding_request_id: uuid.UUID,
    request_data: FundingRequestUpdate,
    db: Session = Depends(get_db),
):
    funding_request = db.get(
        FundingRequest,
        funding_request_id,
    )

    if funding_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="자금 요청을 찾을 수 없습니다.",
        )

    update_data = request_data.model_dump(
        exclude_unset=True,
    )

    for field, value in update_data.items():
        setattr(funding_request, field, value)

    db.commit()
    db.refresh(funding_request)

    return funding_request


@router.delete(
    "/{funding_request_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_funding_request(
    funding_request_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    funding_request = db.get(
        FundingRequest,
        funding_request_id,
    )

    if funding_request is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="자금 요청을 찾을 수 없습니다.",
        )

    db.delete(funding_request)
    db.commit()