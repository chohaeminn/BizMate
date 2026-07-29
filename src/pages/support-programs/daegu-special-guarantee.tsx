import SupportProgramDetailPage from "@/features/support-program-detail/SupportProgramDetailPage";
import { getSupportProgramBySlug } from "@/data/supportPrograms";

export default function DaeguSpecialGuaranteePage() {
  return <SupportProgramDetailPage program={getSupportProgramBySlug("daegu-special-guarantee")} />;
}
