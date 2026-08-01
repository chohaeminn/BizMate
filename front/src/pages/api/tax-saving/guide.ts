import type { NextApiRequest, NextApiResponse } from "next";

const backendApiUrl = (process.env.BACKEND_API_URL || "http://localhost:8000").replace(/\/$/, "");

type BusinessProfile = {
  id: string;
  business_name: string;
  owner_name: string;
  region_name: string | null;
  industry_name: string | null;
  annual_sales: number;
};

type TaxSchedule = {
  id: string;
  title: string;
  note: string | null;
  schedule_date: string;
};

type TaxInputRecord = {
  period_start: string;
  period_end: string;
  amount_basis: string;
  sales_amount: number;
  purchase_amount: number;
  simulation_tax_rate: number;
};

async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${backendApiUrl}${path}`, init);
  if (!response.ok) throw new Error(`백엔드 API 요청 실패 (${response.status})`);
  return response.json() as Promise<T>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const profileId = req.cookies.bizmate_profile_id;
    if (!profileId) return res.status(400).json({ error: "페르소나를 먼저 선택해 주세요." });
    const [profile, schedules, storedTaxInput] = await Promise.all([
      backendRequest<BusinessProfile>(`/business-profiles/${encodeURIComponent(profileId)}`),
      backendRequest<TaxSchedule[]>("/tax-schedules?year=2026"),
      backendRequest<TaxInputRecord>(`/tax-inputs/latest?profile_id=${encodeURIComponent(profileId)}`),
    ]);

    const vatSchedule = schedules.find((schedule) =>
      schedule.title.includes("2026.1기 부가가치세 확정신고"),
    ) ?? null;

    const taxInput = {
      period_start: storedTaxInput.period_start,
      period_end: storedTaxInput.period_end,
      amount_basis: storedTaxInput.amount_basis,
      sales_amount: storedTaxInput.sales_amount,
      purchase_amount: storedTaxInput.purchase_amount,
      simulation_tax_rate: storedTaxInput.simulation_tax_rate,
      deduction_inputs: {
        yellow_umbrella: {
          monthly_payment: 300_000,
          annual_deduction_limit: 5_000_000,
        },
      },
      known_enrollments: { yellow_umbrella: false },
    };

    const enginePayload = {
      business_profile: profile,
      tax_schedule: vatSchedule,
      tax_input: taxInput,
      frontend_context: {
        current_page: "/tax-saving",
        intent: "calculate_tax_saving",
      },
    };

    const engineResponse = await backendRequest<{
      agent: string;
      output: Record<string, unknown>;
      tax_summary: Record<string, number>;
      deduction_candidates: Record<string, unknown>[];
    }>("/tax-engine/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enginePayload),
    });

    return res.status(200).json({
      agent: engineResponse.agent,
      output: JSON.stringify(engineResponse.output),
      profile,
      tax_schedule: vatSchedule,
      tax_input: taxInput,
      tax_summary: engineResponse.tax_summary,
      deduction_candidates: engineResponse.deduction_candidates,
      analysis_date: new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" }),
    });
  } catch (error) {
    console.error("tax-saving-ai 가이드 생성 실패:", error);
    return res.status(502).json({ error: "AI 절세 가이드를 생성하지 못했습니다." });
  }
}
