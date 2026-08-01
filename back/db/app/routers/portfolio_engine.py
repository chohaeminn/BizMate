import json
import uuid
from dataclasses import asdict
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    BusinessProfile,
    DeductionCandidate,
    ExternalDebt,
    FundingCandidate,
    FundingRequest,
    LoanProduct,
    SupportProgram,
)
from app.routers.portfolios import (
    is_application_open,
    is_industry_match,
    is_region_match,
)
from app.services.portfolio_calculator import (
    PortfolioCalculationError,
    PortfolioItemInput,
    calculate_portfolio,
    run_stress_test,
)


router = APIRouter(prefix="/portfolio-engine", tags=["Portfolio Engine"])


class CalculateItemRequest(BaseModel):
    source_type: Literal["support_program", "loan_product", "self_funding"]
    source_id: uuid.UUID | None = None
    amount: int = Field(gt=0)
    reason: str | None = None
    priority_order: int = Field(default=1, ge=1)


class CalculateRequest(BaseModel):
    funding_request_id: uuid.UUID
    portfolio_type: Literal["cost", "stability", "speed"]
    items: list[CalculateItemRequest] = Field(min_length=1)


def period_label(weeks: int) -> str:
    if weeks <= 0:
        return "즉시"
    if weeks <= 4:
        return f"{weeks}주"
    return f"약 {round(weeks / 4)}개월"


@router.get("/candidates")
def get_candidates(
    funding_request_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    funding_request = db.get(FundingRequest, funding_request_id)
    if funding_request is None:
        raise HTTPException(status_code=404, detail="자금 요청을 찾을 수 없습니다.")

    profile = db.get(BusinessProfile, funding_request.profile_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="사업자 프로필을 찾을 수 없습니다.")

    programs = db.scalars(
        select(SupportProgram).where(SupportProgram.support_amount > 0)
    ).all()
    eligible_programs = [
        program for program in programs
        if is_region_match(profile.region_name, program.region_name)
        and is_industry_match(profile.industry_name, program.target_industry)
        and is_application_open(program)
    ]
    loan_products = db.scalars(
        select(LoanProduct)
        .where(LoanProduct.is_active.is_(True))
        .order_by(LoanProduct.created_at.desc())
    ).all()
    debts = db.scalars(
        select(ExternalDebt).where(ExternalDebt.profile_id == profile.id)
    ).all()
    funding_candidates = db.scalars(
        select(FundingCandidate).where(FundingCandidate.eligible.is_(True))
    ).all()
    deduction_candidates = db.scalars(
        select(DeductionCandidate).where(DeductionCandidate.enabled.is_(True))
    ).all()
    eligible_deductions = [
        candidate for candidate in deduction_candidates
        if not candidate.target_industry
        or candidate.target_industry in {"전체", "전 업종", "소상공인"}
        or is_industry_match(profile.industry_name, candidate.target_industry)
    ]

    support_program_payload = [
        {
            "candidate_id": program.id,
            "source_type": "support_program",
            "name": program.title,
            "organization_name": program.organization_name,
            "funding_type": "grant",
            "max_amount": program.support_amount,
            "region_name": program.region_name,
            "target_industry": program.target_industry,
            "application_end_date": program.application_end_date,
            "source_url": program.source_url,
            "calculation_ready": True,
        }
        for program in eligible_programs
    ]

    return {
        "business_profile": profile,
        "funding_request": funding_request,
        "cash_flow": {
            "monthly_average_sales": round(profile.annual_sales / 12),
            "available_cash_amount": profile.available_cash_amount,
            "monthly_fixed_expense": profile.monthly_fixed_expense,
            "existing_debt_balance": sum(item.balance_amount for item in debts),
            "existing_monthly_payment": sum(item.monthly_payment for item in debts),
        },
        "external_debts": debts,
        "deduction_candidates": [
            {
                "candidate_id": candidate.id,
                "name": candidate.name,
                "category": candidate.category,
                "calculation_type": candidate.calculation_type,
                "target_industry": candidate.target_industry,
                "required_inputs": json.loads(candidate.required_inputs),
                "source": candidate.source,
                "source_section": candidate.source_section,
                "calculation_ready": False,
            }
            for candidate in eligible_deductions
        ],
        "funding_candidates": [
            {
                "candidate_id": uuid.uuid5(uuid.NAMESPACE_URL, f"bizmate:{candidate.id}"),
                "funding_candidate_id": candidate.id,
                "source_type": "loan_product",
                "name": candidate.title,
                "funding_type": candidate.funding_type,
                "max_amount": candidate.max_amount,
                "source": candidate.source,
                "annual_rate": candidate.annual_rate,
                "term_months": candidate.term_months,
                "grace_months": candidate.grace_months,
                "guarantee_fee_rate": candidate.guarantee_fee_rate,
                "expected_period_weeks": candidate.expected_period_weeks,
                "region_name": candidate.region_name,
                "target_industry": candidate.target_industry,
                "funding_purpose": candidate.funding_purpose,
                "terms_note": candidate.terms_note,
                "calculation_ready": all(value is not None for value in (
                    candidate.annual_rate,
                    candidate.term_months,
                    candidate.grace_months,
                    candidate.guarantee_fee_rate,
                    candidate.expected_period_weeks,
                )),
            }
            for candidate in funding_candidates
        ],
        "support_programs": support_program_payload,
        # 기존 프론트 계약을 유지하는 호환 필드입니다.
        "support_program_candidates": support_program_payload,
        "loan_product_candidates": [
            {
                "candidate_id": product.id,
                "source_type": "loan_product",
                "name": product.name,
                "organization_name": product.organization_name,
                "funding_type": (
                    "guarantee_loan"
                    if "guarantee" in product.loan_type.lower() or "보증" in product.loan_type
                    else "policy_loan"
                    if "policy" in product.loan_type.lower() or "정책" in product.loan_type
                    else "commercial_loan"
                ),
                "max_amount": product.max_amount,
                "annual_rate": product.annual_rate,
                "term_months": product.term_months,
                "grace_months": product.grace_months,
                "guarantee_fee_rate": product.guarantee_fee_rate,
                "expected_period_weeks": product.expected_period_weeks,
                "source_url": product.source_url,
                "calculation_ready": True,
            }
            for product in loan_products
        ],
        "self_funding_candidate": {
            "candidate_id": None,
            "source_type": "self_funding",
            "name": "자기자금",
            "funding_type": "self_funding",
            "max_amount": funding_request.self_funding_amount,
        },
        "rag_search_keywords": [
            profile.region_name or "전국",
            profile.industry_name or "전 업종",
            funding_request.funding_purpose,
            "지원사업 중복수혜 조건",
            "정책자금 신청 서류",
        ],
        "rag_evidence": [
            {
                "candidate_id": program.id,
                "source": program.source_url,
                "document_title": program.title,
                "evidence": program.description,
            }
            for program in eligible_programs
            if program.description
        ],
    }


@router.post("/calculate")
def calculate(
    payload: CalculateRequest,
    db: Session = Depends(get_db),
):
    funding_request = db.get(FundingRequest, payload.funding_request_id)
    if funding_request is None:
        raise HTTPException(status_code=404, detail="자금 요청을 찾을 수 없습니다.")

    calculator_items: list[PortfolioItemInput] = []
    resolved_items: list[dict] = []
    used_self_funding = 0

    for item in sorted(payload.items, key=lambda value: value.priority_order):
        if item.source_type == "support_program":
            if item.source_id is None:
                raise HTTPException(status_code=400, detail="지원사업 source_id가 필요합니다.")
            program = db.get(SupportProgram, item.source_id)
            if program is None:
                raise HTTPException(status_code=404, detail="지원사업을 찾을 수 없습니다.")
            if program.support_amount > 0 and item.amount > program.support_amount:
                raise HTTPException(status_code=400, detail="지원사업 지원한도를 초과했습니다.")
            calculator_input = PortfolioItemInput(
                item_name=program.title,
                funding_type="grant",
                amount=item.amount,
            )
        elif item.source_type == "loan_product":
            if item.source_id is None:
                raise HTTPException(status_code=400, detail="대출상품 source_id가 필요합니다.")
            product = db.get(LoanProduct, item.source_id)
            if product is None or not product.is_active:
                raise HTTPException(status_code=404, detail="사용 가능한 대출상품을 찾을 수 없습니다.")
            if product.max_amount > 0 and item.amount > product.max_amount:
                raise HTTPException(status_code=400, detail="대출상품 한도를 초과했습니다.")
            funding_type = (
                "guarantee_loan"
                if "guarantee" in product.loan_type.lower() or "보증" in product.loan_type
                else "policy_loan"
                if "policy" in product.loan_type.lower() or "정책" in product.loan_type
                else "commercial_loan"
            )
            calculator_input = PortfolioItemInput(
                item_name=product.name,
                funding_type=funding_type,
                amount=item.amount,
                annual_rate=product.annual_rate,
                term_months=product.term_months,
                grace_months=product.grace_months,
                guarantee_fee_rate=product.guarantee_fee_rate,
                expected_period_weeks=product.expected_period_weeks,
            )
        else:
            if item.source_id is not None:
                raise HTTPException(status_code=400, detail="자기자금 source_id는 없어야 합니다.")
            used_self_funding += item.amount
            if used_self_funding > funding_request.self_funding_amount:
                raise HTTPException(status_code=400, detail="자기자금 한도를 초과했습니다.")
            calculator_input = PortfolioItemInput(
                item_name="자기자금",
                funding_type="self_funding",
                amount=item.amount,
            )

        calculator_items.append(calculator_input)
        resolved_items.append({
            "source_type": item.source_type,
            "source_id": item.source_id,
            "reason": item.reason,
            "priority_order": item.priority_order,
        })

    try:
        calculation = calculate_portfolio(
            total_required_amount=funding_request.required_amount,
            items=calculator_items,
        )
    except PortfolioCalculationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    stress_test = []
    for source, calculated in zip(resolved_items, calculation.items, strict=True):
        if source["source_type"] != "loan_product" or source["source_id"] is None:
            continue
        product = db.get(LoanProduct, source["source_id"])
        stress_test.append({
            "candidate_id": source["source_id"],
            "name": calculated.item_name,
            "scenarios": run_stress_test(
                principal=calculated.amount,
                annual_rate=product.annual_rate,
                term_months=product.term_months,
            ),
        })

    return {
        "portfolio_type": payload.portfolio_type,
        "total_required_amount": calculation.total_required_amount,
        "total_funding_amount": calculation.total_funding_amount,
        "shortage_amount": calculation.shortage_amount,
        "monthly_payment": calculation.monthly_payment,
        "finance_cost": calculation.finance_cost,
        "expected_period_weeks": calculation.expected_period_weeks,
        "expected_period_label": period_label(calculation.expected_period_weeks),
        "exceeds_monthly_payment_limit": (
            funding_request.max_monthly_payment > 0
            and calculation.monthly_payment > funding_request.max_monthly_payment
        ),
        "items": [
            {**asdict(calculated), **source}
            for source, calculated in zip(resolved_items, calculation.items, strict=True)
        ],
        "stress_test": stress_test,
    }
