import type { NextApiRequest, NextApiResponse } from "next";
import { getLatestPortfolioContext, invokePortfolioLlm } from "@/lib/portfolioApi";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const context = await getLatestPortfolioContext();
    const content = JSON.stringify({
      business_profile: context.profile,
      external_debts: context.external_debts,
      loan_products: context.loan_products,
      support_programs: context.support_programs,
      funding_request: req.body,
      user_context: {
        current_page: "/portfolio/result",
        intent: "generate_funding_portfolio",
      },
    });
    const result = await invokePortfolioLlm(content);
    return res.status(200).json(result);
  } catch (error) {
    console.error("portfolio_llm 호출 실패:", error);
    return res.status(502).json({ error: "자금조달 포트폴리오 생성에 실패했습니다." });
  }
}
