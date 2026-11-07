"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, Beaker, Droplet } from "lucide-react";

import {
  DILUTION_PROCEDURE,
  DILUTION_STOCK_PRESETS,
  addObservation,
  calculateDilution,
  completeStepWithMeasurements,
  createInitialState,
  dilutionModelLabel,
  formatConcentration,
  formatVolumeMl,
  getEquipment,
  startProcedure,
  type EquipmentDefinition,
  type MeasurementRecord,
} from "@virtual-chemistry-lab/laboratory-core";

import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";
import { EquipmentSprite } from "./equipment-svg";
import { EquipmentTray } from "./equipment-tray";
import { ObservationPanel } from "./observation-panel";
import { ProcedurePanel } from "./procedure-panel";
import { LabNotebookBridge } from "../learning/lab-notebook-bridge";
import { classNames } from "../../lib/utils";

/** Available equipment for the dilution experiment. */
const AVAILABLE_EQUIPMENT_IDS = [
  "beaker-250",
  "beaker-100",
  "measuring-cylinder-10",
  "measuring-cylinder-100",
  "volumetric-flask-100",
  "glass-rod",
  "wash-bottle",
];

type PlacedItem = { id: string; x: number; y: number };

let noteSeq = 0;

export default function DilutionLab({
  experiment,
}: Readonly<{
  experiment?: Pick<ExperimentRecord, "identity" | "references">;
}> = {}) {
  const [placed, setPlaced] = useState<PlacedItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [procedure, setProcedure] = useState(() => createInitialState(DILUTION_PROCEDURE));
  const [sessionMeasurements, setSessionMeasurements] = useState<MeasurementRecord[]>([]);
  const [modelError, setModelError] = useState<string | null>(null);

  // Inputs controlled by the learner
  const [presetId, setPresetId] = useState<string>("cuso4-0.5");
  const [stockConcentration, setStockConcentration] = useState<number>(0.5);
  const [stockVolumeMl, setStockVolumeMl] = useState<number>(10);
  const [finalVolumeMl, setFinalVolumeMl] = useState<number>(100);

  const placedIds = useMemo(() => new Set(placed.map((p) => p.id)), [placed]);

  const availableEquipment: EquipmentDefinition[] = useMemo(
    () => AVAILABLE_EQUIPMENT_IDS.map(getEquipment),
    [],
  );

  const addEquipment = useCallback((id: string) => {
    setPlaced((prev) => {
      if (prev.some((p) => p.id === id)) return prev;
      // Default position: spread along the bench
      const offset = prev.length;
      return [
        ...prev,
        {
          id,
          x: 40 + offset * 140,
          y: 120,
        },
      ];
    });
  }, []);

  const start = useCallback(() => {
    setProcedure((p) => startProcedure(p));
    // Auto-place the required glassware if the learner hasn't.
    setPlaced((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const additions: PlacedItem[] = [];
      let offset = prev.length;
      for (const reqId of DILUTION_PROCEDURE[0]!.requiredEquipment) {
        if (!existing.has(reqId)) {
          additions.push({ id: reqId, x: 40 + offset * 140, y: 120 });
          offset++;
        }
      }
      return [...prev, ...additions];
    });
  }, []);

  const reset = useCallback(() => {
    setProcedure(createInitialState(DILUTION_PROCEDURE));
    setSessionMeasurements([]);
    setPlaced([]);
    setSelectedId(null);
    setModelError(null);
  }, []);

  const advanceStep = useCallback(
    (measurements: MeasurementRecord[]) => {
      setProcedure((p) => {
        const next = completeStepWithMeasurements(p, measurements, placedIds);
        if (next.lastError) return next;
        setSessionMeasurements((sm) => [...sm, ...measurements]);
        setModelError(null);
        return next;
      });
    },
    [placedIds],
  );

  // Step handlers -------------------------------------------------------

  const completeGlasswareStep = () => {
    advanceStep([]);
  };

  const runCalculation = () => {
    try {
      const { measurements } = calculateDilution({
        stockConcentration,
        stockVolumeMl,
        finalVolumeMl,
      });
      // Tag each measurement with the step it is produced at (step index 3).
      const stepIdx = procedure.currentStepIndex;
      const tagged = measurements.map((m, i) => ({
        ...m,
        stepIndex: stepIdx,
        id: `${m.id}-${i}`,
      }));
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

  // Derived display values
  const finalConcValue =
    sessionMeasurements.find((m) => m.measurementId === "final-concentration")?.value ?? null;

  const stockColor = presetId === "cuso4-0.5" ? "#3b82f6" : "#94a3b8";
  // Liquid levels (illustrative only)
  const stockLevel = stockVolumeMl; // shown in 10 mL cylinder
  const finalLevel = finalVolumeMl; // shown in 100 mL cylinder

  const currentStepIdx = procedure.currentStepIndex;
  const canEnterStock = currentStepIdx >= 1;
  const canEnterVolumes = currentStepIdx >= 2;
  const canCalculate = currentStepIdx === 3;
  const canRecord = currentStepIdx === 4;

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
              Stock solution
              <select
                className="lab-select"
                value={presetId}
                onChange={(e) => {
                  setPresetId(e.target.value);
                  const preset = DILUTION_STOCK_PRESETS.find((p) => p.id === e.target.value);
                  if (preset && preset.id !== "custom")
                    setStockConcentration(preset.concentrationMolL);
                }}
                disabled={!canEnterStock}
              >
                {DILUTION_STOCK_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="lab-control-hint">
              {DILUTION_STOCK_PRESETS.find((p) => p.id === presetId)?.description}
            </p>
          </div>

          <div className="lab-control-group">
            <label className="lab-control-label">
              Stock concentration c₁ (mol/L)
              <input
                type="number"
                className="lab-input"
                min={0.001}
                max={10}
                step={0.01}
                value={Number.isFinite(stockConcentration) ? stockConcentration : ""}
                onChange={(e) => setStockConcentration(parseFloat(e.target.value))}
                disabled={!canEnterStock}
              />
            </label>
          </div>

          <div className="lab-control-group">
            <label className="lab-control-label">
              Stock volume V₁ (mL)
              <input
                type="number"
                className="lab-input"
                min={0.1}
                max={Math.min(finalVolumeMl, 50)}
                step={0.1}
                value={Number.isFinite(stockVolumeMl) ? stockVolumeMl : ""}
                onChange={(e) => setStockVolumeMl(parseFloat(e.target.value))}
                disabled={!canEnterVolumes}
              />
            </label>
          </div>

          <div className="lab-control-group">
            <label className="lab-control-label">
              Final volume V₂ (mL)
              <input
                type="number"
                className="lab-input"
                min={stockVolumeMl}
                max={1000}
                step={1}
                value={Number.isFinite(finalVolumeMl) ? finalVolumeMl : ""}
                onChange={(e) => setFinalVolumeMl(parseFloat(e.target.value))}
                disabled={!canEnterVolumes}
              />
            </label>
          </div>

          {currentStepIdx === 1 ? (
            <button type="button" className="button btn-block" onClick={() => advanceStep([])}>
              Continue to volumes
            </button>
          ) : null}
          {currentStepIdx === 2 ? (
            <button type="button" className="button btn-block" onClick={() => advanceStep([])}>
              Ready to calculate
            </button>
          ) : null}
          {canCalculate ? (
            <button type="button" className="button btn-block" onClick={runCalculation}>
              <Droplet size={15} aria-hidden={true} /> Run dilution calculation
            </button>
          ) : null}
          {currentStepIdx === 0 && procedure.status !== "not_started" ? (
            <button
              type="button"
              className="button btn-block"
              onClick={completeGlasswareStep}
              disabled={!DILUTION_PROCEDURE[0]!.requiredEquipment.every((id) => placedIds.has(id))}
            >
              <Beaker size={15} aria-hidden={true} /> Glassware placed — continue
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
        <div className="lab-bench" aria-hidden={false}>
          <div className="lab-bench-surface">
            {placed.map((p) => {
              const def = getEquipment(p.id);
              const isStockCyl = p.id === "measuring-cylinder-10";
              const isFinalCyl = p.id === "measuring-cylinder-100";
              const volume = isStockCyl ? stockLevel : isFinalCyl ? finalLevel : 0;
              const color = isStockCyl
                ? stockColor
                : isFinalCyl && finalConcValue !== null
                  ? stockColor
                  : undefined;
              const colorAdjusted =
                isFinalCyl && finalConcValue !== null && stockColor === "#3b82f6"
                  ? adjustBlueByDilution(stockConcentration, finalConcValue)
                  : color;
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
                  <EquipmentSprite
                    def={def}
                    volumeMl={volume}
                    liquidColor={colorAdjusted}
                    selected={selectedId === p.id}
                  />
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
            <ReadoutItem
              label="c₁ (stock)"
              value={formatConcentration(stockConcentration)}
              unit="mol/L"
              source="user_entered"
            />
            <ReadoutItem
              label="V₁ (stock aliquot)"
              value={formatVolumeMl(stockVolumeMl, 1)}
              unit="mL"
              source="user_entered"
            />
            <ReadoutItem
              label="V₂ (final)"
              value={formatVolumeMl(finalVolumeMl, 1)}
              unit="mL"
              source="user_entered"
            />
            <ReadoutItem
              label="c₂ (result)"
              value={finalConcValue !== null ? formatConcentration(finalConcValue) : "—"}
              unit="mol/L"
              source={finalConcValue !== null ? "model_calculated" : undefined}
            />
          </div>
          <div className="lab-provenance">
            <small>
              Model: <code>{dilutionModelLabel()}</code>
              {" · "}
              <span className="lab-illustrative-note">
                Liquid levels and colour are illustrative visual cues, not a spectrophotometric
                model.
              </span>
            </small>
          </div>
        </div>
      </section>

      <aside className="lab-sidebar-right">
        <ProcedurePanel state={procedure} onStart={start} onReset={reset} />
        <ObservationPanel
          measurements={sessionMeasurements}
          observations={procedure.observations}
          canAddObservation={canRecord || procedure.status === "in_progress"}
          onAddObservation={addNote}
        />
        {experiment ? (
          <LabNotebookBridge
            experiment={experiment}
            modelId="dilution-c1v1c2v2"
            modelVersion="1.0.0"
            inputs={[
              { label: "Stock concentration c1", value: stockConcentration, unit: "mol/L" },
              { label: "Stock aliquot V1", value: stockVolumeMl, unit: "mL" },
              { label: "Final volume V2", value: finalVolumeMl, unit: "mL" },
            ]}
            measurements={sessionMeasurements}
            observations={procedure.observations}
            assumptions={[
              "Ideal dilute aqueous solution; conserved solute amount n = c1 V1 = c2 V2.",
            ]}
            limitations={[
              "Liquid levels and colour are illustrative visual cues, not spectrophotometry.",
            ]}
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

function ReadoutItem({
  label,
  value,
  unit,
  source,
}: {
  label: string;
  value: string;
  unit: string;
  source?: "model_calculated" | "user_entered";
}) {
  return (
    <div className="lab-readout">
      <div className="lab-readout-label">{label}</div>
      <div className="lab-readout-value">
        {value} <span className="lab-unit">{unit}</span>
      </div>
      {source ? (
        <div className={classNames("lab-source-badge", `lab-source-${source}`)}>
          {source === "model_calculated" ? "Calculated" : "Entered"}
        </div>
      ) : null}
    </div>
  );
}

/** Darken/lighten the illustrative blue for the final flask based on concentration ratio. */
function adjustBlueByDilution(stockC: number, finalC: number): string {
  if (stockC <= 0) return "#94a3b8";
  const ratio = Math.max(0.05, Math.min(1, finalC / stockC));
  // Interpolate in a light-ish blue range
  const r = Math.round(59 + (1 - ratio) * 180);
  const g = Math.round(130 + (1 - ratio) * 100);
  const b = Math.round(246);
  return `rgb(${r},${g},${b})`;
}
