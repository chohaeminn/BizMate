import uuid

from sqlalchemy import text

from app.database import engine


# 통합 공고는 정책자금 세부 금리·상환기간을 별도 융자 공고에서 확인하도록 안내합니다.
# max_amount/title은 기존 DB 값을 유지하고, 아래 계산 조건은 화면 시연용 임시값입니다.
PRODUCTS = [
    ("policy-loan-001", 4.0, 60, 0, 4, "소상공인", "일반 경영안정 운영자금"),
    ("policy-loan-002", 2.0, 60, 24, 2, "재해 피해 소상공인", "재해 피해 복구 및 긴급 운영자금"),
    ("policy-loan-003", 3.0, 60, 12, 3, "일시적 경영애로 소상공인", "긴급 경영안정 운영자금"),
    ("policy-loan-004", 4.5, 60, 12, 5, "신용취약 소상공인", "경영안정 운영자금"),
    ("policy-loan-005", 4.5, 120, 0, 6, "고금리 대출 보유 소상공인", "기존 고금리 대출 대환"),
    ("policy-loan-006", 3.5, 60, 12, 5, "재창업·채무조정 소상공인", "재도전 운영자금"),
    ("policy-loan-007", 3.0, 60, 12, 4, "재기지원 연계 소상공인", "재도전 운영자금"),
    ("policy-loan-008", 3.8, 84, 12, 5, "성장 가능 재도전 소상공인", "재도전 성장자금"),
    ("policy-loan-009", 2.5, 84, 24, 4, "장애인기업 소상공인", "운영자금 및 시설자금"),
    ("policy-loan-010", 3.0, 60, 12, 4, "청년 고용 소상공인", "청년고용 연계 운영자금"),
    ("policy-loan-011", 3.5, 60, 12, 4, "소공인", "제조업 운영자금"),
    ("policy-loan-012", 3.3, 84, 12, 5, "성장 가능 소공인", "제조업 성장 운영자금"),
    ("policy-loan-013", 3.5, 60, 12, 4, "혁신형 소상공인", "혁신성장 운영자금"),
    ("policy-loan-014", 3.3, 84, 12, 5, "성장 가능 혁신형 소상공인", "혁신성장 운영자금"),
    ("policy-loan-015", 4.0, 84, 12, 6, "민간투자 유치 소상공인", "민간투자 연계 사업화자금"),
    ("policy-loan-016", 3.5, 60, 12, 4, "상생협력 소상공인", "상생성장 운영자금"),
    ("policy-loan-017", 3.3, 84, 12, 5, "성장 가능 상생협력 소상공인", "상생성장 운영자금"),
]

TERMS_NOTE = (
    "[데모 임시값] 제공된 '2026년 중소벤처기업부 소상공인 지원사업 통합 공고'는 "
    "정책자금 세부 조건을 별도 융자 공고에서 확인하도록 안내하므로, 금리·기간·거치·확보기간은 시연용 값입니다."
)


def seed() -> None:
    with engine.begin() as connection:
        connection.execute(text(
            "ALTER TABLE funding_candidates ADD COLUMN IF NOT EXISTS terms_note TEXT"
        ))

        for candidate_id, rate, term, grace, weeks, industry, purpose in PRODUCTS:
            candidate = connection.execute(
                text("""
                    SELECT title, max_amount, source
                    FROM funding_candidates
                    WHERE id = :id AND funding_type = 'policy_loan'
                """),
                {"id": candidate_id},
            ).mappings().one()

            connection.execute(
                text("""
                    UPDATE funding_candidates
                    SET annual_rate = :rate,
                        term_months = :term,
                        grace_months = :grace,
                        guarantee_fee_rate = 0,
                        expected_period_weeks = :weeks,
                        region_name = '전국',
                        target_industry = :industry,
                        funding_purpose = :purpose,
                        terms_note = :terms_note
                    WHERE id = :id
                """),
                {
                    "id": candidate_id, "rate": rate, "term": term, "grace": grace,
                    "weeks": weeks, "industry": industry, "purpose": purpose,
                    "terms_note": TERMS_NOTE,
                },
            )

            connection.execute(
                text("""
                    INSERT INTO loan_products (
                        id, name, organization_name, loan_type, max_amount,
                        annual_rate, term_months, grace_months, guarantee_fee_rate,
                        expected_period_weeks, description, source_url, is_active, created_at
                    ) VALUES (
                        :loan_id, :name, '소상공인시장진흥공단', 'policy_loan', :max_amount,
                        :rate, :term, :grace, 0, :weeks, :description,
                        'https://ols.semas.or.kr', true, CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        max_amount = EXCLUDED.max_amount,
                        annual_rate = EXCLUDED.annual_rate,
                        term_months = EXCLUDED.term_months,
                        grace_months = EXCLUDED.grace_months,
                        guarantee_fee_rate = 0,
                        expected_period_weeks = EXCLUDED.expected_period_weeks,
                        description = EXCLUDED.description,
                        source_url = EXCLUDED.source_url,
                        is_active = true
                """),
                {
                    "loan_id": uuid.uuid5(uuid.NAMESPACE_URL, f"bizmate:{candidate_id}"),
                    "name": candidate["title"], "max_amount": candidate["max_amount"],
                    "rate": rate, "term": term, "grace": grace, "weeks": weeks,
                    "description": f"{TERMS_NOTE} 대상: {industry}. 용도: {purpose}.",
                },
            )

    print(f"정책자금 {len(PRODUCTS)}개의 조건과 계산 후보를 반영했습니다.")


if __name__ == "__main__":
    seed()
