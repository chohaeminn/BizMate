import {
  mapSupportProgram,
  type BusinessProfile,
  type RecommendationApiResponse,
  type SupportProgram,
  type SupportProgramApiResponse,
} from "@/data/supportPrograms";

const backendApiUrl = (process.env.BACKEND_API_URL || "http://localhost:8000").replace(/\/$/, "");

type AiSupportRecommendation = {
  program_id: string;
  rank: number;
  score: number;
  reason: string;
  action_guide?: string;
  analysis?: {
    analysis_title?: string;
    fit_reasons?: string[];
    preparation_checklist?: string[];
    risk_notes?: string[];
  };
};

type AiSupportOutput = {
  summary?: string;
  recommendations?: AiSupportRecommendation[];
  recommended_type?: string;
  portfolios?: Array<{
    type: string;
    is_ai_recommended?: boolean;
    recommendation_reason?: string;
    items?: Array<{
      candidate_id: string;
      priority_order: number;
    }>;
    analysis?: AiSupportRecommendation["analysis"];
  }>;
};

type NormalizedAiSupportOutput = {
  summary?: string;
  recommendations: AiSupportRecommendation[];
};

type AiInvokeResponse = {
  agent: string;
  output: string;
};

type AiPersonalizedResult = {
  profile: BusinessProfile | null;
  programs: SupportProgram[];
  summary: string | null;
};

const globalWithSupportCache = globalThis as typeof globalThis & {
  __bizmateSupportAiCache?: Map<string, Promise<AiPersonalizedResult>>;
};

const supportAiCache = globalWithSupportCache.__bizmateSupportAiCache
  ?? new Map<string, Promise<AiPersonalizedResult>>();
globalWithSupportCache.__bizmateSupportAiCache = supportAiCache;

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${backendApiUrl}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`백엔드 API 요청 실패 (${response.status})`);
  }

  return response.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${backendApiUrl}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`백엔드 API 요청 실패 (${response.status})`);
  }

  return response.json() as Promise<T>;
}

function parseAiOutput(output: string): NormalizedAiSupportOutput {
  const normalized = output
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");
  const parsed = JSON.parse(normalized) as AiSupportOutput;
  if (Array.isArray(parsed.recommendations)) {
    return { summary: parsed.summary, recommendations: parsed.recommendations };
  }

  const portfolio = parsed.portfolios?.find((item) => item.is_ai_recommended)
    ?? parsed.portfolios?.find((item) => item.type === parsed.recommended_type);
  if (!portfolio?.items?.length) {
    throw new Error("AI 추천 응답에 recommendations 또는 추천 portfolio가 없습니다.");
  }

  return {
    summary: parsed.summary,
    recommendations: portfolio.items.map((item) => ({
      program_id: item.candidate_id,
      rank: item.priority_order,
      score: 0,
      reason: portfolio.recommendation_reason || "AI 추천 포트폴리오 포함 사업",
      analysis: portfolio.analysis,
    })),
  };
}

export async function getSupportPrograms(): Promise<SupportProgram[]> {
  const programs = await request<SupportProgramApiResponse[]>("/support-programs");
  return programs.map((program, index) => mapSupportProgram(program, index));
}

export async function getBusinessProfiles(): Promise<BusinessProfile[]> {
  return request<BusinessProfile[]>("/business-profiles");
}

export async function getLatestBusinessProfile(profileId?: string): Promise<BusinessProfile | null> {
  if (profileId) {
    return request<BusinessProfile>(`/business-profiles/${encodeURIComponent(profileId)}`);
  }
  const profiles = await getBusinessProfiles();
  return profiles[0] ?? null;
}

export async function getRecommendations(businessId: string): Promise<SupportProgram[]> {
  const recommendations = await request<RecommendationApiResponse[]>(
    `/recommendations/${encodeURIComponent(businessId)}`,
  );
  return recommendations.map((recommendation, index) =>
    mapSupportProgram(recommendation.program, index, recommendation),
  );
}

export async function getPersonalizedSupportPrograms(profileId?: string): Promise<{
  profile: BusinessProfile | null;
  programs: SupportProgram[];
}> {
  const profile = await getLatestBusinessProfile(profileId);
  if (!profile) return { profile: null, programs: [] };
  return { profile, programs: await getRecommendations(profile.id) };
}

async function generateAiPersonalizedSupportPrograms(
  profile: BusinessProfile,
  rawPrograms: SupportProgramApiResponse[],
  backendRecommendations: RecommendationApiResponse[],
): Promise<AiPersonalizedResult> {
  const content = JSON.stringify({
    business_profile: {
      id: profile.id,
      region_name: profile.region_name,
      industry_name: profile.industry_name,
      annual_sales: profile.annual_sales,
    },
    support_programs: rawPrograms.map((program) => ({
      id: program.id,
      title: program.title,
      region_name: program.region_name,
      target_industry: program.target_industry,
      support_type: program.support_type,
      support_amount: program.support_amount,
      application_end_date: program.application_end_date,
    })),
    backend_recommendations: backendRecommendations.map((recommendation) => ({
      program_id: recommendation.program.id,
      score: recommendation.score,
      reason: recommendation.reason,
    })),
    user_context: {
      current_page: "/support",
      intent: "recommend_support_programs",
    },
  });

  const response = await post<AiInvokeResponse>("/ai/support-programs", { content });
  const aiOutput = parseAiOutput(response.output);
  const programsById = new Map(rawPrograms.map((program) => [program.id, program]));
  const programs = aiOutput.recommendations
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 3)
    .flatMap((recommendation, index) => {
      const rawProgram = programsById.get(recommendation.program_id);
      if (!rawProgram) return [];

      const program = mapSupportProgram(rawProgram, index, {
        score: recommendation.score,
        reason: recommendation.reason,
      });
      program.analysisTitle = recommendation.analysis?.analysis_title || program.analysisTitle;
      program.analysisItems = recommendation.analysis?.fit_reasons?.length
        ? recommendation.analysis.fit_reasons
        : program.analysisItems;
      return [program];
    });

  if (programs.length === 0) {
    throw new Error("AI 추천 결과와 DB 지원사업을 연결할 수 없습니다.");
  }

  return { profile, programs, summary: aiOutput.summary || null };
}

export async function getAiPersonalizedSupportPrograms(
  cacheScope = "shared",
  profileId?: string,
): Promise<AiPersonalizedResult> {
  const profile = await getLatestBusinessProfile(profileId);

  if (!profile) return { profile: null, programs: [], summary: null };
  const [rawPrograms, backendRecommendations] = await Promise.all([
    request<SupportProgramApiResponse[]>("/support-programs"),
    request<RecommendationApiResponse[]>(`/recommendations/${encodeURIComponent(profile.id)}`),
  ]);

  const cacheKey = JSON.stringify({
    cacheScope,
    profile: {
      id: profile.id,
      region_name: profile.region_name,
      industry_name: profile.industry_name,
      annual_sales: profile.annual_sales,
      created_at: profile.created_at,
    },
    programs: rawPrograms.map((program) => ({
      id: program.id,
      created_at: program.created_at,
      title: program.title,
      support_amount: program.support_amount,
      application_end_date: program.application_end_date,
    })),
    backendRecommendations: backendRecommendations.map((recommendation) => ({
      program_id: recommendation.program.id,
      score: recommendation.score,
      reason: recommendation.reason,
    })),
  });

  let cached = supportAiCache.get(cacheKey);
  if (!cached) {
    cached = generateAiPersonalizedSupportPrograms(profile, rawPrograms, backendRecommendations);
    supportAiCache.set(cacheKey, cached);
  }

  try {
    const result = await cached;
    const businessCondition = [profile.region_name, profile.industry_name]
      .filter(Boolean)
      .join("·");
    return {
      ...result,
      summary: `${businessCondition || "사업자"} 조건을 분석해 신청 적합도가 높은 맞춤 지원사업 ${result.programs.length}개를 추천합니다.`,
    };
  } catch (error) {
    supportAiCache.delete(cacheKey);
    console.error("support_llm 호출 실패, 백엔드 추천 결과를 사용합니다:", error);
    return {
      profile,
      programs: backendRecommendations.slice(0, 3).map((recommendation, index) =>
        mapSupportProgram(recommendation.program, index, recommendation),
      ),
      summary: `${profile.business_name}의 지역·업종 조건을 기준으로 백엔드가 추천한 지원사업입니다.`,
    };
  }
}

export async function getSupportProgram(programId: string): Promise<SupportProgram> {
  const program = await request<SupportProgramApiResponse>(
    `/support-programs/${encodeURIComponent(programId)}`,
  );
  return mapSupportProgram(program);
}
