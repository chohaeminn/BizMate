export type PortfolioFlowInput = {
  requiredAmount: string;
  fundingPurpose: string;
  neededAt: string;
  description: string;
  usePlans: Array<{ purpose: string; amount: string }>;
  preference: "cost" | "speed" | "burden";
};

const storageKey = "bizmate-portfolio-input";

export const defaultPortfolioFlowInput: PortfolioFlowInput = {
  requiredAmount: "5,000만 원",
  fundingPurpose: "매장 리모델링 및 운영자금",
  neededAt: "2026년 9월",
  description: "성수기 전 재고 확보와 설비 교체가 필요해요",
  usePlans: [],
  preference: "cost",
};

export function loadPortfolioFlowInput(): PortfolioFlowInput {
  if (typeof window === "undefined") return defaultPortfolioFlowInput;
  try {
    const stored = window.sessionStorage.getItem(storageKey);
    return stored ? { ...defaultPortfolioFlowInput, ...JSON.parse(stored) } : defaultPortfolioFlowInput;
  } catch {
    return defaultPortfolioFlowInput;
  }
}

export function savePortfolioFlowInput(update: Partial<PortfolioFlowInput>) {
  const current = loadPortfolioFlowInput();
  window.sessionStorage.setItem(storageKey, JSON.stringify({ ...current, ...update }));
}
