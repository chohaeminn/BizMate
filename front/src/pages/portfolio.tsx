import type { GetServerSideProps } from "next";
import PortfolioPage from "@/features/portfolio/PortfolioPage";
import { getLatestPortfolioContext, type PortfolioContext } from "@/lib/portfolioApi";

export default function Portfolio({ context }: { context: PortfolioContext }) {
  return <PortfolioPage context={context} />;
}

export const getServerSideProps: GetServerSideProps<{ context: PortfolioContext }> = async () => ({
  props: { context: await getLatestPortfolioContext() },
});
