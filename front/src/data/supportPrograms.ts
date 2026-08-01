export type SupportProgramTagTone = "blue" | "green" | "gray";

export type SupportProgramApiResponse = {
  id: string;
  title: string;
  organization_name: string;
  region_name: string | null;
  target_industry: string | null;
  support_type: string | null;
  support_amount: number;
  application_start_date: string | null;
  application_end_date: string | null;
  description: string | null;
  source_url: string | null;
  created_at: string;
};

export type BusinessProfile = {
  id: string;
  business_name: string;
  owner_name: string;
  region_name: string | null;
  industry_name: string | null;
  annual_sales: number;
  created_at: string;
};

export type RecommendationApiResponse = {
  score: number;
  reason: string;
  program: SupportProgramApiResponse;
};

export type SupportProgram = {
  id: string;
  slug: string;
  title: string;
  titleLines: string[];
  summary: string;
  summaryLines: string[];
  tags: { label: string; tone: SupportProgramTagTone }[];
  supportAmountLabel: string;
  estimatedRateLabel?: string;
  deadlineLabel: string;
  deadlineText: string;
  featured?: boolean;
  imageSrc: string;
  imageTone: string;
  matchScore: number;
  analysisTitle: string;
  analysisItems: string[];
  detailRows: { label: string; value: string }[];
  organizationName: string;
  phoneNumber: string;
  contactHours: string;
  requiredDocuments: string[];
  sourceUrl: string | null;
};

const programImages = [
  "/support-program-list/program-daegu-special-guarantee.png",
  "/support-program-list/program-smart-store-tech.png",
  "/support-program-list/program-young-startup-support.png",
  "/support-program-list/program-digital-transition.png",
  "/support-program-list/program-gyeongbuk-business-improvement.png",
];

const imageTones = ["white-doc", "bear-check", "bear-wave", "rabbit", "white-point"];

function formatAmount(amount: number) {
  if (amount <= 0) return "사업별 상이";
  if (amount >= 100_000_000 && amount % 100_000_000 === 0) return `최대 ${amount / 100_000_000}억원`;
  if (amount >= 10_000 && amount % 10_000 === 0) return `최대 ${(amount / 10_000).toLocaleString("ko-KR")}만원`;
  return `최대 ${amount.toLocaleString("ko-KR")}원`;
}

function formatDate(date: string | null) {
  return date ? date.replaceAll("-", ".") : "별도 공고 확인";
}

function getDeadline(endDate: string | null) {
  if (!endDate) return "상시";
  const today = new Date();
  const end = new Date(`${endDate}T23:59:59`);
  const days = Math.ceil((end.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return "마감";
  if (days === 0) return "D-Day";
  return `D-${days}`;
}

function splitText(value: string, length = 24) {
  if (value.length <= length) return [value];
  const splitAt = value.lastIndexOf(" ", length);
  const index = splitAt > 0 ? splitAt : length;
  return [value.slice(0, index), value.slice(index).trim()];
}

export function mapSupportProgram(
  program: SupportProgramApiResponse,
  index = 0,
  recommendation?: Pick<RecommendationApiResponse, "score" | "reason">,
): SupportProgram {
  const region = program.region_name || "전국";
  const industry = program.target_industry || "전 업종";
  const supportType = program.support_type || "지원사업";
  const deadlineLabel = getDeadline(program.application_end_date);
  const summary = program.description || `${program.organization_name}에서 운영하는 지원사업입니다.`;

  return {
    id: program.id,
    slug: program.id,
    title: program.title,
    titleLines: splitText(program.title, 18),
    summary,
    summaryLines: splitText(summary),
    tags: [
      { label: supportType, tone: "blue" },
      { label: industry, tone: "gray" },
      { label: region, tone: "green" },
    ],
    supportAmountLabel: formatAmount(program.support_amount),
    deadlineLabel,
    deadlineText: deadlineLabel === "상시" ? "신청기간" : "신청마감",
    featured: index === 0,
    imageSrc: programImages[index % programImages.length],
    imageTone: imageTones[index % imageTones.length],
    matchScore: recommendation?.score ?? 0,
    analysisTitle: recommendation ? "사업자 정보에 맞춰 추천한 지원사업입니다." : "지원 대상 정보를 확인해 보세요.",
    analysisItems: recommendation?.reason
      ? recommendation.reason.split(", ")
      : [`지원 지역: ${region}`, `대상 업종: ${industry}`, `지원 유형: ${supportType}`],
    detailRows: [
      { label: "지원금", value: formatAmount(program.support_amount) },
      {
        label: "신청기간",
        value: `${formatDate(program.application_start_date)} ~ ${formatDate(program.application_end_date)}`,
      },
      { label: "지원대상", value: `${region} ${industry}` },
      { label: "사업내용", value: summary },
    ],
    organizationName: program.organization_name,
    phoneNumber: "공고문 문의처 확인",
    contactHours: "기관별 운영시간 상이",
    requiredDocuments: ["사업자등록증", "세부 공고에서 제출 서류 확인"],
    sourceUrl: program.source_url,
  };
}
