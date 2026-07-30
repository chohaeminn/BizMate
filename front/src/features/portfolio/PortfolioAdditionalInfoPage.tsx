import Image from "next/image";
import Link from "next/link";

const debtCards = [
  {
    title: "타행 사업자대출",
    icon: "/portfolio/portfolio-bank.svg",
    metrics: [
      { label: "잔액", value: "1,500만 원" },
      { label: "금리", value: "6.7%" },
      { label: "월 상환액", value: "46만 원" },
      { label: "만기", value: "2028.05.20" },
    ],
  },
  {
    title: "거래처 미지급금",
    icon: "/portfolio/portfolio-person.svg",
    metrics: [
      { label: "잔액", value: "300만 원" },
      { label: "월 상환 예정", value: "100만 원" },
      { label: "만기", value: "2026.10.31" },
    ],
  },
];

const actionItems = ["타행 대출 추가", "지원이력 추가"];

export default function PortfolioAdditionalInfoPage() {
  return (
    <main className="landing">
      <div className="mobile-screen portfolio-screen portfolio-step-screen">
        <header className="portfolio-header">
          <Link href="/portfolio" className="icon-button" aria-label="이전 화면으로 이동">
            <Image src="/portfolio/portfolio-back-alt.svg" alt="" width={24} height={24} />
          </Link>
          <h1>KB BizMate AI - 자금 포트폴리오</h1>
        </header>

        <div className="portfolio-content portfolio-step-content">
          <section className="portfolio-title-section">
            <h2>추가 정보 입력</h2>
            <p>타행 대출이나 외부 채무가 있다면 알려주세요</p>
          </section>

          <section className="portfolio-progress" aria-label="진행 단계">
            <div className="portfolio-progress-count">
              <strong>2</strong>
              <span>/ 6</span>
            </div>
            <div className="portfolio-progress-track portfolio-progress-track-step2">
              <div />
            </div>
          </section>

          <div className="portfolio-tabs" role="tablist" aria-label="추가 정보 유형">
            <button className="active" type="button" role="tab" aria-selected="true">
              대출·채무
            </button>
            <button type="button" role="tab" aria-selected="false">
              지원이력
            </button>
          </div>

          <section className="portfolio-section" aria-labelledby="external-debt-title">
            <h2 id="external-debt-title">현재 입력된 외부 채무</h2>
            <div className="portfolio-debt-list">
              {debtCards.map((card) => (
                <article className="portfolio-debt-card" key={card.title}>
                  <div className="portfolio-debt-heading">
                    <div className="portfolio-debt-title">
                      <span className="portfolio-debt-icon">
                        <Image src={card.icon} alt="" width={20} height={20} />
                      </span>
                      <h3>{card.title}</h3>
                    </div>
                    <Image src="/portfolio/portfolio-chevron.svg" alt="" width={16} height={16} />
                  </div>
                  <div className={`portfolio-debt-metrics columns-${card.metrics.length}`}>
                    {card.metrics.map((metric) => (
                      <div key={metric.label}>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className="portfolio-warning">
              <Image src="/portfolio/portfolio-info.svg" alt="" width={20} height={20} />
              <p>
                외부 채무를 입력하면 상환 가능 금액을 더 정확하게 계산할 수 있어요.
              </p>
            </div>
          </section>

          <section className="portfolio-section" aria-labelledby="support-history-title">
            <h2 id="support-history-title">최근 지원금/정책자금 이용 이력</h2>
            <Link href="#" className="portfolio-history-card">
              <span className="portfolio-history-icon">
                <Image src="/portfolio/portfolio-support.svg" alt="" width={20} height={20} />
              </span>
              <strong>2025년 음식점 시설개선 지원사업</strong>
              <Image src="/portfolio/portfolio-chevron.svg" alt="" width={16} height={16} />
            </Link>

            <div className="portfolio-action-list">
              {actionItems.map((label) => (
                <Link href="#" className="portfolio-action-card" key={label}>
                  <span>
                    <Image src="/portfolio/portfolio-add.svg" alt="" width={20} height={20} />
                    {label}
                  </span>
                  <Image src="/portfolio/portfolio-chevron.svg" alt="" width={16} height={16} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <footer className="portfolio-footer portfolio-double-footer">
          <Link href="/portfolio/funding-info" className="portfolio-primary-button">
            확인하고 다음
          </Link>
          <Link href="/portfolio" className="portfolio-secondary-button">
            이전으로 돌아가기
          </Link>
        </footer>
      </div>
    </main>
  );
}
