# BizMate AI 호출 API 가이드

## 1. 개요

BizMate 백엔드는 다음 세 Azure AI 에이전트를 HTTP API로 제공합니다.

| 기능 | Method | Endpoint | Azure AI 에이전트 |
| --- | --- | --- | --- |
| 절세 분석 | `POST` | `/ai/tax-saving` | `tax-saving-ai` |
| 지원사업 추천 | `POST` | `/ai/support-programs` | `support-program-ai` |
| 자금조달 포트폴리오 | `POST` | `/ai/funding-portfolio` | `generate-portfolio-ai` |

API 라우트는 `back/db/app/routers/ai.py`에 정의되어 있으며,
`back/db/app/main.py`에서 FastAPI 앱에 등록됩니다.

```python
from app.routers.ai import router as ai_router

app.include_router(ai_router)
```

라우터의 공통 접두사 `prefix="/ai"`와 각 라우트의 경로가 합쳐져
최종 API 주소가 만들어집니다.

## 2. 실행 준비

### 패키지 설치

프로젝트 루트에서 다음 명령을 실행합니다.

```bash
cd back/db
pip install -r requirements.txt
```

Azure AI 호출에는 `azure-ai-projects`와 `azure-identity`가 사용됩니다.

### 환경변수

기본 에이전트 정보는 코드에 설정되어 있어 필요한 항목만 환경변수로
변경할 수 있습니다.

| 환경변수 | 기본값 |
| --- | --- |
| `AZURE_AI_PROJECT_ENDPOINT` | 현재 BizMate Azure AI 프로젝트 주소 |
| `AZURE_TAX_AGENT_NAME` | `tax-saving-ai` |
| `AZURE_TAX_AGENT_VERSION` | `3` |
| `AZURE_SUPPORT_AGENT_NAME` | `support-program-ai` |
| `AZURE_SUPPORT_AGENT_VERSION` | `2` |
| `AZURE_PORTFOLIO_AGENT_NAME` | `generate-portfolio-ai` |
| `AZURE_PORTFOLIO_AGENT_VERSION` | `2` |

지원사업 API에서 DB 데이터를 자동으로 불러오려면 백엔드의
`DATABASE_URL`도 설정되어 있어야 합니다.

Azure 인증은 `DefaultAzureCredential`을 사용합니다. 로컬 개발에서는
Azure CLI 로그인 등 현재 실행 환경에서 사용할 수 있는 Azure 인증이
준비되어 있어야 합니다.

```bash
az login
```

## 3. 백엔드 실행

```bash
cd back/db
uvicorn app.main:app --reload
```

기본 서버 주소는 `http://localhost:8000`입니다. 실행 후 Swagger UI에서
요청을 직접 시험할 수도 있습니다.

- Swagger UI: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## 4. 공통 요청 및 응답

### 요청

```json
{
  "content": "AI에 전달할 프롬프트 또는 JSON 문자열"
}
```

### 응답

```json
{
  "agent": "호출된 에이전트 이름",
  "output": "Azure AI 에이전트의 텍스트 응답"
}
```

## 5. API별 호출 예시

### 절세 AI

`content`는 필수입니다.

```bash
curl -X POST "http://localhost:8000/ai/tax-saving" \
  -H "Content-Type: application/json" \
  -d '{"content":"연 매출 1억원인 개인사업자가 확인할 절세 항목을 알려줘."}'
```

### 지원사업 추천 AI

프롬프트를 직접 전달하는 경우:

```bash
curl -X POST "http://localhost:8000/ai/support-programs" \
  -H "Content-Type: application/json" \
  -d '{"content":"대구 소재 음식점이 신청할 수 있는 지원사업 기준을 알려줘."}'
```

요청 본문에 `content`를 넣지 않으면 DB에서 가장 최근 사업자 프로필과
지원사업 목록을 조회하여 에이전트 입력을 자동으로 생성합니다.

```bash
curl -X POST "http://localhost:8000/ai/support-programs" \
  -H "Content-Type: application/json" \
  -d '{}'
```

DB에 등록된 사업자 프로필이 없으면 호출이 실패합니다.

### 자금조달 포트폴리오 AI

`content`는 필수입니다.

```bash
curl -X POST "http://localhost:8000/ai/funding-portfolio" \
  -H "Content-Type: application/json" \
  -d '{"content":"운영자금 5천만원을 조달하기 위한 포트폴리오를 만들어줘."}'
```

## 6. `ai/test.py`로 POST 호출

실행 중인 FastAPI 서버에 `POST` 요청을 보내 각 엔드포인트와 에이전트의
연결 상태를 확인할 수 있습니다. 백엔드를 먼저 실행한 후 아래 명령을
프로젝트 루트에서 실행합니다.

```bash
python ai/test.py tax
python ai/test.py support
python ai/test.py portfolio
```

직접 프롬프트를 전달하려면 `--content` 옵션을 사용합니다.

```bash
python ai/test.py portfolio \
  --content "운영자금 5천만원 조달안을 만들어줘."
```

세 에이전트를 순서대로 호출하려면 다음 명령을 사용합니다.

```bash
python ai/test.py all
```

다른 주소에서 백엔드를 실행한 경우 `--base-url`을 지정합니다.

```bash
python ai/test.py tax --base-url http://localhost:8080
```

HTTP API를 거치지 않고 기존 Python 호출 함수를 직접 시험하려면
`--direct` 옵션을 사용합니다.

```bash
python ai/test.py tax --direct
```

## 7. 주요 코드 위치

| 파일 | 역할 |
| --- | --- |
| `back/db/app/routers/ai.py` | 세 HTTP API 엔드포인트 및 오류 응답 |
| `back/db/app/main.py` | AI 라우터를 FastAPI 앱에 등록 |
| `back/db/app/schemas.py` | AI API 요청·응답 모델 |
| `ai/azure_client.py` | 공통 Azure AI 클라이언트와 에이전트 호출 |
| `ai/tax_llm.py` | 절세 AI 호출 함수 |
| `ai/support_llm.py` | 지원사업 AI 호출 함수와 DB 입력 생성 |
| `ai/portfolio_llm.py` | 자금조달 포트폴리오 AI 호출 함수 |
| `ai/test.py` | 에이전트별 직접 호출 예시 |

## 8. 오류 응답

| 상태 코드 | 발생 조건 |
| --- | --- |
| `422` | 절세 또는 자금조달 API 요청에 `content`가 없음 |
| `502` | Azure 인증, 네트워크, 에이전트 설정 또는 DB 조회 등의 호출 실패 |

`502`가 발생하면 Azure 로그인 상태, 프로젝트 주소, 에이전트 이름과
버전, 그리고 지원사업 API의 경우 DB 연결 상태를 확인합니다.
