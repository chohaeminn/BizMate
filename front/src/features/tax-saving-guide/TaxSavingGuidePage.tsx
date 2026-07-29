import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const recommendationBullets = [
  "소득공제 한도 내 최대 공제 가능",
  "사업소득자의 안정적 노후 대비",
  "법적 보호 및 복지 혜택 제공",
];

const estimateSnapshots = [
  {
    payableTax: "1,450,000원",
    comparison: "전월 대비 45,000원 ↓",
    breakdownItems: [
      { label: "매출 세액 (공급가액의 10%)", amount: "15,200,000원", tone: "blue" },
      { label: "매입 세액 (공제 가능)", amount: "8,420,000원", tone: "green" },
      { label: "공제 후 납부 세액", amount: "1,450,000원", tone: "red" },
    ],
    metricItems: [
      {
        label: "매출 증가율",
        value: "+8.3%",
        description: "(전월 대비)",
        icon: "/tax-saving/tax-guide-sales.svg",
        tone: "blue",
      },
      {
        label: "매입 공제율",
        value: "55.5%",
        description: "(공제 가능 비율)",
        icon: "/tax-saving/tax-guide-deduction.svg",
        tone: "green",
      },
      {
        label: "예상 납부 세액",
        value: "1,450,000원",
        description: "(전월 대비 45,000원 ↓)",
        icon: "",
        tone: "red",
      },
    ],
  },
  {
    payableTax: "1,405,000원",
    comparison: "방금 업데이트됨",
    breakdownItems: [
      { label: "매출 세액 (공급가액의 10%)", amount: "15,360,000원", tone: "blue" },
      { label: "매입 세액 (공제 가능)", amount: "8,690,000원", tone: "green" },
      { label: "공제 후 납부 세액", amount: "1,405,000원", tone: "red" },
    ],
    metricItems: [
      {
        label: "매출 증가율",
        value: "+8.6%",
        description: "(전월 대비)",
        icon: "/tax-saving/tax-guide-sales.svg",
        tone: "blue",
      },
      {
        label: "매입 공제율",
        value: "56.6%",
        description: "(공제 가능 비율)",
        icon: "/tax-saving/tax-guide-deduction.svg",
        tone: "green",
      },
      {
        label: "예상 납부 세액",
        value: "1,405,000원",
        description: "(업데이트 반영)",
        icon: "",
        tone: "red",
      },
    ],
  },
];

export default function TaxSavingGuidePage() {
  const [snapshotIndex, setSnapshotIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentEstimate = estimateSnapshots[snapshotIndex];

  const handleRefreshEstimate = () => {
    if (isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    window.setTimeout(() => {
      setSnapshotIndex((current) => (current + 1) % estimateSnapshots.length);
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <main className="landing">
      <div className="mobile-screen tax-guide-screen">
        <header className="tax-saving-header">
          <div className="tax-saving-header-left">
            <Link href="/tax-saving" className="icon-button" aria-label="이전 화면으로 이동">
              <Image src="/tax-saving/tax-guide-back.svg" alt="" width={24} height={24} />
            </Link>
            <h1>KB BizMate AI - 스마트 절세</h1>
          </div>
        </header>

        <div className="tax-guide-content">
          <section className="tax-guide-title" aria-labelledby="tax-guide-title">
            <div>
              <h2 id="tax-guide-title">AI 절세 추천</h2>
              <p>
                사장님에게 꼭 맞는 절세 전략과 실시간
                <br />
                세액을 확인해보세요.
              </p>
            </div>
            <div className="tax-guide-date">
              <Image src="/tax-saving/tax-guide-calendar.svg" alt="" width={14} height={16} />
              <strong>2026년 7월 기준</strong>
            </div>
          </section>

          <section className="tax-guide-recommend" aria-labelledby="tax-recommend-title">
            <div className="tax-guide-card-heading">
              <h2 id="tax-recommend-title">이번달 추천</h2>
              <span>최우선 추천</span>
            </div>

            <div className="tax-guide-recommend-main">
              <div className="tax-guide-umbrella">
                <Image src="/tax-saving/tax-guide-umbrella.svg" alt="" width={64} height={64} />
              </div>
              <div className="tax-guide-recommend-copy">
                <h3>노란우산공제 가입</h3>
                <p>
                  월 30만원씩 납부 시
                  <br />
                  연간 최대 <strong>540,000원</strong> 절세!
                </p>
                <ul>
                  {recommendationBullets.map((text) => (
                    <li key={text}>
                      <Image src="/tax-saving/tax-guide-check.svg" alt="" width={11} height={11} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="tax-guide-recommend-stats">
              <div>
                <span>예상 절세액 (연간)</span>
                <strong>540,000 원</strong>
              </div>
              <div>
                <span>가입 난이도</span>
                <div className="tax-guide-difficulty">
                  <strong>쉬움</strong>
                  <i />
                </div>
              </div>
            </div>

            <Link href="/tax-saving/guide/detail" className="tax-guide-detail-button">
              상세 내용 보기
              <Image src="/tax-saving/tax-guide-chevron.svg" alt="" width={5} height={9} />
            </Link>
          </section>

          <section className="tax-guide-estimate" aria-labelledby="tax-estimate-title">
            <div className="tax-guide-estimate-heading">
              <div>
                <h2 id="tax-estimate-title">실시간 예상 세액</h2>
                <button
                  className={`tax-guide-live-button ${isRefreshing ? "loading" : ""}`}
                  type="button"
                  onClick={handleRefreshEstimate}
                  disabled={isRefreshing}
                  aria-label="실시간 예상 세액 업데이트"
                >
                  클릭해 업데이트
                  <i />
                </button>
              </div>
              <p>2026년 7월 기준</p>
            </div>

            <div className="tax-guide-result-only">
              <div className="tax-guide-donut" aria-label={`예상 납부 세액 ${currentEstimate.payableTax}`}>
                <div className="tax-guide-donut-hole">
                  <span>예상 납부 세액</span>
                  <strong>{currentEstimate.payableTax}</strong>
                  <p>{currentEstimate.comparison}</p>
                </div>
              </div>
            </div>

            <div className="tax-guide-breakdown">
              {currentEstimate.breakdownItems.map((item) => (
                <div className="tax-guide-breakdown-row" key={item.label}>
                  <span>
                    <i className={item.tone} />
                    {item.label}
                  </span>
                  <strong>{item.amount}</strong>
                </div>
              ))}
            </div>

            <aside className="tax-guide-ai-tip">
              <div>
                <p>AI 추천 적용 시</p>
                <strong>
                  추가 <span>45,000원</span> 절세 가능!
                </strong>
              </div>
              <div className="tax-guide-robot">
                <Image src="/tax-saving/tax-guide-robot.svg" alt="" width={40} height={40} />
              </div>
            </aside>
          </section>

          <section className="tax-guide-metrics" aria-label="주요 세무 지표">
            {currentEstimate.metricItems.map((item) => (
              <article className="tax-guide-metric" key={item.label}>
                <div className={`tax-guide-metric-icon ${item.tone}`}>
                  {item.icon ? (
                    <Image src={item.icon} alt="" width={20} height={18} />
                  ) : (
                    <span className="tax-guide-tax-icon" aria-hidden="true" />
                  )}
                </div>
                <div>
                  <p>{item.label}</p>
                  <strong>{item.value}</strong>
                  <span className={item.tone === "red" ? "blue-copy" : ""}>
                    {item.description}
                  </span>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
