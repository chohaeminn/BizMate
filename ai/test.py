"""세 Azure AI 에이전트를 각각 시험 호출하는 예시.

사용 예:
    python ai/test.py tax
    python ai/test.py support
    python ai/test.py portfolio --content "운영자금 5천만원 조달안을 만들어줘."
    python ai/test.py all
"""

import argparse
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ai.portfolio_llm import call_portfolio_agent
from ai.support_llm import call_support_agent
from ai.tax_llm import call_tax_agent


DEFAULT_PROMPTS = {
    "tax": "절세 AI가 제공할 수 있는 기능을 알려줘.",
    "support": "지원사업 추천 AI가 제공할 수 있는 기능을 알려줘.",
    "portfolio": "자금조달 포트폴리오 AI가 제공할 수 있는 기능을 알려줘.",
}


def call_selected_agent(agent: str, content: str | None) -> None:
    prompt = content or DEFAULT_PROMPTS[agent]

    if agent == "tax":
        output = call_tax_agent(prompt)
    elif agent == "support":
        output = call_support_agent(prompt)
    else:
        output = call_portfolio_agent(prompt)

    print(f"\n[{agent}]")
    print(output)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="BizMate Azure AI 에이전트 호출 예시",
    )
    parser.add_argument(
        "agent",
        choices=["tax", "support", "portfolio", "all"],
        help="호출할 AI 에이전트",
    )
    parser.add_argument(
        "--content",
        help="AI에 전달할 내용. 생략하면 기본 예시 문장을 사용합니다.",
    )
    args = parser.parse_args()

    agents = (
        ["tax", "support", "portfolio"]
        if args.agent == "all"
        else [args.agent]
    )

    for agent in agents:
        call_selected_agent(agent, args.content)


if __name__ == "__main__":
    main()
