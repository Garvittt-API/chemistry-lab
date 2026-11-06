import type { Metadata } from "next";

import { SectionHeading, SubjectCard } from "../../components/ui";
import { getSubjects } from "../../lib/content";

export const metadata: Metadata = {
  title: "Chemistry subjects",
  description: "Explore the Virtual Chemistry Lab chemistry discipline taxonomy.",
};

export default function SubjectsPage() {
  const subjects = getSubjects();

  return (
    <div className="page">
      <section className="container page-intro">
        <div>
          <p className="eyebrow">Chemistry subjects</p>
          <h1>Follow the ideas across disciplines.</h1>
          <p className="page-intro-copy">
            A 15-discipline taxonomy of chemistry, with subdisciplines and topics that grow with
            curriculum and educator input. Experiment counts below are real catalog counts.
          </p>
        </div>
      </section>
      <section className="container section section-border" aria-labelledby="subject-list-title">
        <SectionHeading
          id="subject-list-title"
          eyebrow="Discipline taxonomy"
          title="A map for reviewed content"
          description="Disciplines with zero published experiments are part of the planned scope, not an empty promise: they are kept visible so learners can see where the library is heading and where contributions are welcome."
        />
        <div className="subject-grid">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </section>
    </div>
  );
}
