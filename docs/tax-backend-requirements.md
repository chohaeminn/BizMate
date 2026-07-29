# Tax Backend Requirements

스마트 절세 화면 연동을 위해 백엔드 담당자에게 요청할 내용을 정리합니다.

이 문서는 현재 프로젝트의 `back/db` 구현 상태와 프론트 절세 화면 기준으로 작성했습니다.

## Scope Rule

- 현재 `back/db`에 이미 존재하는 DB/API만 연동 대상으로 둡니다.
- 새 테이블 생성이 필요한 기능은 이번 백엔드 요구사항에서 제외합니다.
- 기존 API URL과 기존 Response 형식은 변경하지 않습니다.
- 새 기능이 꼭 필요하면 기존 API 수정이 아니라 신규 endpoint 추가를 검토합니다.

## Existing Backend Scope

현재 세무 일정 관련으로 사용할 수 있는 API는 아래와 같습니다.

| API                                            | Purpose                   |
| ---------------------------------------------- | ------------------------- |
| `GET /tax-schedules`                           | 전체 세무 일정 조회       |
| `GET /tax-schedules?year={year}`               | 연도별 세무 일정 조회     |
| `GET /tax-schedules?year={year}&month={month}` | 특정 연/월 세무 일정 조회 |
| `GET /tax-schedules/{schedule_id}`             | 특정 세무 일정 상세 조회  |

## Page/API Map

| Page                    | UI Area                        | Backend API                                                   | Required Data                          |
| ----------------------- | ------------------------------ | ------------------------------------------------------------- | -------------------------------------- |
| `/tax-saving`           | 세무/금융 캘린더의 세무 마감일 | `GET /tax-schedules?year=2026&month=7`                        | `id`, `title`, `note`, `schedule_date` |
| `/tax-saving`           | D-Day 카드의 부가가치세 일정   | `GET /tax-schedules?year=2026&month=7`                        | 부가가치세 일정 중 화면 노출 대상 1건  |
| `/tax-saving`           | 7월 25일 일정 카드             | `GET /tax-schedules?year=2026&month=7`                        | 일정명, 일정 날짜                      |
| `/tax-saving`           | 다가오는 세무 일정             | `GET /tax-schedules?year=2026` 또는 월별 조회                 | 가까운 일정 목록                       |
| `/tax-saving/vat-guide` | 일정 개요 중 일정명/비고/날짜  | `GET /tax-schedules/{schedule_id}` 또는 월별 조회 결과 재사용 | `title`, `note`, `schedule_date`       |

## Frontend Fixed Data

아래 화면 요소는 현재 DB에 해당 테이블이 없으므로 백엔드 조회 대상에서 제외하고 프론트 고정값으로 유지합니다.

| Page                       | UI Area                                                       | Reason                                     |
| -------------------------- | ------------------------------------------------------------- | ------------------------------------------ |
| `/tax-saving`              | AI 예상 납부 세액, 절세 가능 금액                             | 매출/매입/공제 데이터 테이블 없음          |
| `/tax-saving`              | 카드매출 입금, 세무사 상담, 메모 일정                         | 금융/메모 일정 테이블 없음                 |
| `/tax-saving/guide`        | 실시간 예상 세액, 매출 세액, 매입 세액, 공제 후 납부 세액     | 세액 계산용 데이터/API 없음                |
| `/tax-saving/guide`        | 노란우산공제 추천 카드                                        | 절세 추천 항목 테이블 없음                 |
| `/tax-saving/guide/detail` | 노란우산공제 가입 여부, 추천 이유, 상세 내용, 절세 시뮬레이션 | 가입 여부/절세 상품/시뮬레이션 테이블 없음 |
| `/tax-saving/vat-guide`    | 신고 대상 상세 가이드, 체크리스트, 관련 서식 다운로드         | 가이드/체크리스트/자료 테이블 없음         |

## Requested Backend Work (요청사항)

1. `GET /tax-schedules?year=2026&month=7` 응답으로 2026년 7월 세무 일정을 안정적으로 조회할 수 있어야 합니다.
2. `schedule_date`는 ISO date 문자열로 내려주세요. 프론트에서 D-Day와 캘린더 위치를 계산합니다.
3. `title`과 `note`는 CSV 원문을 유지해주세요. 프론트에서 필요한 문구만 가공합니다.
4. `month` 조회 시 기존 구현처럼 `year`가 없으면 400을 반환해도 됩니다.
5. 세무 일정은 `schedule_date` 오름차순, `title` 오름차순 정렬을 유지해주세요.

## Data Issue To Confirm (데이터 이슈 -확인필요)

현재 프론트 목업은 제1기 부가가치세 확정신고 마감일을 `2026.07.25`로 표시합니다.

하지만 `back/db/국세청_세무일정_20260101.csv` 기준 데이터는 아래와 같습니다.

| CSV Title                           | CSV Note       | CSV Date     |
| ----------------------------------- | -------------- | ------------ |
| `2026.1기 부가가치세 확정신고 납부` | `2026.1~6월분` | `2026-07-27` |

따라서 백엔드/기획/프론트 간 기준 날짜를 확정해야 합니다.
