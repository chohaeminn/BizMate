import json
import os
import sys
from pathlib import Path

from ai.azure_client import invoke_agent


BACKEND_DIR = Path(__file__).resolve().parents[1] / "back" / "db"


def create_llm_content() -> str:
    """DB 데이터를 지원사업 추천 에이전트 입력용 JSON으로 변환한다."""
    if str(BACKEND_DIR) not in sys.path:
        sys.path.insert(0, str(BACKEND_DIR))

    from sqlalchemy import select

    from app.database import SessionLocal
    from app.models import BusinessProfile, SupportProgram

    with SessionLocal() as db:
        business_profile = db.scalar(
            select(BusinessProfile)
            .order_by(BusinessProfile.created_at.desc())
            .limit(1)
        )

        if business_profile is None:
            raise RuntimeError("등록된 사업자 프로필이 없습니다.")

        support_programs = db.scalars(
            select(SupportProgram).order_by(
                SupportProgram.created_at.desc()
            )
        ).all()

        payload = {
            "business_profile": {
                "id": str(business_profile.id),
                "region_name": business_profile.region_name,
                "industry_name": business_profile.industry_name,
                "annual_sales": business_profile.annual_sales,
            },
            "support_programs": [
                {
                    "id": str(program.id),
                    "title": program.title,
                    "region_name": program.region_name,
                    "target_industry": program.target_industry,
                    "support_type": program.support_type,
                    "support_amount": program.support_amount,
                    "application_end_date": (
                        program.application_end_date.isoformat()
                        if program.application_end_date
                        else None
                    ),
                }
                for program in support_programs
            ],
            "user_context": {
                "current_page": "/support",
                "intent": "recommend_support_programs",
            },
        }

        return json.dumps(payload, ensure_ascii=False)


def call_support_agent(content: str | None = None) -> str:
    """지원사업 추천 AI를 호출한다. 입력이 없으면 최신 DB 데이터를 사용한다."""
    return invoke_agent(
        agent_name=os.getenv(
            "AZURE_SUPPORT_AGENT_NAME",
            "support-program-ai",
        ),
        agent_version=os.getenv(
            "AZURE_SUPPORT_AGENT_VERSION",
            "3",
        ),
        content=content or create_llm_content(),
    )


if __name__ == "__main__":
    result = call_support_agent()
    print(f"Response output: {result}")
