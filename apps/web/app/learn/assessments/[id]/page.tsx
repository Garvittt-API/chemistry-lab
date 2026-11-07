import { getAssessmentByIdOrSlug } from "@virtual-chemistry-lab/learning-core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AssessmentRunner } from "../../../../components/learning/assessment-runner";

type AssessmentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: AssessmentPageProps): Promise<Metadata> {
  const { id } = await params;
  const assessment = getAssessmentByIdOrSlug(id);
  return {
    title: assessment ? assessment.title : "Chemistry assessment",
    description: assessment?.description,
  };
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { id } = await params;
  const assessment = getAssessmentByIdOrSlug(id);
  if (!assessment) notFound();

  return (
    <div className="page section">
      <AssessmentRunner assessment={assessment} />
    </div>
  );
}
