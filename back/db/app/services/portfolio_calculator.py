from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP, getcontext
from typing import Iterable, Literal


getcontext().prec = 28

ZERO = Decimal("0")
HUNDRED = Decimal("100")
TWELVE = Decimal("12")
MONEY_QUANT = Decimal("1")


FundingType = Literal[
    "grant",
    "policy_loan",
    "commercial_loan",
    "guarantee_loan",
    "self_funding",
]


@dataclass(frozen=True, slots=True)
class PortfolioItemInput:
    """포트폴리오 항목 계산 입력값."""

    item_name: str
    funding_type: FundingType
    amount: int

    # DB에서는 퍼센트 숫자 그대로 저장
    # 예: 연 3.5% -> 3.5
    annual_rate: Decimal = ZERO

    term_months: int = 0
    grace_months: int = 0

    # 예: 연 0.8% -> 0.8
    guarantee_fee_rate: Decimal = ZERO

    expected_period_weeks: int = 0


@dataclass(frozen=True, slots=True)
class PortfolioItemCalculation:
    """포트폴리오 항목별 계산 결과."""

    item_name: str
    funding_type: FundingType
    amount: int

    monthly_payment: int

    interest_cost: int
    guarantee_fee: int
    finance_cost: int

    expected_period_weeks: int


@dataclass(frozen=True, slots=True)
class PortfolioCalculation:
    """포트폴리오 전체 계산 결과."""

    total_required_amount: int
    total_funding_amount: int
    shortage_amount: int

    monthly_payment: int
    finance_cost: int

    expected_period_weeks: int

    items: tuple[PortfolioItemCalculation, ...]


class PortfolioCalculationError(ValueError):
    """포트폴리오 계산 입력값 오류."""


# =====================================================
# 공통 유틸
# =====================================================

def _to_decimal(
    value: Decimal | int | float | str,
) -> Decimal:
    if isinstance(value, Decimal):
        return value

    return Decimal(str(value))


def _round_money(
    value: Decimal,
) -> int:
    """원 단위 반올림."""

    return int(
        value.quantize(
            MONEY_QUANT,
            rounding=ROUND_HALF_UP,
        )
    )


def _validate_non_negative(
    name: str,
    value: Decimal | int,
) -> None:

    if value < 0:
        raise PortfolioCalculationError(
            f"{name}은(는) 0 이상이어야 합니다."
        )


def _percent_to_ratio(
    percent: Decimal | int | float | str,
) -> Decimal:
    """
    퍼센트 값을 계산용 비율로 변환.

    DB:
        3.5 = 3.5%
        0.8 = 0.8%

    계산:
        3.5 -> 0.035
        0.8 -> 0.008
    """

    value = _to_decimal(percent)

    _validate_non_negative(
        "percent",
        value,
    )

    return value / HUNDRED


# =====================================================
# 월 상환액
# =====================================================

def calculate_monthly_payment(
    principal: int,
    annual_rate: Decimal | float | str,
    term_months: int,
) -> int:
    """
    원리금균등상환 월 상환액.

    annual_rate 입력 규칙:

        3.5 -> 연 3.5%
        4.2 -> 연 4.2%

    예:
        principal = 25,000,000
        annual_rate = 3.5
        term_months = 60
    """

    rate_percent = _to_decimal(
        annual_rate
    )

    _validate_non_negative(
        "principal",
        principal,
    )

    _validate_non_negative(
        "annual_rate",
        rate_percent,
    )

    if principal == 0:
        return 0

    if term_months <= 0:
        raise PortfolioCalculationError(
            "대출 원금이 0보다 크면 "
            "term_months는 1 이상이어야 합니다."
        )

    principal_decimal = Decimal(
        principal
    )

    # 무이자
    if rate_percent == ZERO:

        payment = (
            principal_decimal
            / Decimal(term_months)
        )

        return _round_money(
            payment
        )

    # 3.5% -> 0.035
    annual_rate_ratio = (
        rate_percent
        / HUNDRED
    )

    # 월 이율
    monthly_rate = (
        annual_rate_ratio
        / TWELVE
    )

    factor = (
        Decimal("1")
        + monthly_rate
    ) ** term_months

    payment = (
        principal_decimal
        * monthly_rate
        * factor
        / (
            factor
            - Decimal("1")
        )
    )

    return _round_money(
        payment
    )


# =====================================================
# 이자 비용
# =====================================================

def calculate_interest_cost(
    principal: int,
    annual_rate: Decimal | float | str,
    term_months: int,
    grace_months: int = 0,
) -> int:
    """
    총 이자 비용.

    가정:

    1. 거치기간
       -> 원금 상환 없음
       -> 이자만 납부

    2. 거치기간 종료 후
       -> 원리금균등상환

    annual_rate:
        3.5 = 3.5%
    """

    rate_percent = _to_decimal(
        annual_rate
    )

    _validate_non_negative(
        "principal",
        principal,
    )

    _validate_non_negative(
        "annual_rate",
        rate_percent,
    )

    _validate_non_negative(
        "grace_months",
        grace_months,
    )

    if principal == 0:
        return 0

    if term_months <= 0:
        raise PortfolioCalculationError(
            "대출 원금이 0보다 크면 "
            "term_months는 1 이상이어야 합니다."
        )

    if rate_percent == ZERO:
        return 0

    monthly_payment = (
        calculate_monthly_payment(
            principal=principal,
            annual_rate=rate_percent,
            term_months=term_months,
        )
    )

    # 상환기간 동안 발생하는 이자
    repayment_interest = (
        Decimal(
            monthly_payment
        )
        * Decimal(
            term_months
        )
        - Decimal(
            principal
        )
    )

    # 퍼센트 -> 비율
    annual_rate_ratio = (
        rate_percent
        / HUNDRED
    )

    monthly_rate = (
        annual_rate_ratio
        / TWELVE
    )

    # 거치기간 동안 이자만 납부
    grace_interest = (
        Decimal(
            principal
        )
        * monthly_rate
        * Decimal(
            grace_months
        )
    )

    total_interest = (
        repayment_interest
        + grace_interest
    )

    return max(
        0,
        _round_money(
            total_interest
        ),
    )


# =====================================================
# 보증료
# =====================================================

def calculate_guarantee_fee(
    principal: int,
    guarantee_fee_rate: Decimal | float | str,
    term_months: int,
    grace_months: int = 0,
) -> int:
    """
    보증료 계산.

    guarantee_fee_rate:

        0.8 -> 연 0.8%
        1.0 -> 연 1.0%

    현재 계산식:

        원금
        × 연 보증료율
        × 전체 이용기간(년)

    주의:
    실제 신용보증기관의 보증료는
    잔액/감면/보증비율/선납 방식 등에 따라
    달라질 수 있으므로 추후 상품별 계산 규칙으로
    확장할 수 있습니다.
    """

    fee_percent = _to_decimal(
        guarantee_fee_rate
    )

    _validate_non_negative(
        "principal",
        principal,
    )

    _validate_non_negative(
        "guarantee_fee_rate",
        fee_percent,
    )

    _validate_non_negative(
        "term_months",
        term_months,
    )

    _validate_non_negative(
        "grace_months",
        grace_months,
    )

    if principal == 0:
        return 0

    if fee_percent == ZERO:
        return 0

    total_months = (
        term_months
        + grace_months
    )

    if total_months <= 0:
        raise PortfolioCalculationError(
            "보증료 계산 대상이면 "
            "전체 이용기간은 1개월 이상이어야 합니다."
        )

    # 0.8 -> 0.008
    fee_ratio = (
        fee_percent
        / HUNDRED
    )

    years = (
        Decimal(
            total_months
        )
        / TWELVE
    )

    fee = (
        Decimal(
            principal
        )
        * fee_ratio
        * years
    )

    return _round_money(
        fee
    )


# =====================================================
# 금융비용
# =====================================================

def calculate_finance_cost(
    principal: int,
    annual_rate: Decimal | float | str,
    term_months: int,
    grace_months: int = 0,
    guarantee_fee_rate: Decimal | float | str = ZERO,
) -> int:
    """
    총 금융비용.

    금융비용 =
        총 이자
        + 보증료
    """

    interest_cost = (
        calculate_interest_cost(
            principal=principal,
            annual_rate=annual_rate,
            term_months=term_months,
            grace_months=grace_months,
        )
    )

    guarantee_fee = (
        calculate_guarantee_fee(
            principal=principal,
            guarantee_fee_rate=guarantee_fee_rate,
            term_months=term_months,
            grace_months=grace_months,
        )
    )

    return (
        interest_cost
        + guarantee_fee
    )


# =====================================================
# 개별 포트폴리오 항목
# =====================================================

def calculate_item(
    item: PortfolioItemInput,
) -> PortfolioItemCalculation:
    """
    포트폴리오 항목 1개 계산.
    """

    _validate_non_negative(
        "amount",
        item.amount,
    )

    _validate_non_negative(
        "expected_period_weeks",
        item.expected_period_weeks,
    )

    # ---------------------------------
    # 지원금 / 자기자금
    # ---------------------------------

    if item.funding_type in {
        "grant",
        "self_funding",
    }:

        return PortfolioItemCalculation(
            item_name=item.item_name,
            funding_type=item.funding_type,
            amount=item.amount,

            monthly_payment=0,

            interest_cost=0,
            guarantee_fee=0,
            finance_cost=0,

            expected_period_weeks=(
                item.expected_period_weeks
            ),
        )

    # ---------------------------------
    # 대출
    # ---------------------------------

    if item.funding_type not in {
        "policy_loan",
        "commercial_loan",
        "guarantee_loan",
    }:

        raise PortfolioCalculationError(
            "지원하지 않는 "
            f"funding_type입니다: "
            f"{item.funding_type}"
        )

    monthly_payment = (
        calculate_monthly_payment(
            principal=item.amount,
            annual_rate=item.annual_rate,
            term_months=item.term_months,
        )
    )

    interest_cost = (
        calculate_interest_cost(
            principal=item.amount,
            annual_rate=item.annual_rate,
            term_months=item.term_months,
            grace_months=item.grace_months,
        )
    )

    guarantee_fee = (
        calculate_guarantee_fee(
            principal=item.amount,
            guarantee_fee_rate=(
                item.guarantee_fee_rate
            ),
            term_months=item.term_months,
            grace_months=item.grace_months,
        )
    )

    finance_cost = (
        interest_cost
        + guarantee_fee
    )

    return PortfolioItemCalculation(
        item_name=item.item_name,
        funding_type=item.funding_type,
        amount=item.amount,

        monthly_payment=monthly_payment,

        interest_cost=interest_cost,
        guarantee_fee=guarantee_fee,
        finance_cost=finance_cost,

        expected_period_weeks=(
            item.expected_period_weeks
        ),
    )


# =====================================================
# 전체 포트폴리오
# =====================================================

def calculate_portfolio(
    total_required_amount: int,
    items: Iterable[
        PortfolioItemInput
    ],
) -> PortfolioCalculation:
    """
    포트폴리오 전체 계산.

    계산값:

    - 필요금액
    - 확보금액
    - 부족금액
    - 월 상환액
    - 금융비용
    - 확보 예상기간
    """

    _validate_non_negative(
        "total_required_amount",
        total_required_amount,
    )

    calculated_items = tuple(
        calculate_item(
            item
        )
        for item in items
    )

    total_funding_amount = sum(
        item.amount
        for item in calculated_items
    )

    shortage_amount = max(
        0,
        (
            total_required_amount
            - total_funding_amount
        ),
    )

    monthly_payment = sum(
        item.monthly_payment
        for item in calculated_items
    )

    finance_cost = sum(
        item.finance_cost
        for item in calculated_items
    )

    expected_period_weeks = max(
        (
            item.expected_period_weeks
            for item
            in calculated_items
        ),
        default=0,
    )

    return PortfolioCalculation(
        total_required_amount=(
            total_required_amount
        ),

        total_funding_amount=(
            total_funding_amount
        ),

        shortage_amount=(
            shortage_amount
        ),

        monthly_payment=(
            monthly_payment
        ),

        finance_cost=(
            finance_cost
        ),

        expected_period_weeks=(
            expected_period_weeks
        ),

        items=(
            calculated_items
        ),
    )


# =====================================================
# 스트레스 테스트
# =====================================================

def run_stress_test(
    *,
    principal: int,
    annual_rate: Decimal | float | str,
    term_months: int,
    rate_increase_points: Iterable[
        Decimal | float | str
    ] = (
        Decimal("1.0"),
        Decimal("2.0"),
        Decimal("3.0"),
    ),
) -> list[
    dict[str, int | str]
]:
    """
    금리 상승 스트레스 테스트.

    DB의 금리 단위와 동일하게
    퍼센트(%p)를 사용합니다.

    예:

        기본 금리 = 3.5%

        +1%p -> 4.5%
        +2%p -> 5.5%
        +3%p -> 6.5%
    """

    base_rate = _to_decimal(
        annual_rate
    )

    _validate_non_negative(
        "annual_rate",
        base_rate,
    )

    if principal < 0:
        raise PortfolioCalculationError(
            "principal은 0 이상이어야 합니다."
        )

    if principal > 0 and term_months <= 0:
        raise PortfolioCalculationError(
            "대출 원금이 0보다 크면 "
            "term_months는 1 이상이어야 합니다."
        )

    results: list[
        dict[str, int | str]
    ] = []

    base_payment = (
        calculate_monthly_payment(
            principal=principal,
            annual_rate=base_rate,
            term_months=term_months,
        )
    )

    for increase in (
        rate_increase_points
    ):

        increase_decimal = (
            _to_decimal(
                increase
            )
        )

        _validate_non_negative(
            "rate_increase_point",
            increase_decimal,
        )

        stressed_rate = (
            base_rate
            + increase_decimal
        )

        stressed_payment = (
            calculate_monthly_payment(
                principal=principal,
                annual_rate=stressed_rate,
                term_months=term_months,
            )
        )

        results.append(
            {
                "scenario": (
                    f"rate_plus_"
                    f"{increase_decimal}%p"
                ),

                "annual_rate": str(
                    stressed_rate
                ),

                "monthly_payment": (
                    stressed_payment
                ),

                "monthly_payment_increase": (
                    stressed_payment
                    - base_payment
                ),
            }
        )

    return results
