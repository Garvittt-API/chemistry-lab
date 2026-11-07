import type { Metadata } from "next";

import { NotebookListView } from "../../components/learning/notebook-list-view";
import { PageIntro } from "../../components/ui";
import { getPublishedExperimentRecords } from "../../lib/content";

export const metadata: Metadata = {
  title: "Practical Notebook",
  description:
    "Create, save, resume and export structured practical chemistry notebook sessions with provenance tracking.",
};

type NotebookPageProps = {
  searchParams: Promise<{ experiment?: string }>;
};

export default async function NotebookPage({ searchParams }: NotebookPageProps) {
  const { experiment } = await searchParams;
  const experiments = getPublishedExperimentRecords().map((r) => ({
    identity: r.identity,
    references: r.references,
  }));

  return (
    <div className="page">
      <PageIntro
        eyebrow="Practical Notebook"
        title="Structured laboratory records with explicit provenance."
        description="Record observations with units, fill structured experimental data tables, run simulation-core calculations, and export honest practical reports. Stored locally in your browser."
      />
      <NotebookListView experiments={experiments} initialExperimentSlug={experiment} />
    </div>
  );
}
