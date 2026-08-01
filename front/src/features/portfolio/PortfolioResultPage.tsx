import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { loadPortfolioFlowInput } from "@/lib/portfolioSession";
import {
  getDonutBackground,
  mergePortfolioLlmOutput,
  portfolioOptions,
  type PortfolioSegment,
} from "./portfolioData";

function PortfolioDonut({ segments }: { segments: PortfolioSegment[] }) {
  return (
    <div
      className="portfolio-result-donut"
      style={{ "--donut": getDonutBackground(segments) } as CSSProperties}
      aria-hidden="true"
    />
  );
}

const fundingTypeLegend = [
  { label: "지원사업", description: "상환 없는 지원금", color: "#ffcc00" },
  { label: "정책자금", description: "정부·공공 저금리 자금", color: "#3b82f6" },
  { label: "보증상품", description: "보증기관 연계 대출", color: "#22c55e" },
  { label: "자기자금", description: "보유 현금 활용", color: "#a3a3a3" },
];

export default function PortfolioResultPage() {
  const [options, setOptions] = useState<typeof portfolioOptions>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const requestStarted = useRef(false);

  useEffect(() => {
    if (requestStarted.current) return;
    requestStarted.current = true;
    const input = loadPortfolioFlowInput();
    const cacheKey = `bizmate-portfolio-result-v3:${JSON.stringify(input)}`;
    const cached = window.sessionStorage.getItem(cacheKey);

    const applyOutput = (
      output: string,
      calculations: Parameters<typeof mergePortfolioLlmOutput>[1],
    ) => {
      const result = mergePortfolioLlmOutput(output, calculations);
      if (!result.options.length) return;
      setOptions(result.options);
      setAiSummary(result.summary);
      setDisclaimer(result.disclaimer);
      const normalizedRecommendedType = result.recommendedType === "stable"
        ? "burden"
        : result.recommendedType;
      setSelectedSlug(normalizedRecommendedType);
      setIsLoading(false);
    };

    if (cached) {
      try {
        const parsed = JSON.parse(cached) as {
          output: string;
          calculations: Parameters<typeof mergePortfolioLlmOutput>[1];
        };
        applyOutput(parsed.output, parsed.calculations);
        return;
      } catch {
        window.sessionStorage.removeItem(cacheKey);
      }
    }

    void fetch("/api/portfolio/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(body?.error || `portfolio_llm 호출 실패 (${response.status})`);
        }
        return response.json() as Promise<{
          output: string;
          calculations: Parameters<typeof mergePortfolioLlmOutput>[1];
        }>;
      })
      .then(({ output, calculations }) => {
        window.sessionStorage.setItem(cacheKey, JSON.stringify({ output, calculations }));
        setErrorMessage("");
        applyOutput(output, calculations);
      })
      .catch((error) => {
        console.error(error);
        setErrorMessage("포트폴리오 결과를 생성하지 못했어요. 잠시 후 다시 시도해 주세요.");
        setIsLoading(false);
      });
  }, []);

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
              {isLoading ? "입력하신 정보를 바탕으로 포트폴리오를 생성하고 있어요." : aiSummary}
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

          {!isLoading && options.length ? (
            <section className="portfolio-funding-legend" aria-labelledby="portfolio-funding-legend-title">
              <div className="portfolio-funding-legend-heading">
                <h2 id="portfolio-funding-legend-title">자금 유형별 색상</h2>
                <p>그래프 색상으로 조달 방식의 큰 구성을 확인하세요</p>
              </div>
              <div className="portfolio-funding-legend-grid">
                {fundingTypeLegend.map((item) => (
                  <div className="portfolio-funding-legend-item" key={item.label}>
                    <span style={{ "--legend-color": item.color } as CSSProperties} aria-hidden="true" />
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="portfolio-result-list" aria-label="추천 포트폴리오 목록">
            {isLoading ? (
              <div className="portfolio-result-loading" role="status">
                <div className="portfolio-result-loading-visual" aria-hidden="true">
                  <div className="portfolio-analysis-orbit outer" />
                  <div className="portfolio-analysis-orbit inner" />
                  <div className="portfolio-analysis-character">
                    <Image
                      src="/portfolio/portfolio-analysis-characters.png"
                      alt=""
                      width={352}
                      height={206}
                      priority
                    />
                  </div>
                </div>
                <span className="portfolio-result-spinner" aria-hidden="true" />
                <strong>결과가 나올 때까지 잠시만 기다려 주세요.</strong>
                <p className="portfolio-result-loading-notice">
                  <span>원활한 네트워크 환경 유지해주세요.</span>
                  <span>정확한 결과를 위해 20초~1분 소요될 수 있습니다.</span>
                </p>
              </div>
            ) : null}
            {errorMessage ? (
              <div className="portfolio-result-error" role="alert">{errorMessage}</div>
            ) : null}
            {options.map((option) => {
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

                    {option.recommendationReason ? (
                      <p className="portfolio-result-reason">{option.recommendationReason}</p>
                    ) : null}

                    <ul className="portfolio-result-points">
                      {option.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                    </ul>

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

          {disclaimer ? <p className="portfolio-result-disclaimer">{disclaimer}</p> : null}
        </div>

        {!isLoading && options.length ? <footer className="portfolio-footer portfolio-result-footer">
          <Link href={`/portfolio/roadmap?type=${selectedSlug}`} className="portfolio-roadmap-button">
            신청 로드맵 보기
          </Link>
          <Link href="/service" className="portfolio-later-button">
            나중에 하기
          </Link>
        </footer> : null}
      </div>
    </main>
  );
}
