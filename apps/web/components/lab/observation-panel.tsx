"use client";

import { useState } from "react";

import { NotebookPen, Plus } from "lucide-react";

import type { MeasurementRecord, ObservationNote } from "@virtual-chemistry-lab/laboratory-core";
import {
  formatConcentration,
  formatDecimal,
  formatPh,
} from "@virtual-chemistry-lab/laboratory-core";

import { classNames } from "../../lib/utils";

/**
 * Measurement & observation panel.
 *
 * All measurements shown here are tagged with their data source:
 * "Calculated by model", "Entered by you", etc. — per the integrity rule
 * that categories never get mixed silently.
 */
export function ObservationPanel({
  measurements,
  observations,
  canAddObservation,
  onAddObservation,
}: {
  measurements: ReadonlyArray<MeasurementRecord>;
  observations: ReadonlyArray<ObservationNote>;
  canAddObservation: boolean;
  onAddObservation: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const formatForUnit = (value: number, unit: string): string => {
    if (unit === "pH") return formatPh(value);
    if (unit === "pOH") return formatPh(value);
    if (unit === "mol/L") {
      if (Math.abs(value) < 1e-4) return value.toExponential(2);
      return formatConcentration(value);
    }
    if (unit === "mol") return formatDecimal(value, 5);
    if (unit === "(ratio)") return value.toFixed(4);
    return formatDecimal(value, 3);
  };

  return (
    <section className="lab-observations" aria-labelledby="observations-title">
      <div className="lab-panel-header">
        <h3 id="observations-title">
          <NotebookPen size={16} aria-hidden={true} /> Measurements &amp; observations
        </h3>
      </div>

      {measurements.length === 0 ? (
        <p className="lab-empty-hint">
          No measurements recorded yet — complete steps to capture data.
        </p>
      ) : (
        <ul className="lab-measurement-list" aria-label="Recorded measurements">
          {measurements.map((m) => (
            <li key={m.id} className="lab-measurement">
              <div className="lab-measurement-main">
                <span className="lab-measurement-label">{m.label}</span>
                <span className="lab-measurement-value">
                  {formatForUnit(m.value ?? 0, m.unit)} <span className="lab-unit">{m.unit}</span>
                </span>
              </div>
              <span className={classNames("lab-source-badge", `lab-source-${m.source}`)}>
                {sourceLabel(m.source)}
                {m.modelId ? <> · {m.modelId}</> : null}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="lab-observation-notes">
        <h4>Qualitative notes</h4>
        {observations.length === 0 ? (
          <p className="lab-empty-hint">
            Record observations (colours, changes, anything you notice).
          </p>
        ) : (
          <ul>
            {observations.map((o) => (
              <li key={o.id} className="lab-note">
                <span className="lab-note-step">Step {o.stepIndex + 1}</span>
                <span>{o.text}</span>
              </li>
            ))}
          </ul>
        )}
        {canAddObservation ? (
          <form
            className="lab-note-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim().length > 0) {
                onAddObservation(draft.trim());
                setDraft("");
              }
            }}
          >
            <label htmlFor="obs-note" className="sr-only">
              Observation note
            </label>
            <input
              id="obs-note"
              type="text"
              placeholder="Write an observation…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="lab-note-input"
            />
            <button type="submit" className="button button-secondary btn-small">
              <Plus size={14} aria-hidden={true} /> Add
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}

function sourceLabel(source: MeasurementRecord["source"]): string {
  switch (source) {
    case "model_calculated":
      return "Calculated by model";
    case "user_entered":
      return "Entered by you";
    case "reference_dataset":
      return "Reference dataset";
    case "illustrative":
      return "Illustrative only";
  }
}
