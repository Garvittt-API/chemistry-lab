import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";

import { DemoBadge, EmptyState, FutureLabPanel } from "../../../components/ui";
import { demoExperiments } from "../../../lib/content";

type ExperimentPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ExperimentPageProps): Promise<Metadata> {
  const { id } = await params;
  const experiment = demoExperiments.find((item) => item.id === id);
  return { title: experiment?.title ?? "Experiment detail" };
}

export default async function ExperimentDetailPage({ params }: ExperimentPageProps) {
  const { id } = await params;
  const experiment = demoExperiments.find((item) => item.id === id);
  if (!experiment) notFound();

  return (
    <div className="page page-grid">
      <header className="container detail-header">
        <div>
          <DemoBadge />
          <p className="eyebrow detail-eyebrow">{experiment.discipline}</p>
          <h1>{experiment.title}</h1>
          <p className="detail-summary">
            {experiment.summary} This page demonstrates the information architecture for a future
            reviewed experiment.
          </p>
        </div>
        <dl className="detail-meta">
          <div>
            <dt>Level</dt>
            <dd>{experiment.level}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{experiment.difficulty}</dd>
          </div>
          <div>
            <dt>Content status</dt>
            <dd>Demonstration</dd>
          </div>
        </dl>
      </header>

      <div className="container detail-layout">
        <nav className="detail-nav" aria-label="Experiment sections">
          <a href="#overview">Overview</a>
          <a href="#theory">Theory</a>
          <a href="#materials">Materials</a>
          <a href="#safety">Safety</a>
          <a href="#workspace">Workspace</a>
          <a href="#references">References</a>
        </nav>

        <div className="detail-content">
          <section className="detail-section" id="overview" aria-labelledby="overview-title">
            <h2 id="overview-title">Overview</h2>
            <p>
              This demonstration record exists to show where an educator-reviewed experiment will
              explain its purpose, scope and expected learning journey.
            </p>
            <h3>Learning objectives</h3>
            <ul className="objective-list">
              {experiment.objectives.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </section>

          <section className="detail-section" id="theory" aria-labelledby="theory-title">
            <h2 id="theory-title">Theory and equations</h2>
            <EmptyState
              title="Theory is not published for this demonstration"
              description="Reviewed theory, symbol definitions, units and equations will be supplied with future content. No scientific claim is being made here."
            />
          </section>

          <section className="detail-section" id="materials" aria-labelledby="materials-title">
            <h2 id="materials-title">Equipment, chemicals and materials</h2>
            <div className="content-table-wrap">
              <table className="content-table">
                <caption className="sr-only">
                  Materials area for the future reviewed experiment
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Category</th>
                    <th scope="col">Information</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Content record</td>
                    <td>No equipment or chemical list is provided.</td>
                    <td>
                      <span className="badge badge-muted">Awaiting review</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="detail-section" id="safety" aria-labelledby="safety-title">
            <h2 id="safety-title">Safety information</h2>
            <div className="safety-panel">
              <ShieldAlert size={23} aria-hidden="true" />
              <div>
                <h3>Safety context comes before interaction</h3>
                <p>
                  This demonstration contains no procedure, chemical handling instruction or
                  executable laboratory activity. Future content will require safety review and
                  visible limitations.
                </p>
              </div>
            </div>
          </section>

          <section className="detail-section" aria-labelledby="procedure-title">
            <h2 id="procedure-title">Procedure</h2>
            <EmptyState
              title="No procedure is available"
              description="A future procedure will be authored, reviewed and separated from simulation controls. This page intentionally provides no operational instructions."
            />
          </section>

          <section className="detail-section" id="workspace" aria-labelledby="workspace-title">
            <h2 id="workspace-title">Simulation, observations and calculations</h2>
            <FutureLabPanel />
            <div className="measurement-empty measurement-empty-spaced">
              <p>
                There are no readings, observations or calculations to display. No values have been
                fabricated for this demonstration.
              </p>
            </div>
          </section>

          <section className="detail-section" id="references" aria-labelledby="references-title">
            <h2 id="references-title">References and model assumptions</h2>
            <EmptyState
              title="References will appear with reviewed content"
              description="The content contract requires provenance, references, assumptions and limitations before an experiment can be presented as reviewed."
            />
          </section>
        </div>
      </div>
    </div>
  );
}
