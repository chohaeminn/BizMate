import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { loadPortfolioFlowInput } from "@/lib/portfolioSession";
import { mergePortfolioLlmOutput, type PortfolioOption } from "./portfolioData";

const fallbackSteps = [
  { step: 1, title: "지원 자격과 중복수혜 조건 확인", description: "각 기관의 최신 공고문을 확인해 주세요." },
  { step: 2, title: "필요 서류 준비", description: "사업자 정보와 자금 사용 계획 증빙을 준비해 주세요." },
  { step: 3, title: "기관 상담 후 신청", description: "심사 조건과 실제 일정을 확인한 뒤 신청해 주세요." },
];

const fallbackDocuments = ["사업자등록증", "자금 사용 계획서", "견적서", "최근 매출자료"];

export default function PortfolioRoadmapPage() {
  const router = useRouter();
  const [option, setOption] = useState<PortfolioOption | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const input = loadPortfolioFlowInput();
    const cacheKey = `bizmate-portfolio-result-v3:${JSON.stringify(input)}`;
    const cached = window.sessionStorage.getItem(cacheKey);
    if (!cached) return;

    try {
      const parsed = JSON.parse(cached) as {
        output: string;
        calculations: Parameters<typeof mergePortfolioLlmOutput>[1];
      };
      const result = mergePortfolioLlmOutput(parsed.output, parsed.calculations);
      const requestedType = Array.isArray(router.query.type)
        ? router.query.type[0]
        : router.query.type;
      setOption(result.options.find((item) => item.slug === requestedType) ?? result.options[0] ?? null);
    } catch (error) {
      console.error("포트폴리오 로드맵 캐시를 읽지 못했습니다.", error);
    }
  }, [router.isReady, router.query.type]);

  const roadmapSteps = option?.roadmap?.length ? option.roadmap : fallbackSteps;
  const documents = option?.requiredDocuments?.length
    ? option.requiredDocuments
    : fallbackDocuments;

  return (
    <main className="landing">
      <div className="mobile-screen portfolio-screen portfolio-roadmap-screen">
        <header className="portfolio-header">
          <Link href="/portfolio/result" className="icon-button" aria-label="이전 화면으로 이동">
            <Image src="/portfolio/portfolio-roadmap-back.svg" alt="" width={24} height={24} />
          </Link>
          <h1>KB BizMate AI - 자금 포트폴리오</h1>
        </header>

        <div className="portfolio-content portfolio-step-content">
          <section className="portfolio-title-section portfolio-funded-title">
            <h2>신청 방법 보기</h2>
            <p>선택한 포트폴리오를 실행하는 순서에요</p>
          </section>

          <section className="portfolio-progress" aria-label="진행 단계">
            <div className="portfolio-progress-count">
              <strong>6</strong>
              <span>/ 6</span>
            </div>
            <div className="portfolio-progress-track portfolio-progress-track-step6">
              <div />
            </div>
          </section>

          <section className="portfolio-roadmap-card" aria-label="신청 실행 로드맵">
            {roadmapSteps.map(({ step, title, description }, index) => (
              <div className="portfolio-roadmap-step" key={`${step}-${title}`}>
                <span>{step || index + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="portfolio-documents">
            <h2>준비 서류</h2>
            <div>
              {documents.map((document) => (
                <span key={document}>{document}</span>
              ))}
            </div>
          </section>
        </div>

        <footer className="portfolio-roadmap-footer">
          <Link href="/support-programs/apply/consult" className="portfolio-roadmap-consult">
            영업점 담당자 유선 상담 예약하기
          </Link>
          <Link href="/service" className="portfolio-later-button">
            나중에 하기
          </Link>
        </footer>
      </div>
    </main>
  );
}
