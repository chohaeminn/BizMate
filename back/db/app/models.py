import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    business_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    owner_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    region_name: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    industry_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    annual_sales: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    # 현재 사용할 수 있는 현금 또는 예금성 자금
    available_cash_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    # 임차료, 인건비 등 월 반복 고정지출
    monthly_fixed_expense: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class SupportProgram(Base):
    __tablename__ = "support_programs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    organization_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    region_name: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    target_industry: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    support_type: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    support_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    application_start_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    application_end_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    source_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class DeductionCandidate(Base):
    __tablename__ = "deduction_candidates"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(Text, nullable=False)
    calculation_type: Mapped[str] = mapped_column(Text, nullable=False)
    target_industry: Mapped[str | None] = mapped_column(Text, nullable=True)
    required_inputs: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(Text, nullable=False)
    source_section: Mapped[str] = mapped_column(Text, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class FundingCandidate(Base):
    __tablename__ = "funding_candidates"

    id: Mapped[str] = mapped_column(Text, primary_key=True)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    funding_type: Mapped[str] = mapped_column(Text, nullable=False)
    max_amount: Mapped[int | None] = mapped_column(Integer, nullable=True)
    eligible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    source: Mapped[str] = mapped_column(Text, nullable=False)
    annual_rate: Mapped[Decimal | None] = mapped_column(Numeric(8, 6), nullable=True)
    term_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    grace_months: Mapped[int | None] = mapped_column(Integer, nullable=True)
    guarantee_fee_rate: Mapped[Decimal | None] = mapped_column(Numeric(8, 6), nullable=True)
    expected_period_weeks: Mapped[int | None] = mapped_column(Integer, nullable=True)
    region_name: Mapped[str | None] = mapped_column(Text, nullable=True)
    target_industry: Mapped[str | None] = mapped_column(Text, nullable=True)
    funding_purpose: Mapped[str | None] = mapped_column(Text, nullable=True)
    terms_note: Mapped[str | None] = mapped_column(Text, nullable=True)


class FundingRequest(Base):
    __tablename__ = "funding_requests"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "business_profiles.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    required_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    funding_purpose: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    self_funding_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    max_monthly_payment: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    optimization_priority: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="비용",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class FundingRequestUsePlanItem(Base):
    """
    요청한 자금을 어디에 사용할지 세부적으로 저장합니다.

    예:
    - 시설 개선 20,000,000원
    - 장비 구매 15,000,000원
    - 운영비 5,000,000원
    """

    __tablename__ = "funding_request_use_plan_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    funding_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "funding_requests.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    purpose: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    priority_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class ExternalDebt(Base):
    """
    사업자가 이미 보유한 대출이나 채무를 저장합니다.
    """

    __tablename__ = "external_debts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "business_profiles.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    debt_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    lender_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    balance_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    monthly_payment: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    # 0.037은 연 3.7%를 의미합니다.
    annual_rate: Mapped[Decimal] = mapped_column(
        Numeric(8, 6),
        nullable=False,
        default=Decimal("0"),
    )

    maturity_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class LoanProduct(Base):
    """
    정책자금, 보증부 대출 등 포트폴리오 계산에 사용할
    대출상품 기준 정보를 저장합니다.
    """

    __tablename__ = "loan_products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )

    organization_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    loan_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    max_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    # 0.037은 연 3.7%를 의미합니다.
    annual_rate: Mapped[Decimal] = mapped_column(
        Numeric(8, 6),
        nullable=False,
        default=Decimal("0"),
    )

    term_months: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    grace_months: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    # 0.009는 연 0.9%를 의미합니다.
    guarantee_fee_rate: Mapped[Decimal] = mapped_column(
        Numeric(8, 6),
        nullable=False,
        default=Decimal("0"),
    )

    expected_period_weeks: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    source_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class SupportHistory(Base):
    """
    사업자가 과거에 받은 지원금 또는 정책자금 이력을 저장합니다.
    """

    __tablename__ = "support_histories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "business_profiles.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    support_program_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "support_programs.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    program_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    organization_name: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    received_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    received_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class PortfolioResult(Base):
    __tablename__ = "portfolio_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    funding_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "funding_requests.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # cost, stability, speed 등 포트폴리오 유형
    portfolio_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="basic",
        index=True,
    )

    total_required_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
    )

    total_funding_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    shortage_amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    monthly_payment: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    finance_cost: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    expected_period_weeks: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    expected_period_label: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    is_ai_recommended: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )

    recommendation_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    # 스트레스 테스트 목록을 JSON 배열로 저장합니다.
    stress_test_result: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )

    summary: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    portfolio_result_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "portfolio_results.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    support_program_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "support_programs.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    loan_product_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "loan_products.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    item_name: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    # grant, policy_loan, commercial_loan, self_funding 등
    funding_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    amount: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    annual_rate: Mapped[Decimal] = mapped_column(
        Numeric(8, 6),
        nullable=False,
        default=Decimal("0"),
    )

    term_months: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    grace_months: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    guarantee_fee_rate: Mapped[Decimal] = mapped_column(
        Numeric(8, 6),
        nullable=False,
        default=Decimal("0"),
    )

    expected_period_weeks: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    monthly_payment: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    finance_cost: Mapped[int] = mapped_column(
        BigInteger,
        nullable=False,
        default=0,
    )

    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    priority_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class TaxSchedule(Base):
    __tablename__ = "tax_schedules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    title: Mapped[str] = mapped_column(
        String(300),
        nullable=False,
    )

    note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    schedule_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.now,
    )


class TaxInputRecord(Base):
    __tablename__ = "tax_inputs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4,
    )
    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("business_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    amount_basis: Mapped[str] = mapped_column(
        String(30), nullable=False, default="SUPPLY_VALUE",
    )
    sales_amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    purchase_amount: Mapped[int] = mapped_column(BigInteger, nullable=False)
    simulation_tax_rate: Mapped[Decimal] = mapped_column(
        Numeric(8, 6), nullable=False, default=Decimal("0.15"),
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now,
    )
