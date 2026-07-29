import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import BusinessProfile, SupportProgram
from app.schemas import RecommendationResponse, SupportProgramResponse

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)


@router.get(
    "/{business_id}",
    response_model=list[RecommendationResponse],
)
def get_recommendations(
    business_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    business = db.get(BusinessProfile, business_id)

    if business is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사업자 정보를 찾을 수 없습니다.",
        )

    programs = db.scalars(select(SupportProgram)).all()

    recommendations = []

    for program in programs:
        score = 0
        reasons = []

        # 지역 점수
        if business.region_name:
            if program.region_name == business.region_name:
                score += 40
                reasons.append("지역 일치")

            elif program.region_name == "전국":
                score += 30
                reasons.append("전국 대상")

        # 업종 점수
        if business.industry_name:
            if program.target_industry == business.industry_name:
                score += 40
                reasons.append("업종 일치")

            elif program.target_industry == "전 업종":
                score += 30
                reasons.append("전 업종 대상")

            elif (
                program.target_industry
                and (
                    program.target_industry in business.industry_name
                    or business.industry_name in program.target_industry
                )
            ):
                score += 35
                reasons.append("유사 업종")

            elif (
                program.target_industry == "소매·서비스업"
                and (
                    "소매" in business.industry_name
                    or "도소매" in business.industry_name
                    or "서비스" in business.industry_name
                )
            ):
                score += 35
                reasons.append("소매·서비스업 대상")

        # 지원금 점수
        support_amount = program.support_amount or 0

        if support_amount >= 100_000_000:
            score += 20
            reasons.append("지원금 매우 큼")

        elif support_amount >= 50_000_000:
            score += 15
            reasons.append("지원금 큼")

        elif support_amount >= 10_000_000:
            score += 10
            reasons.append("지원금 보통")

        elif support_amount > 0:
            score += 5
            reasons.append("지원금 제공")

        # 지역 또는 업종이 맞는 사업만 추천
        if score >= 30:
            recommendations.append(
                RecommendationResponse(
                    score=score,
                    reason=", ".join(reasons),
                    program=SupportProgramResponse.model_validate(program),
                )
            )

    recommendations.sort(
        key=lambda x: x.score,
        reverse=True,
    )

    return recommendations[:10]