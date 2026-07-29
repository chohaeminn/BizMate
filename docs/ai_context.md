# BizMate AI / Developer Context

## Project Overview

BizMate는 소상공인에게 맞춤형 정부 지원사업을 추천하는 서비스입니다.

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

```
BizMate/
├── back/
│   └── db/
│       └── app/
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

지원사업 데이터는 Seed Script를 통해 추가합니다.

최초 실행 시

```bash
python seed_support_programs.py
```

---

# Available APIs

## Business Profile

GET /business-profiles

GET /business-profiles/{id}

---

## Support Program

GET /support-programs

GET /support-programs/{id}

---

## Recommendation

GET /recommendations/{business_id}

추천 지원사업 상위 10개를 반환합니다.

---

# Recommendation Logic

지역 점수

- 동일 지역 +40
- 전국 +30

업종 점수

- 동일 업종 +40
- 전 업종 +30
- 유사 업종 +35

지원금 점수

- 1억 이상 +20
- 5천만 이상 +15
- 1천만 이상 +10
- 그 외 +5

점수 기준으로 내림차순 정렬하여 상위 10개 반환

---

# Test Business

Business ID

72590276-63b3-44f8-ad73-8505c7674994

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

---

# Frontend Usage

Frontend는 아래 API만 사용합니다.

GET /business-profiles

GET /business-profiles/{id}

GET /support-programs

GET /support-programs/{id}

GET /recommendations/{business_id}

---

# Notes

- application_end_date가 null이면 "상시 모집" 또는 "예산 소진 시"로 표시
- recommendation의 score는 화면에 표시 가능
- recommendation의 reason은 그대로 출력 가능
- source_url 클릭 시 원본 공고 페이지로 이동

---

# AI Instructions

새로운 기능을 추가할 때는 기존 API와 Response 형식을 최대한 유지합니다.

새로운 API가 필요한 경우 기존 API를 수정하지 말고 새로운 Endpoint를 추가합니다.

기존 프로젝트 구조를 유지하며 구현합니다.

코드는 가독성과 유지보수성을 고려하여 작성합니다.

PEP8 스타일을 준수합니다.
