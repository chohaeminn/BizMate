import Image from "next/image";
import Link from "next/link";

const steps = [
  { label: "본인 인증", icon: "/figma-assets/complete-step-user.svg", done: true },
  { label: "사업자 인\n증", icon: "/figma-assets/complete-step-business.svg", done: true },
  { label: "신청정보\n입력", icon: "/figma-assets/complete-step-form.svg", done: true },
  { label: "자동 서류\n제출", icon: "/figma-assets/complete-step-upload.svg", active: true },
  { label: "심사", icon: "/figma-assets/complete-step-review.svg" },
  { label: "대출 실행", icon: "/figma-assets/complete-step-loan.svg" },
];

const processItems = [
  {
    title: "보증기관 심사",
    badge: "발급기관",
    description: "대구신용보증재단에서 보증 심사가 진행됩니다.",
    duration: "1~3 영업일",
    memo: ["대구신용보증재단", "보증심사 진행 후", "보증 승인 여부를", "결정합니다"],
  },
  {
    title: "KB국민은행 심사",
    badge: "은행",
    description: "보증 승인 후 KB국민은행에서 최종 대출 심사를 진행합니다.",
    duration: "당일~1 영업일",
    memo: ["KB국민은행", "고객 신용도와", "대출조건을", "최종 심사합니다"],
  },
  {
    title: "대출 실행",
    description: "모든 심사 완료 후 등록된 계좌로 대출금이 입금됩니다.",
    memo: ["KB국민은행", "대출 실행 완료 시", "PUSH 알림을", "보내드립니다"],
  },
];

export default function SupportProgramApplyCompletePage() {
  return (
    <main className="landing">
      <div className="mobile-screen complete-screen">
        <header className="complete-header">
          <div className="complete-header-left">
            <Link href="/support-programs/apply" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/figma-assets/complete-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI</h1>
          </div>
          <div className="complete-header-actions">
            <button className="icon-button" type="button" aria-label="검색">
              <Image src="/figma-assets/complete-search.svg" alt="" width={24} height={24} />
            </button>
            <Link href="/" className="icon-button" aria-label="홈으로 이동">
              <Image src="/figma-assets/complete-home.svg" alt="" width={24} height={24} />
            </Link>
            <button className="icon-button" type="button" aria-label="메뉴 열기">
              <Image src="/figma-assets/complete-menu.svg" alt="" width={24} height={24} />
            </button>
          </div>
        </header>

        <div className="complete-content">
          <section className="complete-banner" aria-labelledby="complete-title">
            <div className="complete-title-row">
              <span>
                <Image src="/figma-assets/complete-check.svg" alt="" width={16} height={16} />
              </span>
              <h2 id="complete-title">
                신청이 <strong>완료</strong>되었습니다.
              </h2>
            </div>
            <p>
              KB스타뱅킹에서 보증서 대출 신청이 정상적으로
              <br />
              접수되었습니다.
            </p>
          </section>

          <section className="complete-section" aria-labelledby="complete-progress-title">
            <h2 id="complete-progress-title">신청 진행 과정</h2>
            <div className="complete-step-card">
              <div className="complete-step-line" aria-hidden="true" />
              {steps.map((step, index) => (
                <div
                  className={`complete-step ${step.done ? "done" : ""} ${step.active ? "active" : ""}`}
                  key={step.label}
                >
                  <div className="complete-step-icon">
                    <Image src={step.icon} alt="" width={24} height={24} />
                  </div>
                  <span className="complete-step-state">
                    {step.done ? (
                      <Image src="/figma-assets/complete-step-done.svg" alt="" width={12} height={12} />
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
            </div>
          </section>

          <section className="complete-section process-guide" aria-labelledby="process-guide-title">
            <h2 id="process-guide-title">앞으로 진행되는 절차 안내</h2>
            <div className="process-list">
              {processItems.map((item, index) => (
                <div className="process-item-wrap" key={item.title}>
                  <article className="process-item">
                    <div className="process-copy">
                      <div className="process-title-row">
                        <h3>{item.title}</h3>
                        {item.badge ? <span>{item.badge}</span> : null}
                      </div>
                      <p>{item.description}</p>
                      {item.duration ? (
                        <div className="process-duration">
                          <span>예상 소요</span>
                          <strong>{item.duration}</strong>
                        </div>
                      ) : null}
                    </div>
                    <div className="process-memo">
                      {item.memo.map((line) => (
                        <p key={line}>{line}</p>
                      ))}
                    </div>
                  </article>
                  {index < processItems.length - 1 ? <div className="process-divider" aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="complete-bottom-cta">
          <Link href="/support-programs/apply/status" className="complete-status-button">
            신청현황 보기
            <Image src="/figma-assets/complete-arrow.svg" alt="" width={20} height={20} />
          </Link>
        </div>
      </div>
    </main>
  );
}
