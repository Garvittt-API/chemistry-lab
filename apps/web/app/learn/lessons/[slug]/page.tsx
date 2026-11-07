import { getLessonByIdOrSlug } from "@virtual-chemistry-lab/learning-core";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonDetailView } from "../../../../components/learning/lesson-detail-view";
import { getExperimentCards } from "../../../../lib/content";

type LessonPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonByIdOrSlug(slug);
  return {
    title: lesson ? lesson.title : "Chemistry lesson",
    description: lesson?.summary,
  };
}

export default async function LessonDetailPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLessonByIdOrSlug(slug);
  if (!lesson) notFound();

  const experimentTitles: Record<string, string> = {};
  for (const card of getExperimentCards()) {
    experimentTitles[card.id] = card.title;
  }

  return (
    <div className="page section">
      <LessonDetailView lesson={lesson} experimentTitles={experimentTitles} />
    </div>
  );
}
