# Tax AI Requirements

스마트 절세 화면에서 AI 파트에 요청할 내용을 정리합니다.

이 문서는 현재 프로젝트의 `back/db` 구현 상태와 프론트 절세 화면 기준으로 작성했습니다.

## Scope Rule

- AI는 현재 백엔드 또는 프론트에서 제공 가능한 데이터만 입력으로 사용합니다.
- `/tax-saving/guide`의 AI 절세 추천과 실시간 예상 세액 업데이트는 AI가 계산해서 프론트에 전달합니다.
- AI 계산에 필요한 매출/매입/공제/사업자 상태 데이터는 API 호출 payload로 전달받는 것을 전제로 합니다.
- 입력 payload에 없는 실제 매출/매입/공제액, 노란우산공제 가입 여부, 실제 신고 완료 여부는 AI가 추정하지 않습니다.
- 날짜, 신고 대상 여부 같은 법적/행정적 판정 데이터는 AI가 임의 생성하지 않습니다.
- 새 테이블이 필요한 데이터는 AI 요구사항에서도 제외합니다.
- AI 계산 결과는 화면 표시용 예상값이며, 실제 신고/납부 세액 확정값이 아님을 함께 내려줍니다.

## Available Input

AI 호출 시 아래 범위의 데이터를 입력으로 전달합니다.

```json
{
  "business_profile": {
    "id": "uuid",
    "business_name": "테스트 사업장",
    "owner_name": "홍길동",
    "region_name": "대구",
    "industry_name": "음식점업",
    "annual_sales": 120000000
  },
  "tax_schedule": {
    "id": "uuid",
    "title": "2026.1기 부가가치세 확정신고 납부",
    "note": "2026.1~6월분",
    "schedule_date": "2026-07-27"
  },
  "tax_input": {
    "period_start": "2026-01-01",
    "period_end": "2026-06-30",
    "sales_amount": 152000000,
    "purchase_amount": 84200000,
    "deduction_candidates": [
      {
        "name": "노란우산공제",
        "monthly_payment": 300000,
        "annual_deduction_limit": 5000000
      }
    ],
    "known_enrollments": {
      "yellow_umbrella": false
    }
  },
  "frontend_context": {
    "current_page": "/tax-saving",
    "intent": "calculate_tax_saving"
  }
}
```

`tax_input`은 현재 DB 테이블 추가 없이 프론트 또는 백엔드가 AI 호출 시 구성해서 전달하는 값입니다. 값이 없는 경우 AI는 해당 항목을 계산하지 않고 `missing_inputs`에 누락 항목을 반환합니다. |

## Recommended Output Contract

AI 응답은 JSON으로 고정합니다.

```json
{
  "summary": "노란우산공제 가입 시 예상 절세 효과가 있어 우선 검토를 추천드립니다.",
  "tax_estimate": {
    "sales_tax": 15200000,
    "purchase_tax": 8420000,
    "estimated_payable_tax": 1450000,
    "previous_period_delta": -45000,
    "sales_growth_rate": 8.3,
    "purchase_deduction_rate": 55.5
  },
  "recommendations": [
    {
      "id": "yellow_umbrella",
      "title": "노란우산공제 가입",
      "category": "소득공제",
      "priority": 1,
      "expected_saving_amount": 540000,
      "difficulty": "쉬움",
      "reason": "현재 입력값 기준으로 공제 적용 시 과세표준을 낮추는 효과가 예상됩니다.",
      "detail_items": [
        "월 30만원 납입 시 연간 360만원 소득공제 가능",
        "납입 금액은 전액 필요경비 처리 가능"
      ],
      "simulation": {
        "current_tax_base": 46000000,
        "after_tax_base": 42400000,
        "current_calculated_tax": 6900000,
        "after_calculated_tax": 6360000,
        "expected_saving_amount": 540000
      }
    }
  ],
  "guide_messages": ["세금계산서 발행 내역과 매입 자료를 먼저 확인해 주세요."],
  "missing_inputs": [],
  "disclaimer": "AI 계산 결과는 입력값 기반 예상치이며, 실제 신고·납부 세액은 세무 자료 확인 후 달라질 수 있습니다."
}
```

## Page/AI Map

| Page                       | UI Area                           | AI Output                                                       | Input                                   |
| -------------------------- | --------------------------------- | --------------------------------------------------------------- | --------------------------------------- |
| `/tax-saving`              | D-Day 카드 하단 안내 문구         | 세무 일정 준비를 유도하는 짧은 안내 문구                        | 사업자 기본정보, 세무 일정              |
| `/tax-saving`              | AI 절세 가이드 보기 CTA 주변 문구 | 신고 마감 전 준비 필요성을 설명                                 | 세무 일정                               |
| `/tax-saving/guide`        | AI 절세 추천 카드                 | 추천 절세 항목, 예상 절세액, 추천 이유                          | 사업자 기본정보, 세무 일정, `tax_input` |
| `/tax-saving/guide`        | 실시간 예상 세액 업데이트         | 예상 납부 세액, 매출 세액, 매입 세액, 공제 후 납부 세액, 지표값 | `tax_input`                             |
| `/tax-saving/guide/detail` | 추천 이유/시뮬레이션              | 추천 이유, 절세 효과, 가입 전/후 시뮬레이션                     | 사업자 기본정보, `tax_input`, 추천 항목 |
| `/tax-saving/vat-guide`    | 신고 대상 확인 안내               | 세무 일정 기반의 일반적 안내 문구                               | 세무 일정                               |

## Prompt Rules

- 한국어 존댓말로 작성합니다.
- 사용자가 바로 이해할 수 있게 1~2문장 중심으로 짧게 작성합니다.
- 확정 판정 표현을 피합니다.
  - 사용 가능: `확인이 필요합니다`, `준비하는 것이 좋습니다`, `점검해 주세요`
  - 사용 금지: `반드시 대상입니다`, `정확히 절세됩니다`, `가입되어 있지 않습니다`
- AI는 입력 payload 기반으로만 예상 세액과 예상 절세액을 계산합니다.
- 입력값 없이 금액을 생성하지 않습니다.
- AI가 날짜를 새로 추정하지 않습니다.
- 입력에 없는 사업자 상태를 만들어내지 않습니다.
- 계산에 필요한 값이 부족하면 `missing_inputs`를 반환합니다.

## Page Notes

### `/tax-saving`

현재 화면에는 `AI 예상 납부 세액`, `절세 가능 금액`이 표시되지만, 현재 DB에는 이를 계산할 매출/매입/공제 데이터가 없습니다.

따라서 AI 계산에 필요한 매출/매입/공제 입력값은 별도 DB 조회가 아니라 AI 호출 payload로 전달합니다.

AI는 전달받은 입력값을 기준으로 예상 납부 세액과 절세 가능 금액을 계산하고, 화면용 안내 문구를 함께 반환합니다.

### `/tax-saving/guide`

`클릭해 업데이트` 버튼은 현재 프론트 예시 데이터를 번갈아 보여주는 상태입니다.

AI 연동 시에는 버튼 클릭 시 AI 계산 API를 호출하고, 응답의 `tax_estimate` 값을 화면에 반영합니다.

반영 대상은 아래와 같습니다.

- 예상 납부 세액
- 전월 대비 증감액
- 매출 세액
- 매입 세액
- 공제 후 납부 세액
- 매출 증가율
- 매입 공제율
- 예상 납부 세액 카드

### `/tax-saving/guide/detail`

노란우산공제 가입 여부와 예상 절세 효과는 현재 DB에 없습니다.

가입 여부와 공제 입력값은 AI 호출 payload로 전달받습니다.

AI는 전달받은 값을 기준으로 추천 이유와 가입 전/후 시뮬레이션을 생성합니다. 입력에 가입 여부가 없으면 실제 가입 여부를 추정하지 않고 `missing_inputs`에 포함합니다.

### `/tax-saving/vat-guide`

부가가치세 일정명, 비고, 날짜는 `tax_schedules`에서 받을 수 있습니다.

상세 가이드 단계, 체크리스트, 관련 서식은 현재 DB에 없으므로 프론트 고정값 기준으로 안내 문구만 보강합니다.
