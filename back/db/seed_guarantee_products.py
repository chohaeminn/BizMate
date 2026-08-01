import uuid

from sqlalchemy import text

from app.database import engine


PRODUCTS = [
    ("policy-001", "2026 대구 상생성장 금융지원 패키지", 4.2, 60, 12, 0.9, 3, "대구", "소상공인", "운영자금 및 시설자금"),
    ("policy-002", "2026년 서구 소상공인 경영안정자금 지원 특례보증", 3.8, 60, 12, 0.8, 3, "대구 서구", "소상공인", "경영안정 운영자금"),
    ("policy-003", "2026년 소상공인 비즈+카드보증", 4.5, 36, 0, 0.7, 2, "대구", "소상공인", "사업용 카드 결제 및 운영자금"),
    ("policy-004", "전환보증(기보증회수보증)", 4.0, 60, 12, 0.9, 4, "대구", "기존 보증 이용 소상공인", "기존 보증 전환 및 운영자금"),
    ("policy-005", "2026년 북구 소상공인 경영안정자금 지원 특례보증(Ⅱ)", 3.8, 60, 12, 0.8, 3, "대구 북구", "소상공인", "경영안정 운영자금"),
]


ALTER_COLUMNS = """
ALTER TABLE funding_candidates ADD COLUMN IF NOT EXISTS annual_rate NUMERIC(8, 6);
ALTER TABLE funding_candidates ADD COLUMN IF NOT EXISTS term_months INTEGER;
ALTER TABLE funding_candidates ADD COLUMN IF NOT EXISTS grace_months INTEGER;
ALTER TABLE funding_candidates ADD COLUMN IF NOT EXISTS guarantee_fee_rate NUMERIC(8, 6);
ALTER TABLE funding_candidates ADD COLUMN IF NOT EXISTS expected_period_weeks INTEGER;
ALTER TABLE funding_candidates ADD COLUMN IF NOT EXISTS region_name TEXT;
ALTER TABLE funding_candidates ADD COLUMN IF NOT EXISTS target_industry TEXT;
ALTER TABLE funding_candidates ADD COLUMN IF NOT EXISTS funding_purpose TEXT;
"""


def seed() -> None:
    with engine.begin() as connection:
        for statement in ALTER_COLUMNS.strip().split(";"):
            if statement.strip():
                connection.execute(text(statement))

        for product in PRODUCTS:
            candidate_id, title, rate, term, grace, fee, weeks, region, industry, purpose = product
            connection.execute(
                text("""
                    UPDATE funding_candidates
                    SET annual_rate = :rate,
                        term_months = :term,
                        grace_months = :grace,
                        guarantee_fee_rate = :fee,
                        expected_period_weeks = :weeks,
                        region_name = :region,
                        target_industry = :industry,
                        funding_purpose = :purpose
                    WHERE id = :candidate_id
                """),
                {
                    "candidate_id": candidate_id, "rate": rate, "term": term,
                    "grace": grace, "fee": fee, "weeks": weeks, "region": region,
                    "industry": industry, "purpose": purpose,
                },
            )
            max_amount = connection.execute(
                text("SELECT max_amount FROM funding_candidates WHERE id = :id"),
                {"id": candidate_id},
            ).scalar_one()
            connection.execute(
                text("""
                    INSERT INTO loan_products (
                        id, name, organization_name, loan_type, max_amount,
                        annual_rate, term_months, grace_months, guarantee_fee_rate,
                        expected_period_weeks, description, is_active, created_at
                    ) VALUES (
                        :id, :name, '대구신용보증재단', 'guarantee_loan', :max_amount,
                        :rate, :term, :grace, :fee, :weeks,
                        :description, true, CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        max_amount = EXCLUDED.max_amount,
                        annual_rate = EXCLUDED.annual_rate,
                        term_months = EXCLUDED.term_months,
                        grace_months = EXCLUDED.grace_months,
                        guarantee_fee_rate = EXCLUDED.guarantee_fee_rate,
                        expected_period_weeks = EXCLUDED.expected_period_weeks,
                        description = EXCLUDED.description,
                        is_active = true
                """),
                {
                    "id": uuid.uuid5(uuid.NAMESPACE_URL, f"bizmate:{candidate_id}"),
                    "name": title,
                    "max_amount": max_amount,
                    "rate": rate,
                    "term": term,
                    "grace": grace,
                    "fee": fee,
                    "weeks": weeks,
                    "description": f"[데모 임시값] 대상 지역: {region}, 대상: {industry}, 용도: {purpose}. 실제 조건은 공고 확인 필요.",
                },
            )

    print(f"보증상품 {len(PRODUCTS)}개의 임시 계산 조건을 반영했습니다.")


if __name__ == "__main__":
    seed()
