import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type TaxEstimate = {
  sales_tax?: number | null;
  purchase_tax?: number | null;
  estimated_payable_tax?: number | null;
  previous_period_delta?: number | null;
  sales_growth_rate?: number | null;
  purchase_deduction_rate?: number | null;
};

type TaxRecommendation = {
  id: string;
  title: string;
  category: string;
  priority: number;
  expected_saving_amount?: number | null;
  difficulty?: string;
  reason?: string;
  detail_items?: string[];
  simulation?: {
    monthly_payment?: number;
    annual_payment?: number;
    deduction_limit?: number;
    deductible_amount?: number;
    applied_tax_rate?: number;
    expected_saving_amount?: number;
  };
  action_guide?: string[];
  source?: { document_name?: string; section?: string };
};

type TaxAiOutput = {
  summary?: string;
  tax_estimate?: TaxEstimate;
  recommendations?: TaxRecommendation[];
  guide_messages?: string[];
  tax_guide_message?: string;
  missing_inputs?: string[];
  disclaimer?: string;
};

type GuideApiResponse = {
  output: string;
  tax_schedule: { title: string; note: string | null; schedule_date: string } | null;
};

function parseAiOutput(output: string): TaxAiOutput {
  return JSON.parse(output.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")) as TaxAiOutput;
}

function formatWon(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value).toLocaleString("ko-KR")}원`
    : "계산 정보 부족";
}

function formatPercent(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? `${value > 0 ? "+" : ""}${value.toFixed(1)}%` : "-";
}

function formatPeriod(date?: string) {
  if (!date) return "세무일정 확인 필요";
  const [year, month] = date.split("-");
  return `${year}년 ${Number(month)}월 기준`;
}

export default function TaxSavingGuidePage() {
  const [result, setResult] = useState<TaxAiOutput | null>(null);
  const [schedule, setSchedule] = useState<GuideApiResponse["tax_schedule"]>(null);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const loadGuide = async (force = false) => {
    if (isRefreshing && force) return;
    const cacheKey = "bizmate-tax-guide-v4";
    if (!force) {
      const cached = window.sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as GuideApiResponse;
          setResult(parseAiOutput(parsed.output));
          setSchedule(parsed.tax_schedule);
          setIsRefreshing(false);
          return;
        } catch {
          window.sessionStorage.removeItem(cacheKey);
        }
      }
    }

    setIsRefreshing(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/tax-saving/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: force }),
      });
      if (!response.ok) throw new Error(`tax-saving-ai 호출 실패 (${response.status})`);
      const data = await response.json() as GuideApiResponse;
      const output = parseAiOutput(data.output);
      window.sessionStorage.setItem(cacheKey, JSON.stringify(data));
      setResult(output);
      setSchedule(data.tax_schedule);
    } catch (error) {
      console.error(error);
      setErrorMessage("AI 절세 가이드를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadGuide();
    // 최초 진입 시 한 번만 실행합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const recommendation = [...(result?.recommendations ?? [])].sort((a, b) => a.priority - b.priority)[0];
  const estimate = result?.tax_estimate;
  const expectedSaving = result?.recommendations?.reduce(
    (sum, item) => sum + (item.expected_saving_amount ?? 0), 0,
  ) ?? 0;
  const comparison = typeof estimate?.previous_period_delta === "number"
    ? `이전 기간 대비 ${formatWon(Math.abs(estimate.previous_period_delta))} ${estimate.previous_period_delta <= 0 ? "↓" : "↑"}`
    : "이전 기간 비교 정보 부족";
  const breakdownItems = [
    { label: "매출 세액", amount: formatWon(estimate?.sales_tax), tone: "blue" },
    { label: "매입 세액 (공제 가능)", amount: formatWon(estimate?.purchase_tax), tone: "green" },
    { label: "예상 납부 세액", amount: formatWon(estimate?.estimated_payable_tax), tone: "red" },
  ];
  const metricItems = [
    { label: "매출 증가율", value: formatPercent(estimate?.sales_growth_rate), description: "이전 기간 대비", icon: "/tax-saving/tax-guide-sales.svg", tone: "blue" },
    { label: "매입 공제율", value: formatPercent(estimate?.purchase_deduction_rate), description: "공제 가능 비율", icon: "/tax-saving/tax-guide-deduction.svg", tone: "green" },
    { label: "예상 납부 세액", value: formatWon(estimate?.estimated_payable_tax), description: comparison, icon: "", tone: "red" },
  ];

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
              <p>{result?.summary ?? (isRefreshing ? "사업자 정보와 세무일정을 분석하고 있어요." : "입력 정보를 기준으로 절세 항목을 확인해 보세요.")}</p>
            </div>
            <div className="tax-guide-date">
              <Image src="/tax-saving/tax-guide-calendar.svg" alt="" width={14} height={16} />
              <strong>{formatPeriod(schedule?.schedule_date)}</strong>
            </div>
          </section>

          {recommendation ? (
            <section className="tax-guide-recommend" aria-labelledby="tax-recommend-title">
              <div className="tax-guide-card-heading"><h2 id="tax-recommend-title">이번달 추천</h2><span>최우선 추천</span></div>
              <div className="tax-guide-recommend-main">
                <div className="tax-guide-umbrella"><Image src="/tax-saving/tax-guide-umbrella.svg" alt="" width={64} height={64} /></div>
                <div className="tax-guide-recommend-copy">
                  <h3>{recommendation.title}</h3>
                  <p>{recommendation.reason || "입력된 사업자 정보 기준으로 검토를 추천드립니다."}</p>
                  <ul>{(recommendation.detail_items ?? []).map((text) => <li key={text}><Image src="/tax-saving/tax-guide-check.svg" alt="" width={11} height={11} />{text}</li>)}</ul>
                </div>
              </div>
              <div className="tax-guide-recommend-stats">
                <div><span>예상 절세액</span><strong>{formatWon(recommendation.expected_saving_amount)}</strong></div>
                <div><span>검토 난이도</span><div className="tax-guide-difficulty"><strong>{recommendation.difficulty || "확인 필요"}</strong><i /></div></div>
              </div>
              <Link href="/tax-saving/guide/detail" className="tax-guide-detail-button">상세 내용 보기<Image src="/tax-saving/tax-guide-chevron.svg" alt="" width={5} height={9} /></Link>
            </section>
          ) : null}

          <section className="tax-guide-estimate" aria-labelledby="tax-estimate-title">
            <div className="tax-guide-estimate-heading">
              <div><h2 id="tax-estimate-title">실시간 예상 세액</h2><button className={`tax-guide-live-button ${isRefreshing ? "loading" : ""}`} type="button" onClick={() => void loadGuide(true)} disabled={isRefreshing}>AI로 업데이트<i /></button></div>
              <p>{formatPeriod(schedule?.schedule_date)}</p>
            </div>
            {errorMessage ? <p className="tax-guide-error" role="alert">{errorMessage}</p> : null}
            <div className="tax-guide-result-only"><div className="tax-guide-donut" aria-label={`예상 납부 세액 ${formatWon(estimate?.estimated_payable_tax)}`}><div className="tax-guide-donut-hole"><span>예상 납부 세액</span><strong>{formatWon(estimate?.estimated_payable_tax)}</strong><p>{comparison}</p></div></div></div>
            <div className="tax-guide-breakdown">{breakdownItems.map((item) => <div className="tax-guide-breakdown-row" key={item.label}><span><i className={item.tone} />{item.label}</span><strong>{item.amount}</strong></div>)}</div>
            <aside className="tax-guide-ai-tip"><div><p>AI 추천 검토 시</p><strong>예상 <span>{formatWon(expectedSaving)}</span> 절세 가능</strong></div><div className="tax-guide-robot"><Image src="/tax-saving/tax-guide-robot.svg" alt="" width={40} height={40} /></div></aside>
            {(result?.guide_messages ?? (result?.tax_guide_message ? [result.tax_guide_message] : [])).map((message) => <p className="tax-guide-message" key={message}>{message}</p>)}
            {result?.missing_inputs?.length ? <p className="tax-guide-missing">추가 확인 필요: {result.missing_inputs.join(", ")}</p> : null}
            {result?.disclaimer ? <p className="tax-guide-disclaimer">{result.disclaimer}</p> : null}
          </section>

          <section className="tax-guide-metrics" aria-label="주요 세무 지표">{metricItems.map((item) => <article className="tax-guide-metric" key={item.label}><div className={`tax-guide-metric-icon ${item.tone}`}>{item.icon ? <Image src={item.icon} alt="" width={20} height={18} /> : <span className="tax-guide-tax-icon" aria-hidden="true" />}</div><div><p>{item.label}</p><strong>{item.value}</strong><span className={item.tone === "red" ? "blue-copy" : ""}>{item.description}</span></div></article>)}</section>
        </div>
      </div>
    </main>
  );
}
