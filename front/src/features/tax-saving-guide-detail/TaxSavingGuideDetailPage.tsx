import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Recommendation = {
  id: string;
  title: string;
  category: string;
  priority: number;
  expected_saving_amount?: number;
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

type AiOutput = { recommendations?: Recommendation[]; disclaimer?: string };
type CachedGuide = { output: string };

function parseOutput(output: string): AiOutput {
  return JSON.parse(output.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")) as AiOutput;
}

function won(value?: number) {
  return typeof value === "number" ? `${Math.round(value).toLocaleString("ko-KR")}원` : "정보 없음";
}

export default function TaxSavingGuideDetailPage() {
  const [result, setResult] = useState<AiOutput | null>(null);

  useEffect(() => {
    const cached = window.sessionStorage.getItem("bizmate-tax-guide-v4");
    if (!cached) return;
    try {
      setResult(parseOutput((JSON.parse(cached) as CachedGuide).output));
    } catch {
      window.sessionStorage.removeItem("bizmate-tax-guide-v4");
    }
  }, []);

  const recommendation = useMemo(
    () => [...(result?.recommendations ?? [])].sort((a, b) => a.priority - b.priority)[0],
    [result],
  );
  const simulation = recommendation?.simulation;
  const simulationRows = [
    { label: "월 납입액", current: "0원", after: won(simulation?.monthly_payment) },
    { label: "연간 납입액", current: "0원", after: won(simulation?.annual_payment) },
    { label: "소득공제 적용액", current: "0원", after: won(simulation?.deductible_amount) },
    { label: "예상 절세액", current: "0원", after: won(simulation?.expected_saving_amount ?? recommendation?.expected_saving_amount), highlight: true },
  ];

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
          {!recommendation ? (
            <section className="tax-detail-section">
              <h2>절세 추천 결과가 없습니다.</h2>
              <p>절세 추천 화면에서 AI 분석을 먼저 실행해 주세요.</p>
            </section>
          ) : (
            <>
              <section className="tax-detail-hero" aria-labelledby="tax-detail-title">
                <div className="tax-detail-tags"><span className="green">AI 추천</span><span className="yellow">{recommendation.category}</span></div>
                <h2 id="tax-detail-title">{recommendation.title}</h2>
                <div className="tax-detail-effect-card">
                  <div className="tax-detail-character"><Image src="/tax-saving/tax-detail-character.png" alt="" width={92} height={92} /></div>
                  <div className="tax-detail-effect"><span>예상 절세 효과</span><strong>연간 {won(recommendation.expected_saving_amount)}</strong></div>
                </div>
              </section>

              <section className="tax-detail-section" aria-labelledby="tax-reason-title">
                <h3 id="tax-reason-title">추천 이유</h3><p>{recommendation.reason}</p>
              </section>

              <section className="tax-detail-section" aria-labelledby="tax-detail-list-title">
                <h3 id="tax-detail-list-title">상세 내용</h3>
                <ul className="tax-detail-check-list">{(recommendation.detail_items ?? []).map((item) => <li key={item}><i aria-hidden="true" />{item}</li>)}</ul>
              </section>

              <section className="tax-detail-section" aria-labelledby="tax-simulation-title">
                <h3 id="tax-simulation-title">예상 절세 시뮬레이션</h3>
                <div className="tax-detail-table" role="table" aria-label="예상 절세 시뮬레이션">
                  <div className="tax-detail-table-row head" role="row"><span role="columnheader">구분</span><span role="columnheader">현재 (미가입)</span><span role="columnheader">가입 검토 시</span></div>
                  {simulationRows.map((row) => <div className={`tax-detail-table-row ${row.highlight ? "highlight" : ""}`} role="row" key={row.label}><strong role="cell">{row.label}</strong><span role="cell">{row.current}</span><span role="cell">{row.after}</span></div>)}
                </div>
                {typeof simulation?.deduction_limit === "number" ? <p className="tax-detail-note">연간 공제한도 {won(simulation.deduction_limit)}, 적용 세율 {((simulation.applied_tax_rate ?? 0) * 100).toFixed(0)}% 기준입니다.</p> : null}
              </section>

              <section className="tax-detail-section" aria-labelledby="tax-action-title">
                <h3 id="tax-action-title">행동 가이드</h3>
                <ul className="tax-detail-check-list">{(recommendation.action_guide ?? []).map((item) => <li key={item}><i aria-hidden="true" />{item}</li>)}</ul>
              </section>

              <section className="tax-detail-section" aria-labelledby="tax-reference-title">
                <h3 id="tax-reference-title">참고 자료</h3>
                <div className="tax-detail-reference"><i aria-hidden="true" /><div><strong>{recommendation.source?.document_name ?? "참고 문서 정보 없음"}</strong><span>{recommendation.source?.section ?? "관련 절세 항목"}</span></div></div>
              </section>
              {result?.disclaimer ? <p className="tax-detail-note">{result.disclaimer}</p> : null}
            </>
          )}
          <Link href="/tax-saving/guide" className="tax-detail-back-button">이전으로 돌아가기</Link>
        </div>
      </div>
    </main>
  );
}
