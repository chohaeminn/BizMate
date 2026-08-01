import type { NextApiRequest, NextApiResponse } from "next";
import {
  calculatePortfolio,
  createFundingRequest,
  getLatestPortfolioContext,
  getPortfolioCandidates,
  invokePortfolioLlm,
  savePortfolio,
} from "@/lib/portfolioApi";

type AiItem = {
  candidate_id?: string | null;
  source_id?: string | null;
  source_type?: string;
  name?: string;
  item_name?: string;
  allocated_amount: number;
  priority_order: number;
  reason?: string;
};

type AiPortfolio = {
  type: string;
  is_ai_recommended?: boolean;
  recommendation_reason?: string;
  items?: AiItem[];
};

function parseWon(value: unknown): number {
  const text = String(value ?? "").replaceAll(",", "").replaceAll(" ", "");
  const eok = Number(text.match(/([\d.]+)억/)?.[1] ?? 0) * 100_000_000;
  const man = Number(text.match(/([\d.]+)만/)?.[1] ?? 0) * 10_000;
  if (eok || man) return Math.round(eok + man);
  const number = Number(text.replace(/[^\d.]/g, ""));
  return Number.isFinite(number) ? Math.round(number) : 0;
}

function parseAiJson(output: string) {
  return JSON.parse(
    output.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""),
  ) as {
    recommended_type?: string;
    portfolios?: AiPortfolio[];
    options?: AiPortfolio[];
    [key: string]: unknown;
  };
}

function backendType(type: string) {
  if (type === "stable" || type === "burden") return "stability";
  if (type === "fast") return "speed";
  return "cost";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const profileId = req.cookies.bizmate_profile_id;
    if (!profileId) return res.status(400).json({ error: "페르소나를 먼저 선택해 주세요." });
    const context = await getLatestPortfolioContext(profileId);
    const requiredAmount = parseWon(req.body.requiredAmount);
    if (requiredAmount <= 0 || !String(req.body.fundingPurpose ?? "").trim()) {
      return res.status(400).json({ error: "필요 금액과 자금 사용 목적을 입력해 주세요." });
    }

    const previousRequest = context.funding_request;
    const selfFundingAmount = previousRequest?.self_funding_amount ?? 0;
    const fundingRequest = await createFundingRequest({
      profile_id: context.profile.id,
      required_amount: requiredAmount,
      funding_purpose: String(req.body.fundingPurpose).trim().slice(0, 50),
      self_funding_amount: selfFundingAmount,
      max_monthly_payment: previousRequest?.max_monthly_payment ?? 0,
      optimization_priority: String(req.body.preference ?? "cost"),
    });
    const candidates = await getPortfolioCandidates(fundingRequest.id);

    const proposalResponse = await invokePortfolioLlm(JSON.stringify({
      task: "deduction_candidates, funding_candidates, support_programs 세 DB 조회 결과를 모두 근거로 cost, stable, fast 세 가지 자금 조달 조합을 제안하세요. 단, items에는 calculation_ready=true인 DB 후보와 자기자금만 넣고 월 상환액, 금융비용, 확보 기간은 계산하지 마세요. calculation_ready=false 후보는 추천 근거와 향후 검토사항으로만 활용하세요.",
      funding_request_id: fundingRequest.id,
      session_business_info: req.body.businessInfoOverrides ?? null,
      user_input: req.body,
      candidates,
      output_rules: {
        portfolio_types: ["cost", "stable", "fast"],
        candidate_id_must_come_from_candidates: true,
        use_all_db_sources_for_recommendation: [
          "deduction_candidates", "funding_candidates", "support_programs",
        ],
        required_item_fields: ["candidate_id", "allocated_amount", "priority_order"],
      },
    }));
    const proposal = parseAiJson(proposalResponse.output);
    const portfolios = proposal.portfolios ?? proposal.options;
    if (!portfolios?.length) throw new Error("AI 후보 조합에 portfolios가 없습니다.");

    const candidateSourceTypes = new Map<string, string>();
    const candidateIdsByName = new Map<string, string>();
    const candidateMaxAmounts = new Map<string, number>();
    for (const key of ["support_program_candidates", "loan_product_candidates"] as const) {
      const list = candidates[key] as Array<{
        candidate_id: string;
        source_type: string;
        name?: string;
        max_amount?: number | null;
      }> | undefined;
      for (const candidate of list ?? []) {
        candidateSourceTypes.set(candidate.candidate_id, candidate.source_type);
        if (typeof candidate.max_amount === "number" && candidate.max_amount > 0) {
          candidateMaxAmounts.set(candidate.candidate_id, candidate.max_amount);
        }
        if (candidate.name) candidateIdsByName.set(candidate.name.trim(), candidate.candidate_id);
      }
    }

    const calculations = await Promise.all(portfolios.map(async (portfolio) => {
      let usedSelfFunding = 0;
      const items = (portfolio.items ?? []).flatMap((item) => {
        const rawId = item.candidate_id ?? item.source_id ?? null;
        const itemName = String(item.name ?? item.item_name ?? "").trim();
        const isSelfFunding = item.source_type === "self_funding"
          || rawId === null
          || rawId === "self_funding"
          || rawId === "self-funding"
          || itemName === "자기자금";
        const sourceId = isSelfFunding
          ? null
          : candidateSourceTypes.has(String(rawId))
            ? String(rawId)
            : candidateIdsByName.get(itemName);
        const requestedAmount = Math.max(0, Math.round(Number(item.allocated_amount) || 0));
        if (requestedAmount === 0) return [];
        const candidateMax = sourceId ? candidateMaxAmounts.get(sourceId) : undefined;
        let amount = candidateMax ? Math.min(requestedAmount, candidateMax) : requestedAmount;
        if (isSelfFunding) {
          const remaining = Math.max(0, selfFundingAmount - usedSelfFunding);
          amount = Math.min(amount, remaining);
          usedSelfFunding += amount;
        }
        if (amount <= 0) return [];
        return [{
          source_type: isSelfFunding ? "self_funding" : candidateSourceTypes.get(sourceId ?? ""),
          source_id: sourceId,
          amount,
          reason: item.reason ?? portfolio.recommendation_reason,
          priority_order: Math.max(1, Math.round(Number(item.priority_order) || 1)),
        }];
      });
      if (!items.length) throw new Error(`${portfolio.type} 포트폴리오에 계산 가능한 금액이 없습니다.`);
      if (items.some((item) => !item.source_type)) {
        throw new Error("AI가 DB 후보에 없는 candidate_id를 반환했습니다.");
      }
      const portfolioType = backendType(portfolio.type);
      const calculation = await calculatePortfolio({
        funding_request_id: fundingRequest.id,
        portfolio_type: portfolioType,
        items,
      });
      return { portfolio, portfolioType, items, calculation };
    }));

    const finalResponse = await invokePortfolioLlm(JSON.stringify({
      task: "백엔드 계산 결과를 비교해 최종 추천 유형과 사용자 설명을 작성하세요. 숫자를 다시 계산하거나 변경하지 마세요.",
      funding_request_id: fundingRequest.id,
      user_preference: req.body.preference,
      session_business_info: req.body.businessInfoOverrides ?? null,
      candidates,
      backend_calculations: calculations.map(({ portfolio, calculation }) => ({
        type: portfolio.type,
        recommendation_reason: portfolio.recommendation_reason,
        ...calculation,
      })),
      required_output_fields: [
        "recommended_type", "summary", "portfolios", "disclaimer",
      ],
      portfolio_required_fields: [
        "type", "title", "is_ai_recommended", "recommendation_reason",
        "recommendation_points", "items", "risk_notes", "roadmap", "required_documents",
      ],
      roadmap_rules: {
        source: "DB 후보, RAG 근거, 백엔드 계산 결과만 사용",
        format: [{ step: 1, title: "실행 단계", description: "예상 기간 또는 확인 사항" }],
        do_not_invent_deadlines: true,
        required_documents_must_be_conservative: true,
      },
    }));

    const finalOutput = parseAiJson(finalResponse.output);
    const recommendedType = String(finalOutput.recommended_type ?? proposal.recommended_type ?? "cost");
    await Promise.allSettled(calculations.map(({ portfolio, portfolioType, items }) =>
      savePortfolio({
        funding_request_id: fundingRequest.id,
        portfolio_type: portfolioType,
        selections: items,
        summary: portfolio.recommendation_reason,
        is_ai_recommended: backendType(recommendedType) === portfolioType,
        recommendation_reason: portfolio.recommendation_reason,
      }),
    ));

    return res.status(200).json({
      agent: finalResponse.agent,
      output: finalResponse.output,
      calculations: calculations.map(({ portfolio, calculation }) => ({
        type: portfolio.type,
        ...calculation,
      })),
      funding_request_id: fundingRequest.id,
    });
  } catch (error) {
    console.error("portfolio_llm 오케스트레이션 실패:", error);
    return res.status(502).json({ error: "자금조달 포트폴리오 생성에 실패했습니다." });
  }
}
