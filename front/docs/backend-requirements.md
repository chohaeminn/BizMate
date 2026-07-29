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

## Requested Backend Adjustments

1. `/service` TOP3와 `/support-programs` 전체보기는 같은 지원사업 DB 결과를 사용하게 해주세요.
2. `support_amount`는 숫자 원본으로 내려주세요. 화면 표시 문구는 프론트에서 포맷합니다.
3. `application_end_date`는 마감일 계산에 사용하므로 가능한 한 채워주세요.
4. `GET /recommendations/{business_id}` 응답의 `program`에는 현재 지원사업 DB 필드만 포함하면 됩니다.
5. 에러 응답은 FastAPI 기본 `detail`을 그대로 사용해도 됩니다.
