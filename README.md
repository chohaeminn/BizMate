# BizMate

BizMate는 소상공인을 위한 맞춤형 자금 관리 서비스입니다. 사업자 조건을 바탕으로 지원사업, 절세 정보, 자금조달 포트폴리오를 추천합니다.

## Local Dev Script

프로젝트 루트에서 프론트엔드와 백엔드를 한 번에 실행합니다.

```powershell
.\start-dev.cmd
```

실행 후 접속 주소:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## 주요 기능

- 사업자 프로필 기반 지원사업 추천
- 지원사업 목록, 상세, 신청, 진행 현황, 상담 예약 플로우
- 세무 일정 조회와 절세 가이드
- 지원금, 정책자금, 보증/대출, 자기자금을 조합한 자금조달 포트폴리오
- Azure OpenAI 기반 추천 설명, 결과 요약, 실행 로드맵 생성

## 기술 스택

- Frontend: Next.js Pages Router, React, TypeScript, CSS
- Backend: FastAPI, SQLAlchemy, Pydantic, Uvicorn
- Database: PostgreSQL
- AI: Azure AI Projects, Azure Identity, Azure OpenAI

## 프로젝트 구조

```text
BizMate/
  ai/                 Azure AI Agent 호출 모듈
  back/db/            FastAPI 백엔드와 DB seed 스크립트
  docs/               요구사항 및 API 문서
  front/              Next.js 프론트엔드
  scripts/            로컬 개발 실행 스크립트
```

## 주요 화면

- `/persona`: 사업자 페르소나 선택 및 기본 정보 입력
- `/service`: 맞춤 서비스 대시보드
- `/support-programs`: 지원사업 목록
- `/support-programs/apply/status`: 신청 현황
- `/support-programs/apply/consult`: 상담 예약
- `/tax-saving`: 세금 관리 홈
- `/portfolio`: 자금조달 포트폴리오 시작
- `/portfolio/result`: AI 포트폴리오 결과

## 수동 실행

백엔드:

```powershell
cd back\db
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

프론트엔드:

```powershell
cd front
npm.cmd install
npm.cmd run dev
```

## 데이터 적재

```powershell
cd back\db
python seed_support_programs.py
python seed_tax_schedules.py
python seed_policy_loan_products.py
python seed_guarantee_products.py
python seed_portfolio_demo_data.py
```
