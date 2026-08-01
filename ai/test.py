"""세 Azure AI 에이전트 API를 POST로 시험 호출하는 예시.

사용 예:
    python ai/test.py tax
    python ai/test.py support
    python ai/test.py portfolio --content "운영자금 5천만원 조달안을 만들어줘."
    python ai/test.py all
    python ai/test.py tax --direct
"""

import argparse
import json
import sys
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


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

API_PATHS = {
    "tax": "/ai/tax-saving",
    "support": "/ai/support-programs",
    "portfolio": "/ai/funding-portfolio",
}


def call_api(
    agent: str,
    content: str,
    base_url: str,
) -> None:
    url = f"{base_url.rstrip('/')}{API_PATHS[agent]}"
    body = json.dumps(
        {"content": content},
        ensure_ascii=False,
    ).encode("utf-8")
    request = Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urlopen(request, timeout=120) as response:
            result = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        detail = error.read().decode("utf-8")
        raise RuntimeError(
            f"API 오류 ({error.code}): {detail}"
        ) from error
    except URLError as error:
        raise RuntimeError(
            f"API 서버에 연결할 수 없습니다: {url}"
        ) from error

    print(f"\n[{agent}] POST {url}")
    print(json.dumps(result, ensure_ascii=False, indent=2))


def call_directly(agent: str, content: str) -> None:
    """HTTP API를 거치지 않고 Python 호출 함수를 직접 실행한다."""
    if agent == "tax":
        output = call_tax_agent(content)
    elif agent == "support":
        output = call_support_agent(content)
    else:
        output = call_portfolio_agent(content)

    print(f"\n[{agent}] direct")
    print(output)


def call_selected_agent(
    agent: str,
    content: str | None,
    *,
    base_url: str,
    direct: bool,
) -> None:
    prompt = content or DEFAULT_PROMPTS[agent]

    if direct:
        call_directly(agent, prompt)
    else:
        call_api(agent, prompt, base_url)


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
    parser.add_argument(
        "--base-url",
        default="http://localhost:8000",
        help="FastAPI 서버 주소 (기본값: http://localhost:8000)",
    )
    parser.add_argument(
        "--direct",
        action="store_true",
        help="HTTP API를 거치지 않고 Python 함수를 직접 호출합니다.",
    )
    args = parser.parse_args()

    agents = (
        ["tax", "support", "portfolio"]
        if args.agent == "all"
        else [args.agent]
    )

    for agent in agents:
        call_selected_agent(
            agent,
            args.content,
            base_url=args.base_url,
            direct=args.direct,
        )


if __name__ == "__main__":
    main()
