import type { Metadata } from "next";

import { NotebookWorkspace } from "../../../components/learning/notebook-workspace";
import { getPublishedExperimentRecordsMap } from "../../../lib/content";

export const metadata: Metadata = {
  title: "Practical Notebook Session",
  description: "Record observations, experimental data tables, calculations and conclusions.",
};

type SessionPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function NotebookSessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  const experimentsById = getPublishedExperimentRecordsMap();

  return (
    <div className="page section">
      <NotebookWorkspace sessionId={sessionId} experimentsById={experimentsById} />
    </div>
  );
}
