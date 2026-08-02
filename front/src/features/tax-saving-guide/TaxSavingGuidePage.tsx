import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type TaxAiOutput = {
  summary?: string;
  tax_estimate?: {
    sales_tax?: number | null;
    purchase_tax?: number | null;
    estimated_payable_tax?: number | null;
    previous_period_delta?: number | null;
    sales_growth_rate?: number | null;
    purchase_deduction_rate?: number | null;
  };
  recommendations?: Array<{
    id: string;
    title: string;
    priority: number;
    expected_saving_amount?: number | null;
    difficulty?: string;
    reason?: string;
    detail_items?: string[];
  }>;
  guide_messages?: string[];
  missing_inputs?: string[];
  disclaimer?: string;
};

function formatWon(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value).toLocaleString("ko-KR")}원`
    : "계산 정보 부족";
}

function formatPercent(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value > 0 ? "+" : ""}${value.toFixed(1)}%`
    : "-";
}

const recommendationBullets = [
  "소득공제 한도 내 최대 공제 가능",
  "사업소득자의 안정적 노후 대비",
  "법적 보호 및 복지 혜택 제공",
];

const missingInputLabels: Record<string, string> = {
  "tax_input.period_start": "세무 계산 시작일",
  "tax_input.period_end": "세무 계산 종료일",
  "tax_input.amount_basis": "금액 입력 기준",
  "tax_input.sales_amount": "과세기간 매출 공급가액",
  "tax_input.purchase_amount": "공제 가능한 매입 공급가액",
  "tax_input.simulation_tax_rate": "절세 시뮬레이션 적용 세율",
  "tax_input.deduction_candidates": "적용 가능한 공제 항목",
  "tax_input.known_enrollments": "현재 가입한 공제 제도",
  "tax_summary.sales_tax": "계산된 매출세액",
  "tax_summary.purchase_tax": "계산된 매입세액",
  "tax_summary.estimated_payable_tax": "계산된 예상 납부세액",
  "사업자 유형(개인사업자 또는 법인사업자)": "사업자 유형(개인사업자 또는 법인사업자)",
  "사업 관련 세금계산서·사업자 명의 신용카드매출전표·현금영수증 내역": "공제 증빙자료(세금계산서, 사업자 카드전표, 현금영수증)",
  bad_debt_amount: "대손 금액",
  bad_debt_confirmed: "대손 확정 여부",
  vat_reported: "부가가치세 신고 여부",
  business_start_date: "사업 개업일",
  owner_age: "대표자 연령",
  industry_code: "표준산업분류 코드",
  calculated_income_tax: "계산된 소득세액",
  previous_year_revenue: "직전 연도 매출액",
  bookkeeping_status: "장부 작성 상태",
  business_category: "사업자 유형",
  eligible_card_purchase_amount: "공제 가능한 카드 매입액",
  vat_amount: "부가가치세액",
  business_card_registered: "사업용 신용카드 등록 여부",
  eligible_purchase_supply_amount: "공제 가능한 매입 공급가액",
  purchase_vat_amount: "매입 부가가치세액",
  tax_invoice_received: "세금계산서 수취 여부",
};

function formatMissingInput(value: string) {
  return missingInputLabels[value] ?? value.replaceAll("_", " ");
}

function formatGuideMessage(value: string) {
  return value.replaceAll("**", "").trim();
}

export default function TaxSavingGuidePage() {
  const [result, setResult] = useState<TaxAiOutput | null>(null);
  const [analysisDate, setAnalysisDate] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadGuide = async () => {
    setIsRefreshing(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/tax-saving/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error(`tax-saving-ai 호출 실패 (${response.status})`);
      const data = await response.json() as { output: string; analysis_date: string };
      const output = JSON.parse(
        data.output.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""),
      ) as TaxAiOutput;
      setResult(output);
      setAnalysisDate(data.analysis_date);
    } catch (error) {
      console.error(error);
      setErrorMessage("AI 절세 가이드를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadGuide();
  }, []);

  const recommendation = [...(result?.recommendations ?? [])]
    .sort((a, b) => a.priority - b.priority)[0];
  const estimate = result?.tax_estimate;
  const expectedSaving = result?.recommendations?.reduce(
    (sum, item) => sum + (item.expected_saving_amount ?? 0),
    0,
  ) ?? 0;
  const currentEstimate = {
    payableTax: formatWon(estimate?.estimated_payable_tax),
    comparison: typeof estimate?.previous_period_delta === "number"
      ? `이전 기간 대비 ${formatWon(Math.abs(estimate.previous_period_delta))} ${estimate.previous_period_delta <= 0 ? "↓" : "↑"}`
      : "이전 기간 비교 정보 부족",
    breakdownItems: [
      { label: "매출 세액", amount: formatWon(estimate?.sales_tax), tone: "blue" },
      { label: "매입 세액 (공제 가능)", amount: formatWon(estimate?.purchase_tax), tone: "green" },
      { label: "예상 납부 세액", amount: formatWon(estimate?.estimated_payable_tax), tone: "red" },
    ],
    metricItems: [
      { label: "매출 증가율", value: formatPercent(estimate?.sales_growth_rate), description: "이전 기간 대비", icon: "/tax-saving/tax-guide-sales.svg", tone: "blue" },
      { label: "매입 공제율", value: formatPercent(estimate?.purchase_deduction_rate), description: "공제 가능 비율", icon: "/tax-saving/tax-guide-deduction.svg", tone: "green" },
      { label: "예상 납부 세액", value: formatWon(estimate?.estimated_payable_tax), description: "AI 분석 결과", icon: "", tone: "red" },
    ],
  };
  const periodLabel = analysisDate
    ? `${analysisDate.slice(0, 4)}년 ${Number(analysisDate.slice(5, 7))}월 기준`
    : "분석 중";

  const handleRefreshEstimate = () => void loadGuide();

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
                {result?.summary ?? "사업자 정보와 세무일정을 AI가 분석하고 있어요."}
              </p>
            </div>
            <div className="tax-guide-date">
              <Image src="/tax-saving/tax-guide-calendar.svg" alt="" width={14} height={16} />
              <strong>{periodLabel}</strong>
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
                <h3>{recommendation?.title ?? (isRefreshing ? "AI 분석 중" : "추천 정보 부족")}</h3>
                <p>
                  {recommendation?.reason ?? "확인된 정보를 기준으로 절세 항목을 검토합니다."}
                </p>
                <ul>
                  {(recommendation?.detail_items ?? recommendationBullets).map((text) => (
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
                <strong>{formatWon(recommendation?.expected_saving_amount)}</strong>
              </div>
              <div>
                <span>가입 난이도</span>
                <div className="tax-guide-difficulty">
                  <strong>{recommendation?.difficulty ?? "확인 필요"}</strong>
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
                  {isRefreshing ? "AI 분석 중" : "AI로 업데이트"}
                  <i />
                </button>
              </div>
              <p>{periodLabel}</p>
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
                  예상 <span>{formatWon(expectedSaving)}</span> 절세 가능
                </strong>
              </div>
              <div className="tax-guide-robot">
                <Image src="/tax-saving/tax-guide-robot.svg" alt="" width={40} height={40} />
              </div>
            </aside>
            {errorMessage ? <p className="tax-guide-error" role="alert">{errorMessage}</p> : null}
            {result?.guide_messages?.map((message) => (
              <p className="tax-guide-message" key={message}>{formatGuideMessage(message)}</p>
            ))}
            {result?.missing_inputs?.length ? (
              <aside className="tax-guide-missing">
                <strong>추가 정보가 필요해요</strong>
                <p>아래 정보를 입력하면 더 정확한 절세 분석을 받을 수 있어요.</p>
                <ul>
                  {result.missing_inputs.map((value, index) => (
                    <li key={`${value}-${index}`}>{formatMissingInput(value)}</li>
                  ))}
                </ul>
              </aside>
            ) : null}
            {result?.disclaimer ? <p className="tax-guide-disclaimer">{result.disclaimer}</p> : null}
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
