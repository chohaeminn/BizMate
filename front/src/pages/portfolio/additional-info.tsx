import type { GetServerSideProps } from "next";
import PortfolioAdditionalInfoPage from "@/features/portfolio/PortfolioAdditionalInfoPage";
import { getLatestPortfolioContext, type ExternalDebt } from "@/lib/portfolioApi";

export default function AdditionalInfo({ debts }: { debts: ExternalDebt[] }) {
  return <PortfolioAdditionalInfoPage debts={debts} />;
}

export const getServerSideProps: GetServerSideProps<{ debts: ExternalDebt[] }> = async ({ req }) => {
  const profileId = req.cookies.bizmate_profile_id;
  if (!profileId) return { redirect: { destination: "/persona", permanent: false } };
  const context = await getLatestPortfolioContext(profileId);
  return { props: { debts: context.external_debts } };
};
