from datetime import date
from decimal import Decimal

from sqlalchemy import select

from app.database import SessionLocal
from app.models import (
    BusinessProfile,
    ExternalDebt,
    FundingRequest,
    FundingRequestUsePlanItem,
)


BUSINESS_NAME = "준우문구"


def seed() -> None:
    with SessionLocal() as db:
        profile = db.scalar(
            select(BusinessProfile)
            .where(BusinessProfile.business_name == BUSINESS_NAME)
            .order_by(BusinessProfile.created_at.desc())
            .limit(1)
        )
        if profile is None:
            raise RuntimeError(f"{BUSINESS_NAME} 사업자 프로필을 찾을 수 없습니다.")

        # 연매출 1억 원 규모의 소상공인에게 무리가 없는 예시 현금흐름입니다.
        profile.available_cash_amount = 12_000_000
        profile.monthly_fixed_expense = 5_500_000

        debt = db.scalar(
            select(ExternalDebt).where(
                ExternalDebt.profile_id == profile.id,
                ExternalDebt.lender_name == "타행 사업자대출",
            )
        )
        if debt is None:
            debt = ExternalDebt(
                profile_id=profile.id,
                debt_type="사업자대출",
                lender_name="타행 사업자대출",
            )
            db.add(debt)

        debt.balance_amount = 15_000_000
        debt.monthly_payment = 460_000
        debt.annual_rate = Decimal("0.067")
        debt.maturity_date = date(2028, 5, 20)

        funding_request = db.scalar(
            select(FundingRequest)
            .where(FundingRequest.profile_id == profile.id)
            .order_by(FundingRequest.created_at.desc())
            .limit(1)
        )
        if funding_request is not None:
            plans = [
                ("시설 개선", 20_000_000),
                ("장비 구매", 7_000_000),
                ("운영비", 3_000_000),
            ]
            for priority, (purpose, amount) in enumerate(plans, start=1):
                item = db.scalar(
                    select(FundingRequestUsePlanItem).where(
                        FundingRequestUsePlanItem.funding_request_id == funding_request.id,
                        FundingRequestUsePlanItem.purpose == purpose,
                    )
                )
                if item is None:
                    item = FundingRequestUsePlanItem(
                        funding_request_id=funding_request.id,
                        purpose=purpose,
                    )
                    db.add(item)
                item.amount = amount
                item.priority_order = priority

        db.commit()
        print(f"{BUSINESS_NAME} 포트폴리오 예시 데이터를 반영했습니다.")


if __name__ == "__main__":
    seed()
