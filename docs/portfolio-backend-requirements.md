# 자금 포트폴리오 Backend 요청사항

자금 포트폴리오는 **AI 의사결정 에이전트가 판단하고, 백엔드는 DB 조회와 계산 도구를 제공하는 구조**로 구현합니다.

백엔드는 금액, 금리, 상환액, 금융비용, 확보 기간 같은 정량 계산을 담당합니다. AI가 숫자를 임의 생성하지 않도록 계산 가능한 값을 API/tool 형태로 제공해야 합니다.

## 현재 DB 활용

`/back/db/app/models.py` 기준으로 아래 기존 테이블을 우선 활용합니다.

| 테이블 | 활용 |
| --- | --- |
| `business_profiles` | 지역, 업종, 연매출 기반 사업자 조건 |
| `support_programs` | 지원사업/RAG 후보의 DB 기준 데이터 |
| `funding_requests` | 필요 금액, 목적, 자기자금, 월 상환 선호 |
| `portfolio_results` | 생성된 포트폴리오 결과 저장 |
| `portfolio_items` | 포트폴리오별 구성 항목 저장 |

## 부족한 데이터

현재 DB만으로 3개 포트폴리오의 월 상환액, 금융비용, 스트레스 테스트를 정확히 계산하기에는 아래 정보가 부족합니다.

| 부족 정보 | 필요 조치 |
| --- | --- |
| 현재 가용잔액, 월 반복지출 | `business_profiles` 확장 또는 현금흐름 요약 테이블 |
| 기존 대출잔액, 기존 월 상환액, 타행 대출 | `external_debts` 테이블 |
| 지원금/정책자금 이용 이력 | `support_histories` 테이블 |
| 세부 자금 사용 계획 | `funding_request_use_plan_items` 테이블 |
| 대출 금리, 기간, 거치기간, 보증료율, 확보 기간 | `loan_products` 테이블 또는 정책 파라미터 |

## 권장 추가 테이블

| 테이블 | 주요 필드 |
| --- | --- |
| `external_debts` | `profile_id`, `debt_type`, `balance_amount`, `monthly_payment`, `annual_rate`, `maturity_date` |
| `funding_request_use_plan_items` | `funding_request_id`, `purpose`, `amount`, `priority_order` |
| `loan_products` | `name`, `loan_type`, `max_amount`, `annual_rate`, `term_months`, `grace_months`, `guarantee_fee_rate`, `expected_period_weeks` |
| `support_histories` | `profile_id`, `program_name`, `organization_name`, `received_amount`, `received_date` |

## Backend 역할

1. DB에서 사업자, 지원사업, 채무, 대출상품 데이터를 조회합니다.
2. RAG가 찾은 지원사업/정책 후보를 DB 데이터와 매칭합니다.
3. AI가 호출할 수 있는 계산 API를 제공합니다.
4. AI가 선택한 최종 포트폴리오를 저장합니다.
5. 프론트에서 필요한 응답 shape으로 결과를 반환합니다.

## 필수 계산 API

### 1. 후보 조회

```text
GET /portfolio-engine/candidates?funding_request_id={id}
```

반환:

- 사업자 프로필
- 자금 요청
- DB 기반 지원사업 후보
- RAG 검색 대상 키워드
- 대출상품 후보
- 기존 채무/현금흐름 요약

### 2. 단일 포트폴리오 계산

```text
POST /portfolio-engine/calculate
```

요청 예시:

```json
{
  "funding_request_id": "uuid",
  "portfolio_type": "cost",
  "items": [
    {
      "name": "시설개선 지원금",
      "funding_type": "grant",
      "amount": 10000000
    },
    {
      "name": "소상공인 정책자금",
      "funding_type": "policy_loan",
      "amount": 20000000,
      "annual_rate": 0.037,
      "term_months": 60,
      "grace_months": 12
    }
  ]
}
```

응답 예시:

```json
{
  "portfolio_type": "cost",
  "total_funding_amount": 50000000,
  "monthly_payment": 820000,
  "finance_cost": 1980000,
  "expected_period_weeks": 6,
  "expected_period_label": "6주",
  "shortage_amount": 0,
  "stress_test": [
    {
      "scenario": "sales_down_20",
      "label": "매출 20% 감소",
      "status": "danger"
    }
  ]
}
```

### 3. 최종 결과 저장

```text
POST /portfolio-engine/results
```

AI가 최종 선택한 3개 유형과 추천 유형을 저장합니다.

권장 저장 방식:

- `portfolio_results`에 `portfolio_type`, `monthly_payment`, `finance_cost`, `expected_period_label`, `is_ai_recommended` 추가
- `portfolio_items`에 각 구성 항목 저장

## 지원사업 필터 규칙

기존 `portfolios.py`의 지역/업종/신청기간 필터를 유지합니다.

1. `support_programs.support_amount > 0`
2. 사업자 지역과 지원사업 지역 매칭
3. `전국`, `전체`, `지역무관`, `제한없음`은 전국 사업으로 처리
4. 업종 매칭
5. 신청 시작/종료일 기준 신청 가능 여부 계산
6. `title + organization_name` 기준 중복 제거

## 프론트 응답에 필요한 결과

최종 API 응답은 아래 화면을 바로 그릴 수 있어야 합니다.

| 화면 | 필요 데이터 |
| --- | --- |
| `/portfolio/result` | 3개 유형, 도넛 구성 항목, 월 상환액, 금융비용, 확보 기간, AI 추천 여부 |
| `/portfolio/detail/[type]` | 유형별 추천 이유, 핵심 지표, 스트레스 테스트 |
| `/portfolio/roadmap` | 실행 단계, 준비 서류, 상담 예약 연결 |
