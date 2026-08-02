import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BusinessProfile, TaxInputRecord


router = APIRouter(prefix="/tax-inputs", tags=["Tax Inputs"])


@router.get("/latest")
def get_latest_tax_input(profile_id: uuid.UUID, db: Session = Depends(get_db)):
    if db.get(BusinessProfile, profile_id) is None:
        raise HTTPException(status_code=404, detail="사업자 프로필을 찾을 수 없습니다.")

    tax_input = db.scalar(
        select(TaxInputRecord)
        .where(TaxInputRecord.profile_id == profile_id)
        .order_by(TaxInputRecord.period_end.desc(), TaxInputRecord.created_at.desc())
        .limit(1)
    )
    if tax_input is None:
        raise HTTPException(status_code=404, detail="사업자의 세무 입력값이 없습니다.")

    return {
        "id": tax_input.id,
        "profile_id": tax_input.profile_id,
        "period_start": tax_input.period_start,
        "period_end": tax_input.period_end,
        "amount_basis": tax_input.amount_basis,
        "sales_amount": tax_input.sales_amount,
        "purchase_amount": tax_input.purchase_amount,
        "simulation_tax_rate": float(tax_input.simulation_tax_rate),
        "created_at": tax_input.created_at,
    }
