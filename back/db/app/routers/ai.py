import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException, status

from app.schemas import AIInvokeRequest, AIInvokeResponse


PROJECT_ROOT = Path(__file__).resolve().parents[4]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.portfolio_llm import call_portfolio_agent
from ai.support_llm import call_support_agent
from ai.tax_llm import call_tax_agent


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


def create_response(
    *,
    agent: str,
    call,
    content: str | None,
) -> AIInvokeResponse:
    try:
        output = call(content)
    except Exception as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"{agent} 호출에 실패했습니다.",
        ) from error

    return AIInvokeResponse(
        agent=agent,
        output=output,
    )


@router.post(
    "/tax-saving",
    response_model=AIInvokeResponse,
)
def invoke_tax_saving_agent(
    request: AIInvokeRequest,
):
    if request.content is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="content를 입력해 주세요.",
        )

    return create_response(
        agent="tax-saving-ai",
        call=call_tax_agent,
        content=request.content,
    )


@router.post(
    "/support-programs",
    response_model=AIInvokeResponse,
)
def invoke_support_program_agent(
    request: AIInvokeRequest,
):
    return create_response(
        agent="support-program-ai",
        call=call_support_agent,
        content=request.content,
    )


@router.post(
    "/funding-portfolio",
    response_model=AIInvokeResponse,
)
def invoke_funding_portfolio_agent(
    request: AIInvokeRequest,
):
    if request.content is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="content를 입력해 주세요.",
        )

    return create_response(
        agent="generate-portfolio-ai",
        call=call_portfolio_agent,
        content=request.content,
    )
