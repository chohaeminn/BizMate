# BizMate

소상공인 지원사업 추천, 신청 안내, 상담 예약 흐름을 구현한 Next.js 기반 프론트엔드 프로젝트입니다.

## Tech Stack

- Frontend: Next.js Pages Router, React, TypeScript, CSS
- AI: Azure OpenAI 연동 준비용 Next.js API route 포함

## Install

Node.js 의존성을 설치합니다.

```bash
cd front
npm install
```

## Environment

`.env.example`을 복사해 `.env.local`로 사용합니다.

```bash
BACKEND_API_URL=http://localhost:8000
AZURE_OPENAI_ENDPOINT=https://YOUR_RESOURCE_NAME.openai.azure.com
AZURE_OPENAI_API_KEY=YOUR_AZURE_OPENAI_KEY
AZURE_OPENAI_DEPLOYMENT=YOUR_DEPLOYMENT_NAME
AZURE_OPENAI_API_VERSION=2024-10-21
```

## Run

프론트엔드 개발 서버:

```bash
cd front
npm run dev
```

기본 접속 주소는 `http://localhost:3000`입니다. 특정 포트가 필요하면 아래처럼 실행합니다.

```bash
cd front
npm run dev -- -p 3002
```

## Build

```bash
cd front
npm run build
npm run start
```

## Main Routes

- `/`: 메인 랜딩
- `/service`: AI 추천 맞춤 사업 TOP3와 대시보드
- `/interest`: 관심사업/알림 설정 안내
- `/support-programs`: 맞춤 지원사업 전체보기
- `/support-programs/peer-analysis`: 비슷한 조건 사업자 분석
- `/support-programs/[slug]`: 지원사업 상세
- `/support-programs/apply`: 비대면 신청 안내
- `/support-programs/apply/complete`: 신청 완료
- `/support-programs/apply/status`: 신청 현황
- `/support-programs/apply/consult`: 추가 상담 예약
- `/support-programs/apply/consult/complete`: 상담 예약 완료

## Project Structure

- `src/pages`: Next.js 라우트
- `src/features`: 화면별 React 컴포넌트
- `src/styles`: 전역 CSS와 페이지별 CSS
- `src/data/supportPrograms.ts`: 프론트 임시 지원사업 데이터
- `src/pages/api/azure-openai`: Azure OpenAI 테스트용 API 라우트
- `docs`: 구현 방식과 협업 요청 문서
- `public/figma-assets`: Figma 기반 로컬 정적 에셋

## Docs

- 프론트 구현 방식: `docs/frontend-implementation.md`
- 백엔드 요청사항: `docs/backend-requirements.md`
- AI 파트 요청사항: `docs/ai-requirements.md`
