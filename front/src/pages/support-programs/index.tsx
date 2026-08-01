import type { GetServerSideProps } from "next";
import SupportProgramListPage from "@/features/support-program-list/SupportProgramListPage";
import type { BusinessProfile, SupportProgram } from "@/data/supportPrograms";
import { getPersonalizedSupportPrograms } from "@/lib/supportProgramsApi";

type Props = { programs: SupportProgram[]; profile: BusinessProfile | null };

export default function SupportProgramsPage({ programs, profile }: Props) {
  return <SupportProgramListPage programs={programs} profile={profile} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  try {
    const profileId = req.cookies.bizmate_profile_id;
    if (!profileId) return { redirect: { destination: "/persona", permanent: false } };
    return { props: await getPersonalizedSupportPrograms(profileId) };
  } catch (error) {
    console.error("지원사업 목록 조회 실패:", error);
    return { props: { programs: [], profile: null } };
  }
};
