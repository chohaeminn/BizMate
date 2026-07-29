import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import TaxSchedule
from app.schemas import TaxScheduleResponse


router = APIRouter(
    prefix="/tax-schedules",
    tags=["Tax Schedules"],
)


@router.get(
    "",
    response_model=list[TaxScheduleResponse],
)
def get_tax_schedules(
    year: int | None = Query(
        default=None,
        ge=2000,
        le=2100,
    ),
    month: int | None = Query(
        default=None,
        ge=1,
        le=12,
    ),
    db: Session = Depends(get_db),
):
    query = db.query(TaxSchedule)

    if month is not None and year is None:
        raise HTTPException(
            status_code=400,
            detail="month를 조회하려면 year도 함께 입력해야 합니다.",
        )

    if year is not None:
        if month is None:
            start_date = date(year, 1, 1)
            end_date = date(year + 1, 1, 1)

        elif month == 12:
            start_date = date(year, 12, 1)
            end_date = date(year + 1, 1, 1)

        else:
            start_date = date(year, month, 1)
            end_date = date(year, month + 1, 1)

        query = query.filter(
            TaxSchedule.schedule_date >= start_date,
            TaxSchedule.schedule_date < end_date,
        )

    return query.order_by(
        TaxSchedule.schedule_date.asc(),
        TaxSchedule.title.asc(),
    ).all()


@router.get(
    "/{schedule_id}",
    response_model=TaxScheduleResponse,
)
def get_tax_schedule(
    schedule_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    tax_schedule = (
        db.query(TaxSchedule)
        .filter(TaxSchedule.id == schedule_id)
        .first()
    )

    if tax_schedule is None:
        raise HTTPException(
            status_code=404,
            detail="세무일정을 찾을 수 없습니다.",
        )

    return tax_schedule