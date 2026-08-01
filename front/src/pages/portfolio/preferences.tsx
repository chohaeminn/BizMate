import type { GetServerSideProps } from "next";
import PortfolioPreferencesPage from "@/features/portfolio/PortfolioPreferencesPage";
import { getLatestPortfolioContext, type PortfolioContext } from "@/lib/portfolioApi";

export default function Preferences({ context }: { context: PortfolioContext }) {
  return <PortfolioPreferencesPage context={context} />;
}

export const getServerSideProps: GetServerSideProps<{ context: PortfolioContext }> = async ({ req }) => {
  const profileId = req.cookies.bizmate_profile_id;
  if (!profileId) return { redirect: { destination: "/persona", permanent: false } };
  return { props: { context: await getLatestPortfolioContext(profileId) } };
};
