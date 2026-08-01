import type { BusinessProfile, SupportProgramApiResponse } from "@/data/supportPrograms";

const backendApiUrl = (process.env.BACKEND_API_URL || "http://localhost:8000").replace(/\/$/, "");

export type ExternalDebt = {
  id: string;
  debt_type: string;
  lender_name: string | null;
  balance_amount: number;
  monthly_payment: number;
  annual_rate: number;
  maturity_date: string | null;
};

export type LoanProduct = {
  id: string;
  name: string;
  organization_name: string | null;
  loan_type: string;
  max_amount: number;
  annual_rate: number;
  term_months: number;
  grace_months: number;
  guarantee_fee_rate: number;
  expected_period_weeks: number;
};

export type PortfolioContext = {
  profile: BusinessProfile & {
    available_cash_amount?: number;
    monthly_fixed_expense?: number;
  };
  external_debts: ExternalDebt[];
  loan_products: LoanProduct[];
  support_programs: SupportProgramApiResponse[];
  funding_request: {
    id: string;
    required_amount: number;
    funding_purpose: string;
    self_funding_amount: number;
    max_monthly_payment: number;
    optimization_priority: string;
  } | null;
};

async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${backendApiUrl}${path}`, init);
  if (!response.ok) throw new Error(`백엔드 API 요청 실패 (${response.status})`);
  return response.json() as Promise<T>;
}

export async function createFundingRequest(payload: {
  profile_id: string;
  required_amount: number;
  funding_purpose: string;
  self_funding_amount: number;
  max_monthly_payment: number;
  optimization_priority: string;
}) {
  return backendRequest<{ id: string }>("/funding-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getPortfolioCandidates(fundingRequestId: string) {
  return backendRequest<Record<string, unknown>>(
    `/portfolio-engine/candidates?funding_request_id=${encodeURIComponent(fundingRequestId)}`,
  );
}

export async function calculatePortfolio(payload: Record<string, unknown>) {
  return backendRequest<Record<string, unknown>>("/portfolio-engine/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function savePortfolio(payload: Record<string, unknown>) {
  return backendRequest<Record<string, unknown>>("/portfolios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function getLatestPortfolioContext(): Promise<PortfolioContext> {
  const profiles = await backendRequest<BusinessProfile[]>("/business-profiles");
  const profile = profiles[0];
  if (!profile) throw new Error("등록된 사업자 프로필이 없습니다.");
  return backendRequest<PortfolioContext>(`/portfolios/context/${profile.id}`);
}

export async function invokePortfolioLlm(content: string) {
  return backendRequest<{ agent: string; output: string }>("/ai/funding-portfolio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}
