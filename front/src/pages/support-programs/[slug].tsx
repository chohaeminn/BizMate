import type { GetStaticPaths, GetStaticProps } from "next";
import SupportProgramDetailPage from "@/features/support-program-detail/SupportProgramDetailPage";
import { getSupportProgramBySlug, supportPrograms, type SupportProgram } from "@/data/supportPrograms";

type SupportProgramPageProps = {
  program: SupportProgram;
};

export default function SupportProgramPage({ program }: SupportProgramPageProps) {
  return <SupportProgramDetailPage program={program} />;
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: supportPrograms
    .filter((program) => program.slug !== "daegu-special-guarantee")
    .map((program) => ({
      params: { slug: program.slug },
    })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<SupportProgramPageProps> = ({ params }) => {
  const slug = String(params?.slug ?? "");
  const program = getSupportProgramBySlug(slug);

  if (!program) {
    return { notFound: true };
  }

  return {
    props: {
      program,
    },
  };
};
