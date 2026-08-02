import type { GetServerSideProps } from "next";

import type { BusinessProfile } from "@/data/supportPrograms";
import PersonaSelectionPage from "@/features/persona/PersonaSelectionPage";
import { getBusinessProfiles } from "@/lib/supportProgramsApi";

type Props = {
  profiles: BusinessProfile[];
};

export default function Persona({ profiles }: Props) {
  return <PersonaSelectionPage profiles={profiles} />;
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  try {
    return { props: { profiles: await getBusinessProfiles() } };
  } catch (error) {
    console.error("사업자 페르소나 목록 조회 실패:", error);
    return { props: { profiles: [] } };
  }
};
