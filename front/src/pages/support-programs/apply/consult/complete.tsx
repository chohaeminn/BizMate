import type { GetServerSideProps } from "next";
import SupportProgramConsultCompletePage from "@/features/support-program-consult-complete/SupportProgramConsultCompletePage";
import { getBusinessProfiles } from "@/lib/supportProgramsApi";

export default SupportProgramConsultCompletePage;

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  if (!req.cookies.bizmate_profile_id) {
    try {
      const [profile] = await getBusinessProfiles();
      if (profile) {
        res.setHeader(
          "Set-Cookie",
          `bizmate_profile_id=${encodeURIComponent(profile.id)}; Path=/; SameSite=Lax`,
        );
      }
    } catch (error) {
      console.error("상담 완료 페이지 프로필 쿠키 설정 실패:", error);
    }
  }

  return { props: {} };
};
