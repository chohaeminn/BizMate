# BizMate

BizMate는 소상공인을 위한 맞춤형 자금 관리 서비스입니다. 사업자 조건을 바탕으로 지원사업, 세무 정보, 자금조달 포트폴리오를 추천합니다.

## Local Dev Script

프로젝트 루트에서 프론트엔드와 백엔드를 한 번에 실행합니다.

Windows PowerShell 또는 명령 프롬프트:

```powershell
.\start-dev.cmd
```

macOS/Linux (`zsh`, `bash`):

```bash
chmod +x start-dev.sh
./start-dev.sh
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## Azure Authentication

Azure OpenAI 인증은 `DefaultAzureCredential`을 사용합니다. 앱 코드에서는 Azure CLI 로그인 명령을 호출하지 않고, Azure 배포 환경에서는 Azure OpenAI API Key 없이 Managed Identity로 인증합니다.

배포 순서:

1. 배포 전: `AZURE_AI_PROJECT_ENDPOINT`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_DEPLOYMENT` 같은 리소스 정보만 설정합니다.
2. 배포 후: App Service, Container Apps, VM 등 배포된 앱 리소스에서 System assigned Managed Identity를 켭니다.
3. Azure OpenAI 리소스의 Access Control (IAM)에서 해당 Managed Identity에 `Cognitive Services OpenAI User` 역할을 부여합니다.

권한 반영에는 보통 1~2분이 걸릴 수 있습니다.

## Features

- 사업자 프로필 기반 지원사업 추천
- 지원사업 목록, 상세, 신청, 진행 현황, 상담 예약
- 세무 일정 조회와 절세 가이드
- 지원금, 정책자금, 보증/대출, 자기자금을 조합한 자금조달 포트폴리오
- Azure AI Agent와 Azure OpenAI 기반 추천 설명 및 결과 요약

## Stack

- Frontend: Next.js Pages Router, React, TypeScript, CSS
- Backend: FastAPI, SQLAlchemy, Pydantic, Uvicorn
- Database: PostgreSQL
- AI: Azure AI Projects, Azure Identity, Azure OpenAI

## Structure

```text
BizMate/
  ai/                 Azure AI Agent 호출 모듈
  back/db/            FastAPI 백엔드와 DB seed 스크립트
  docs/               요구사항 및 API 문서
  front/              Next.js 프론트엔드
  scripts/            로컬 개발 실행 스크립트
```

## Manual Run

Backend:

```powershell
cd back\db
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Frontend:

```powershell
cd front
npm.cmd install
npm.cmd run dev
```

## Seed Data

```powershell
cd back\db
python seed_support_programs.py
python seed_tax_schedules.py
python seed_policy_loan_products.py
python seed_guarantee_products.py
python seed_portfolio_demo_data.py
```
