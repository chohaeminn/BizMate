import json
import sys
from pathlib import Path

from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from sqlalchemy import select


BACKEND_DIR = Path(__file__).resolve().parents[1] / "back" / "db"
sys.path.insert(0, str(BACKEND_DIR))

from app.database import SessionLocal
from app.models import BusinessProfile, SupportProgram


def create_llm_content() -> str:
    """DB 데이터를 지원사업 추천 에이전트 입력용 JSON으로 변환한다."""
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
                "current_page": "/service",
                "intent": "recommend_support_programs",
            },
        }

        return json.dumps(payload, ensure_ascii=False)


def main() -> None:
    endpoint = (
        "https://jihyeonhwang-0999-resource.services.ai.azure.com"
        "/api/projects/jihyeonhwang-0999"
    )

    project_client = AIProjectClient(
        endpoint=endpoint,
        credential=DefaultAzureCredential(),
    )
    openai_client = project_client.get_openai_client()

    response = openai_client.responses.create(
        input=[
            {
                "role": "user",
                "content": create_llm_content(),
            }
        ],
        extra_body={
            "agent_reference": {
                "name": "support-program-ai",
                "version": "2",
                "type": "agent_reference",
            }
        },
    )

    print(f"Response output: {response.output_text}")


if __name__ == "__main__":
    main()
