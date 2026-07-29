import Image from "next/image";
import Link from "next/link";

const steps = [
  { label: "본인 인증", icon: "/apply-status/status-step-user.svg", done: true },
  { label: "사업자 인\n증", icon: "/apply-status/status-step-business.svg", done: true },
  { label: "신청정보\n입력", icon: "/apply-status/status-step-form.svg", done: true },
  { label: "자동 서류\n제출", icon: "/apply-status/status-step-upload.svg", active: true },
  { label: "심사", icon: "/apply-status/status-step-review.svg" },
  { label: "대출 실행", icon: "/apply-status/status-step-loan.svg" },
];

const documents = [
  { label: "사업자등록증", status: "제출 완료", tone: "done", icon: "/apply-status/status-doc-building.svg" },
  { label: "신분증", status: "제출 완료", tone: "done", icon: "/apply-status/status-doc-id.svg" },
  { label: "매출 관련 자료", status: "제출 완료", tone: "done", icon: "/apply-status/status-doc-sales.svg" },
  { label: "국세 납세증명", status: "제출 완료", tone: "done", icon: "/apply-status/status-doc-building.svg" },
  { label: "지방세 납세증명", status: "제출 중", tone: "progress", icon: "/apply-status/status-doc-tax.svg" },
  { label: "4대보험 사업장 가입내역", status: "대기 중", tone: "waiting", icon: "/apply-status/status-doc-tax.svg" },
];

export default function SupportProgramApplyStatusPage() {
  return (
    <main className="landing">
      <div className="mobile-screen status-screen">
        <header className="status-header">
          <div className="status-header-left">
            <Link href="/support-programs/apply/complete" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/apply-status/status-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
          <div className="status-header-actions">
            <button className="icon-button" type="button" aria-label="검색">
              <Image src="/apply-status/status-search.svg" alt="" width={24} height={24} />
            </button>
            <Link href="/" className="icon-button" aria-label="홈으로 이동">
              <Image src="/apply-status/status-home.svg" alt="" width={24} height={24} />
            </Link>
            <button className="icon-button" type="button" aria-label="메뉴 열기">
              <Image src="/apply-status/status-menu.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </header>

        <div className="status-content">
          <section className="status-banner" aria-labelledby="status-title">
            <h2 id="status-title">
              서류 제출부터 심사까지 <strong>진행중</strong>
              <br />
              이에요!
            </h2>
            <p>
              제출 서류는 KB 금융 데이터를 통해 자동으로
              <br />
              안전하게 전달됩니다.
            </p>
          </section>

          <section className="status-step-card" aria-label="신청 진행 단계">
            <div className="status-step-line" aria-hidden="true" />
            {steps.map((step, index) => (
              <div
                className={`status-step ${step.done ? "done" : ""} ${step.active ? "active" : ""}`}
                key={step.label}
              >
                <div className="status-step-icon">
                  <Image src={step.icon} alt="" width={24} height={24} />
                </div>
                <span className="status-step-state">
                  {step.done ? (
                    <Image src="/apply-status/status-step-done.svg" alt="" width={12} height={12} />
                  ) : (
                    index + 1
                  )}
                </span>
                <p>
                  {step.label.split("\n").map((line, lineIndex) => (
                    <span key={line}>
                      {line}
                      {lineIndex < step.label.split("\n").length - 1 ? <br /> : null}
                    </span>
                  ))}
                </p>
              </div>
            ))}
          </section>

          <section className="status-doc-section" aria-labelledby="status-doc-title">
            <h2 id="status-doc-title">서류 제출 현황</h2>
            <div className="status-doc-card">
              {documents.map((document) => (
                <div className="status-doc-row" key={document.label}>
                  <div className="status-doc-name">
                    <span>
                      <Image src={document.icon} alt="" width={20} height={20} />
                    </span>
                    <strong>{document.label}</strong>
                  </div>
                  <div className={`status-doc-state ${document.tone}`}>
                    <span>{document.status}</span>
                    <Image
                      src={
                        document.tone === "done"
                          ? "/apply-status/status-success.svg"
                          : document.tone === "progress"
                            ? "/apply-status/status-sync.svg"
                            : "/apply-status/status-wait.svg"
                      }
                      alt=""
                      width={20}
                      height={20}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        <div className="status-bottom-cta">
          <Link href="/support-programs/apply/consult" className="status-consult-button">
            추가 상담하기
            <Image src="/apply-status/status-arrow.svg" alt="" width={20} height={20} />
          </Link>

          <Link href="/service" className="status-home-button">
            홈으로 돌아가기
            <Image src="/apply-status/status-arrow.svg" alt="" width={20} height={20} />
          </Link>
        </div>
      </div>
    </main>
  );
}
