from __future__ import annotations

import uuid
from dataclasses import dataclass
from decimal import Decimal
from typing import Iterable, Literal, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    FundingRequest,
    LoanProduct,
    PortfolioItem,
    PortfolioResult,
    SupportProgram,
)
from app.services.portfolio_calculator import (
    PortfolioCalculation,
    PortfolioCalculationError,
    PortfolioItemInput,
    calculate_portfolio,
    run_stress_test,
)

PortfolioType = Literal["cost", "stability", "speed"]


class PortfolioServiceError(ValueError):
    """포트폴리오 생성 과정에서 발생하는 서비스 계층 예외입니다."""


class PortfolioNotFoundError(PortfolioServiceError):
    """요청한 DB 데이터가 존재하지 않을 때 발생합니다."""


@dataclass(frozen=True, slots=True)
class PortfolioSelectionItem:
    """
    AI 또는 라우터가 선택한 자금 조달 항목입니다.

    source_id:
    - support_program이면 support_programs.id
    - loan_product이면 loan_products.id
    - self_funding이면 None
    """

    source_type: Literal["support_program", "loan_product", "self_funding"]
    source_id: uuid.UUID | None
    amount: int
    reason: str | None = None
    priority_order: int = 1


@dataclass(frozen=True, slots=True)
class PortfolioCreateCommand:
    """포트폴리오 1개를 생성하기 위한 서비스 입력값입니다."""

    funding_request_id: uuid.UUID
    portfolio_type: PortfolioType
    selections: Sequence[PortfolioSelectionItem]
    summary: str | None = None
    is_ai_recommended: bool = False
    recommendation_reason: str | None = None


@dataclass(frozen=True, slots=True)
class CreatedPortfolio:
    """DB에 저장된 포트폴리오와 계산 결과를 함께 반환합니다."""

    portfolio_result: PortfolioResult
    calculation: PortfolioCalculation


class PortfolioService:
    """
    자금 포트폴리오 생성 서비스입니다.

    역할:
    1. FundingRequest와 선택된 상품을 DB에서 조회
    2. 계산기 입력값으로 변환
    3. 월 상환액·금융비용·부족금액·확보기간 계산
    4. PortfolioResult와 PortfolioItem 저장

    트랜잭션 commit은 이 서비스에서 수행합니다.
    오류가 발생하면 rollback 후 예외를 다시 발생시킵니다.
    """

    def __init__(self, db: Session) -> None:
        self.db = db

    def create_portfolio(
        self,
        command: PortfolioCreateCommand,
    ) -> CreatedPortfolio:
        self._validate_command(command)

        funding_request = self._get_funding_request(
            command.funding_request_id
        )

        calculator_items, resolved_items = self._resolve_selections(
            selections=command.selections,
            self_funding_limit=funding_request.self_funding_amount,
        )

        calculation = calculate_portfolio(
            total_required_amount=funding_request.required_amount,
            items=calculator_items,
        )

        max_monthly_payment = funding_request.max_monthly_payment or 0
        if (
            max_monthly_payment > 0
            and calculation.monthly_payment > max_monthly_payment
        ):
            raise PortfolioServiceError(
                "계산된 월 상환액이 사용자의 최대 월 상환 선호액을 초과합니다. "
                f"계산값={calculation.monthly_payment}, "
                f"허용값={max_monthly_payment}"
            )

        stress_test_result = self._build_portfolio_stress_test(
            resolved_items
        )

        portfolio_result = PortfolioResult(
            funding_request_id=funding_request.id,
            portfolio_type=command.portfolio_type,
            total_required_amount=calculation.total_required_amount,
            total_funding_amount=calculation.total_funding_amount,
            shortage_amount=calculation.shortage_amount,
            monthly_payment=calculation.monthly_payment,
            finance_cost=calculation.finance_cost,
            expected_period_weeks=calculation.expected_period_weeks,
            expected_period_label=self._period_label(
                calculation.expected_period_weeks
            ),
            is_ai_recommended=command.is_ai_recommended,
            recommendation_reason=command.recommendation_reason,
            stress_test_result=stress_test_result,
            summary=command.summary,
        )

        try:
            self.db.add(portfolio_result)
            self.db.flush()

            for resolved, calculated in zip(
                resolved_items,
                calculation.items,
                strict=True,
            ):
                portfolio_item = PortfolioItem(
                    portfolio_result_id=portfolio_result.id,
                    support_program_id=resolved.support_program_id,
                    loan_product_id=resolved.loan_product_id,
                    item_name=calculated.item_name,
                    funding_type=calculated.funding_type,
                    amount=calculated.amount,
                    annual_rate=resolved.annual_rate,
                    term_months=resolved.term_months,
                    grace_months=resolved.grace_months,
                    guarantee_fee_rate=resolved.guarantee_fee_rate,
                    expected_period_weeks=calculated.expected_period_weeks,
                    monthly_payment=calculated.monthly_payment,
                    finance_cost=calculated.finance_cost,
                    reason=resolved.reason,
                    priority_order=resolved.priority_order,
                )
                self.db.add(portfolio_item)

            self.db.commit()
            self.db.refresh(portfolio_result)
        except Exception:
            self.db.rollback()
            raise

        return CreatedPortfolio(
            portfolio_result=portfolio_result,
            calculation=calculation,
        )

    def create_three_portfolios(
        self,
        commands: Sequence[PortfolioCreateCommand],
    ) -> list[CreatedPortfolio]:
        """
        비용 최소형·안정형·신속형 3개를 순서대로 생성합니다.

        각 command는 서로 독립적으로 저장됩니다. 한 건이라도 실패했을 때
        전체를 하나의 트랜잭션으로 묶고 싶다면 create_portfolio의 commit을
        외부 트랜잭션 방식으로 변경해야 합니다.
        """
        portfolio_types = [command.portfolio_type for command in commands]

        if len(commands) != 3:
            raise PortfolioServiceError(
                "3개 포트폴리오를 생성하려면 command가 정확히 3개여야 합니다."
            )

        if set(portfolio_types) != {"cost", "stability", "speed"}:
            raise PortfolioServiceError(
                "portfolio_type은 cost, stability, speed가 각각 하나씩 필요합니다."
            )

        request_ids = {
            command.funding_request_id for command in commands
        }
        if len(request_ids) != 1:
            raise PortfolioServiceError(
                "3개 포트폴리오는 동일한 funding_request_id를 사용해야 합니다."
            )

        return [self.create_portfolio(command) for command in commands]

    def get_portfolio(
        self,
        portfolio_result_id: uuid.UUID,
    ) -> PortfolioResult:
        result = self.db.get(PortfolioResult, portfolio_result_id)
        if result is None:
            raise PortfolioNotFoundError(
                f"포트폴리오 결과를 찾을 수 없습니다: {portfolio_result_id}"
            )
        return result

    def list_portfolios_by_request(
        self,
        funding_request_id: uuid.UUID,
    ) -> list[PortfolioResult]:
        statement = (
            select(PortfolioResult)
            .where(
                PortfolioResult.funding_request_id
                == funding_request_id
            )
            .order_by(PortfolioResult.created_at.desc())
        )
        return list(self.db.scalars(statement).all())

    def _get_funding_request(
        self,
        funding_request_id: uuid.UUID,
    ) -> FundingRequest:
        request = self.db.get(FundingRequest, funding_request_id)
        if request is None:
            raise PortfolioNotFoundError(
                f"자금 요청을 찾을 수 없습니다: {funding_request_id}"
            )
        return request

    def _resolve_selections(
        self,
        *,
        selections: Sequence[PortfolioSelectionItem],
        self_funding_limit: int,
    ) -> tuple[
        list[PortfolioItemInput],
        list["_ResolvedSelection"],
    ]:
        calculator_items: list[PortfolioItemInput] = []
        resolved_items: list[_ResolvedSelection] = []
        used_self_funding = 0

        for selection in selections:
            if selection.amount <= 0:
                raise PortfolioServiceError(
                    "각 포트폴리오 항목의 amount는 0보다 커야 합니다."
                )
            if selection.priority_order <= 0:
                raise PortfolioServiceError(
                    "priority_order는 1 이상이어야 합니다."
                )

            if selection.source_type == "self_funding":
                if selection.source_id is not None:
                    raise PortfolioServiceError(
                        "self_funding의 source_id는 None이어야 합니다."
                    )

                used_self_funding += selection.amount
                if used_self_funding > self_funding_limit:
                    raise PortfolioServiceError(
                        "자기자금 배정액이 요청에 등록된 자기자금을 초과합니다. "
                        f"배정액={used_self_funding}, "
                        f"한도={self_funding_limit}"
                    )

                resolved = _ResolvedSelection(
                    item_name="자기자금",
                    funding_type="self_funding",
                    amount=selection.amount,
                    support_program_id=None,
                    loan_product_id=None,
                    annual_rate=Decimal("0"),
                    term_months=0,
                    grace_months=0,
                    guarantee_fee_rate=Decimal("0"),
                    expected_period_weeks=0,
                    reason=selection.reason,
                    priority_order=selection.priority_order,
                )

            elif selection.source_type == "support_program":
                if selection.source_id is None:
                    raise PortfolioServiceError(
                        "support_program에는 source_id가 필요합니다."
                    )

                program = self.db.get(
                    SupportProgram,
                    selection.source_id,
                )
                if program is None:
                    raise PortfolioNotFoundError(
                        f"지원사업을 찾을 수 없습니다: {selection.source_id}"
                    )

                if (
                    program.support_amount > 0
                    and selection.amount > program.support_amount
                ):
                    raise PortfolioServiceError(
                        "선택한 지원금액이 지원사업의 기준 지원금액을 초과합니다. "
                        f"선택액={selection.amount}, "
                        f"기준액={program.support_amount}"
                    )

                resolved = _ResolvedSelection(
                    item_name=program.title,
                    funding_type="grant",
                    amount=selection.amount,
                    support_program_id=program.id,
                    loan_product_id=None,
                    annual_rate=Decimal("0"),
                    term_months=0,
                    grace_months=0,
                    guarantee_fee_rate=Decimal("0"),
                    expected_period_weeks=0,
                    reason=selection.reason,
                    priority_order=selection.priority_order,
                )

            elif selection.source_type == "loan_product":
                if selection.source_id is None:
                    raise PortfolioServiceError(
                        "loan_product에는 source_id가 필요합니다."
                    )

                product = self.db.get(
                    LoanProduct,
                    selection.source_id,
                )
                if product is None:
                    raise PortfolioNotFoundError(
                        f"대출상품을 찾을 수 없습니다: {selection.source_id}"
                    )

                if not product.is_active:
                    raise PortfolioServiceError(
                        f"비활성 대출상품은 사용할 수 없습니다: {product.name}"
                    )

                if (
                    product.max_amount > 0
                    and selection.amount > product.max_amount
                ):
                    raise PortfolioServiceError(
                        "선택한 대출금액이 상품 한도를 초과합니다. "
                        f"선택액={selection.amount}, "
                        f"한도={product.max_amount}"
                    )

                funding_type = self._loan_funding_type(
                    product.loan_type
                )

                resolved = _ResolvedSelection(
                    item_name=product.name,
                    funding_type=funding_type,
                    amount=selection.amount,
                    support_program_id=None,
                    loan_product_id=product.id,
                    annual_rate=product.annual_rate,
                    term_months=product.term_months,
                    grace_months=product.grace_months,
                    guarantee_fee_rate=product.guarantee_fee_rate,
                    expected_period_weeks=product.expected_period_weeks,
                    reason=selection.reason,
                    priority_order=selection.priority_order,
                )

            else:
                raise PortfolioServiceError(
                    f"지원하지 않는 source_type입니다: "
                    f"{selection.source_type}"
                )

            calculator_items.append(
                PortfolioItemInput(
                    item_name=resolved.item_name,
                    funding_type=resolved.funding_type,
                    amount=resolved.amount,
                    annual_rate=resolved.annual_rate,
                    term_months=resolved.term_months,
                    grace_months=resolved.grace_months,
                    guarantee_fee_rate=resolved.guarantee_fee_rate,
                    expected_period_weeks=resolved.expected_period_weeks,
                )
            )
            resolved_items.append(resolved)

        return calculator_items, resolved_items

    @staticmethod
    def _loan_funding_type(
        loan_type: str,
    ) -> Literal["policy_loan", "commercial_loan", "guarantee_loan"]:
        normalized = loan_type.strip().lower()

        if normalized in {"guarantee", "guarantee_loan", "보증", "보증대출"}:
            return "guarantee_loan"

        policy_keywords = {
            "policy",
            "policy_loan",
            "정책",
            "정책자금",
            "보증부",
            "보증부대출",
        }

        if normalized in policy_keywords:
            return "policy_loan"

        return "commercial_loan"

    @staticmethod
    def _build_portfolio_stress_test(
        items: Iterable["_ResolvedSelection"],
    ) -> list[dict]:
        """
        각 대출 항목에 대해 금리 +1%p, +2%p, +3%p 시나리오를 계산합니다.
        PortfolioResult.stress_test_result(JSONB)에 바로 저장할 수 있습니다.
        """
        result: list[dict] = []

        for item in items:
            if item.funding_type not in {
                "policy_loan",
                "commercial_loan",
                "guarantee_loan",
            }:
                continue

            scenarios = run_stress_test(
                principal=item.amount,
                annual_rate=item.annual_rate,
                term_months=item.term_months,
            )

            result.append(
                {
                    "item_name": item.item_name,
                    "loan_product_id": (
                        str(item.loan_product_id)
                        if item.loan_product_id
                        else None
                    ),
                    "principal": item.amount,
                    "base_annual_rate": str(item.annual_rate),
                    "scenarios": scenarios,
                }
            )

        return result

    @staticmethod
    def _period_label(weeks: int) -> str:
        if weeks <= 0:
            return "즉시"
        if weeks == 1:
            return "약 1주"
        if weeks < 4:
            return f"약 {weeks}주"
        if weeks % 4 == 0:
            return f"약 {weeks // 4}개월"
        return f"약 {weeks}주"

    @staticmethod
    def _validate_command(
        command: PortfolioCreateCommand,
    ) -> None:
        if command.portfolio_type not in {
            "cost",
            "stability",
            "speed",
        }:
            raise PortfolioServiceError(
                "portfolio_type은 cost, stability, speed 중 하나여야 합니다."
            )

        if not command.selections:
            raise PortfolioServiceError(
                "포트폴리오에는 최소 1개 이상의 항목이 필요합니다."
            )


@dataclass(frozen=True, slots=True)
class _ResolvedSelection:
    item_name: str
    funding_type: Literal[
        "grant",
        "policy_loan",
        "commercial_loan",
        "guarantee_loan",
        "self_funding",
    ]
    amount: int
    support_program_id: uuid.UUID | None
    loan_product_id: uuid.UUID | None
    annual_rate: Decimal
    term_months: int
    grace_months: int
    guarantee_fee_rate: Decimal
    expected_period_weeks: int
    reason: str | None
    priority_order: int
