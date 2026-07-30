import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";
import { getDonutBackground, portfolioOptions, type PortfolioSegment } from "./portfolioData";

function PortfolioDonut({ segments }: { segments: PortfolioSegment[] }) {
  return (
    <div
      className="portfolio-result-donut"
      style={{ "--donut": getDonutBackground(segments) } as CSSProperties}
      aria-hidden="true"
    />
  );
}

export default function PortfolioResultPage() {
  const [selectedSlug, setSelectedSlug] = useState(portfolioOptions[0].slug);

  return (
    <main className="landing">
      <div className="mobile-screen portfolio-screen portfolio-result-screen">
        <header className="portfolio-header">
          <Link href="/portfolio/preferences" className="icon-button" aria-label="이전 화면으로 이동">
            <Image src="/portfolio/portfolio-result-back.svg" alt="" width={24} height={24} />
          </Link>
          <h1>KB BizMate AI - 자금 포트폴리오</h1>
        </header>

        <div className="portfolio-content portfolio-step-content portfolio-result-content">
          <section className="portfolio-title-section portfolio-funded-title">
            <h2>내 상황에 맞추어 추천했어요</h2>
            <p>
              비용, 속도, 월 부담을 기준으로 3가지를 제안해요
              <br />
              원하는 방식을 선택하고 신청 로드맵을 확인하세요
            </p>
          </section>

          <section className="portfolio-progress" aria-label="진행 단계">
            <div className="portfolio-progress-count">
              <strong>5</strong>
              <span>/ 6</span>
            </div>
            <div className="portfolio-progress-track portfolio-progress-track-step5">
              <div />
            </div>
          </section>

          <section className="portfolio-result-list" aria-label="추천 포트폴리오 목록">
            {portfolioOptions.map((option) => {
              const selected = selectedSlug === option.slug;

              return (
                <article className={`portfolio-result-card ${selected ? "selected" : ""}`} key={option.slug}>
                  <button
                    className="portfolio-result-select"
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedSlug(option.slug)}
                  >
                    <div className="portfolio-result-heading">
                      {option.badge ? <span className="portfolio-ai-badge">✧ {option.badge}</span> : null}
                      <h2>{option.title}</h2>
                    </div>

                    <div className="portfolio-result-body">
                      <PortfolioDonut segments={option.segments} />
                      <div className="portfolio-result-breakdown">
                        {option.segments.map((segment) => (
                          <div className="portfolio-result-segment" key={segment.label}>
                            <span style={{ "--dot": segment.color } as CSSProperties}>{segment.label}</span>
                            <strong>{segment.amount}</strong>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="portfolio-result-metrics">
                      {option.metrics.map((metric) => (
                        <div key={metric.label}>
                          <span>{metric.label}</span>
                          <strong>{metric.value}</strong>
                        </div>
                      ))}
                    </div>
                  </button>

                  <Link href={`/portfolio/detail/${option.slug}`} className="portfolio-result-detail">
                    상세보기 &gt;
                  </Link>
                </article>
              );
            })}
          </section>
        </div>

        <footer className="portfolio-footer portfolio-result-footer">
          <Link href={`/portfolio/roadmap?type=${selectedSlug}`} className="portfolio-roadmap-button">
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
