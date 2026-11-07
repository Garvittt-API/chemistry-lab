"use client";

import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";
import type { MeasurementRecord, ObservationNote } from "@virtual-chemistry-lab/laboratory-core";
import { recordLabRunInSession } from "@virtual-chemistry-lab/learning-core";
import { BookOpenCheck, ExternalLink, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useLearningStore } from "./learning-store-provider";

export function LabNotebookBridge({
  experiment,
  modelId,
  modelVersion,
  engineName = "@virtual-chemistry-lab/simulation-core",
  engineVersion = "0.1.0",
  inputs,
  measurements,
  observations,
  assumptions,
  limitations,
  completedStepCount,
  totalStepCount,
}: Readonly<{
  experiment: Pick<ExperimentRecord, "identity" | "references">;
  modelId: string;
  modelVersion: string;
  engineName?: string;
  engineVersion?: string;
  inputs: ReadonlyArray<{ label: string; value: number | string; unit: string }>;
  measurements: ReadonlyArray<MeasurementRecord>;
  observations: ReadonlyArray<ObservationNote>;
  assumptions?: ReadonlyArray<string>;
  limitations?: ReadonlyArray<string>;
  completedStepCount: number;
  totalStepCount: number;
}>) {
  const { hydrated, snapshot, createSession, saveSession } = useLearningStore();
  const [selectedSessionId, setSelectedSessionId] = useState<string>("new");
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const matchingSessions = snapshot.sessions.filter(
    (s) => s.experimentId === experiment.identity.id,
  );
  const hasRecords = measurements.length > 0 || observations.length > 0;

  const handleSaveToNotebook = () => {
    const targetSession =
      selectedSessionId !== "new"
        ? matchingSessions.find((s) => s.sessionId === selectedSessionId)
        : undefined;

    const baseSession = targetSession ?? createSession({ experiment });
    const updated = recordLabRunInSession(baseSession, {
      engineName,
      engineVersion,
      modelId,
      modelVersion,
      inputs,
      measurements,
      qualitativeNotes: observations,
      assumptions,
      limitations,
      completedStepCount,
      totalStepCount,
    });
    saveSession(updated);
    setSelectedSessionId(updated.sessionId);
    setSavedSessionId(updated.sessionId);
  };

  return (
    <section className="lab-notebook-bridge" aria-labelledby="notebook-bridge-heading">
      <div className="lab-panel-header">
        <h3 id="notebook-bridge-heading">
          <BookOpenCheck size={16} aria-hidden="true" /> Practical Notebook
        </h3>
      </div>
      <p className="card-meta">
        Append your model-calculated readings and qualitative notes to a local practical notebook
        session without overwriting previous entries.
      </p>

      {hydrated && matchingSessions.length > 0 ? (
        <label className="lab-control-label">
          Target notebook session
          <select
            className="lab-select"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
          >
            <option value="new">+ Create new notebook session</option>
            {matchingSessions.map((s) => (
              <option key={s.sessionId} value={s.sessionId}>
                {s.title} ({s.status.replace(/_/g, " ")})
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <button
        type="button"
        className="button button-secondary btn-block"
        disabled={!hasRecords}
        onClick={handleSaveToNotebook}
      >
        <PlusCircle size={15} aria-hidden="true" />{" "}
        {hasRecords ? "Append run to Practical Notebook" : "Run a step or note to save"}
      </button>

      {savedSessionId ? (
        <p className="lab-bridge-saved" role="status">
          Saved to notebook.{" "}
          <Link className="text-link" href={`/notebook/${savedSessionId}`}>
            Open session <ExternalLink size={14} aria-hidden="true" />
          </Link>
        </p>
      ) : (
        <p className="card-meta">
          <Link className="text-link" href="/notebook">
            View all notebook sessions
          </Link>
        </p>
      )}
    </section>
  );
}
