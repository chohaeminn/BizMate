import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const fundingFields = [
  {
    label: "필요한 금액",
    placeholder: "예: 3,000만 원",
    type: "text",
  },
  {
    label: "자금 사용 목적",
    placeholder: "예: 매장 리모델링 및 운영자금",
    type: "text",
  },
  {
    label: "필요한 시점",
    placeholder: "예: 2026년 9월",
    type: "text",
  },
];

type PlanRow = {
  id: number;
  purpose: string;
  amount: string;
};

function parseAmountToManwon(value: string) {
  const normalized = value.replace(/,/g, "").replace(/\s/g, "");
  if (!normalized) {
    return 0;
  }

  const eokMatch = normalized.match(/(\d+(?:\.\d+)?)억/);
  const manMatch = normalized.match(/(\d+(?:\.\d+)?)만/);

  if (eokMatch || manMatch) {
    const eok = eokMatch ? Number(eokMatch[1]) * 10000 : 0;
    const man = manMatch ? Number(manMatch[1]) : 0;
    return eok + man;
  }

  const numeric = Number(normalized.replace(/[^\d.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatManwon(value: number) {
  if (value <= 0) {
    return "0원";
  }

  const rounded = Math.round(value);
  const eok = Math.floor(rounded / 10000);
  const man = rounded % 10000;

  if (eok > 0 && man > 0) {
    return `${eok}억 ${man.toLocaleString("ko-KR")}만 원`;
  }

  if (eok > 0) {
    return `${eok}억 원`;
  }

  return `${man.toLocaleString("ko-KR")}만 원`;
}

export default function PortfolioFundingInfoPage() {
  const [planRows, setPlanRows] = useState<PlanRow[]>([
    { id: 1, purpose: "", amount: "" },
  ]);

  const totalAmount = useMemo(
    () => planRows.reduce((sum, row) => sum + parseAmountToManwon(row.amount), 0),
    [planRows],
  );

  const updatePlanRow = (id: number, field: keyof Omit<PlanRow, "id">, value: string) => {
    setPlanRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const addPlanRow = () => {
    setPlanRows((rows) => [
      ...rows,
      {
        id: rows.length > 0 ? Math.max(...rows.map((row) => row.id)) + 1 : 1,
        purpose: "",
        amount: "",
      },
    ]);
  };

  return (
    <main className="landing">
      <div className="mobile-screen portfolio-screen portfolio-funding-screen">
        <header className="portfolio-header">
          <Link
            href="/portfolio/additional-info"
            className="icon-button"
            aria-label="이전 화면으로 이동"
          >
            <Image src="/portfolio/portfolio-back-step.svg" alt="" width={24} height={24} />
          </Link>
          <h1>KB BizMate AI - 자금 포트폴리오</h1>
        </header>

        <div className="portfolio-content portfolio-step-content">
          <section className="portfolio-title-section portfolio-funded-title">
            <h2>필요한 자금을 알려주세요</h2>
            <p>얼마가 필요하고, 어디에 사용할 예정인가요?</p>
          </section>

          <section className="portfolio-progress" aria-label="진행 단계">
            <div className="portfolio-progress-count">
              <strong>3</strong>
              <span>/ 6</span>
            </div>
            <div className="portfolio-progress-track portfolio-progress-track-step3">
              <div />
            </div>
          </section>

          <section className="portfolio-input-card" aria-label="자금 정보 입력">
            {fundingFields.map((field) => (
              <label className="portfolio-input-row" key={field.label}>
                <span>{field.label}</span>
                <input type={field.type} placeholder={field.placeholder} />
              </label>
            ))}
            <label className="portfolio-input-row portfolio-textarea-row">
              <span>상세 설명</span>
              <textarea placeholder="예: 성수기 전 재고 확보와 주방 설비 교체가 필요해요" />
            </label>
          </section>

          <section className="portfolio-plan-card" aria-labelledby="funding-plan-title">
            <h2 id="funding-plan-title">세부 자금 사용 계획</h2>
            {planRows.map((row, index) => (
              <div className="portfolio-plan-row" key={row.id}>
                <div className="portfolio-plan-purpose">
                  <Image src="/portfolio/portfolio-drag.svg" alt="" width={20} height={20} />
                  <input
                    type="text"
                    placeholder={index === 0 ? "예: 인테리어" : "예: 장비 구입"}
                    value={row.purpose}
                    onChange={(event) =>
                      updatePlanRow(row.id, "purpose", event.target.value)
                    }
                  />
                </div>
                <input
                  className="portfolio-plan-amount"
                  type="text"
                  inputMode="decimal"
                  placeholder={index === 0 ? "예: 1,500만 원" : "예: 500만 원"}
                  value={row.amount}
                  onChange={(event) => updatePlanRow(row.id, "amount", event.target.value)}
                />
              </div>
            ))}
            <button className="portfolio-plan-add" type="button" onClick={addPlanRow}>
              <Image src="/portfolio/portfolio-add-step.svg" alt="" width={15} height={15} />
              추가하기
            </button>
            <div className="portfolio-plan-total">
              <strong>합계</strong>
              <strong>{formatManwon(totalAmount)}</strong>
            </div>
          </section>
        </div>

        <footer className="portfolio-footer portfolio-double-footer">
          <Link href="/portfolio/preferences" className="portfolio-primary-button">
            확인하고 다음
          </Link>
          <Link href="/portfolio/additional-info" className="portfolio-secondary-button">
            이전으로 돌아가기
          </Link>
        </footer>
      </div>
    </main>
  );
}
