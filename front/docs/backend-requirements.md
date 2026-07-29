# Backend Requirements

`docs/DB_plan.pdf`에 정의된 DB 데이터와 현재 백엔드 구현 상태를 기준으로 프론트 연동에 필요한 백엔드 요청사항만 정리합니다.

DB 계획에 없는 화면용 데이터는 백엔드에서 조회하지 않고 프론트에서 고정값으로 처리합니다.

## Backend API Scope

| API | Page | UI Area | Purpose |
| --- | --- | --- | --- |
| `GET /business-profiles/{id}` | `/service`, `/support-programs` | 추천 기준 사업자 정보 | 사업자 지역, 업종, 매출 기준 조회 |
| `GET /business-profiles` | 개발/관리용 | 사업자 목록 | 테스트용 사업자 프로필 선택 |
| `GET /recommendations/{business_id}` | `/service`, `/support-programs` | 추천 지원사업 목록 | 사업자 조건 기반 추천 점수와 추천 사유 조회 |
| `GET /support-programs` | `/support-programs` | 맞춤 사업 전체보기 | 지원사업 DB 목록 조회 |
| `GET /support-programs/{program_id}` | `/support-programs/[slug]` | 지원사업 상세 | 지원사업 DB 상세 조회 |
| `POST /funding-requests` | 추후 자금 요청 입력 화면 | 필요 자금 입력 | 사업자별 자금 요청 생성 |
| `GET /funding-requests/{id}` | 추후 자금 요청 확인 화면 | 요청 상세 | 필요 금액, 목적, 자체 조달금 조회 |
| `POST /portfolios/generate/{funding_request_id}` | 추후 포트폴리오 화면 | 포트폴리오 생성 | 자금 요청 기준 포트폴리오 생성 |
| `GET /portfolios/{id}` | 추후 포트폴리오 상세 | 포트폴리오 결과 | 조달 구성과 부족 금액 조회 |
| `GET /portfolios/funding-request/{funding_request_id}` | 추후 포트폴리오 목록 | 요청별 결과 목록 | 특정 자금 요청의 포트폴리오 목록 조회 |

## Frontend Hardcoded Data

아래 값들은 `DB_plan.pdf`에 없거나 현재 DB 모델에 없는 경우 백엔드 요청 대상에서 제외하고 프론트에서 고정값으로 관리합니다.

| Data | Used Page | Frontend Handling |
| --- | --- | --- |
| `slug` | `/support-programs/[slug]` | `src/data/supportPrograms.ts`에서 title/id 기준으로 매핑 |
| 카드용 줄바꿈 제목과 설명 | `/service`, `/support-programs` | 프론트 고정 |
| 태그 색상과 배지 목록 | 카드/상세 화면 | `support_type`, `region_name` 기반 또는 프론트 고정 |
| 지원금/마감 표시 라벨 | 카드/상세 화면 | 숫자/날짜 원본을 프론트에서 포맷 |
| 예상금리 | 카드/상세 화면 | DB 계획에 없으면 프론트 고정 |
| 캐릭터 이미지 경로 | 모든 Figma 화면 | `public/figma-assets` 로컬 에셋 |
| 관심사업 등록 토스트 | 상세 화면 | 프론트 상태만 사용 |
| 신청 진행 단계/제출 서류 상태 | `/support-programs/apply/*` | DB 계획에 없으면 프론트 고정 |
| 상담 가능 날짜/시간/배정 상담사 | `/support-programs/apply/consult*` | DB 계획에 없으면 프론트 고정 |

## Requested Backend Adjustments

1. `/service` TOP3와 `/support-programs` 전체보기는 같은 지원사업 DB 결과를 사용하게 해주세요.
2. `support_amount`는 숫자 원본으로 내려주세요. 화면 표시 문구는 프론트에서 포맷합니다.
3. `application_end_date`는 마감일 계산에 사용하므로 가능한 한 채워주세요.
4. `GET /recommendations/{business_id}` 응답의 `program`에는 현재 지원사업 DB 필드만 포함하면 됩니다.
5. 에러 응답은 FastAPI 기본 `detail`을 그대로 사용해도 됩니다.

## Not Requested From Backend

아래 API는 DB 계획에 없는 경우 만들지 않아도 됩니다.

- 관심사업 저장 API
- 알림 설정 CRUD
- 신청 진행 상태 API
- 상담 예약 가능 시간 조회 API
- 상담 예약 생성/조회 API
- 이미지/캐릭터 에셋 API
- 화면 카드 라벨/태그 전용 API
