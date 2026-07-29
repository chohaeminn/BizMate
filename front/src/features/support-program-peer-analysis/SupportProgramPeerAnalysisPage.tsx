import Image from "next/image";
import Link from "next/link";

const filters = [
  { label: "최근 30일", icon: "/figma-assets/peer-calendar.svg" },
  { label: "대구", icon: "/figma-assets/peer-location.svg" },
  { label: "도소매업", icon: "/figma-assets/peer-industry.svg" },
  { label: "업력 2년 이상", icon: "/figma-assets/peer-career.svg" },
];

const rankings = [
  {
    rank: "TOP 1",
    title: "대구 소상공인 특례보증",
    rate: 48,
    tone: "green",
    featured: true,
  },
  {
    rank: "TOP 2",
    title: "스마트상점 기술보급사업",
    rate: 27,
    tone: "blue",
  },
  {
    rank: "TOP 3",
    title: "소상공인 디지털전환 지원사업",
    rate: 14,
    tone: "purple",
  },
];

export default function SupportProgramPeerAnalysisPage() {
  return (
    <main className="landing">
      <div className="mobile-screen peer-analysis-screen">
        <header className="peer-header">
          <div className="peer-header-left">
            <Link href="/support-programs" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/figma-assets/peer-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
          <div className="peer-header-actions">
            <button className="icon-button" type="button" aria-label="검색">
              <Image src="/figma-assets/peer-search.svg" alt="" width={24} height={24} />
            </button>
            <Link href="/" className="icon-button" aria-label="홈으로 이동">
              <Image src="/figma-assets/peer-home.svg" alt="" width={24} height={24} />
            </Link>
            <button className="icon-button" type="button" aria-label="메뉴 열기">
              <Image src="/figma-assets/peer-menu.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </header>

        <div className="peer-content">
          <section className="peer-hero" aria-labelledby="peer-hero-title">
            <h2 id="peer-hero-title">
              회원님과 비슷한
              <br />
              <strong>2,384명</strong>의 사업자를
              <br />
              분석했습니다.
            </h2>
          </section>

          <nav className="peer-filter-bar" aria-label="분석 조건 필터">
            {filters.map((filter) => (
              <button type="button" key={filter.label}>
                <Image src={filter.icon} alt="" width={16} height={16} />
                {filter.label}
                <Image src="/figma-assets/peer-chevron-down.svg" alt="" width={12} height={12} />
              </button>
            ))}
          </nav>

          <section className="peer-result-card" aria-labelledby="peer-result-title">
            <h2 id="peer-result-title">비슷한 사업자는 이렇게 신청했어요</h2>
            <div className="peer-ranking-list">
              {rankings.map((ranking) => (
                <article
                  className={`peer-ranking-card ${ranking.featured ? "featured" : ""}`}
                  key={ranking.rank}
                >
                  <div className="peer-ranking-copy">
                    <span className={`peer-rank-badge ${ranking.tone}`}>{ranking.rank}</span>
                    <h3>{ranking.title}</h3>
                    <div className="peer-rate-row">
                      <span>선택 비율</span>
                      <strong className={ranking.tone}>{ranking.rate}%</strong>
                    </div>
                    <div className="peer-progress" aria-hidden="true">
                      <span
                        className={ranking.tone}
                        style={{ width: `${ranking.rate}%` }}
                      />
                    </div>
                  </div>
                  <Image
                    src="/figma-assets/peer-chevron-right.svg"
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                  />
                </article>
              ))}
            </div>
            <p className="peer-note">※ 분석 기준: 업종, 지역, 업력, 매출규모, 신청이력 등</p>
          </section>
        </div>

        <div className="peer-bottom-cta">
          <Link href="/support-programs">다른 사업 보기</Link>
        </div>
      </div>
    </main>
  );
}
