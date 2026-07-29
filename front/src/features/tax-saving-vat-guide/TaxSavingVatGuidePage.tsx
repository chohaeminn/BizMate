import Image from "next/image";
import Link from "next/link";

const overviewRows = [
  { label: "신고 대상", value: "2026년 1월 1일 ~ 6월 30일 거래분" },
  { label: "신고 기간", value: "2026.07.01 (수) ~ 2026.07.25 (금)" },
  { label: "납부 기한", value: "2026.07.25 (금)" },
  { label: "세목", value: "부가가치세" },
  { label: "신고 대상자", value: "일반과세자 (간이과세자 포함)" },
];

const guideSteps = ["신고 대상 확인", "신고 준비", "신고 방법", "납부 방법"];

const guideTargets = [
  "일반과세자",
  "간이과세자 (직전 과세기간 공급대가 4,800만원 이상)",
  "법인사업자 및 개인사업자",
  "국내에서 사업을 영위하는 외국법인·외국인 사업자",
];

const checklistItems = [
  { label: "세금계산서 발행 내역 확인", checked: true },
  { label: "매입세금계산서 수취 내역 확인" },
  { label: "신용카드 매출전표 수령 내역 확인" },
  { label: "현금영수증 발급 및 수취 내역 확인" },
];

const resources = ["부가가치세 확정신고 안내문", "부가가치세 신고서식"];

export default function TaxSavingVatGuidePage() {
  return (
    <main className="landing">
      <div className="mobile-screen tax-vat-screen">
        <header className="tax-saving-header">
          <div className="tax-saving-header-left">
            <Link href="/tax-saving" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/tax-saving/tax-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI - 스마트 절세</h1>
          </div>
        </header>

        <div className="tax-vat-content">
          <section className="tax-vat-hero" aria-labelledby="tax-vat-title">
            <div className="tax-vat-title-copy">
              <div className="tax-vat-title-row">
                <span>세무 마감일</span>
              </div>
              <h2 id="tax-vat-title">
                제1기 부가가치세
                <br />
                확정신고
              </h2>
              <p>2026.07.25 (금) 마감</p>
            </div>
          </section>

          <section className="tax-vat-card" aria-labelledby="tax-vat-overview-title">
            <h3 id="tax-vat-overview-title">일정 개요</h3>
            <dl className="tax-vat-overview">
              {overviewRows.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="tax-vat-section" aria-labelledby="tax-vat-guide-title">
            <h3 id="tax-vat-guide-title">상세 가이드</h3>
            <div className="tax-vat-step-scroll" aria-label="상세 가이드 단계">
              {guideSteps.map((step, index) => (
                <button className={index === 0 ? "active" : ""} type="button" key={step}>
                  <span>{index + 1}</span>
                  {step}
                </button>
              ))}
            </div>

            <div className="tax-vat-guide-box">
              <p>
                아래에 해당하는 사업자는
                <br />
                부가가치세 확정신고 대상입니다.
              </p>
              <ol>
                {guideTargets.map((target) => (
                  <li key={target}>{target}</li>
                ))}
              </ol>
            </div>
          </section>

          <section className="tax-vat-section" aria-labelledby="tax-vat-check-title">
            <h3 id="tax-vat-check-title">신고 전 체크리스트</h3>
            <div className="tax-vat-checklist">
              {checklistItems.map((item) => (
                <label key={item.label}>
                  <span className={item.checked ? "checked" : ""} aria-hidden="true" />
                  {item.label}
                </label>
              ))}
            </div>
          </section>

          <section className="tax-vat-section tax-vat-resources" aria-labelledby="tax-vat-resources-title">
            <h3 id="tax-vat-resources-title">관련 서식 및 자료</h3>
            <div>
              {resources.map((resource) => (
                <article key={resource}>
                  <Image src="/tax-saving/vat-resource-document.png" alt="" width={25} height={32} />
                  <strong>{resource}</strong>
                  <button type="button">
                    <Image src="/tax-saving/vat-resource-download.png" alt="" width={15} height={18} />
                    다운로드
                  </button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
