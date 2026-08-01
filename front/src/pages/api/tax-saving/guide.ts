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

async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${backendApiUrl}${path}`, init);
  if (!response.ok) throw new Error(`백엔드 API 요청 실패 (${response.status})`);
  return response.json() as Promise<T>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const [profiles, schedules] = await Promise.all([
      backendRequest<BusinessProfile[]>("/business-profiles"),
      backendRequest<TaxSchedule[]>("/tax-schedules?year=2026"),
    ]);
    const profile = profiles[0];
    if (!profile) return res.status(404).json({ error: "사업자 정보가 없습니다." });

    const vatSchedule = schedules.find((schedule) =>
      schedule.title.includes("2026.1기 부가가치세 확정신고"),
    ) ?? null;

    const salesAmount = 152_000_000;
    const purchaseAmount = 84_200_000;
    const taxInput = {
      period_start: "2026-01-01",
      period_end: "2026-06-30",
      amount_basis: "SUPPLY_VALUE",
      sales_amount: salesAmount,
      purchase_amount: purchaseAmount,
      simulation_tax_rate: 0.15,
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
    });
  } catch (error) {
    console.error("tax-saving-ai 가이드 생성 실패:", error);
    return res.status(502).json({ error: "AI 절세 가이드를 생성하지 못했습니다." });
  }
}
