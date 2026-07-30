export type PortfolioSegment = {
  label: string;
  amount: string;
  value: number;
  color: string;
};

export type PortfolioOption = {
  slug: string;
  title: string;
  badge?: string;
  segments: PortfolioSegment[];
  metrics: Array<{ label: string; value: string }>;
  reasons: string[];
  stressWarning: string;
};

export const portfolioOptions: PortfolioOption[] = [
  {
    slug: "cost",
    title: "비용 최소형",
    badge: "AI 추천",
    segments: [
      { label: "시설개선 지원금", amount: "1,000만 원", value: 1000, color: "#fc0" },
      { label: "정책자금", amount: "2,000만 원", value: 2000, color: "#ffd700" },
      { label: "보증부 대출", amount: "1,500만 원", value: 1500, color: "#a3a3a3" },
      { label: "자기자금", amount: "500만 원", value: 500, color: "#e5e5e5" },
    ],
    metrics: [
      { label: "월 상환액", value: "82만 원" },
      { label: "금융비용", value: "198만 원" },
      { label: "확보기간", value: "6주" },
    ],
    reasons: [
      "지원금과 정책자금을 우선 활용해 대출원금을 줄였어요",
      "신규 월 상환액을 권장 범위 90만 원 이내로 유지했어요",
      "유사 사업자 대비 총부채 수준이 높아 일반 대출 비중을 낮췄어요",
    ],
    stressWarning: "매출이 20% 감소하면 상환 부담이 커질 수 있어요.",
  },
  {
    slug: "fast",
    title: "빠른 확보형",
    segments: [
      { label: "일반 사업자대출", amount: "2,500만 원", value: 2500, color: "#3b82f6" },
      { label: "신속 정책자금", amount: "1,000만 원", value: 1000, color: "#60a5fa" },
      { label: "한도 대출", amount: "1,000만 원", value: 1000, color: "#93c5fd" },
      { label: "자기자금", amount: "500만 원", value: 500, color: "#dbeafe" },
    ],
    metrics: [
      { label: "월 상환액", value: "108만 원" },
      { label: "금융비용", value: "347만 원" },
      { label: "확보기간", value: "2~3주" },
    ],
    reasons: [
      "일반 사업자대출 비중을 높여 자금 확보 기간을 줄였어요",
      "신속 정책자금을 함께 배치해 금융비용 상승을 완화했어요",
      "긴급 운전자금이 필요한 상황에 맞춰 실행 가능성을 우선했어요",
    ],
    stressWarning: "매출이 10% 이상 감소하면 월 상환 여력이 빠르게 줄 수 있어요.",
  },
  {
    slug: "burden",
    title: "월 부담 최소형",
    segments: [
      { label: "장기 거치 정책자금", amount: "3,000만 원", value: 3000, color: "#22c55e" },
      { label: "시설자금", amount: "1,000만 원", value: 1000, color: "#4ade80" },
      { label: "보증서 대출", amount: "500만 원", value: 500, color: "#86efac" },
      { label: "자기자금", amount: "500만 원", value: 500, color: "#dcfce7" },
    ],
    metrics: [
      { label: "월 상환액", value: "65만 원" },
      { label: "금융비용", value: "225만 원" },
      { label: "확보기간", value: "7~8주" },
    ],
    reasons: [
      "장기 거치 상품을 우선 배치해 초기 월 상환 부담을 낮췄어요",
      "보증서 대출은 최소 금액만 활용해 고정비 증가를 제한했어요",
      "자금 확보 속도보다 안정적인 현금흐름을 우선했어요",
    ],
    stressWarning: "확보기간이 길어져 신청 마감 일정 관리가 중요해요.",
  },
];

export function getPortfolioOption(slug?: string | string[]) {
  const value = Array.isArray(slug) ? slug[0] : slug;

  return portfolioOptions.find((option) => option.slug === value) ?? portfolioOptions[0];
}

export function getDonutBackground(segments: PortfolioSegment[]) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let cursor = 0;

  const stops = segments.map((segment) => {
    const start = (cursor / total) * 100;
    cursor += segment.value;
    const end = (cursor / total) * 100;

    return `${segment.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`;
  });

  return `conic-gradient(${stops.join(", ")})`;
}
