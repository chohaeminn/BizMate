import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const fundingOptions = [
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
    id: "repayment",
    label: "월 상환 부담 최소",
    symbol: "₩",
  },
];

const currentFunds = [
  { label: "현재 가용잔액", value: "1,215만 원" },
  { label: "향후 30일 예정지출", value: "820만 원" },
  { label: "이번 계획에 사용할 금액", value: "500만 원" },
  { label: "최소 유지 희망자금", value: "1,000만 원" },
];

const repaymentOptions = [
  { label: "보수적", value: "70만 원" },
  { label: "권장", value: "90만 원", selected: true },
  { label: "최대", value: "110만 원" },
];

export default function PortfolioPreferencesPage() {
  const [selectedFunding, setSelectedFunding] = useState("cost");

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
            <h2 id="current-funds-title">분석한 현재 자금이에요</h2>
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
                  src="/portfolio/portfolio-preferences-robot.png"
                  alt=""
                  width={50}
                  height={68}
                  priority
                />
              </div>
              <p>
                현재 현금흐름 기준 권장 월 상환액은
                <br />
                90만 원이에요.
              </p>
            </div>
          </section>
        </div>

        <footer className="portfolio-footer portfolio-analysis-footer">
          <Link href="/portfolio/analysis" className="portfolio-analysis-button">
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
