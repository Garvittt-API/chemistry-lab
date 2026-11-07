import type { Metadata } from "next";

import { GlossaryView } from "../../../components/learning/glossary-view";
import { PageIntro } from "../../../components/ui";

export const metadata: Metadata = {
  title: "Chemistry Glossary",
  description:
    "Definitions, symbols, units and experiment cross-references for key chemistry terms.",
};

export default function GlossaryPage() {
  return (
    <div className="page">
      <PageIntro
        eyebrow="Scientific Glossary"
        title="Definitions, symbols and SI-consistent units."
        description="Search core laboratory and theoretical chemistry concepts with explicit symbols, units and traceable textbook/IUPAC references."
      />
      <GlossaryView />
    </div>
  );
}
