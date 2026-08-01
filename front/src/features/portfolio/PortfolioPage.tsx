import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PortfolioContext } from "@/lib/portfolioApi";
import { clearPortfolioResultCache, loadPortfolioFlowInput, savePortfolioFlowInput } from "@/lib/portfolioSession";

const toManwon = (value: number) => String(Math.round(value / 10_000));
const parseManwon = (value: string) => {
  const number = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? Math.round(number * 10_000) : 0;
};

type EditableBusinessInfo = {
  regionName: string;
  industryName: string;
  businessDuration: string;
  availableCashAmount: string;
  monthlySales: string;
  cardSettlementAmount: string;
  existingDebtAmount: string;
  existingMonthlyPayment: string;
  monthlyFixedExpense: string;
};

function createInitialForm(context: PortfolioContext): EditableBusinessInfo {
  const stored = loadPortfolioFlowInput().businessInfoOverrides;
  const totalDebt = context.external_debts.reduce((sum, debt) => sum + debt.balance_amount, 0);
  const monthlyDebt = context.external_debts.reduce((sum, debt) => sum + debt.monthly_payment, 0);

  return {
    regionName: stored?.regionName ?? context.profile.region_name ?? "",
    industryName: stored?.industryName ?? context.profile.industry_name ?? "",
    businessDuration: stored?.businessDuration ?? "2년 4개월",
    availableCashAmount: toManwon(stored?.availableCashAmount ?? context.profile.available_cash_amount ?? 0),
    monthlySales: toManwon(stored?.monthlySales ?? Math.round(context.profile.annual_sales / 12)),
    cardSettlementAmount: toManwon(stored?.cardSettlementAmount ?? 2_480_000),
    existingDebtAmount: toManwon(stored?.existingDebtAmount ?? totalDebt),
    existingMonthlyPayment: toManwon(stored?.existingMonthlyPayment ?? monthlyDebt),
    monthlyFixedExpense: toManwon(stored?.monthlyFixedExpense ?? context.profile.monthly_fixed_expense ?? 0),
  };
}

export default function PortfolioPage({ context }: { context: PortfolioContext }) {
  const [form, setForm] = useState(() => createInitialForm(context));

  const businessInfoItems = useMemo(() => [
    {
      key: "regionName",
      label: "사업장",
      value: form.regionName,
      suffix: "",
      icon: "/portfolio/portfolio-location.svg",
    },
    {
      key: "industryName",
      label: "업종",
      value: form.industryName,
      suffix: "",
      icon: "/portfolio/portfolio-industry.svg",
    },
    {
      key: "businessDuration",
      label: "사업기간",
      value: form.businessDuration,
      suffix: "",
      icon: "/portfolio/portfolio-duration.svg",
    },
    {
      key: "availableCashAmount",
      label: "현재 가용잔액",
      value: form.availableCashAmount,
      suffix: "만원",
      inputMode: "numeric" as const,
      icon: "/portfolio/portfolio-balance.svg",
    },
    {
      key: "monthlySales",
      label: "월평균 매출",
      value: form.monthlySales,
      suffix: "만원",
      inputMode: "numeric" as const,
      icon: "/portfolio/portfolio-sales.svg",
    },
    {
      key: "cardSettlementAmount",
      label: "카드 정산 예정액",
      value: form.cardSettlementAmount,
      suffix: "만원",
      inputMode: "numeric" as const,
      icon: "/portfolio/portfolio-card.svg",
    },
    {
      key: "existingDebtAmount",
      label: "기존 대출잔액",
      value: form.existingDebtAmount,
      suffix: "만원",
      inputMode: "numeric" as const,
      icon: "/portfolio/portfolio-debt.svg",
    },
    {
      key: "existingMonthlyPayment",
      label: "기존 월 상환액",
      value: form.existingMonthlyPayment,
      suffix: "만원",
      inputMode: "numeric" as const,
      icon: "/portfolio/portfolio-repayment.svg",
    },
    {
      key: "monthlyFixedExpense",
      label: "월 반복지출",
      value: form.monthlyFixedExpense,
      suffix: "만원",
      inputMode: "numeric" as const,
      icon: "/portfolio/portfolio-expense.svg",
    },
  ], [form]);

  const updateField = (key: keyof EditableBusinessInfo, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const saveSessionInfo = () => {
    savePortfolioFlowInput({
      businessInfoOverrides: {
        regionName: form.regionName.trim(),
        industryName: form.industryName.trim(),
        businessDuration: form.businessDuration.trim(),
        availableCashAmount: parseManwon(form.availableCashAmount),
        monthlySales: parseManwon(form.monthlySales),
        cardSettlementAmount: parseManwon(form.cardSettlementAmount),
        existingDebtAmount: parseManwon(form.existingDebtAmount),
        existingMonthlyPayment: parseManwon(form.existingMonthlyPayment),
        monthlyFixedExpense: parseManwon(form.monthlyFixedExpense),
      },
    });
    clearPortfolioResultCache();
  };

  return (
    <main className="landing">
      <div className="mobile-screen portfolio-screen">
        <header className="portfolio-header">
          <Link href="/service" className="icon-button" aria-label="서비스 화면으로 이동">
            <Image src="/portfolio/portfolio-back.svg" alt="" width={24} height={24} />
          </Link>
          <h1>KB BizMate AI - 자금 포트폴리오</h1>
        </header>

        <div className="portfolio-content">
          <section className="portfolio-title-section">
            <h2>사업정보를 불러왔어요</h2>
            <p>KB에 등록된 사업정보를 확인하고 이번 분석에만 반영할 수 있어요.</p>
          </section>

          <section className="portfolio-progress" aria-label="진행 단계">
            <div className="portfolio-progress-count">
              <strong>1</strong>
              <span>/ 6</span>
            </div>
            <div className="portfolio-progress-track">
              <div />
            </div>
          </section>

          <section className="portfolio-info-card" aria-labelledby="portfolio-info-title">
            <div className="portfolio-info-heading">
              <h2 id="portfolio-info-title">KB 사업 정보</h2>
              <p>현재까지 파악한 정보예요. 다른 정보가 있다면 수정할 수 있어요</p>
            </div>
            <div className="portfolio-info-list">
              {businessInfoItems.map((item) => (
                <label className="portfolio-info-row portfolio-info-edit-row" key={item.key}>
                  <div className="portfolio-info-label">
                    <span className="portfolio-info-icon">
                      <Image src={item.icon} alt="" width={16} height={16} />
                    </span>
                    <span>{item.label}</span>
                  </div>
                  <span className="portfolio-info-input-wrap">
                    {item.inputMode ? (
                      <input
                        value={item.value}
                        inputMode={item.inputMode}
                        onChange={(event) => updateField(item.key as keyof EditableBusinessInfo, event.target.value)}
                        aria-label={`${item.label} 수정`}
                      />
                    ) : (
                      <textarea
                        value={item.value}
                        rows={1}
                        onChange={(event) => updateField(item.key as keyof EditableBusinessInfo, event.target.value)}
                        aria-label={`${item.label} 수정`}
                      />
                    )}
                    {item.suffix ? <small>{item.suffix}</small> : null}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section className="portfolio-insight" aria-label="AI 현금흐름 진단">
            <div className="portfolio-robot">
              <Image
                src="/portfolio/portfolio-cash-flow.png"
                alt=""
                width={82}
                height={94}
                priority
              />
            </div>
            <p>
              현재 데이터 기준으로
              <br />
              운영 현금흐름은 <strong>보통</strong> 수준이에요.
            </p>
          </section>
        </div>

        <footer className="portfolio-footer">
          <Link href="/portfolio/additional-info" className="portfolio-primary-button" onClick={saveSessionInfo}>
            확인했어요
          </Link>
        </footer>
      </div>
    </main>
  );
}
