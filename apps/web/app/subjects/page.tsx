import type { Metadata } from "next";

import { SectionHeading, SubjectCard } from "../../components/ui";
import { subjectCatalog } from "../../lib/content";

export const metadata: Metadata = {
  title: "Chemistry subjects",
  description: "Explore the extensible chemistry subject taxonomy.",
};

export default function SubjectsPage() {
  return (
    <div className="page">
      <section className="container page-intro">
        <div>
          <p className="eyebrow">Chemistry subjects</p>
          <h1>Follow the ideas across disciplines.</h1>
          <p className="page-intro-copy">
            A flexible starting taxonomy for future reviewed learning modules. Categories can grow
            with curriculum and educator input.
          </p>
        </div>
      </section>
      <section className="container section section-border" aria-labelledby="subject-list-title">
        <SectionHeading
          id="subject-list-title"
          eyebrow="Initial taxonomy proposal"
          title="A map for future content"
          description="These subject descriptions are orientation copy only. They do not represent a completed content library or scientific review."
        />
        <div className="subject-grid">
          {subjectCatalog.map((subject) => (
            <SubjectCard key={subject.name} subject={subject} />
          ))}
        </div>
      </section>
    </div>
  );
}
