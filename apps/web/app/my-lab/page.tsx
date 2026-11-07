import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";

import { MyLabDashboard } from "../../components/learning/my-lab-dashboard";
import { PageIntro } from "../../components/ui";

export const metadata: Metadata = {
  title: "My Lab",
  description: "Local learner progress dashboard, pathways and practical notebook sessions.",
};

export default function MyLabPage() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="My Lab"
        title="Your local learning & practical notebook workspace."
        description="Track completed lessons, practical sessions, engine calculations, assessments and generated reports. All records stay locally in this browser — no account or cloud sync is required."
      >
        <span className="badge badge-muted">
          <LockKeyhole size={14} aria-hidden="true" /> Local browser storage only
        </span>
      </PageIntro>
      <MyLabDashboard />
    </div>
  );
}
