import type { GetServerSideProps } from "next";
import PortfolioAdditionalInfoPage from "@/features/portfolio/PortfolioAdditionalInfoPage";
import { getLatestPortfolioContext, type ExternalDebt } from "@/lib/portfolioApi";

export default function AdditionalInfo({ debts }: { debts: ExternalDebt[] }) {
  return <PortfolioAdditionalInfoPage debts={debts} />;
}

export const getServerSideProps: GetServerSideProps<{ debts: ExternalDebt[] }> = async () => {
  const context = await getLatestPortfolioContext();
  return { props: { debts: context.external_debts } };
};
