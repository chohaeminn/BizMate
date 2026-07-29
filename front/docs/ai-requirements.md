# AI Requirements

현재 프론트 화면과 DB 기반 백엔드 응답을 기준으로 AI 파트에 요청할 내용을 정리합니다.

## Feature/AI Map

| AI Output | Page | UI Area | Purpose |
| --- | --- | --- | --- |
| 추천 요약 | `/service` | 상단 추천 현황/안내 문구 | 사용자의 사업 조건에 맞는 추천 이유를 짧게 설명 |
| TOP3 추천 사유 | `/service` | AI 추천 맞춤 사업 TOP3 카드 | 카드별 추천 점수와 핵심 근거 표시 |
| 전체 목록 정렬 근거 | `/support-programs` | 맞춤 사업 전체보기 | 추천 순위와 유사 사업자 기준 설명 |
| 상세 분석 | `/support-programs/[slug]` | AI 분석 카드 | 해당 지원사업이 사용자에게 맞는 이유와 준비사항 안내 |
| 유사 사업자 분석 | `/support-programs/peer-analysis` | 비슷한 조건 사업자 화면 | 비슷한 조건의 사업자 신청 경향 요약? 가능하다면 

## Input Contract

AI는 백엔드가 정리한 구조화 데이터를 입력받는 것을 전제로 합니다.

```json
{
  "business_profile": {
    "id": "uuid",
    "region_name": "대구",
    "industry_name": "음식점업",
    "annual_sales": 120000000
  },
  "support_programs": [
    {
      "id": "uuid",
      "title": "대구 소상공인 특례보증 지원",
      "region_name": "대구",
      "target_industry": "소상공인",
      "support_type": "보증",
      "support_amount": 50000000,
      "application_end_date": "2026-06-30"
    }
  ],
  "user_context": {
    "current_page": "/service",
    "intent": "recommend_support_programs"
  }
}
```

## Recommendation Output

```json
{
  "summary": "대구 소재 소상공인 조건과 마감 임박 여부를 기준으로 보증형 사업의 적합도가 높습니다.",
  "recommendations": [
    {
      "program_id": "uuid",
      "rank": 1,
      "score": 98,
      "reason": "사업장 지역, 지원 대상, 자금 목적이 모두 일치합니다.",
      "action_guide": "신청 전 사업자등록증과 납세증명서를 먼저 준비하세요."
    }
  ]
}
```

## Detail Analysis Output

```json
{
  "program_id": "uuid",
  "analysis_title": "회원님과 조건이 매우 유사합니다.",
  "fit_reasons": [
    "대구 소재 사업장 조건과 일치합니다.",
    "소상공인 대상 보증 지원사업입니다."
  ],
  "preparation_checklist": [
    "사업자등록증",
    "납세증명서"
  ],
  "risk_notes": [
    "신청기간과 예산 소진 여부를 최종 확인해야 합니다."
  ]
}
```

## Prompt/Response Rules

- 응답은 JSON으로 반환해주세요.
- 사용자가 볼 문구는 한국어 존댓말로 작성해주세요.
- 금액, 날짜, 금리 등 정량 데이터는 AI가 임의 생성하지 말고 입력값을 기반으로만 사용해주세요.
- 지원사업 신청 가능 여부는 확정 표현 대신 `조건 확인 필요`, `적합도가 높음`처럼 보수적으로 표현해주세요.
- 추천 점수는 백엔드 rule-based 점수가 있으면 우선 사용하고, AI는 설명을 보강하는 역할로 제한하는 것을 권장합니다.

## Open Questions

- AI 추천 점수 산정까지 AI가 맡을지, 백엔드 점수 산정 후 AI가 설명만 생성할지 결정이 필요합니다.
- Azure OpenAI 호출 주체를 Next.js API 라우트로 둘지, FastAPI 백엔드로 일원화할지 결정이 필요합니다.
- 상담사용 요약을 저장할지, 예약 완료 시점에 매번 생성할지 결정이 필요합니다.
