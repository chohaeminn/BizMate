import json
import sys
from pathlib import Path
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import DeductionCandidate


PROJECT_ROOT = Path(__file__).resolve().parents[4]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.tax_llm import call_tax_agent


router = APIRouter(prefix="/tax-engine", tags=["Tax Engine"])


class TaxInput(BaseModel):
    period_start: str
    period_end: str
    amount_basis: str
    sales_amount: int = Field(ge=0)
    purchase_amount: int = Field(ge=0)
    simulation_tax_rate: float = Field(ge=0)
    deduction_inputs: dict[str, dict[str, Any]] = Field(default_factory=dict)
    known_enrollments: dict[str, bool]


class TaxRecommendationRequest(BaseModel):
    business_profile: dict[str, Any]
    tax_schedule: dict[str, Any] | None
    tax_input: TaxInput
    frontend_context: dict[str, Any]


def parse_ai_json(output: str) -> dict[str, Any]:
    normalized = output.strip()
    if normalized.startswith("```json"):
        normalized = normalized[7:]
    elif normalized.startswith("```"):
        normalized = normalized[3:]
    if normalized.endswith("```"):
        normalized = normalized[:-3]
    return json.loads(normalized.strip())


def parse_required_inputs(value: str) -> Any:
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        return value


@router.post("/recommend")
def recommend_tax_saving(
    payload: TaxRecommendationRequest,
    db: Session = Depends(get_db),
):
    sales_tax = round(payload.tax_input.sales_amount * 0.1)
    purchase_tax = round(payload.tax_input.purchase_amount * 0.1)
    tax_summary = {
        "sales_tax": sales_tax,
        "purchase_tax": purchase_tax,
        "estimated_payable_tax": sales_tax - purchase_tax,
    }
    db_candidates = db.scalars(
        select(DeductionCandidate)
        .where(DeductionCandidate.enabled.is_(True))
        .order_by(DeductionCandidate.name)
    ).all()
    deduction_candidates = [
        {
            "id": candidate.id,
            "name": candidate.name,
            "category": candidate.category,
            "calculation_type": candidate.calculation_type,
            "target_industry": candidate.target_industry,
            "required_inputs": parse_required_inputs(candidate.required_inputs),
            "source": candidate.source,
            "source_section": candidate.source_section,
            **payload.tax_input.deduction_inputs.get(candidate.id, {}),
        }
        for candidate in db_candidates
    ]
    tax_input = payload.tax_input.model_dump(exclude={"deduction_inputs"})
    tax_input["deduction_candidates"] = deduction_candidates
    agent_input = {
        "business_profile": payload.business_profile,
        "tax_schedule": payload.tax_schedule,
        "tax_input": tax_input,
        "tax_summary": tax_summary,
        "frontend_context": payload.frontend_context,
    }

    try:
        ai_output = parse_ai_json(call_tax_agent(json.dumps(agent_input, ensure_ascii=False)))
    except Exception as error:
        raise HTTPException(status_code=502, detail="tax-saving-ai 호출에 실패했습니다.") from error

    merged_output = {
        **ai_output,
        "tax_estimate": ai_output.get("tax_estimate", tax_summary),
        "guide_messages": ai_output.get("guide_messages")
        or ([ai_output["tax_guide_message"]] if ai_output.get("tax_guide_message") else []),
    }
    return {
        "agent": "tax-saving-ai",
        "output": merged_output,
        "tax_summary": tax_summary,
        "deduction_candidates": deduction_candidates,
    }
