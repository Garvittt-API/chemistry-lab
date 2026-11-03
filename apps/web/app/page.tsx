import { EXPERIMENT_SCHEMA_VERSION } from "@virtual-chemistry-lab/experiment-schema";

export default function HomePage() {
  const environment = process.env.NEXT_PUBLIC_APP_ENV ?? "development";

  return (
    <main className="shell">
      <section className="card" aria-labelledby="page-title">
        <p className="eyebrow">Phase 01 foundation</p>
        <h1 id="page-title">Virtual Chemistry Lab</h1>
        <p>
          The engineering foundation is ready for reviewed educational experiment content. No
          simulations are implemented in this phase.
        </p>
        <dl className="metadata">
          <div>
            <dt>Environment</dt>
            <dd>{environment}</dd>
          </div>
          <div>
            <dt>Experiment schema</dt>
            <dd>{EXPERIMENT_SCHEMA_VERSION}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
