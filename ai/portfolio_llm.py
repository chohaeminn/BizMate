import os

from ai.azure_client import invoke_agent


def call_portfolio_agent(content: str) -> str:
    """자금조달 포트폴리오 AI 에이전트를 호출한다."""
    return invoke_agent(
        agent_name=os.getenv(
            "AZURE_PORTFOLIO_AGENT_NAME",
            "generate-portfolio-ai",
        ),
        agent_version=os.getenv(
            "AZURE_PORTFOLIO_AGENT_VERSION",
            "2",
        ),
        content=content,
    )


if __name__ == "__main__":
    result = call_portfolio_agent(
        "자금조달 포트폴리오 AI가 제공할 수 있는 기능을 알려줘."
    )
    print(f"Response output: {result}")
