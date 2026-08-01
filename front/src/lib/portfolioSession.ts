export type PortfolioFlowInput = {
  requiredAmount: string;
  fundingPurpose: string;
  neededAt: string;
  description: string;
  usePlans: Array<{ purpose: string; amount: string }>;
  preference: "cost" | "speed" | "burden";
};

const storageKey = "bizmate-portfolio-input-v2";

export const defaultPortfolioFlowInput: PortfolioFlowInput = {
  requiredAmount: "",
  fundingPurpose: "",
  neededAt: "",
  description: "",
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

export function clearPortfolioResultCache() {
  if (typeof window === "undefined") return;
  for (let index = window.sessionStorage.length - 1; index >= 0; index -= 1) {
    const key = window.sessionStorage.key(index);
    if (key?.startsWith("bizmate-portfolio-result-")) {
      window.sessionStorage.removeItem(key);
    }
  }
}
