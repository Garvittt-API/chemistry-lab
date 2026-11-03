import type { Metadata } from "next";
import { ClipboardList, LockKeyhole } from "lucide-react";

import { EmptyState, PageIntro } from "../../components/ui";

export const metadata: Metadata = {
  title: "My Lab",
  description: "The future local learning workspace boundary.",
};

export default function MyLabPage() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="My Lab"
        title="A workspace for careful observation."
        description="This area is reserved for future notebook and learning flows. Accounts, cloud storage and progress tracking are not implemented in Phase 02."
      >
        <span className="badge badge-muted">
          <LockKeyhole size={14} aria-hidden="true" /> Local foundation only
        </span>
      </PageIntro>
      <section className="container section section-border" aria-labelledby="my-lab-title">
        <EmptyState
          title="No learner records yet"
          description="When the notebook exists, it will distinguish simulated, theoretical, user-entered and measured values. Nothing is being stored here today."
        />
        <div className="help-panel my-lab-note">
          <ClipboardList size={24} aria-hidden="true" />
          <h2 id="my-lab-title">Designed for provenance</h2>
          <p>
            The future workspace will preserve experiment versions, model conditions and observation
            labels so a learner can understand where a value came from.
          </p>
        </div>
      </section>
    </div>
  );
}
