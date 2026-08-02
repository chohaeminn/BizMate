import type { NextApiRequest, NextApiResponse } from "next";

const backendApiUrl = (process.env.BACKEND_API_URL || "http://localhost:8000").replace(/\/$/, "");

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
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`백엔드 API 요청 실패 (${response.status}): ${detail}`);
  }
  return response.json() as Promise<T>;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const profileId = req.cookies.bizmate_profile_id;
    if (!profileId) return res.status(400).json({ error: "페르소나를 먼저 선택해 주세요." });

    const now = new Date();
    const analysisDate = now.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    const currentYear = Number(analysisDate.slice(0, 4));
    const [profile, schedules, taxInput] = await Promise.all([
      backendRequest<Record<string, unknown>>(`/business-profiles/${encodeURIComponent(profileId)}`),
      backendRequest<Array<Record<string, unknown>>>(`/tax-schedules?year=${currentYear}`),
      backendRequest<TaxInputRecord>(`/tax-inputs/latest?profile_id=${encodeURIComponent(profileId)}`),
    ]);
    const upcomingSchedule = schedules.find((schedule) => (
      typeof schedule.schedule_date === "string" && schedule.schedule_date >= analysisDate
    )) ?? null;

    const engineResponse = await backendRequest<{
      agent: string;
      output: Record<string, unknown>;
      tax_summary: Record<string, number>;
    }>("/tax-engine/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_profile: profile,
        tax_schedule: upcomingSchedule,
        tax_input: {
          ...taxInput,
          deduction_inputs: {
            yellow_umbrella: {
              monthly_payment: 300_000,
              annual_deduction_limit: 5_000_000,
            },
          },
          known_enrollments: { yellow_umbrella: false },
        },
        frontend_context: {
          current_page: "/tax-saving/guide",
          intent: "calculate_tax_saving",
        },
      }),
    });

    return res.status(200).json({
      agent: engineResponse.agent,
      output: JSON.stringify(engineResponse.output),
      tax_summary: engineResponse.tax_summary,
      tax_schedule: upcomingSchedule,
      tax_input: taxInput,
      analysis_date: analysisDate,
    });
  } catch (error) {
    console.error("tax-saving-ai 가이드 생성 실패:", error);
    return res.status(502).json({ error: "AI 절세 가이드를 생성하지 못했습니다." });
  }
}
