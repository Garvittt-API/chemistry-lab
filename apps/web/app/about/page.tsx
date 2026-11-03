import type { Metadata } from "next";
import { BookOpen, GitBranch, ShieldCheck } from "lucide-react";

import { SectionHeading } from "../../components/ui";

export const metadata: Metadata = {
  title: "About the project",
  description: "The vision and scientific integrity principles behind Virtual Chemistry Lab.",
};

export default function AboutPage() {
  return (
    <div className="page">
      <section className="container page-intro">
        <div>
          <p className="eyebrow">About the project</p>
          <h1>A learning instrument, built carefully.</h1>
          <p className="page-intro-copy">
            Virtual Chemistry Lab aims to help learners understand chemistry through structured
            explanations and responsible interactive models. The identity is temporary; the
            standards are not.
          </p>
        </div>
      </section>
      <section className="container section section-border" aria-labelledby="about-purpose-title">
        <div className="about-grid">
          <div>
            <SectionHeading
              id="about-purpose-title"
              eyebrow="Purpose"
              title="Make the reasoning visible"
              description="The project is designed for school learners, undergraduate students, teachers, laboratory instructors and contributors who care about provenance and accessibility."
            />
            <p className="body-copy">
              The first complete learning experiences will be small and reviewed. They will
              distinguish theory, simulation and physical measurement, document assumptions, and
              avoid presenting interface placeholders as scientific results.
            </p>
          </div>
          <aside className="about-note">
            <ShieldCheck size={25} aria-hidden="true" />
            <h2>Scientific integrity</h2>
            <p>
              Passing software tests will never be treated as proof of scientific correctness.
              Future models require reference cases, limitations and qualified human review.
            </p>
          </aside>
        </div>
      </section>
      <section className="container section section-border" aria-labelledby="about-values-title">
        <SectionHeading
          id="about-values-title"
          eyebrow="Working principles"
          title="Open to scrutiny, designed for learning"
        />
        <div className="principles-grid">
          <article className="principle-item">
            <BookOpen size={25} aria-hidden="true" />
            <h3>Explain, do not impress</h3>
            <p>
              Visual design supports a learner's question; it does not replace a clear explanation.
            </p>
          </article>
          <article className="principle-item">
            <ShieldCheck size={25} aria-hidden="true" />
            <h3>Safety is part of the lesson</h3>
            <p>
              Safety context, intended use and limitations belong beside procedures and controls.
            </p>
          </article>
          <article className="principle-item">
            <GitBranch size={25} aria-hidden="true" />
            <h3>Contributions need provenance</h3>
            <p>
              The repository is private during initial development. Future contribution workflows
              will document source, license and review status.
            </p>
          </article>
        </div>
      </section>
      <section
        className="container section section-border"
        aria-labelledby="about-contribute-title"
      >
        <div className="help-panel">
          <p className="eyebrow">Contribution direction</p>
          <h2 id="about-contribute-title">Bring a question, a review or a correction</h2>
          <p>
            Contributors will eventually be able to propose content, accessibility improvements and
            scientific corrections through the documented workflow. This page does not claim that
            the repository is already publicly open-source.
          </p>
        </div>
      </section>
    </div>
  );
}
