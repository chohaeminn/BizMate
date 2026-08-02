import type { NextApiRequest, NextApiResponse } from "next";

const backendApiUrl = (process.env.BACKEND_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const year = Array.isArray(req.query.year) ? req.query.year[0] : req.query.year;
  const month = Array.isArray(req.query.month) ? req.query.month[0] : req.query.month;
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (month) params.set("month", month);

  try {
    const response = await fetch(`${backendApiUrl}/tax-schedules?${params.toString()}`);
    const body = await response.json();
    return res.status(response.status).json(body);
  } catch (error) {
    console.error("세무일정 백엔드 연동 실패:", error);
    return res.status(502).json({ error: "세무일정을 불러오지 못했습니다." });
  }
}
