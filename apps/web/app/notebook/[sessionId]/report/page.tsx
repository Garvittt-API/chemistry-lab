import type { Metadata } from "next";

import { ReportBuilderView } from "../../../../components/learning/report-builder-view";
import { getPublishedExperimentRecordsMap } from "../../../../lib/content";

export const metadata: Metadata = {
  title: "Practical Laboratory Report",
  description:
    "Generate and export provenance-preserving PDF, HTML, CSV and JSON chemistry practical reports.",
};

type ReportPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function NotebookReportPage({ params }: ReportPageProps) {
  const { sessionId } = await params;
  const experimentsById = getPublishedExperimentRecordsMap();

  return (
    <div className="page section">
      <ReportBuilderView sessionId={sessionId} experimentsById={experimentsById} />
    </div>
  );
}
