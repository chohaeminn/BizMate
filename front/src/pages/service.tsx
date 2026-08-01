import type { GetServerSideProps } from "next";
import ServicePage from "@/features/service/ServicePage";
import type { BusinessProfile, SupportProgram } from "@/data/supportPrograms";
import { getAiPersonalizedSupportPrograms } from "@/lib/supportProgramsApi";

type Props = {
  programs: SupportProgram[];
  profile: BusinessProfile | null;
  recommendationSummary: string | null;
};

export default function Service({ programs, profile, recommendationSummary }: Props) {
  return (
    <ServicePage
      programs={programs}
      profile={profile}
      recommendationSummary={recommendationSummary}
    />
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const { summary, ...result } = await getAiPersonalizedSupportPrograms();
    return { props: { ...result, recommendationSummary: summary } };
  } catch (error) {
    console.error("support_llm 지원사업 추천 조회 실패:", error);
    return { props: { programs: [], profile: null, recommendationSummary: null } };
  }
};
