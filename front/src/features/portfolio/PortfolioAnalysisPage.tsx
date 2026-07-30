import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ANALYSIS_DURATION_MS = 5000;

export default function PortfolioAnalysisPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(
        100,
        Math.round((elapsed / ANALYSIS_DURATION_MS) * 100),
      );

      setProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(intervalId);
        window.setTimeout(() => {
          void router.push("/portfolio/result");
        }, 200);
      }
    }, 50);

    return () => window.clearInterval(intervalId);
  }, [router]);

  return (
    <main className="landing">
      <div className="mobile-screen portfolio-analysis-screen">
        <section className="portfolio-analysis-visual" aria-label="자금 포트폴리오 분석 중">
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
        </section>

        <section className="portfolio-analysis-progress" aria-label="분석 진행률">
          <div className="portfolio-analysis-progress-label">
            <span>분석 진행률</span>
            <strong>{progress}%</strong>
          </div>
          <div
            className="portfolio-analysis-progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="portfolio-analysis-headline">
          <h1>자금 포트폴리오 생성 중....</h1>
          <p>
            KB의 정교한 알고리즘이 맞춤형 성장을
            <br />
            설계하고 있습니다.
          </p>
        </section>

        <footer className="portfolio-analysis-context">
          <div className="portfolio-analysis-tip">
            <Image src="/portfolio/portfolio-analysis-bulb.svg" alt="" width={15} height={20} />
            <p>
              복잡한 정책 자금 조건들을 AI가 하나하나 대조하여 매칭합니다.
            </p>
          </div>
          <p className="portfolio-analysis-wait">
            잠시만 기다려 주세요. 보통 1분 내외로 완료됩니다.
          </p>
        </footer>
      </div>
    </main>
  );
}
