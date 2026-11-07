import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FlaskConical, Info } from "lucide-react";

import DilutionLab from "../../../../components/lab/dilution-lab";
import PhLab from "../../../../components/lab/ph-lab";
import { DILUTION_EXPERIMENT_ID, PH_EXPERIMENT_ID } from "@virtual-chemistry-lab/laboratory-core";

import { getExperimentRecord } from "../../../../lib/content";

type LabPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: LabPageProps): Promise<Metadata> {
  const { id } = await params;
  const record = getExperimentRecord(id);
  return {
    title: record ? `Laboratory · ${record.identity.title}` : "Laboratory",
    description: "Interactive 2D chemistry laboratory workspace.",
  };
}

/**
 * Only experiments that have an implemented model-backed adapter can be
 * opened in the lab. Others get a friendly "not yet implemented" panel that
 * explicitly does NOT provide fabricated interactions.
 */
const IMPLEMENTED_EXPERIMENTS = new Set<string>([DILUTION_EXPERIMENT_ID, PH_EXPERIMENT_ID]);

export default async function LabPage({ params }: LabPageProps) {
  const { id } = await params;
  const record = getExperimentRecord(id);
  if (!record) notFound();

  const implemented = IMPLEMENTED_EXPERIMENTS.has(record.identity.id);

  return (
    <div className="page lab-page">
      <header className="container lab-page-header">
        <div>
          <Link href={`/experiments/${record.identity.slug}`} className="text-link lab-back-link">
            <ArrowLeft size={16} aria-hidden={true} /> Back to experiment
          </Link>
          <p className="eyebrow">Interactive laboratory</p>
          <h1>
            <FlaskConical size={22} aria-hidden={true} /> {record.identity.title}
          </h1>
          <p className="lab-subtitle">
            This virtual laboratory supplements, but does not replace, supervised physical
            laboratory training. All calculations are produced by versioned scientific models;
            visual liquid levels and indicator colours are illustrative and are labelled as such.
          </p>
        </div>
      </header>

      {implemented ? (
        record.identity.id === DILUTION_EXPERIMENT_ID ? (
          <DilutionLab />
        ) : record.identity.id === PH_EXPERIMENT_ID ? (
          <PhLab />
        ) : null
      ) : (
        <div className="container lab-not-implemented">
          <div className="future-lab-panel">
            <div className="future-lab-icon" aria-hidden="true">
              <Info size={22} />
            </div>
            <div>
              <p className="eyebrow">Not yet available</p>
              <h2>This experiment does not yet have a reviewed model-backed workspace.</h2>
              <p>
                Interactive 2D experiences are added only when a documented scientific model exists
                in <code>@virtual-chemistry-lab/simulation-core</code> and has been integrated via{" "}
                <code>@virtual-chemistry-lab/laboratory-core</code>. Fabricated measurements or
                placeholder visualisations are not provided.
              </p>
              <p>
                See <Link href="/experiments/solution-dilution/lab">Solution Dilution</Link> or{" "}
                <Link href="/experiments/ph-and-indicators/lab">Acid-Base pH Exploration</Link> for
                the current model-backed activities.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
