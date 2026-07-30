import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { getPortfolioOption } from "./portfolioData";

const stressRows = [
  { label: "현재 매출 유지", state: "안정", tone: "stable" },
  { label: "매출 10% 감소", state: "보통", tone: "normal" },
  { label: "매출 20% 감소", state: "위험", tone: "danger" },
];

export default function PortfolioDetailPage() {
  const router = useRouter();
  const option = getPortfolioOption(router.query.slug);
  const total = option.segments.reduce((sum, segment) => sum + segment.value, 0).toLocaleString("ko-KR");
  const monthly = option.metrics[0]?.value ?? "-";
  const cost = option.metrics[1]?.value ?? "-";

  return (
    <main className="landing">
      <div className="mobile-screen portfolio-screen portfolio-detail-screen">
        <header className="portfolio-header">
          <Link href="/portfolio/result" className="icon-button" aria-label="이전 화면으로 이동">
            <Image src="/portfolio/portfolio-detail-back.svg" alt="" width={24} height={24} />
          </Link>
          <h1>KB BizMate AI - 자금 포트폴리오</h1>
        </header>

        <div className="portfolio-detail-content">
          <section className="portfolio-detail-title">
            <h1>AI 추천 결과</h1>
            <p>왜 이 포트폴리오를 추천하는지 설명드릴게요</p>
          </section>

          <section className="portfolio-detail-hero">
            <div className="portfolio-detail-hero-main">
              <div className="portfolio-detail-robot">
                <Image src="/portfolio/portfolio-detail-robot.png" alt="" width={83} height={103} priority />
              </div>
              <h2>{option.title} 추천</h2>
            </div>
            <div className="portfolio-detail-metric-grid">
              <div>
                <span className="portfolio-detail-won">₩</span>
                <small>총 조달</small>
                <strong>{total}만 원</strong>
              </div>
              <div>
                <Image src="/portfolio/portfolio-detail-calendar.svg" alt="" width={24} height={24} />
                <small>신규 월 상환</small>
                <strong>{monthly}</strong>
              </div>
              <div>
                <Image src="/portfolio/portfolio-detail-cost.svg" alt="" width={24} height={24} />
                <small>예상 금융비용</small>
                <strong>{cost}</strong>
              </div>
            </div>
          </section>

          <section className="portfolio-detail-card">
            <div className="portfolio-detail-card-heading">
              <Image src="/portfolio/portfolio-detail-bulb.svg" alt="" width={30} height={30} />
              <h2>추천 이유</h2>
            </div>
            <ul className="portfolio-reason-list">
              {option.reasons.map((reason) => (
                <li key={reason}>
                  <span>
                    <Image src="/portfolio/portfolio-detail-check.svg" alt="" width={12} height={12} />
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="portfolio-detail-card">
            <div className="portfolio-detail-card-heading">
              <Image src="/portfolio/portfolio-detail-chart.svg" alt="" width={21} height={18} />
              <h2>매출이 감소 된다면</h2>
            </div>
            <div className="portfolio-stress-list">
              {stressRows.map((row) => (
                <div className="portfolio-stress-row" key={row.label}>
                  <span className={row.tone}>{row.label}</span>
                  <strong className={row.tone}>{row.state}</strong>
                </div>
              ))}
            </div>
            <div className="portfolio-stress-warning">
              <span>⚠</span>
              <p>{option.stressWarning}</p>
            </div>
          </section>
        </div>

        <footer className="portfolio-footer portfolio-detail-footer">
          <Link href={`/portfolio/roadmap?type=${option.slug}`} className="portfolio-detail-primary">
            신청 로드맵 보기
          </Link>
          <Link href="/service" className="portfolio-later-button">
            나중에 하기
          </Link>
        </footer>
      </div>
    </main>
  );
}
