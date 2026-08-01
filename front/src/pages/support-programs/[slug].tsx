import type { GetServerSideProps } from "next";
import SupportProgramDetailPage from "@/features/support-program-detail/SupportProgramDetailPage";
import type { SupportProgram } from "@/data/supportPrograms";
import { getPersonalizedSupportPrograms, getSupportProgram } from "@/lib/supportProgramsApi";

type SupportProgramPageProps = {
  program: SupportProgram;
};

export default function SupportProgramPage({ program }: SupportProgramPageProps) {
  return <SupportProgramDetailPage program={program} />;
}

export const getServerSideProps: GetServerSideProps<SupportProgramPageProps> = async ({ params, req }) => {
  const slug = String(params?.slug ?? "");
  try {
    const profileId = req.cookies.bizmate_profile_id;
    if (!profileId) return { redirect: { destination: "/persona", permanent: false } };
    const { programs } = await getPersonalizedSupportPrograms(profileId);
    const program = programs.find((item) => item.id === slug) ?? await getSupportProgram(slug);
    return { props: { program } };
  } catch (error) {
    console.error("지원사업 상세 조회 실패:", error);
    return { notFound: true };
  }
};
