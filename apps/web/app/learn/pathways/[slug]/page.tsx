import { getPathwayByIdOrSlug } from "@virtual-chemistry-lab/learning-core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PathwayDetailView } from "../../../../components/learning/pathway-detail-view";

type PathwayPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PathwayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pathway = getPathwayByIdOrSlug(slug);
  return {
    title: pathway ? pathway.title : "Learning pathway",
    description: pathway?.description,
  };
}

export default async function PathwayDetailPage({ params }: PathwayPageProps) {
  const { slug } = await params;
  const pathway = getPathwayByIdOrSlug(slug);
  if (!pathway) notFound();

  return (
    <div className="page section">
      <PathwayDetailView pathway={pathway} />
    </div>
  );
}
