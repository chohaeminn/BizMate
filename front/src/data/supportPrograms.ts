export type SupportProgramTagTone = "blue" | "green" | "gray";

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
};

export const supportPrograms: SupportProgram[] = [
  {
    id: "daegu-special-guarantee",
    slug: "daegu-special-guarantee",
    title: "대구 소상공인 특례보증 지원",
    titleLines: ["대구 소상공인", "특례보증 지원"],
    summary: "소상공인의 경영안정을 위한 특례보증을 지원하는 사업입니다.",
    summaryLines: ["소상공인의 경영안정을 위한", "특례보증을 지원하는 사업입니다."],
    tags: [
      { label: "보증", tone: "blue" },
      { label: "저금리", tone: "blue" },
      { label: "대구", tone: "green" },
    ],
    supportAmountLabel: "최대 5,000만원",
    estimatedRateLabel: "2.3%",
    deadlineLabel: "D-7",
    deadlineText: "신청마감",
    featured: true,
    imageSrc: "/figma-assets/program-daegu-special-guarantee.png",
    imageTone: "white-doc",
    matchScore: 98,
    analysisTitle: "회원님과 조건이 매우 유사합니다.",
    analysisItems: ["대구 사업장", "도소매업", "업력 2년 이상", "신청 가능 조건 충족"],
    detailRows: [
      { label: "지원금", value: "최대 5,000만원" },
      { label: "예상금리", value: "연 2.3% (변동금리)" },
      { label: "신청기간", value: "2026.06.01 ~ 2026.06.30" },
      { label: "지원대상", value: "대구 소재 소상공인" },
      { label: "사업내용", value: "운전자금 (경영안정 자금 지원)" },
    ],
    organizationName: "대구신용보증재단",
    phoneNumber: "053-560-6300",
    contactHours: "평일 09:00 ~ 18:00",
    requiredDocuments: ["사업자등록증", "부가가치세과세표준증명", "국세/지방세 납세증명서", "신분증"],
  },
  {
    id: "smart-store-tech",
    slug: "smart-store-tech",
    title: "스마트상점 기술보급사업",
    titleLines: ["스마트상점", "기술보급사업"],
    summary: "매장 운영 효율을 높이는 스마트 기술 도입 비용을 지원하는 사업입니다.",
    summaryLines: ["매장 운영 효율을 높이는", "스마트 기술 도입 비용을 지원합니다."],
    tags: [
      { label: "지원금", tone: "blue" },
      { label: "기술", tone: "gray" },
      { label: "전국", tone: "green" },
    ],
    supportAmountLabel: "최대 1,000만원",
    estimatedRateLabel: "2.1%",
    deadlineLabel: "D-12",
    deadlineText: "신청마감",
    imageSrc: "/figma-assets/program-smart-store-tech.png",
    imageTone: "bear-check",
    matchScore: 91,
    analysisTitle: "디지털 전환 니즈와 잘 맞습니다.",
    analysisItems: ["소상공인 업종", "매장 운영 사업자", "기술 도입 가능", "자부담 조건 확인 필요"],
    detailRows: [
      { label: "지원금", value: "최대 1,000만원" },
      { label: "예상금리", value: "연 2.1% (예상)" },
      { label: "신청기간", value: "2026.06.05 ~ 2026.07.10" },
      { label: "지원대상", value: "스마트 기술 도입 희망 소상공인" },
      { label: "사업내용", value: "키오스크, POS, 스마트오더 등 도입 지원" },
    ],
    organizationName: "소상공인시장진흥공단",
    phoneNumber: "1357",
    contactHours: "평일 09:00 ~ 18:00",
    requiredDocuments: ["사업자등록증", "견적서", "매출 증빙자료", "개인정보 수집 동의서"],
  },
  {
    id: "young-startup-support",
    slug: "young-startup-support",
    title: "청년창업 지원사업",
    titleLines: ["청년창업", "지원사업"],
    summary: "청년 창업자의 초기 사업화 자금과 성장 프로그램을 지원하는 사업입니다.",
    summaryLines: ["청년 창업자의 초기 사업화 자금과", "성장 프로그램을 지원합니다."],
    tags: [
      { label: "지원금", tone: "blue" },
      { label: "창업", tone: "gray" },
      { label: "전국", tone: "green" },
    ],
    supportAmountLabel: "최대 7,000만원",
    estimatedRateLabel: "2.0%",
    deadlineLabel: "D-20",
    deadlineText: "신청마감",
    imageSrc: "/figma-assets/program-young-startup-support.png",
    imageTone: "bear-wave",
    matchScore: 87,
    analysisTitle: "창업 성장 단계와 연관성이 있습니다.",
    analysisItems: ["창업 이력 보유", "사업화 자금 필요", "청년 대표자 조건 확인", "성장 계획서 준비 필요"],
    detailRows: [
      { label: "지원금", value: "최대 7,000만원" },
      { label: "예상금리", value: "연 2.0% (예상)" },
      { label: "신청기간", value: "2026.06.10 ~ 2026.07.18" },
      { label: "지원대상", value: "청년 창업자 및 초기 기업" },
      { label: "사업내용", value: "사업화 자금, 멘토링, 판로개척 지원" },
    ],
    organizationName: "창업진흥원",
    phoneNumber: "1357",
    contactHours: "평일 09:00 ~ 18:00",
    requiredDocuments: ["사업계획서", "사업자등록증", "대표자 신분증", "매출 증빙자료"],
  },
  {
    id: "digital-transition",
    slug: "digital-transition",
    title: "소상공인 디지털전환 지원사업",
    titleLines: ["소상공인", "디지털전환 지원사업"],
    summary: "온라인 판매와 디지털 운영 환경 구축을 돕는 전환 지원사업입니다.",
    summaryLines: ["온라인 판매와 디지털 운영 환경 구축을", "돕는 전환 지원사업입니다."],
    tags: [
      { label: "지원금", tone: "blue" },
      { label: "디지털", tone: "gray" },
      { label: "전국", tone: "green" },
    ],
    supportAmountLabel: "최대 500만원",
    deadlineLabel: "D-30",
    deadlineText: "신청마감",
    imageSrc: "/figma-assets/program-digital-transition.png",
    imageTone: "rabbit",
    matchScore: 84,
    analysisTitle: "온라인 전환 과제와 연결됩니다.",
    analysisItems: ["소상공인 대상", "디지털 도입 가능", "온라인 판로 확대", "도입 견적서 준비 필요"],
    detailRows: [
      { label: "지원금", value: "최대 500만원" },
      { label: "예상금리", value: "해당 없음" },
      { label: "신청기간", value: "2026.06.15 ~ 2026.07.28" },
      { label: "지원대상", value: "디지털 전환 희망 소상공인" },
      { label: "사업내용", value: "온라인몰, 예약관리, 마케팅 솔루션 도입 지원" },
    ],
    organizationName: "소상공인시장진흥공단",
    phoneNumber: "1357",
    contactHours: "평일 09:00 ~ 18:00",
    requiredDocuments: ["사업자등록증", "도입계획서", "견적서", "매출 증빙자료"],
  },
  {
    id: "gyeongbuk-business-improvement",
    slug: "gyeongbuk-business-improvement",
    title: "경북 소상공인 경영환경개선사업",
    titleLines: ["경북 소상공인", "경영환경개선사업"],
    summary: "경북 소재 소상공인의 점포 환경과 서비스 품질 개선을 지원합니다.",
    summaryLines: ["경북 소재 소상공인의 점포 환경과", "서비스 품질 개선을 지원합니다."],
    tags: [
      { label: "지원금", tone: "blue" },
      { label: "시설개선", tone: "gray" },
      { label: "경북", tone: "green" },
    ],
    supportAmountLabel: "최대 2,000만원",
    deadlineLabel: "D-35",
    deadlineText: "신청마감",
    imageSrc: "/figma-assets/program-gyeongbuk-business-improvement.png",
    imageTone: "white-point",
    matchScore: 79,
    analysisTitle: "시설 개선 목적과 일부 부합합니다.",
    analysisItems: ["인근 지역 사업", "점포 운영 사업자", "환경개선 항목 가능", "경북 소재 조건 확인 필요"],
    detailRows: [
      { label: "지원금", value: "최대 2,000만원" },
      { label: "예상금리", value: "해당 없음" },
      { label: "신청기간", value: "2026.06.20 ~ 2026.08.03" },
      { label: "지원대상", value: "경북 소재 소상공인" },
      { label: "사업내용", value: "간판, 인테리어, 위생설비 등 경영환경 개선" },
    ],
    organizationName: "경상북도경제진흥원",
    phoneNumber: "054-470-8500",
    contactHours: "평일 09:00 ~ 18:00",
    requiredDocuments: ["사업자등록증", "견적서", "시공 전 사진", "지방세 납세증명서"],
  },
];

export const topRecommendedPrograms = supportPrograms.slice(0, 3);

export function getSupportProgramBySlug(slug: string) {
  return supportPrograms.find((program) => program.slug === slug);
}
