import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SupportProgram } from "@/data/supportPrograms";

type SupportProgramDetailPageProps = {
  program: SupportProgram;
};

export default function SupportProgramDetailPage({ program }: SupportProgramDetailPageProps) {
  const [isInterested, setIsInterested] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);

  useEffect(() => {
    if (!showInterestModal) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShowInterestModal(false);
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [showInterestModal]);

  const handleInterestClick = () => {
    setIsInterested(true);
    setShowInterestModal(true);
  };

  return (
    <main className="landing">
      <div className="mobile-screen detail-screen">
        <header className="detail-header">
          <div className="detail-header-left">
            <Link href="/service" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/support-program-detail/detail-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
          <div className="detail-header-actions">
            <button className="icon-button" type="button" aria-label="검색">
              <Image src="/support-program-detail/detail-search.svg" alt="" width={24} height={24} />
            </button>
            <Link href="/" className="icon-button" aria-label="홈으로 이동">
              <Image src="/support-program-detail/detail-home.svg" alt="" width={24} height={24} />
            </Link>
            <button className="icon-button" type="button" aria-label="메뉴 열기">
              <Image src="/support-program-detail/detail-menu.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </header>

        <div className="detail-content">
          <section className="program-hero" aria-labelledby="program-title">
            <div className="ai-chip">
              <Image src="/support-program-detail/detail-ai-spark.svg" alt="" width={11} height={10} />
              <span>AI 추천</span>
            </div>
            <h2 id="program-title">
              {program.titleLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < program.titleLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </h2>
            <div className="program-tags">
              {program.tags.map((tag) => (
                <span className={`program-tag ${tag.tone}`} key={tag.label}>
                  {tag.label}
                </span>
              ))}
            </div>
            <p>
              {program.summaryLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < program.summaryLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            <div className="deadline-badge">
              <span>{program.deadlineText}</span>
              <strong>{program.deadlineLabel}</strong>
            </div>
            <span className="hero-star star-one">✦</span>
            <span className="hero-star star-two">✦</span>
          </section>

          <section className="ai-analysis-card" aria-labelledby="analysis-title">
            <div className="analysis-copy">
              <div className="analysis-label">
                <Image src="/support-program-detail/detail-ai-code.svg" alt="" width={16} height={16} />
                <span>AI 분석 결과</span>
              </div>
              <h2 id="analysis-title">{program.analysisTitle}</h2>
              <ul>
                {program.analysisItems.map((item) => (
                  <li key={item}>
                    <Image src="/support-program-detail/detail-check.svg" alt="" width={8} height={8} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="fit-score" aria-label={`적합도 ${program.matchScore}%`}>
              <span>적합도</span>
              <strong>
                {program.matchScore}
                <small>%</small>
              </strong>
            </div>
          </section>

          <section className="program-detail-list" aria-label="지원사업 상세 정보">
            {program.detailRows.map((row) => (
              <div className="program-detail-row" key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </section>

          <section className="inquiry-docs-card" aria-label="문의기관과 필요 서류">
            <article>
              <h2>문의기관</h2>
              <div className="info-block">
                <div className="info-icon">
                  <Image src="/support-program-detail/detail-phone.svg" alt="" width={20} height={20} />
                </div>
                <div>
                  <strong>{program.organizationName}</strong>
                  <p>{program.phoneNumber}</p>
                  <span>{program.contactHours}</span>
                </div>
              </div>
            </article>

            <div className="vertical-divider" />

            <article>
              <h2>필요 서류</h2>
              <div className="info-block">
                <div className="info-icon">
                  <Image src="/support-program-detail/detail-doc.svg" alt="" width={20} height={20} />
                </div>
                <ul>
                  {program.requiredDocuments.map((document) => (
                    <li key={document}>{document}</li>
                  ))}
                </ul>
              </div>
            </article>
          </section>

          <section className="kb-guidance">
            <div>
              <h2>신청 진행은 KB스타뱅킹에서 비대면으로!</h2>
              <p>영업점 방문 없이 KB스타뱅킹에서 간편하게 신청하실 수 있습니다.</p>
            </div>
          </section>
        </div>

        <div className="detail-bottom-cta">
          <button
            className={`detail-interest-button ${isInterested ? "active" : ""}`}
            type="button"
            onClick={handleInterestClick}
            aria-pressed={isInterested}
          >
            <span className="detail-star-icon" aria-hidden="true">
              <Image src="/support-program-detail/detail-star.svg" alt="" width={18} height={20} />
            </span>
            관심사업 등록
          </button>
          <Link href="/support-programs/apply" className="detail-apply-button">
            신청하기
            <Image src="/support-program-detail/detail-arrow.svg" alt="" width={20} height={20} />
          </Link>
        </div>

        {showInterestModal ? (
          <div className="interest-toast-modal" role="status" aria-live="polite">
            관심사업으로 등록했어요
          </div>
        ) : null}
      </div>
    </main>
  );
}
