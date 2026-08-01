import type { GetServerSideProps } from "next";
import SupportProgramDetailPage from "@/features/support-program-detail/SupportProgramDetailPage";
import type { SupportProgram } from "@/data/supportPrograms";
import { getPersonalizedSupportPrograms } from "@/lib/supportProgramsApi";

type Props = { program: SupportProgram };

export default function DaeguSpecialGuaranteePage({ program }: Props) {
  return <SupportProgramDetailPage program={program} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    const { programs: [program] } = await getPersonalizedSupportPrograms();
    return program ? { props: { program } } : { notFound: true };
  } catch (error) {
    console.error("지원사업 상세 조회 실패:", error);
    return { notFound: true };
  }
};
