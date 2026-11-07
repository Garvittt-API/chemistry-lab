import type { Metadata } from "next";

import { LearnHubView } from "../../components/learning/learn-hub-view";
import { PageIntro } from "../../components/ui";

export const metadata: Metadata = {
  title: "Learning Pathways & Lessons",
  description:
    "Structured chemistry pathways, lessons, worked examples, glossary and model-backed assessments.",
};

export default function LearnPage() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="Learning System"
        title="Structured pathways from fundamentals to quantitative analysis."
        description="Follow guided sequences across beginner, school, intermediate, undergraduate and advanced chemistry tracks, study theory and equations, practice in virtual laboratories, and check understanding."
      />
      <LearnHubView />
    </div>
  );
}
