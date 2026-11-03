import { EXPERIMENT_SCHEMA_VERSION } from "@virtual-chemistry-lab/experiment-schema";
import { ArrowRight, BookOpen, Compass, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { demoExperiments, subjectCatalog } from "../lib/content";
import { ExperimentCard, SectionHeading, SubjectCard } from "../components/ui";

export default function HomePage() {
  return (
    <div className="page page-grid">
      <section className="container hero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">A clearer way to learn chemistry</p>
          <h1 id="page-title">Understand the work behind the experiment.</h1>
          <p className="hero-copy">
            Virtual Chemistry Lab is being built as a calm, transparent learning environment for
            exploring chemistry concepts, procedures and evidence—before a future model ever
            produces a reading.
          </p>
          <div className="hero-actions">
            <Link className="button" href="/explore">
              Explore the foundation <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="button button-secondary" href="/about">
              Why this project
            </Link>
          </div>
          <p className="microcopy">
            Phase 02 web foundation · Schema {EXPERIMENT_SCHEMA_VERSION} · No validated experiments
            yet
          </p>
        </div>

        <aside className="hero-note" aria-label="Product principles">
          <div className="hero-note-header">
            <div>
              <p className="eyebrow">Design note 02</p>
              <h2>Make the scientific boundary visible.</h2>
            </div>
            <span className="hero-note-mark" aria-hidden="true">
              <Compass size={28} />
            </span>
          </div>
          <ul className="hero-note-list">
            <li>
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Safety and limitations come before spectacle.</span>
            </li>
            <li>
              <BookOpen size={18} aria-hidden="true" />
              <span>Explanations stay readable at every level.</span>
            </li>
            <li>
              <Compass size={18} aria-hidden="true" />
              <span>Future interactions will expose why a value changes.</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="container section section-border" aria-labelledby="start-title">
        <SectionHeading
          eyebrow="Start with a question"
          title="Find the right doorway into chemistry"
          description="Browse the structure we are preparing for reviewed learning content. Every card below is a demonstration of the interface, not a published experiment."
        />
        <div className="card-grid">
          {demoExperiments.map((experiment) => (
            <ExperimentCard key={experiment.id} experiment={experiment} />
          ))}
        </div>
      </section>

      <section className="container section section-border" aria-labelledby="subjects-title">
        <SectionHeading
          eyebrow="A growing taxonomy"
          title="Explore chemistry by the questions it asks"
          description="The subject structure is intentionally extensible so educators can map future content to different curricula without changing the interface."
        />
        <div className="subject-grid">
          {subjectCatalog.slice(0, 5).map((subject) => (
            <SubjectCard key={subject.name} subject={subject} />
          ))}
        </div>
        <div className="button-row">
          <Link className="text-link" href="/subjects">
            View all subjects <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="container section section-border" aria-labelledby="approach-title">
        <SectionHeading
          eyebrow="How the laboratory will work"
          title="Build understanding before adding interaction"
          description="The foundation separates content, scientific models and presentation so each layer can be reviewed on its own terms."
        />
        <div className="principles-grid">
          <article className="principle-item">
            <ShieldCheck size={25} aria-hidden="true" />
            <h3>Reviewable by design</h3>
            <p>
              Content carries authorship, references, safety context and review status instead of
              hiding provenance behind an animation.
            </p>
          </article>
          <article className="principle-item">
            <BookOpen size={25} aria-hidden="true" />
            <h3>Readable at two depths</h3>
            <p>
              Beginners get a guided path. Advanced learners can reach equations, units, assumptions
              and uncertainty without leaving the page.
            </p>
          </article>
          <article className="principle-item">
            <Compass size={25} aria-hidden="true" />
            <h3>Honest about what is known</h3>
            <p>
              Simulated, theoretical, user-entered and measured values will remain distinct when the
              later laboratory workspace exists.
            </p>
          </article>
        </div>
      </section>

      <section className="container section section-border" aria-labelledby="benefits-title">
        <SectionHeading
          eyebrow="For learners and educators"
          title="A foundation made for careful learning"
        />
        <div className="benefits-grid">
          <div className="benefit-item">
            <h3>School learners</h3>
            <p>
              Clear language, guided structure and visible safety context without assuming
              laboratory experience.
            </p>
          </div>
          <div className="benefit-item">
            <h3>University learners</h3>
            <p>
              Space for equations, units, calculations and the assumptions that give a result
              meaning.
            </p>
          </div>
          <div className="benefit-item">
            <h3>Educators</h3>
            <p>
              A content surface that can eventually show objectives, references, review status and
              curriculum context.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
