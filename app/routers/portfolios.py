import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    BusinessProfile,
    FundingRequest,
    PortfolioItem,
    PortfolioResult,
    SupportProgram,
)
from app.schemas import PortfolioGenerateResponse


router = APIRouter(
    prefix="/portfolios",
    tags=["Portfolios"],
)


def normalize_text(value: str | None) -> str:
    """
    비교하기 쉽도록 공백을 제거하고 소문자로 변환한다.
    """
    if value is None:
        return ""

    return value.replace(" ", "").lower()


def is_nationwide_region(region_name: str | None) -> bool:
    """
    전국 대상 또는 지역 제한이 없는 지원사업인지 확인한다.
    """
    normalized_region = normalize_text(region_name)

    nationwide_keywords = {
        "",
        "전국",
        "전지역",
        "지역무관",
        "제한없음",
        "대한민국",
    }

    return normalized_region in nationwide_keywords


def is_region_match(
    business_region: str | None,
    program_region: str | None,
) -> bool:
    """
    사업자 지역과 지원사업 지역의 일치 여부를 확인한다.
    """
    if is_nationwide_region(program_region):
        return True

    normalized_business_region = normalize_text(business_region)
    normalized_program_region = normalize_text(program_region)

    if not normalized_business_region:
        return False

    return (
        normalized_business_region in normalized_program_region
        or normalized_program_region in normalized_business_region
    )


def is_industry_match(
    business_industry: str | None,
    target_industry: str | None,
) -> bool:
    """
    사업자 업종과 지원 대상 업종의 일치 여부를 확인한다.
    """
    normalized_business_industry = normalize_text(business_industry)
    normalized_target_industry = normalize_text(target_industry)

    general_industry_keywords = {
        "",
        "전체",
        "전업종",
        "업종무관",
        "제한없음",
        "소상공인",
        "중소기업",
    }

    if normalized_target_industry in general_industry_keywords:
        return True

    if not normalized_business_industry:
        return False

    return (
        normalized_business_industry in normalized_target_industry
        or normalized_target_industry in normalized_business_industry
    )


def is_application_open(program: SupportProgram) -> bool:
    """
    현재 신청 가능한 기간인지 확인한다.

    시작일이나 종료일이 없으면 기간 제한이 없는 것으로 처리한다.
    """
    today = date.today()

    if (
        program.application_start_date is not None
        and program.application_start_date > today
    ):
        return False

    if (
        program.application_end_date is not None
        and program.application_end_date < today
    ):
        return False

    return True


def calculate_program_score(
    profile: BusinessProfile,
    program: SupportProgram,
) -> int:
    """
    지원사업 우선순위 점수를 계산한다.
    """
    score = 0

    if is_nationwide_region(program.region_name):
        score += 20
    elif is_region_match(
        profile.region_name,
        program.region_name,
    ):
        score += 50

    if is_industry_match(
        profile.industry_name,
        program.target_industry,
    ):
        score += 30

    if program.support_amount >= 10_000_000:
        score += 20
    elif program.support_amount >= 5_000_000:
        score += 10

    return score


@router.post(
    "/generate/{funding_request_id}",
    response_model=PortfolioGenerateResponse,
)
def generate_portfolio(
    funding_request_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    # 1. 자금 요청 조회
    funding_request = db.get(
        FundingRequest,
        funding_request_id,
    )

    if funding_request is None:
        raise HTTPException(
            status_code=404,
            detail="자금 요청을 찾을 수 없습니다.",
        )

    # 2. 자금 요청에 연결된 사업자 프로필 조회
    profile = db.get(
        BusinessProfile,
        funding_request.profile_id,
    )

    if profile is None:
        raise HTTPException(
            status_code=404,
            detail="사업자 프로필을 찾을 수 없습니다.",
        )

    # 3. 지원금액이 0원보다 큰 지원사업 조회
    programs = db.scalars(
        select(SupportProgram).where(
            SupportProgram.support_amount > 0
        )
    ).all()

    # 4. 지역, 업종, 신청 기간이 맞는 지원사업만 선별
    eligible_programs = []

    for program in programs:
        if not is_region_match(
            profile.region_name,
            program.region_name,
        ):
            continue

        if not is_industry_match(
            profile.industry_name,
            program.target_industry,
        ):
            continue

        if not is_application_open(program):
            continue

        score = calculate_program_score(
            profile,
            program,
        )

        eligible_programs.append(
            (score, program)
        )

    # 점수가 높은 순, 지원금액이 큰 순으로 정렬
    eligible_programs.sort(
        key=lambda item: (
            item[0],
            item[1].support_amount,
        ),
        reverse=True,
    )

    # 5. 포트폴리오 결과 생성
    portfolio = PortfolioResult(
        funding_request_id=funding_request.id,
        total_required_amount=funding_request.required_amount,
        total_funding_amount=0,
        shortage_amount=funding_request.required_amount,
        summary="사업자 지역과 업종을 기준으로 자동 생성된 자금 포트폴리오",
    )

    db.add(portfolio)
    db.flush()

    items: list[PortfolioItem] = []
    total_amount = 0
    priority_order = 1

    # 6. 자부담금 먼저 반영
    self_funding_amount = min(
        funding_request.self_funding_amount,
        funding_request.required_amount,
    )

    if self_funding_amount > 0:
        self_funding_item = PortfolioItem(
            portfolio_result_id=portfolio.id,
            support_program_id=None,
            item_name="자부담금",
            funding_type="자기자금",
            amount=self_funding_amount,
            reason="자금 요청 시 입력한 자체 조달 가능 금액",
            priority_order=priority_order,
        )

        db.add(self_funding_item)
        items.append(self_funding_item)

        total_amount += self_funding_amount
        priority_order += 1

    # 7. 적합한 지원사업을 포트폴리오에 추가
    used_program_keys: set[tuple[str, str]] = set()

    for score, program in eligible_programs:
        if total_amount >= funding_request.required_amount:
            break

        # 제목과 기관명이 같은 중복 지원사업 제외
        duplicate_key = (
            normalize_text(program.title),
            normalize_text(program.organization_name),
        )

        if duplicate_key in used_program_keys:
            continue

        used_program_keys.add(duplicate_key)

        remaining_amount = (
            funding_request.required_amount - total_amount
        )

        # 마지막 지원사업이 필요 금액을 초과하면
        # 실제 포트폴리오 반영 금액은 남은 금액까지만 적용
        applied_amount = min(
            program.support_amount,
            remaining_amount,
        )

        reason_parts = []

        if is_nationwide_region(program.region_name):
            reason_parts.append("전국 대상 지원사업")
        else:
            reason_parts.append(
                f"사업자 지역({profile.region_name})과 일치"
            )

        reason_parts.append(
            f"사업자 업종({profile.industry_name})에 적합"
        )

        reason_parts.append(
            f"적합도 점수 {score}점"
        )

        item = PortfolioItem(
            portfolio_result_id=portfolio.id,
            support_program_id=program.id,
            item_name=program.title,
            funding_type=program.support_type or "지원사업",
            amount=applied_amount,
            reason=", ".join(reason_parts),
            priority_order=priority_order,
        )

        db.add(item)
        items.append(item)

        total_amount += applied_amount
        priority_order += 1

    # 8. 최종 금액 계산
    shortage_amount = max(
        funding_request.required_amount - total_amount,
        0,
    )

    portfolio.total_funding_amount = total_amount
    portfolio.shortage_amount = shortage_amount

    if not eligible_programs:
        portfolio.summary = (
            "사업자 지역과 업종에 맞는 지원사업을 찾지 못했습니다. "
            "현재는 자부담금만 반영되었습니다."
        )
    elif shortage_amount > 0:
        portfolio.summary = (
            f"필요 자금 중 {total_amount:,}원을 확보할 수 있으며, "
            f"{shortage_amount:,}원이 부족합니다."
        )
    else:
        portfolio.summary = (
            f"자부담금과 지원사업을 조합하여 "
            f"필요 자금 {funding_request.required_amount:,}원을 "
            "충당할 수 있습니다."
        )

    # 9. 데이터베이스 저장
    db.commit()

    db.refresh(portfolio)

    for item in items:
        db.refresh(item)

    return {
        "portfolio": portfolio,
        "items": items,
    }

@router.get(
    "/{portfolio_id}",
    response_model=PortfolioGenerateResponse,
)
def get_portfolio(
    portfolio_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    portfolio = db.get(
        PortfolioResult,
        portfolio_id,
    )

    if portfolio is None:
        raise HTTPException(
            status_code=404,
            detail="포트폴리오를 찾을 수 없습니다.",
        )

    items = db.scalars(
        select(PortfolioItem).where(
            PortfolioItem.portfolio_result_id == portfolio.id
        ).order_by(
            PortfolioItem.priority_order
        )
    ).all()

    return {
        "portfolio": portfolio,
        "items": items,
    }


@router.get(
    "/funding-request/{funding_request_id}",
    response_model=list[PortfolioGenerateResponse],
)
def get_portfolios_by_funding_request(
    funding_request_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    portfolios = db.scalars(
        select(PortfolioResult)
        .where(
            PortfolioResult.funding_request_id == funding_request_id
        )
        .order_by(
            PortfolioResult.created_at.desc()
        )
    ).all()

    results = []

    for portfolio in portfolios:
        items = db.scalars(
            select(PortfolioItem)
            .where(
                PortfolioItem.portfolio_result_id == portfolio.id
            )
            .order_by(
                PortfolioItem.priority_order
            )
        ).all()

        results.append(
            {
                "portfolio": portfolio,
                "items": items,
            }
        )

    return results

@router.delete(
    "/{portfolio_id}",
)
def delete_portfolio(
    portfolio_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    portfolio = db.get(
        PortfolioResult,
        portfolio_id,
    )

    if portfolio is None:
        raise HTTPException(
            status_code=404,
            detail="포트폴리오를 찾을 수 없습니다.",
        )

    # 해당 포트폴리오의 항목 조회
    items = db.scalars(
        select(PortfolioItem).where(
            PortfolioItem.portfolio_result_id == portfolio.id
        )
    ).all()

    # 항목 먼저 삭제
    for item in items:
        db.delete(item)

    # 포트폴리오 삭제
    db.delete(portfolio)

    db.commit()

    return {
        "message": "포트폴리오가 성공적으로 삭제되었습니다."
    }