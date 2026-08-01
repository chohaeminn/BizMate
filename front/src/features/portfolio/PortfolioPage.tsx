import Image from "next/image";
import Link from "next/link";
import type { PortfolioContext } from "@/lib/portfolioApi";

const formatWon = (value: number) => `${Math.round(value / 10_000).toLocaleString("ko-KR")}만 원`;

export default function PortfolioPage({ context }: { context: PortfolioContext }) {
  const totalDebt = context.external_debts.reduce((sum, debt) => sum + debt.balance_amount, 0);
  const monthlyDebt = context.external_debts.reduce((sum, debt) => sum + debt.monthly_payment, 0);
  const businessInfoItems = [
  {
    label: "사업장",
    value: context.profile.region_name || "정보 없음",
    icon: "/portfolio/portfolio-location.svg",
  },
  {
    label: "업종",
    value: context.profile.industry_name || "정보 없음",
    icon: "/portfolio/portfolio-industry.svg",
  },
  {
    label: "사업기간",
    value: "2년 4개월",
    icon: "/portfolio/portfolio-duration.svg",
  },
  {
    label: "현재 가용잔액",
    value: formatWon(context.profile.available_cash_amount ?? 0),
    icon: "/portfolio/portfolio-balance.svg",
  },
  {
    label: "월평균 매출",
    value: formatWon(Math.round(context.profile.annual_sales / 12)),
    icon: "/portfolio/portfolio-sales.svg",
  },
  {
    label: "카드 정산 예정액",
    value: "248만 원",
    icon: "/portfolio/portfolio-card.svg",
  },
  {
    label: "기존 대출잔액",
    value: formatWon(totalDebt),
    icon: "/portfolio/portfolio-debt.svg",
  },
  {
    label: "기존 월 상환액",
    value: formatWon(monthlyDebt),
    icon: "/portfolio/portfolio-repayment.svg",
  },
  {
    label: "월 반복지출",
    value: formatWon(context.profile.monthly_fixed_expense ?? 0),
    icon: "/portfolio/portfolio-expense.svg",
  },
  ];
  return (
    <main className="landing">
      <div className="mobile-screen portfolio-screen">
        <header className="portfolio-header">
          <Link href="/service" className="icon-button" aria-label="서비스 화면으로 이동">
            <Image src="/portfolio/portfolio-back.svg" alt="" width={24} height={24} />
          </Link>
          <h1>KB BizMate AI - 자금 포트폴리오</h1>
        </header>

        <div className="portfolio-content">
          <section className="portfolio-title-section">
            <h2>사업정보를 불러왔어요</h2>
            <p>KB에 등록된 사업정보를 확인하고 수정할 수 있어요</p>
          </section>

          <section className="portfolio-progress" aria-label="진행 단계">
            <div className="portfolio-progress-count">
              <strong>1</strong>
              <span>/ 6</span>
            </div>
            <div className="portfolio-progress-track">
              <div />
            </div>
          </section>

          <section className="portfolio-info-card" aria-labelledby="portfolio-info-title">
            <h2 id="portfolio-info-title">KB 사업정보</h2>
            <div className="portfolio-info-list">
              {businessInfoItems.map((item) => (
                <div className="portfolio-info-row" key={item.label}>
                  <div className="portfolio-info-label">
                    <span className="portfolio-info-icon">
                      <Image src={item.icon} alt="" width={16} height={16} />
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="portfolio-insight" aria-label="AI 현금흐름 진단">
            <div className="portfolio-robot">
              <Image
                src="/portfolio/portfolio-robot.png"
                alt=""
                width={82}
                height={94}
                priority
              />
            </div>
            <p>
              현재 데이터 기준으로
              <br />
              운영 현금흐름은 <strong>보통</strong> 수준이에요.
            </p>
          </section>
        </div>

        <footer className="portfolio-footer">
          <Link href="/portfolio/additional-info" className="portfolio-primary-button">
            확인했어요
          </Link>
        </footer>
      </div>
    </main>
  );
}
