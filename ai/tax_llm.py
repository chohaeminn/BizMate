import os

from ai.azure_client import invoke_agent


def call_tax_agent(content: str) -> str:
    """절세 AI 에이전트를 호출한다."""
    return invoke_agent(
        agent_name=os.getenv(
            "AZURE_TAX_AGENT_NAME",
            "tax-saving-ai",
        ),
        agent_version=os.getenv(
            "AZURE_TAX_AGENT_VERSION",
            "3",
        ),
        content=content,
    )


if __name__ == "__main__":
    result = call_tax_agent("절세 AI가 제공할 수 있는 기능을 알려줘.")
    print(f"Response output: {result}")
