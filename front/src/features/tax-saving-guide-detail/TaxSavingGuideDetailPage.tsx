import Image from "next/image";
import Link from "next/link";

const detailItems = [
  "월 30만원 납입 시 연간 360만원 소득공제 가능",
  "납입 금액은 전액 필요경비 처리 가능",
  "폐업·노령 등 사유 발생 시 공제금 수령 가능",
  "압류로부터 공제금 보호 (법적 보호)",
];

const simulationRows = [
  { label: "과세표준", current: "46,000,000원", after: "42,400,000원" },
  { label: "산출세액", current: "6,900,000원", after: "6,360,000원" },
  { label: "예상 절세액", current: "-", after: "540,000원", highlight: true },
];

export default function TaxSavingGuideDetailPage() {
  return (
    <main className="landing">
      <div className="mobile-screen tax-detail-screen">
        <header className="tax-saving-header">
          <div className="tax-saving-header-left">
            <Link href="/tax-saving/guide" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/tax-saving/tax-guide-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI - 스마트 절세</h1>
          </div>
        </header>

        <div className="tax-detail-content">
          <section className="tax-detail-hero" aria-labelledby="tax-detail-title">
            <div className="tax-detail-tags">
              <span className="green">AI 추천</span>
              <span className="yellow">소득공제</span>
            </div>
            <h2 id="tax-detail-title">노란우산공제 가입</h2>

            <div className="tax-detail-effect-card">
              <div className="tax-detail-character">
                <Image src="/tax-saving/tax-detail-character.png" alt="" width={92} height={92} />
              </div>
              <div className="tax-detail-effect">
                <span>예상 절세 효과</span>
                <strong>연간 540,000원</strong>
              </div>
            </div>
          </section>

          <section className="tax-detail-section" aria-labelledby="tax-reason-title">
            <h3 id="tax-reason-title">추천 이유</h3>
            <p>
              현재 고객님은 노란우산공제에 가입되어 있지 않습니다.
              <br />
              노란우산공제는 소기업·소상공인의 안정적인 노후를 지원하는 공제 제도로, 연간 최대
              500만원까지 소득공제를 받을 수 있어 세금 부담을 효과적으로 줄일 수 있습니다.
            </p>
          </section>

          <section className="tax-detail-section" aria-labelledby="tax-detail-list-title">
            <h3 id="tax-detail-list-title">상세 내용</h3>
            <ul className="tax-detail-check-list">
              {detailItems.map((item) => (
                <li key={item}>
                  <i aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="tax-detail-section" aria-labelledby="tax-simulation-title">
            <h3 id="tax-simulation-title">예상 절세 시뮬레이션</h3>
            <div className="tax-detail-table" role="table" aria-label="예상 절세 시뮬레이션">
              <div className="tax-detail-table-row head" role="row">
                <span role="columnheader">구분</span>
                <span role="columnheader">현재 (미가입)</span>
                <span role="columnheader">가입 후</span>
              </div>
              {simulationRows.map((row) => (
                <div className={`tax-detail-table-row ${row.highlight ? "highlight" : ""}`} role="row" key={row.label}>
                  <strong role="cell">{row.label}</strong>
                  <span role="cell">{row.current}</span>
                  <span role="cell">{row.after}</span>
                </div>
              ))}
            </div>
            <p className="tax-detail-note">※ 위 금액은 예상치이며, 실제 절세액은 개인의 상황에 따라 달라질 수 있습니다.</p>
          </section>

          <section className="tax-detail-section" aria-labelledby="tax-reference-title">
            <h3 id="tax-reference-title">참고 자료</h3>
            <div className="tax-detail-reference">
              <i aria-hidden="true" />
              <div>
                <strong>절세가이드북_2026.pdf</strong>
                <span>34~37p</span>
              </div>
              <button type="button">PDF 열기</button>
            </div>
          </section>

          <Link href="/tax-saving/guide" className="tax-detail-back-button">
            이전으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
