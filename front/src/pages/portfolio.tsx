import type { GetServerSideProps } from "next";
import PortfolioPage from "@/features/portfolio/PortfolioPage";
import { getLatestPortfolioContext, type PortfolioContext } from "@/lib/portfolioApi";

export default function Portfolio({ context }: { context: PortfolioContext }) {
  return <PortfolioPage context={context} />;
}

export const getServerSideProps: GetServerSideProps<{ context: PortfolioContext }> = async ({ req }) => {
  const profileId = req.cookies.bizmate_profile_id;
  if (!profileId) return { redirect: { destination: "/persona", permanent: false } };
  return { props: { context: await getLatestPortfolioContext(profileId) } };
};
