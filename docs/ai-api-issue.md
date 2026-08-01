# [공유] AI API 호출 방법 및 Swagger 테스트 가이드

## 목적

절세 분석, 지원사업 추천, 자금조달 포트폴리오 AI를 백엔드 HTTP API로
호출할 수 있도록 연동했습니다. 프론트엔드 연동 및 API 테스트 시 아래
내용을 참고해 주세요.

## API 목록

| 기능 | Method | Endpoint | `content` |
| --- | --- | --- | --- |
| 절세 분석 | `POST` | `/ai/tax-saving` | 필수 |
| 지원사업 추천 | `POST` | `/ai/support-programs` | 선택 |
| 자금조달 포트폴리오 | `POST` | `/ai/funding-portfolio` | 필수 |

기본 로컬 서버 주소는 `http://localhost:8000`입니다.

## 실행 전 준비

프로젝트 루트에서 백엔드 패키지를 설치하고 서버를 실행합니다.

```bash
cd back/db
pip install -r requirements.txt
uvicorn app.main:app --reload
```

AI 호출은 Azure의 `DefaultAzureCredential`을 사용하므로 로컬에서는
Azure 인증이 되어 있어야 합니다.

```bash
az login
```

지원사업 추천 API에서 요청 본문 없이 DB 기반 추천을 받을 경우
`DATABASE_URL` 설정과 사업자 프로필 데이터가 필요합니다.

## Swagger에서 호출하는 방법

1. 백엔드 실행 후 `http://localhost:8000/docs`에 접속합니다.
2. `AI` 항목에서 호출할 API를 펼칩니다.
3. `Try it out`을 누릅니다.
4. Request body에 아래 형식으로 입력합니다.
5. `Execute`를 눌러 응답을 확인합니다.

```json
{
  "content": "AI에 전달할 요청 내용"
}
```

OpenAPI 명세는 `http://localhost:8000/openapi.json`에서도 확인할 수
있습니다.

## 호출 예시

### 1. 절세 분석

```bash
curl -X POST "http://localhost:8000/ai/tax-saving" \
  -H "Content-Type: application/json" \
  -d '{"content":"연 매출 1억원인 개인사업자가 확인할 절세 항목을 알려줘."}'
```

### 2. 지원사업 추천

요청 내용을 직접 전달하는 경우:

```bash
curl -X POST "http://localhost:8000/ai/support-programs" \
  -H "Content-Type: application/json" \
  -d '{"content":"대구 소재 음식점이 신청할 수 있는 지원사업을 추천해줘."}'
```

`content`를 생략하면 DB의 최신 사업자 프로필과 지원사업 목록을 기반으로
입력을 자동 생성합니다.

```bash
curl -X POST "http://localhost:8000/ai/support-programs" \
  -H "Content-Type: application/json" \
  -d '{}'
```

### 3. 자금조달 포트폴리오

```bash
curl -X POST "http://localhost:8000/ai/funding-portfolio" \
  -H "Content-Type: application/json" \
  -d '{"content":"운영자금 5천만원을 조달하기 위한 포트폴리오를 만들어줘."}'
```

## 백엔드에서 API로 호출하는 예시

다른 Python 백엔드에서 BizMate API를 호출할 때는 다음과 같이 JSON
본문을 담아 `POST` 요청을 보냅니다. 아래 코드는 Python 표준 라이브러리만
사용하므로 별도 패키지 설치가 필요하지 않습니다.

```python
import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def call_bizmate_ai(endpoint: str, content: str | None) -> dict:
    url = f"http://localhost:8000{endpoint}"
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
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        detail = error.read().decode("utf-8")
        raise RuntimeError(
            f"BizMate AI API 오류 ({error.code}): {detail}"
        ) from error
    except URLError as error:
        raise RuntimeError(
            "BizMate AI API에 연결할 수 없습니다."
        ) from error
```

각 AI는 엔드포인트만 바꿔서 호출합니다.

```python
tax_result = call_bizmate_ai(
    "/ai/tax-saving",
    "연 매출 1억원인 개인사업자의 절세 항목을 알려줘.",
)

support_result = call_bizmate_ai(
    "/ai/support-programs",
    "대구 소재 음식점의 지원사업을 추천해줘.",
)

portfolio_result = call_bizmate_ai(
    "/ai/funding-portfolio",
    "운영자금 5천만원 조달 포트폴리오를 만들어줘.",
)

print(tax_result["agent"])
print(tax_result["output"])
```

지원사업 추천에서 DB 데이터를 자동으로 사용하려면 `content`를
`None`으로 전달합니다. JSON 요청은 `{"content": null}`이 되며,
`{}`를 보내는 것과 동일하게 처리됩니다.

```python
support_result = call_bizmate_ai(
    "/ai/support-programs",
    None,
)
```

BizMate FastAPI 애플리케이션 내부에서 호출하는 경우에는 자기 서버로
다시 HTTP 요청을 보내기보다 기존 호출 함수를 직접 사용하는 편이
간단합니다.

```python
from ai.portfolio_llm import call_portfolio_agent
from ai.support_llm import call_support_agent
from ai.tax_llm import call_tax_agent


tax_output = call_tax_agent("절세 항목을 알려줘.")
support_output = call_support_agent(None)  # DB 기반 입력 자동 생성
portfolio_output = call_portfolio_agent("자금조달 포트폴리오를 만들어줘.")
```

## 프론트엔드 호출 예시

```javascript
const response = await fetch("/ai/tax-saving", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    content: "연 매출 1억원인 개인사업자의 절세 항목을 알려줘.",
  }),
});

if (!response.ok) {
  throw new Error(`AI 호출 실패: ${response.status}`);
}

const data = await response.json();
console.log(data.agent);
console.log(data.output);
```

프론트엔드와 백엔드의 로컬 주소가 다르면 개발 서버의 API 프록시를
설정하거나 백엔드에서 해당 프론트엔드 origin을 허용해야 합니다.

## 정상 응답

세 API 모두 같은 형식으로 응답합니다.

```json
{
  "agent": "tax-saving-ai",
  "output": "AI 에이전트가 생성한 응답"
}
```

| 필드 | 설명 |
| --- | --- |
| `agent` | 실제 호출된 Azure AI 에이전트 이름 |
| `output` | AI 에이전트가 생성한 텍스트 |

## 오류 응답

| 상태 코드 | 발생 조건 |
| --- | --- |
| `422` | 절세 또는 자금조달 요청에 `content`가 없거나 요청 형식이 잘못됨 |
| `502` | Azure 인증, 네트워크, 에이전트 설정 또는 DB 조회 실패 |

`502` 발생 시 Azure 로그인 상태, 프로젝트 엔드포인트, 에이전트 이름과
버전을 확인합니다. 지원사업 DB 기반 호출이라면 DB 연결과 사업자 프로필
데이터도 함께 확인해 주세요.

## 테스트 명령

백엔드가 실행 중인 상태에서 프로젝트 루트 기준으로 호출합니다.

```bash
python ai/test.py tax
python ai/test.py support
python ai/test.py portfolio
python ai/test.py all
```

직접 요청 내용을 전달하거나 서버 주소를 바꿀 수도 있습니다.

```bash
python ai/test.py portfolio \
  --content "운영자금 5천만원 조달안을 만들어줘."

python ai/test.py tax \
  --base-url http://localhost:8080
```

## 참고

- 상세 사용 가이드: `docs/ai_api.md`
- API 라우터: `back/db/app/routers/ai.py`
- 요청·응답 스키마: `back/db/app/schemas.py`
- 호출 테스트 스크립트: `ai/test.py`
