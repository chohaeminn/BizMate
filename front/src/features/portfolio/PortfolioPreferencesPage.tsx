import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { clearPortfolioResultCache, loadPortfolioFlowInput, savePortfolioFlowInput } from "@/lib/portfolioSession";
import type { PortfolioContext } from "@/lib/portfolioApi";

const fundingOptions: Array<{
  id: "cost" | "speed" | "burden";
  label: string;
  icon?: string;
  symbol?: string;
}> = [
  {
    id: "cost",
    label: "대출 비용 최소",
    icon: "/portfolio/portfolio-dollar.svg",
  },
  {
    id: "speed",
    label: "자금의 빠른 확보",
    icon: "/portfolio/portfolio-clock.svg",
  },
  {
    id: "burden",
    label: "월 상환 부담 최소",
    symbol: "₩",
  },
];

const formatWon = (value: number) => `${Math.round(value / 10_000).toLocaleString("ko-KR")}만 원`;
const roundRepayment = (value: number) => Math.max(100_000, Math.round(value / 100_000) * 100_000);

export default function PortfolioPreferencesPage({ context }: { context: PortfolioContext }) {
  const flowInput = loadPortfolioFlowInput();
  const overrides = flowInput.businessInfoOverrides;
  const [selectedFunding, setSelectedFunding] = useState(() => flowInput.preference);
  const recommendedRepayment = context.funding_request?.max_monthly_payment
    || overrides?.existingMonthlyPayment
    || 900_000;
  const repaymentOptions = [
    { label: "보수적", value: formatWon(roundRepayment(recommendedRepayment * 0.8)) },
    { label: "권장", value: formatWon(recommendedRepayment), selected: true },
    { label: "최대", value: formatWon(roundRepayment(recommendedRepayment * 1.2)) },
  ];
  const currentFunds = [
    { label: "현재 가용잔액", value: formatWon(overrides?.availableCashAmount ?? context.profile.available_cash_amount ?? 0) },
    { label: "향후 30일 예정지출", value: formatWon(overrides?.monthlyFixedExpense ?? context.profile.monthly_fixed_expense ?? 0) },
    {
      label: "이번 계획에 사용할 금액",
      value: formatWon(context.funding_request?.self_funding_amount ?? 5_000_000),
    },
    { label: "최소 유지 희망자금", value: "1,000만 원" },
  ];

  return (
    <main className="landing">
      <div className="mobile-screen portfolio-screen portfolio-preferences-screen">
        <header className="portfolio-header">
          <Link
            href="/portfolio/funding-info"
            className="icon-button"
            aria-label="이전 화면으로 이동"
          >
            <Image
              src="/portfolio/portfolio-back-preferences.svg"
              alt=""
              width={24}
              height={24}
            />
          </Link>
          <h1>KB BizMate AI - 자금 포트폴리오</h1>
        </header>

        <div className="portfolio-content portfolio-step-content">
          <section className="portfolio-title-section portfolio-funded-title">
            <h2>자금 조달 방식을 선택해 주세요</h2>
            <p>자기자금과 월 상환 선호를 설정해 주세요</p>
          </section>

          <section className="portfolio-progress" aria-label="진행 단계">
            <div className="portfolio-progress-count">
              <strong>4</strong>
              <span>/ 6</span>
            </div>
            <div className="portfolio-progress-track portfolio-progress-track-step4">
              <div />
            </div>
          </section>

          <section className="portfolio-preference-card" aria-labelledby="funding-choice-title">
            <h2 id="funding-choice-title">어떤 자금 조달 방식을 원하시나요?</h2>
            <div className="portfolio-choice-grid">
              {fundingOptions.map((option) => {
                const selected = selectedFunding === option.id;

                return (
                  <button
                    className={`portfolio-choice-card ${selected ? "selected" : ""}`}
                    type="button"
                    key={option.id}
                    aria-pressed={selected}
                    onClick={() => setSelectedFunding(option.id)}
                  >
                    {option.icon ? (
                      <Image src={option.icon} alt="" width={18} height={18} />
                    ) : (
                      <span className="portfolio-choice-symbol">{option.symbol}</span>
                    )}
                    <strong>{option.label}</strong>
                    {selected ? (
                      <Image
                        className="portfolio-choice-check"
                        src="/portfolio/portfolio-selected-check.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="portfolio-preference-card" aria-labelledby="current-funds-title">
            <h2 id="current-funds-title">확인한 현재 자금이에요</h2>
            <div className="portfolio-summary-list">
              {currentFunds.map((item) => (
                <div className="portfolio-summary-row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="portfolio-preference-card" aria-labelledby="repayment-range-title">
            <h2 id="repayment-range-title">
              신규 자금 월 상환 권장 범위는
              <br />
              다음과 같아요
            </h2>
            <div className="portfolio-repayment-grid">
              {repaymentOptions.map((option) => (
                <div
                  className={`portfolio-repayment-card ${option.selected ? "selected" : ""}`}
                  key={option.label}
                >
                  {option.selected ? (
                    <Image
                      className="portfolio-repayment-check"
                      src="/portfolio/portfolio-selected-check.svg"
                      alt=""
                      width={20}
                      height={20}
                    />
                  ) : null}
                  <span>{option.label}</span>
                  <strong>{option.value}</strong>
                </div>
              ))}
            </div>
            <div className="portfolio-repayment-message">
              <div className="portfolio-preferences-robot">
                <Image
                  src="/portfolio/portfolio-repayment-advice.png"
                  alt=""
                  width={50}
                  height={68}
                  priority
                />
              </div>
              <p>
                현재 현금흐름 기준 권장 월 상환액은
                <br />
                {formatWon(recommendedRepayment)}이에요.
              </p>
            </div>
          </section>
        </div>

        <footer className="portfolio-footer portfolio-analysis-footer">
          <Link
            href="/portfolio/result"
            className="portfolio-analysis-button"
            onClick={() => {
              savePortfolioFlowInput({ preference: selectedFunding });
              clearPortfolioResultCache();
            }}
          >
            분석 시작
          </Link>
          <Link href="/service" className="portfolio-later-button">
            나중에 하기
          </Link>
        </footer>
      </div>
    </main>
  );
}
