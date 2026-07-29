import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
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

    conditions = []

    if business.region_name:
        conditions.append(
            or_(
                SupportProgram.region_name == business.region_name,
                SupportProgram.region_name == "전국",
                SupportProgram.region_name.is_(None),
            )
        )

    if business.industry_name:
        conditions.append(
            or_(
                SupportProgram.target_industry == business.industry_name,
                SupportProgram.target_industry.is_(None),
            )
        )

    statement = select(SupportProgram)

    if conditions:
        statement = statement.where(*conditions)

    programs = db.scalars(statement).all()

    recommendations = []

    for program in programs:
        score = 0
        reasons = []

        # 지역 점수
        if (
            business.region_name
            and program.region_name == business.region_name
        ):
            score += 50
            reasons.append("지역 일치")

        elif program.region_name == "전국":
            score += 20
            reasons.append("전국 지원")

        # 업종 점수
        if (
            business.industry_name
            and program.target_industry == business.industry_name
        ):
            score += 30
            reasons.append("업종 일치")

        # 지원금 점수
        if program.support_amount >= 10000000:
            score += 20
            reasons.append("지원금 규모 큼")

        elif program.support_amount >= 5000000:
            score += 10
            reasons.append("지원금 규모 보통")

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

    return recommendations