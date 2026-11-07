"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, Beaker, Droplets } from "lucide-react";

import {
  PH_PROCEDURE,
  SUPPORTED_ELECTROLYTES,
  addObservation,
  calculatePh,
  completeStepWithMeasurements,
  createInitialState,
  formatDecimal,
  formatPh,
  getEquipment,
  phProvenanceLabel,
  startProcedure,
  type MeasurementRecord,
  type PhExplorationResult,
} from "@virtual-chemistry-lab/laboratory-core";

import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";
import { EquipmentSprite } from "./equipment-svg";
import { EquipmentTray } from "./equipment-tray";
import { ObservationPanel } from "./observation-panel";
import { ProcedurePanel } from "./procedure-panel";
import { LabNotebookBridge } from "../learning/lab-notebook-bridge";

/** Equipment needed for pH exploration. */
const AVAILABLE_EQUIPMENT_IDS = [
  "beaker-100",
  "beaker-250",
  "ph-meter",
  "glass-rod",
  "wash-bottle",
];

let noteSeq = 0;

export default function PhLab({
  experiment,
}: Readonly<{
  experiment?: Pick<ExperimentRecord, "identity" | "references">;
}> = {}) {
  const [placed, setPlaced] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [procedure, setProcedure] = useState(() => createInitialState(PH_PROCEDURE));
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([]);
  const [modelError, setModelError] = useState<string | null>(null);
  const [result, setResult] = useState<PhExplorationResult | null>(null);
  const [limitations, setLimitations] = useState<ReadonlyArray<string>>([]);

  // Inputs
  const [electrolyteId, setElectrolyteId] = useState<string>("hcl-strong");
  const [concentration, setConcentration] = useState<number>(0.01);

  const placedIds = useMemo(() => new Set(placed.map((p) => p.id)), [placed]);
  const availableEquipment = useMemo(() => AVAILABLE_EQUIPMENT_IDS.map(getEquipment), []);

  const addEquipment = useCallback((id: string) => {
    setPlaced((prev) => {
      if (prev.some((p) => p.id === id)) return prev;
      const offset = prev.length;
      return [...prev, { id, x: 60 + offset * 160, y: 110 }];
    });
  }, []);

  const start = useCallback(() => {
    setProcedure((p) => startProcedure(p));
    setPlaced((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const additions: Array<{ id: string; x: number; y: number }> = [];
      let offset = prev.length;
      for (const reqId of PH_PROCEDURE[0]!.requiredEquipment) {
        if (!existing.has(reqId)) {
          additions.push({ id: reqId, x: 60 + offset * 160, y: 110 });
          offset++;
        }
      }
      return [...prev, ...additions];
    });
  }, []);

  const reset = useCallback(() => {
    setProcedure(createInitialState(PH_PROCEDURE));
    setMeasurements([]);
    setPlaced([]);
    setSelectedId(null);
    setModelError(null);
    setResult(null);
  }, []);

  const advanceStep = useCallback(
    (m: MeasurementRecord[]) => {
      setProcedure((p) => {
        const next = completeStepWithMeasurements(p, m, placedIds);
        if (next.lastError) return next;
        setMeasurements((sm) => [...sm, ...m]);
        setModelError(null);
        return next;
      });
    },
    [placedIds],
  );

  const runPh = () => {
    try {
      const {
        result: r,
        measurements: m,
        limitations: l,
      } = calculatePh({
        electrolyteId,
        concentration,
      });
      setResult(r);
      setLimitations(l);
      const stepIdx = procedure.currentStepIndex;
      const tagged = m.map((mm, i) => ({ ...mm, stepIndex: stepIdx, id: `${mm.id}-${i}` }));
      advanceStep(tagged);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Calculation failed.";
      setModelError(message);
    }
  };

  const addNote = (text: string) => {
    noteSeq++;
    setProcedure((p) => addObservation(p, text, () => `obs-${noteSeq}`));
  };

  const phReading = result?.ph ?? null;
  const currentStepIdx = procedure.currentStepIndex;

  const liquidColor =
    electrolyteId === "acetic-weak"
      ? "#fef3c7" // pale yellow for vinegar illustrative
      : "#bfdbfe";

  const beaker100Volume = concentration > 0 ? 60 : 0; // illustrative volume

  // pH colour is illustrative (universal-indicator rainbow).
  const indicatorColor = phColor(phReading);

  return (
    <div className="lab-layout">
      <aside className="lab-sidebar-left">
        <EquipmentTray available={availableEquipment} placed={placedIds} onAdd={addEquipment} />

        <section className="lab-controls" aria-labelledby="controls-title">
          <div className="lab-panel-header">
            <h3 id="controls-title">Parameters</h3>
          </div>

          <div className="lab-control-group">
            <label className="lab-control-label">
              Acid or base
              <select
                className="lab-select"
                value={electrolyteId}
                onChange={(e) => setElectrolyteId(e.target.value)}
                disabled={currentStepIdx < 1}
              >
                {SUPPORTED_ELECTROLYTES.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="lab-control-hint">
              {SUPPORTED_ELECTROLYTES.find((e) => e.id === electrolyteId)?.note}
            </p>
          </div>

          <div className="lab-control-group">
            <label className="lab-control-label">
              Analytical concentration (mol/L)
              <input
                type="number"
                className="lab-input"
                min={0}
                max={2}
                step={0.001}
                value={Number.isFinite(concentration) ? concentration : ""}
                onChange={(e) => setConcentration(parseFloat(e.target.value))}
                disabled={currentStepIdx < 2}
              />
            </label>
            <p className="lab-control-hint">
              Recommended range 0.0001–1.0 mol/L (activity assumptions break down at higher ionic
              strength).
            </p>
          </div>

          {currentStepIdx === 0 && procedure.status !== "not_started" ? (
            <button
              type="button"
              className="button btn-block"
              onClick={() => advanceStep([])}
              disabled={!PH_PROCEDURE[0]!.requiredEquipment.every((id) => placedIds.has(id))}
            >
              <Beaker size={15} aria-hidden={true} /> Glassware ready — continue
            </button>
          ) : null}
          {currentStepIdx === 1 ? (
            <button type="button" className="button btn-block" onClick={() => advanceStep([])}>
              Choose concentration
            </button>
          ) : null}
          {currentStepIdx === 2 ? (
            <button type="button" className="button btn-block" onClick={() => advanceStep([])}>
              Ready to measure
            </button>
          ) : null}
          {currentStepIdx === 3 ? (
            <button type="button" className="button btn-block" onClick={runPh}>
              <Droplets size={15} aria-hidden={true} /> Dip electrode / read pH
            </button>
          ) : null}

          {modelError ? (
            <div className="lab-error" role="alert">
              <AlertTriangle size={16} aria-hidden={true} />
              <p>{modelError}</p>
            </div>
          ) : null}
        </section>
      </aside>

      <section className="lab-workspace" aria-label="Laboratory workspace">
        <div className="lab-bench">
          <div className="lab-bench-surface">
            {placed.map((p) => {
              const def = getEquipment(p.id);
              const isBeaker = p.id === "beaker-100";
              const volume = isBeaker ? beaker100Volume : 0;
              const isPhMeter = p.id === "ph-meter";
              return (
                <div
                  key={p.id}
                  className="lab-placed-item"
                  style={{ left: p.x, top: p.y }}
                  onClick={() => setSelectedId(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedId(p.id);
                    }
                  }}
                >
                  {isPhMeter ? (
                    <div className="lab-placed-meter-wrap">
                      <EquipmentSprite
                        def={def}
                        phReading={phReading}
                        selected={selectedId === p.id}
                      />
                      {phReading !== null ? (
                        <div
                          className="lab-indicator-swatch"
                          style={{ backgroundColor: indicatorColor }}
                          aria-hidden={true}
                        />
                      ) : null}
                    </div>
                  ) : (
                    <EquipmentSprite
                      def={def}
                      volumeMl={volume}
                      liquidColor={isBeaker && phReading !== null ? indicatorColor : liquidColor}
                      selected={selectedId === p.id}
                    />
                  )}
                </div>
              );
            })}
            {placed.length === 0 ? (
              <div className="lab-empty-workspace">
                <Beaker size={32} aria-hidden={true} />
                <p>Start the procedure or add equipment from the tray.</p>
              </div>
            ) : null}
          </div>

          <div className="lab-bench-readouts" aria-live="polite">
            <Readout
              label="pH"
              value={formatPh(phReading)}
              unit="pH"
              shown={phReading !== null}
              source="model_calculated"
            />
            <Readout
              label="pOH"
              value={result ? formatPh(result.poh) : "—"}
              unit="pOH"
              shown={!!result}
              source="model_calculated"
            />
            <Readout
              label="[H⁺]"
              value={
                result && result.hydrogenConcentration
                  ? formatExponential(result.hydrogenConcentration, 3)
                  : "—"
              }
              unit="mol/L"
              shown={!!result}
              source="model_calculated"
            />
            <Readout
              label="[OH⁻]"
              value={
                result && result.hydroxideConcentration
                  ? formatExponential(result.hydroxideConcentration, 3)
                  : "—"
              }
              unit="mol/L"
              shown={!!result}
              source="model_calculated"
            />
            <Readout
              label="c (analytical)"
              value={formatDecimal(concentration, 3)}
              unit="mol/L"
              shown={true}
              source="user_entered"
            />
          </div>

          {result && result.degreeOfDissociation !== undefined ? (
            <div className="lab-model-note">
              <small>
                Degree of dissociation α = {formatDecimal(result.degreeOfDissociation, 4)}
                {" · "}5 % approximation:{" "}
                {result.approximationValidAt5Percent
                  ? "valid (α ≤ 0.05)"
                  : "NOT valid — exact quadratic result used"}
                .
              </small>
            </div>
          ) : null}

          {limitations.length > 0 ? (
            <div className="lab-limitations" role="note">
              <details>
                <summary>
                  <AlertTriangle size={14} aria-hidden={true} /> Model limitations (read before use)
                </summary>
                <ul>
                  {limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </details>
              <small>
                Model: <code>{phProvenanceLabel()}</code>
              </small>
            </div>
          ) : (
            <div className="lab-provenance">
              <small>
                Model: <code>{phProvenanceLabel()}</code>
              </small>
            </div>
          )}
        </div>
      </section>

      <aside className="lab-sidebar-right">
        <ProcedurePanel state={procedure} onStart={start} onReset={reset} />
        <ObservationPanel
          measurements={measurements}
          observations={procedure.observations}
          canAddObservation={currentStepIdx === 4 || procedure.status === "in_progress"}
          onAddObservation={addNote}
        />
        {experiment ? (
          <LabNotebookBridge
            experiment={experiment}
            modelId="ph-monoprotic-25c"
            modelVersion="1.0.0"
            inputs={[
              { label: "Electrolyte", value: electrolyteId, unit: "species" },
              { label: "Analytical concentration", value: concentration, unit: "mol/L" },
            ]}
            measurements={measurements}
            observations={procedure.observations}
            assumptions={["Dilute aqueous monoprotic electrolyte at 25 °C (Kw = 1.0e-14)."]}
            limitations={limitations}
            completedStepCount={
              procedure.steps.filter((s) => procedure.stepStatus[s.id] === "completed").length
            }
            totalStepCount={procedure.steps.length}
          />
        ) : null}
      </aside>
    </div>
  );
}

function Readout({
  label,
  value,
  unit,
  source,
  shown,
}: {
  label: string;
  value: string;
  unit: string;
  source?: "model_calculated" | "user_entered";
  shown: boolean;
}) {
  return (
    <div className="lab-readout">
      <div className="lab-readout-label">{label}</div>
      <div className="lab-readout-value" aria-hidden={!shown}>
        {value} <span className="lab-unit">{unit}</span>
      </div>
      {source ? (
        <div className={"lab-source-badge lab-source-" + source}>
          {source === "model_calculated" ? "Calculated" : "Entered"}
        </div>
      ) : null}
    </div>
  );
}

/** Render an illustrative universal-indicator colour for a given pH. */
function phColor(ph: number | null): string {
  if (ph === null || !Number.isFinite(ph)) return "transparent";
  // Universal indicator approximate stops.
  const stops: Array<{ ph: number; color: string }> = [
    { ph: 0, color: "#b91c1c" }, // red (strongly acidic)
    { ph: 2, color: "#ea580c" }, // red-orange
    { ph: 4, color: "#eab308" }, // orange-yellow
    { ph: 6, color: "#84cc16" }, // yellow-green
    { ph: 7, color: "#22c55e" }, // green
    { ph: 8, color: "#14b8a6" }, // teal
    { ph: 10, color: "#3b82f6" }, // blue
    { ph: 12, color: "#6366f1" }, // indigo
    { ph: 14, color: "#7c3aed" }, // violet (strongly basic)
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i]!;
    const b = stops[i + 1]!;
    if (ph <= a.ph) return a.color;
    if (ph >= b.ph) continue;
    const t = (ph - a.ph) / (b.ph - a.ph);
    return mixHex(a.color, b.color, t);
  }
  return stops[stops.length - 1]!.color;
}

function mixHex(a: string, b: string, t: number): string {
  const ra = parseInt(a.slice(1, 3), 16);
  const ga = parseInt(a.slice(3, 5), 16);
  const ba = parseInt(a.slice(5, 7), 16);
  const rb = parseInt(b.slice(1, 3), 16);
  const gb = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ra + (rb - ra) * t);
  const g = Math.round(ga + (gb - ga) * t);
  const bl = Math.round(ba + (bb - ba) * t);
  return `rgb(${r},${g},${bl})`;
}

function formatExponential(v: number, digits: number): string {
  if (!Number.isFinite(v)) return "—";
  return v.toExponential(digits);
}
