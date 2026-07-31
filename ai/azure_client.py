import os
from functools import lru_cache


DEFAULT_PROJECT_ENDPOINT = (
    "https://jihyeonhwang-0999-resource.services.ai.azure.com"
    "/api/projects/jihyeonhwang-0999"
)


@lru_cache
def get_openai_client():
    """Azure AI 프로젝트의 OpenAI 클라이언트를 한 번만 생성한다."""
    from azure.ai.projects import AIProjectClient
    from azure.identity import DefaultAzureCredential

    project_client = AIProjectClient(
        endpoint=os.getenv(
            "AZURE_AI_PROJECT_ENDPOINT",
            DEFAULT_PROJECT_ENDPOINT,
        ),
        credential=DefaultAzureCredential(),
    )
    return project_client.get_openai_client()


def invoke_agent(
    *,
    agent_name: str,
    agent_version: str,
    content: str,
) -> str:
    """지정한 Azure AI 에이전트를 호출하고 텍스트 응답을 반환한다."""
    response = get_openai_client().responses.create(
        input=[{"role": "user", "content": content}],
        extra_body={
            "agent_reference": {
                "name": agent_name,
                "version": agent_version,
                "type": "agent_reference",
            }
        },
    )
    return response.output_text
