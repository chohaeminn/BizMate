# BizMate AI / Developer Context

## Project Overview

BizMate는 소상공인에게 맞춤형 정부 지원사업과 세무일정을 제공하는 서비스입니다.

---

# Tech Stack

## Backend

- Python 3.12
- FastAPI
- SQLAlchemy ORM
- SQLite (Development)
- Pydantic
- Uvicorn

## Frontend

- React
- TypeScript

---

# Project Structure

```text
BizMate/
├── back/
│   └── db/
│       ├── app/
│       │   ├── routers/
│       │   │   └── tax_schedules.py
│       │   ├── database.py
│       │   ├── main.py
│       │   ├── models.py
│       │   └── schemas.py
│       ├── seed_support_programs.py
│       ├── seed_tax_schedules.py
│       └── 국세청_세무일정_20260101.csv
├── front/
└── docs/
```

---

# Backend Run

```bash
cd back/db
uvicorn app.main:app --reload
```

Swagger

```
http://127.0.0.1:8000/docs
```

---

# Database

## Support Program Seed

```bash
python seed_support_programs.py
```

## Tax Schedule Seed

```bash
python seed_tax_schedules.py
```

세무일정 데이터는 **국세청\_세무일정\_20260101.csv**를 이용하여 DB에 저장합니다.

현재 Seed 데이터: **237건**

---

# Available APIs

## Business Profile

```
GET /business-profiles
GET /business-profiles/{id}
```

---

## Support Program

```
GET /support-programs
GET /support-programs/{id}
```

---

## Recommendation

```
GET /recommendations/{business_id}
```

추천 지원사업 상위 10개를 반환합니다.

---

## Tax Schedule

```
GET /tax-schedules
```

전체 세무일정 조회

```
GET /tax-schedules?year=2026
```

연도별 조회

```
GET /tax-schedules?year=2026&month=7
```

연도 + 월 조회

```
GET /tax-schedules/{schedule_id}
```

특정 세무일정 조회

---

# Tax Schedule Model

| Field         | Type     | Description |
| ------------- | -------- | ----------- |
| id            | UUID     | 세무일정 ID |
| title         | String   | 일정명      |
| note          | String   | 비고        |
| schedule_date | Date     | 일정 날짜   |
| created_at    | DateTime | 생성일      |

---

# Recommendation Logic

## 지역

- 동일 지역 +40
- 전국 +30

## 업종

- 동일 업종 +40
- 유사 업종 +35
- 전 업종 +30

## 지원금

- 1억 이상 +20
- 5천만 이상 +15
- 1천만 이상 +10
- 그 외 +5

점수 기준 내림차순으로 상위 10개 반환

---

# Test Business

Business ID

```
72590276-63b3-44f8-ad73-8505c7674994
```

---

# Development Rules

## 반드시 지켜야 하는 사항

- 기존 API URL 변경 금지
- 기존 Response 형식 변경 금지
- SQLAlchemy ORM 사용
- FastAPI 사용
- REST API 유지
- Pydantic ResponseModel 사용
- 기존 DB Model 삭제 금지
- 기존 Recommendation API 유지
- 새로운 기능은 기존 API 수정 대신 새로운 Endpoint 추가
- UUID 사용
- PEP8 스타일 준수

---

# Frontend Usage

Frontend는 아래 API만 사용합니다.

```
GET /business-profiles

GET /business-profiles/{id}

GET /support-programs

GET /support-programs/{id}

GET /recommendations/{business_id}

GET /tax-schedules

GET /tax-schedules?year={year}

GET /tax-schedules?year={year}&month={month}

GET /tax-schedules/{schedule_id}
```

---

# Notes

- application_end_date가 null이면 "상시 모집" 또는 "예산 소진 시"로 표시
- recommendation의 score는 화면에 표시 가능
- recommendation의 reason은 그대로 출력 가능
- source_url 클릭 시 원본 공고 페이지로 이동
- 세무일정은 schedule_date 기준으로 정렬
- month 사용 시 반드시 year도 함께 전달

---

# AI Instructions

새로운 기능을 추가할 때는 기존 API와 Response 형식을 최대한 유지합니다.

새로운 API가 필요한 경우 기존 API를 수정하지 말고 새로운 Endpoint를 추가합니다.

기존 프로젝트 구조를 유지하며 구현합니다.

SQLAlchemy Model 추가 시 Pydantic Schema도 함께 작성합니다.

새로운 Router 추가 시 app/main.py에 등록합니다.

Seed Script는 중복 데이터를 생성하지 않도록 작성합니다.

Swagger에서 API 테스트 후 GitHub에 반영합니다.
