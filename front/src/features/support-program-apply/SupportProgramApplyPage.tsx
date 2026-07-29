import Image from "next/image";
import Link from "next/link";

const steps = [
  { label: "본인 인증", icon: "/figma-assets/apply-step-user.svg" },
  { label: "사업자\n인증", icon: "/figma-assets/apply-step-business.svg" },
  { label: "신청정보\n입력", icon: "/figma-assets/apply-step-form.svg" },
  { label: "자동 서류\n제출", icon: "/figma-assets/apply-step-upload.svg", active: true },
  { label: "심사", icon: "/figma-assets/apply-step-review.svg" },
  { label: "대출 실행", icon: "/figma-assets/apply-step-loan.svg" },
];

const documents = [
  { label: "사업자등록증", icon: "/figma-assets/apply-doc-business.svg" },
  { label: "신분증", icon: "/figma-assets/apply-doc-id.svg" },
  { label: "매출 관련 자료", icon: "/figma-assets/apply-doc-business.svg" },
  { label: "국세 납세증명", icon: "/figma-assets/apply-doc-tax.svg" },
  { label: "지방세 납세증명", icon: "/figma-assets/apply-doc-tax.svg" },
];

const notices = [
  "신청 결과는 알림 또는 PUSH로 안내드립니다.",
  "심사 과정에서 추가 서류가 필요할 수 있습니다.",
  "보증 승인 후 대출 실행까지 비대면으로 진행됩니다.",
];

export default function SupportProgramApplyPage() {
  return (
    <main className="landing">
      <div className="mobile-screen apply-screen">
        <header className="apply-header">
          <div className="apply-header-left">
            <Link href="/support-programs" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/figma-assets/apply-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
          <div className="apply-header-actions">
            <button className="icon-button" type="button" aria-label="검색">
              <Image src="/figma-assets/apply-search.svg" alt="" width={24} height={24} />
            </button>
            <Link href="/" className="icon-button" aria-label="홈으로 이동">
              <Image src="/figma-assets/apply-home.svg" alt="" width={24} height={24} />
            </Link>
            <button className="icon-button" type="button" aria-label="메뉴 열기">
              <Image src="/figma-assets/apply-menu.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </header>

        <div className="apply-content">
          <section className="apply-hero">
            <h2>
              영업점 방문 없이
              <br />
              <strong>KB스타뱅킹</strong>에서
              <br />
              신청부터 실행까지 가능합니다.
            </h2>
            <p>간편하고 안전한 비대면 신청 서비스</p>
          </section>

          <section className="apply-section" aria-labelledby="apply-steps-title">
            <h2 id="apply-steps-title">신청 진행 단계</h2>
            <div className="apply-step-card">
              <div className="apply-step-line" aria-hidden="true" />
              {steps.map((step, index) => (
                <div className={`apply-step ${step.active ? "active" : ""}`} key={step.label}>
                  <div className="apply-step-icon">
                    <Image src={step.icon} alt="" width={24} height={24} />
                  </div>
                  <span className="apply-step-number">{index + 1}</span>
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
            </div>
          </section>

          <section className="apply-section" aria-labelledby="apply-documents-title">
            <h2 id="apply-documents-title">자동 제출 가능 서류</h2>
            <div className="apply-doc-card">
              <div className="apply-doc-list">
                {documents.map((document) => (
                  <div className="apply-doc-row" key={document.label}>
                    <div className="apply-doc-name">
                      <Image src={document.icon} alt="" width={32} height={32} />
                      <span>{document.label}</span>
                    </div>
                    <span className="auto-submit-badge">
                      자동 제출
                      <Image src="/figma-assets/apply-check.svg" alt="" width={6} height={6} />
                    </span>
                  </div>
                ))}
              </div>
              <div className="apply-doc-info">
                <Image src="/figma-assets/apply-lock.svg" alt="" width={16} height={16} />
                <p>KB 금융 데이터를 바탕으로 안전하게 자동 제출됩니다.</p>
              </div>
            </div>
          </section>

          <section className="apply-section" aria-labelledby="apply-notice-title">
            <h2 id="apply-notice-title">안내 사항</h2>
            <div className="apply-notice-card">
              {notices.map((notice) => (
                <div className="apply-notice-row" key={notice}>
                  <Image src="/figma-assets/apply-notice-check.svg" alt="" width={16} height={16} />
                  <p>{notice}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="apply-bottom-cta">
          <Link href="/support-programs/apply/complete" aria-label="KB스타뱅킹에서 비대면 신청하기">
            비대면 신청하기
            <Image src="/figma-assets/apply-arrow.svg" alt="" width={20} height={20} />
          </Link>
        </div>
      </div>
    </main>
  );
}
