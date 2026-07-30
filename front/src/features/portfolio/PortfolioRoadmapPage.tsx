import Image from "next/image";
import Link from "next/link";

const roadmapSteps = [
  ["시설개선 지원금 중복수혜 여부 확인", "예상 소요 1일"],
  ["대구 시설개선 지원금 신청", "마감일 8월 10일"],
  ["소상공인 정책자금 사전 상담", "지원금 심사와 병행 가능"],
  ["대구신용보증재단 보증 신청", "부족금 1,500만 원 기준"],
  ["KB 보증부 대출 실행", "보증서 승인 후 진행"],
];

const documents = ["사업자등록증", "견적서", "통장사본", "최근 매출자료"];

export default function PortfolioRoadmapPage() {
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
            {roadmapSteps.map(([title, description], index) => (
              <div className="portfolio-roadmap-step" key={title}>
                <span>{index + 1}</span>
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
