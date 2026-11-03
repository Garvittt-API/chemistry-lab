import type { Metadata } from "next";
import { CircleHelp, Keyboard, ShieldCheck } from "lucide-react";

import { SectionHeading } from "../../components/ui";

export const metadata: Metadata = {
  title: "Help and guidance",
  description: "Guidance for navigating the Virtual Chemistry Lab foundation.",
};

export default function HelpPage() {
  return (
    <div className="page">
      <section className="container page-intro">
        <div>
          <p className="eyebrow">Help and guidance</p>
          <h1>Know what the interface is telling you.</h1>
          <p className="page-intro-copy">
            The foundation is intentionally small. These notes explain the current boundaries while
            the reviewed content pipeline is being built.
          </p>
        </div>
      </section>
      <section className="container section section-border" aria-labelledby="help-title">
        <SectionHeading
          id="help-title"
          eyebrow="Three useful rules"
          title="Read the status, then the explanation"
        />
        <div className="help-grid">
          <article className="help-panel">
            <CircleHelp size={24} aria-hidden="true" />
            <h2>Demonstration content</h2>
            <p>
              Cards and detail pages marked with this label show interface structure only. They are
              not reviewed experiments.
            </p>
          </article>
          <article className="help-panel">
            <ShieldCheck size={24} aria-hidden="true" />
            <h2>Safety context</h2>
            <p>
              Future procedures will show intended use, precautions, limitations and review status
              before any workspace interaction.
            </p>
          </article>
          <article className="help-panel">
            <Keyboard size={24} aria-hidden="true" />
            <h2>Keyboard first</h2>
            <p>
              Use Tab to move through controls, Enter or Space to activate them, and the visible
              skip link to reach page content quickly.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
