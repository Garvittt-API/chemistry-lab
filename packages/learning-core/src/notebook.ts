import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";
import type {
  ExperimentSession as Phase05ExperimentSession,
  MeasurementRecord,
  ObservationNote,
} from "@virtual-chemistry-lab/laboratory-core";

import {
  LEARNING_SCHEMA_VERSION,
  experimentalDataTableSchema,
  notebookSessionSchema,
  observationRecordSchema,
  type CalculationRecord,
  type DataTableCell,
  type DataTableColumn,
  type ExperimentalDataTable,
  type NotebookProvenance,
  type NotebookSession,
  type ObservationRecord,
  type PreLabChecklist,
  type SessionHistoryAction,
  type SessionHistoryEntry,
  type SessionUserNotes,
  type SimulationRunRecord,
} from "./schemas.js";
import { sanitizeUserText } from "./security.js";

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function historyEntry(
  action: SessionHistoryAction,
  summary: string,
  timestamp = new Date().toISOString(),
): SessionHistoryEntry {
  return {
    id: generateId("hist"),
    timestamp,
    action,
    summary: sanitizeUserText(summary, 280),
  };
}

/**
 * Construct experiment-specific empty data table templates (never populated with
 * fabricated numerical values).
 */
export function buildDefaultTablesForExperiment(
  experimentId: string,
): ReadonlyArray<ExperimentalDataTable> {
  const mkTable = (
    id: string,
    title: string,
    description: string,
    columns: Array<{
      id: string;
      label: string;
      kind: "numeric" | "text";
      unit?: string;
      precisionDecimals?: number;
      min?: number;
      max?: number;
    }>,
    xAxisColumnId?: string,
    yAxisColumnId?: string,
  ): ExperimentalDataTable =>
    experimentalDataTableSchema.parse({
      id,
      title,
      description,
      xAxisColumnId,
      yAxisColumnId,
      columns: columns.map((c) => ({
        ...c,
        precisionDecimals: c.precisionDecimals ?? 2,
        required: false,
      })),
      rows: [],
    });

  switch (experimentId) {
    case "solution-dilution":
      return [
        mkTable(
          "tbl-dilution-series",
          "Dilution Series: Volume & Concentration",
          "Record stock concentration, aliquot volume V1, total flask volume V2 and resulting concentration c2.",
          [
            {
              id: "stock-conc",
              label: "Stock c1",
              kind: "numeric",
              unit: "mol/L",
              precisionDecimals: 3,
              min: 0,
            },
            {
              id: "aliquot-vol",
              label: "Aliquot V1",
              kind: "numeric",
              unit: "mL",
              precisionDecimals: 1,
              min: 0,
            },
            {
              id: "final-vol",
              label: "Final V2",
              kind: "numeric",
              unit: "mL",
              precisionDecimals: 1,
              min: 0.1,
            },
            {
              id: "final-conc",
              label: "Final c2",
              kind: "numeric",
              unit: "mol/L",
              precisionDecimals: 4,
              min: 0,
            },
          ],
          "final-vol",
          "final-conc",
        ),
      ];
    case "ph-and-indicators":
      return [
        mkTable(
          "tbl-ph-samples",
          "Solution pH & Indicator Observations (25 °C)",
          "Record electrolyte concentration, pH value and observed indicator colour.",
          [
            { id: "sample", label: "Solution / Electrolyte", kind: "text" },
            {
              id: "conc",
              label: "Concentration",
              kind: "numeric",
              unit: "mol/L",
              precisionDecimals: 4,
              min: 0,
            },
            {
              id: "ph-val",
              label: "pH",
              kind: "numeric",
              unit: "pH",
              precisionDecimals: 2,
              min: -2,
              max: 16,
            },
            { id: "colour", label: "Indicator Colour", kind: "text" },
          ],
          "conc",
          "ph-val",
        ),
      ];
    case "acid-base-titration":
      return [
        mkTable(
          "tbl-titration-burette",
          "Burette Titration Trials",
          "Record initial and final burette readings (to 0.05 mL) and delivered titrant volume.",
          [
            {
              id: "trial",
              label: "Trial #",
              kind: "numeric",
              unit: "dimensionless",
              precisionDecimals: 0,
              min: 1,
            },
            {
              id: "initial-vol",
              label: "Initial Burette",
              kind: "numeric",
              unit: "mL",
              precisionDecimals: 2,
              min: 0,
              max: 50,
            },
            {
              id: "final-vol",
              label: "Final Burette",
              kind: "numeric",
              unit: "mL",
              precisionDecimals: 2,
              min: 0,
              max: 50,
            },
            {
              id: "titre-vol",
              label: "Titre Delivered",
              kind: "numeric",
              unit: "mL",
              precisionDecimals: 2,
              min: 0,
              max: 50,
            },
            { id: "endpoint-note", label: "Endpoint Note", kind: "text" },
          ],
          "trial",
          "titre-vol",
        ),
      ];
    case "reaction-rates-thiosulfate":
      return [
        mkTable(
          "tbl-kinetics-runs",
          "Reaction Rate Runs: Concentration, Temperature & Obscuration Time",
          "Record initial thiosulfate concentration, solution temperature, obscuration time t and relative rate 1/t.",
          [
            {
              id: "conc-s2o3",
              label: "[S2O3^2-]0",
              kind: "numeric",
              unit: "mol/L",
              precisionDecimals: 3,
              min: 0,
            },
            {
              id: "temperature",
              label: "Temperature",
              kind: "numeric",
              unit: "°C",
              precisionDecimals: 1,
              min: 0,
              max: 100,
            },
            {
              id: "time-s",
              label: "Obscuration Time t",
              kind: "numeric",
              unit: "s",
              precisionDecimals: 1,
              min: 0.1,
            },
            {
              id: "inv-time",
              label: "Relative Rate 1/t",
              kind: "numeric",
              unit: "s^-1",
              precisionDecimals: 4,
              min: 0,
            },
          ],
          "conc-s2o3",
          "inv-time",
        ),
      ];
    case "standard-solution-preparation":
      return [
        mkTable(
          "tbl-standard-weighing",
          "Weighing by Difference & Volumetric Flask Make-Up",
          "Record balance masses before and after transfer alongside calibrated flask volume.",
          [
            {
              id: "vessel-plus-solid",
              label: "Boat + Solid",
              kind: "numeric",
              unit: "g",
              precisionDecimals: 4,
              min: 0,
            },
            {
              id: "vessel-after",
              label: "Boat After Transfer",
              kind: "numeric",
              unit: "g",
              precisionDecimals: 4,
              min: 0,
            },
            {
              id: "net-mass",
              label: "Transferred Mass",
              kind: "numeric",
              unit: "g",
              precisionDecimals: 4,
              min: 0,
            },
            {
              id: "flask-vol",
              label: "Flask Volume",
              kind: "numeric",
              unit: "mL",
              precisionDecimals: 1,
              min: 1,
            },
          ],
        ),
      ];
    case "paper-chromatography":
      return [
        mkTable(
          "tbl-chromatography-rf",
          "Chromatogram Migration Distances & Retention Factors",
          "Measure spot-centre travel and solvent-front distance from the pencil baseline.",
          [
            { id: "spot-id", label: "Spot / Component", kind: "text" },
            {
              id: "d-solute",
              label: "Spot Distance d_solute",
              kind: "numeric",
              unit: "cm",
              precisionDecimals: 2,
              min: 0,
            },
            {
              id: "d-solvent",
              label: "Solvent Front d_solvent",
              kind: "numeric",
              unit: "cm",
              precisionDecimals: 2,
              min: 0.1,
            },
            {
              id: "rf",
              label: "Rf Ratio",
              kind: "numeric",
              unit: "dimensionless",
              precisionDecimals: 2,
              min: 0,
              max: 1,
            },
          ],
        ),
      ];
    case "electrochemical-cell-daniell":
      return [
        mkTable(
          "tbl-daniell-emf",
          "Daniell Cell Potential vs Half-Cell Concentrations",
          "Record half-cell molarities and high-impedance open-circuit voltage.",
          [
            {
              id: "zn-conc",
              label: "[Zn^2+]",
              kind: "numeric",
              unit: "mol/L",
              precisionDecimals: 3,
              min: 0,
            },
            {
              id: "cu-conc",
              label: "[Cu^2+]",
              kind: "numeric",
              unit: "mol/L",
              precisionDecimals: 3,
              min: 0,
            },
            {
              id: "emf",
              label: "Cell Potential E_cell",
              kind: "numeric",
              unit: "V",
              precisionDecimals: 3,
              min: -5,
              max: 5,
            },
          ],
          "zn-conc",
          "emf",
        ),
      ];
    case "chemical-equilibrium-fescn":
      return [
        mkTable(
          "tbl-fescn-shifts",
          "Perturbation & Colour-Shift Log",
          "Record control vs perturbed test tubes, observed colour intensity change and Q vs K direction.",
          [
            { id: "tube", label: "Tube ID", kind: "text" },
            { id: "perturbation", label: "Perturbation Applied", kind: "text" },
            { id: "colour-obs", label: "Colour Change vs Control", kind: "text" },
            { id: "direction", label: "Inferred Net Shift", kind: "text" },
          ],
        ),
      ];
    case "flame-tests-qualitative-inorganic":
      return [
        mkTable(
          "tbl-flame-emission",
          "Qualitative Flame Test Observations",
          "Record direct flame colour, appearance through cobalt blue glass and candidate ion.",
          [
            { id: "sample-code", label: "Sample", kind: "text" },
            { id: "direct-flame", label: "Direct Flame Colour", kind: "text" },
            { id: "cobalt-glass", label: "Through Cobalt Blue Glass", kind: "text" },
            { id: "candidate-ion", label: "Tentative Cation", kind: "text" },
          ],
        ),
      ];
    case "vsepr-molecular-geometry":
      return [
        mkTable(
          "tbl-vsepr-angles",
          "Molecular Electron Domains & Bond Angles",
          "Record bonding pairs, lone pairs on central atom and observed/reference bond angle.",
          [
            { id: "molecule", label: "Molecule / Formula", kind: "text" },
            {
              id: "bonding-domains",
              label: "Bonding Domains",
              kind: "numeric",
              unit: "dimensionless",
              precisionDecimals: 0,
              min: 1,
              max: 8,
            },
            {
              id: "lone-pairs",
              label: "Lone Pairs",
              kind: "numeric",
              unit: "dimensionless",
              precisionDecimals: 0,
              min: 0,
              max: 4,
            },
            {
              id: "bond-angle",
              label: "Bond Angle",
              kind: "numeric",
              unit: "deg",
              precisionDecimals: 1,
              min: 0,
              max: 180,
            },
          ],
          "lone-pairs",
          "bond-angle",
        ),
      ];
    default:
      return [];
  }
}

export interface CreateNotebookSessionInput {
  readonly experiment: Pick<ExperimentRecord, "identity" | "references">;
  readonly localProfileId: string;
  readonly sessionId?: string;
  readonly title?: string;
  readonly pathwayId?: string;
  readonly now?: string;
}

export function createNotebookSession(input: CreateNotebookSessionInput): NotebookSession {
  const now = input.now ?? new Date().toISOString();
  const title = sanitizeUserText(
    input.title ?? `${input.experiment.identity.title} — Practical Session`,
    200,
  );
  return notebookSessionSchema.parse({
    schemaVersion: LEARNING_SCHEMA_VERSION,
    sessionId: input.sessionId ?? generateId("sess"),
    revision: 1,
    ownerScope: {
      kind: "local_device",
      localProfileId: input.localProfileId,
    },
    title,
    experimentId: input.experiment.identity.id,
    experimentSlug: input.experiment.identity.slug,
    experimentTitle: input.experiment.identity.title,
    experimentVersion: input.experiment.identity.contentVersion,
    experimentSchemaVersion: input.experiment.identity.schemaVersion,
    pathwayId: input.pathwayId,
    createdAt: now,
    updatedAt: now,
    status: "draft",
    preLabChecklist: {
      objectiveReviewed: false,
      apparatusReviewed: false,
      safetyReviewed: false,
      procedureReviewed: false,
    },
    userNotes: {
      hypothesisOrPlan: "",
      discussion: "",
      conclusion: "",
      errorAnalysis: "",
    },
    simulationRuns: [],
    observations: [],
    dataTables: [...buildDefaultTablesForExperiment(input.experiment.identity.id)],
    calculations: [],
    assessmentAttemptIds: [],
    referenceCitations: input.experiment.references.items.map((r) => r.citation),
    history: [
      historyEntry(
        "created",
        `Created practical session for ${input.experiment.identity.title} (v${input.experiment.identity.contentVersion}).`,
        now,
      ),
    ],
  });
}

function bumpSession(
  session: NotebookSession,
  patch: Partial<NotebookSession>,
  action: SessionHistoryAction,
  summary: string,
  now = new Date().toISOString(),
): NotebookSession {
  const nextStatus =
    patch.status ??
    (session.status === "draft" && action !== "renamed" && action !== "resumed"
      ? "in_progress"
      : session.status);
  return notebookSessionSchema.parse({
    ...session,
    ...patch,
    status: nextStatus,
    revision: session.revision + 1,
    updatedAt: now,
    history: [...session.history, historyEntry(action, summary, now)],
  });
}

export function renameNotebookSession(
  session: NotebookSession,
  newTitle: string,
  now?: string,
): NotebookSession {
  const cleanTitle = sanitizeUserText(newTitle, 200);
  if (cleanTitle.length === 0) {
    throw new Error("Session title cannot be empty.");
  }
  return bumpSession(
    session,
    { title: cleanTitle },
    "renamed",
    `Renamed session to "${cleanTitle}".`,
    now,
  );
}

export function updateSessionChecklist(
  session: NotebookSession,
  checklist: Partial<PreLabChecklist>,
  now?: string,
): NotebookSession {
  return bumpSession(
    session,
    { preLabChecklist: { ...session.preLabChecklist, ...checklist } },
    "checklist_updated",
    "Updated pre-lab readiness checklist.",
    now,
  );
}

export function updateSessionUserNotes(
  session: NotebookSession,
  notes: Partial<SessionUserNotes>,
  now?: string,
): NotebookSession {
  const merged: SessionUserNotes = {
    hypothesisOrPlan:
      notes.hypothesisOrPlan !== undefined
        ? sanitizeUserText(notes.hypothesisOrPlan, 4000)
        : session.userNotes.hypothesisOrPlan,
    discussion:
      notes.discussion !== undefined
        ? sanitizeUserText(notes.discussion, 6000)
        : session.userNotes.discussion,
    conclusion:
      notes.conclusion !== undefined
        ? sanitizeUserText(notes.conclusion, 4000)
        : session.userNotes.conclusion,
    errorAnalysis:
      notes.errorAnalysis !== undefined
        ? sanitizeUserText(notes.errorAnalysis, 4000)
        : session.userNotes.errorAnalysis,
  };
  return bumpSession(
    session,
    { userNotes: merged },
    "notes_updated",
    "Saved written notebook notes.",
    now,
  );
}

export interface AddObservationInput {
  readonly id?: string;
  readonly timestamp?: string;
  readonly title: string;
  readonly description?: string;
  readonly value?: number | null;
  readonly unit?: string;
  readonly precisionDecimals?: number;
  readonly apparatusId?: string;
  readonly apparatusLabel?: string;
  readonly notes?: string;
  readonly provenance: NotebookProvenance;
  readonly modelId?: string;
  readonly engineVersion?: string;
  readonly referenceCitation?: string;
  readonly importSourceNote?: string;
}

export function addObservationToSession(
  session: NotebookSession,
  input: AddObservationInput,
  now = new Date().toISOString(),
): NotebookSession {
  const nextSeq = session.observations.reduce((max, o) => Math.max(max, o.sequence), 0) + 1;
  const record: ObservationRecord = observationRecordSchema.parse({
    id: input.id ?? generateId("obs"),
    sequence: nextSeq,
    timestamp: input.timestamp ?? now,
    title: sanitizeUserText(input.title, 200),
    description: sanitizeUserText(input.description ?? "", 2000),
    value: input.value ?? null,
    unit: input.unit ? sanitizeUserText(input.unit, 40) : undefined,
    precisionDecimals: input.precisionDecimals,
    apparatusId: input.apparatusId,
    apparatusLabel: input.apparatusLabel ? sanitizeUserText(input.apparatusLabel, 120) : undefined,
    notes: input.notes ? sanitizeUserText(input.notes, 2000) : undefined,
    provenance: input.provenance,
    modelId: input.modelId,
    engineVersion: input.engineVersion,
    referenceCitation: input.referenceCitation
      ? sanitizeUserText(input.referenceCitation, 400)
      : undefined,
    importSourceNote: input.importSourceNote
      ? sanitizeUserText(input.importSourceNote, 300)
      : undefined,
  });

  return bumpSession(
    session,
    { observations: [...session.observations, record] },
    "observation_added",
    `Recorded observation #${nextSeq}: "${record.title}" (${record.provenance.replace(/_/g, " ")}).`,
    now,
  );
}

export function removeObservationFromSession(
  session: NotebookSession,
  observationId: string,
  now?: string,
): NotebookSession {
  const target = session.observations.find((o) => o.id === observationId);
  if (!target) return session;
  const remaining = session.observations
    .filter((o) => o.id !== observationId)
    .map((o, idx) => ({ ...o, sequence: idx + 1 }));
  return bumpSession(
    session,
    { observations: remaining },
    "observation_removed",
    `Removed observation "${target.title}".`,
    now,
  );
}

export interface LabWorkspaceSyncInput {
  readonly engineName: string;
  readonly engineVersion: string;
  readonly modelId: string;
  readonly modelVersion: string;
  readonly inputs: ReadonlyArray<{ label: string; value: number | string; unit: string }>;
  readonly measurements: ReadonlyArray<MeasurementRecord>;
  readonly qualitativeNotes: ReadonlyArray<ObservationNote>;
  readonly assumptions?: ReadonlyArray<string>;
  readonly limitations?: ReadonlyArray<string>;
  readonly completedStepCount: number;
  readonly totalStepCount: number;
}

/**
 * Append outputs and notes from an interactive Phase 05/06 workspace run into a
 * notebook session WITHOUT overwriting any previously recorded observations.
 */
export function recordLabRunInSession(
  session: NotebookSession,
  run: LabWorkspaceSyncInput,
  now = new Date().toISOString(),
): NotebookSession {
  const simRecord: SimulationRunRecord = {
    id: generateId("sim"),
    recordedAt: now,
    engineName: run.engineName,
    engineVersion: run.engineVersion,
    modelId: run.modelId,
    modelVersion: run.modelVersion,
    inputs: run.inputs.map((i) => ({ label: i.label, value: i.value, unit: i.unit })),
    outputs: run.measurements
      .filter((m) => m.value !== null && Number.isFinite(m.value))
      .map((m) => ({
        label: m.label,
        value: m.value as number,
        formattedValue: String(Number((m.value as number).toPrecision(5))),
        unit: m.unit || "dimensionless",
        provenance: m.source === "model_calculated" ? "engine_calculated" : "simulation_generated",
      })),
    assumptions: [...(run.assumptions ?? [])],
    limitations: [...(run.limitations ?? [])],
    completedStepCount: run.completedStepCount,
    totalStepCount: Math.max(1, run.totalStepCount),
    disclosure:
      "Outputs generated by a deterministic mathematical model in virtual simulation; never represent these values as physical laboratory instrument measurements.",
  };

  let nextSeq = session.observations.reduce((max, o) => Math.max(max, o.sequence), 0);
  const addedObservations: ObservationRecord[] = [];

  for (const m of run.measurements) {
    if (m.value === null) continue;
    nextSeq += 1;
    const prov: NotebookProvenance =
      m.source === "model_calculated"
        ? "engine_calculated"
        : m.source === "user_entered"
          ? "user_entered"
          : m.source === "reference_dataset"
            ? "reference_expected"
            : "simulation_generated";
    addedObservations.push(
      observationRecordSchema.parse({
        id: generateId("obs"),
        sequence: nextSeq,
        timestamp: now,
        title: m.label,
        description: `Captured during virtual laboratory step ${m.stepIndex + 1}.`,
        value: m.value,
        unit: m.unit || "dimensionless",
        provenance: prov,
        modelId:
          prov === "engine_calculated" || prov === "simulation_generated"
            ? (m.modelId ?? run.modelId)
            : undefined,
        engineVersion:
          prov === "engine_calculated" || prov === "simulation_generated"
            ? (m.engineVersion ?? run.engineVersion)
            : undefined,
      }),
    );
  }

  for (const note of run.qualitativeNotes) {
    nextSeq += 1;
    addedObservations.push(
      observationRecordSchema.parse({
        id: generateId("obs"),
        sequence: nextSeq,
        timestamp: now,
        title: `Qualitative lab note (Step ${note.stepIndex + 1})`,
        description: sanitizeUserText(note.text, 2000),
        value: null,
        provenance: "user_entered",
      }),
    );
  }

  return bumpSession(
    session,
    {
      simulationRuns: [...session.simulationRuns, simRecord],
      observations: [...session.observations, ...addedObservations],
    },
    "simulation_recorded",
    `Appended virtual simulation run (${run.modelId}) with ${addedObservations.length} tagged record(s).`,
    now,
  );
}

/**
 * Parse and validate a user-entered cell string against a DataTableColumn definition.
 */
export function parseTableCellInput(
  column: DataTableColumn,
  rawInput: string,
): { ok: true; cell: DataTableCell } | { ok: false; error: string } {
  const trimmed = sanitizeUserText(rawInput, 400);
  if (trimmed.length === 0) {
    if (column.required) {
      return { ok: false, error: `"${column.label}" is required.` };
    }
    return {
      ok: true,
      cell: { raw: "", numericValue: null, missingReason: "not_recorded" },
    };
  }

  if (column.kind === "text") {
    return { ok: true, cell: { raw: trimmed, numericValue: null } };
  }

  if (trimmed.toUpperCase() === "NA" || trimmed.toUpperCase() === "N/A") {
    return {
      ok: true,
      cell: { raw: "N/A", numericValue: null, missingReason: "not_applicable" },
    };
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    return {
      ok: false,
      error: `"${column.label}" requires a finite number in ${column.unit ?? "specified units"} (or leave blank if unrecorded).`,
    };
  }
  if (column.min !== undefined && parsed < column.min) {
    return {
      ok: false,
      error: `"${column.label}" (${parsed}) cannot be less than ${column.min} ${column.unit ?? ""}.`,
    };
  }
  if (column.max !== undefined && parsed > column.max) {
    return {
      ok: false,
      error: `"${column.label}" (${parsed}) cannot exceed ${column.max} ${column.unit ?? ""}.`,
    };
  }

  return {
    ok: true,
    cell: { raw: trimmed, numericValue: parsed },
  };
}

export function upsertSessionDataTable(
  session: NotebookSession,
  table: ExperimentalDataTable,
  now?: string,
): NotebookSession {
  const validated = experimentalDataTableSchema.parse(table);
  const exists = session.dataTables.some((t) => t.id === validated.id);
  const nextTables = exists
    ? session.dataTables.map((t) => (t.id === validated.id ? validated : t))
    : [...session.dataTables, validated];

  return bumpSession(
    session,
    { dataTables: nextTables },
    "table_updated",
    `${exists ? "Updated" : "Added"} data table "${validated.title}" (${validated.rows.length} row${validated.rows.length === 1 ? "" : "s"}).`,
    now,
  );
}

export function removeSessionDataTable(
  session: NotebookSession,
  tableId: string,
  now?: string,
): NotebookSession {
  const target = session.dataTables.find((t) => t.id === tableId);
  if (!target) return session;
  return bumpSession(
    session,
    { dataTables: session.dataTables.filter((t) => t.id !== tableId) },
    "table_updated",
    `Removed data table "${target.title}".`,
    now,
  );
}

export function addCalculationToSession(
  session: NotebookSession,
  calculation: CalculationRecord,
  now?: string,
): NotebookSession {
  return bumpSession(
    session,
    { calculations: [...session.calculations, calculation] },
    "calculation_added",
    `Saved ${calculation.title} (${calculation.result.formattedValue} ${calculation.result.unit}) via ${calculation.provenance.modelId}.`,
    now,
  );
}

export function removeCalculationFromSession(
  session: NotebookSession,
  calculationId: string,
  now?: string,
): NotebookSession {
  const target = session.calculations.find((c) => c.id === calculationId);
  if (!target) return session;
  return bumpSession(
    session,
    { calculations: session.calculations.filter((c) => c.id !== calculationId) },
    "calculation_removed",
    `Removed calculation "${target.title}".`,
    now,
  );
}

export function linkAssessmentAttemptToSession(
  session: NotebookSession,
  attemptId: string,
  now?: string,
): NotebookSession {
  if (session.assessmentAttemptIds.includes(attemptId)) return session;
  return bumpSession(
    session,
    { assessmentAttemptIds: [...session.assessmentAttemptIds, attemptId] },
    "assessment_linked",
    `Linked assessment attempt ${attemptId}.`,
    now,
  );
}

export function completeNotebookSession(
  session: NotebookSession,
  now = new Date().toISOString(),
): NotebookSession {
  return bumpSession(
    session,
    { status: "completed", completedAt: now },
    "completed",
    "Marked practical session completed.",
    now,
  );
}

export function reopenNotebookSession(
  session: NotebookSession,
  now = new Date().toISOString(),
): NotebookSession {
  return bumpSession(
    session,
    { status: "in_progress", completedAt: undefined },
    "resumed",
    "Reopened session for editing.",
    now,
  );
}

export function duplicateNotebookSession(
  session: NotebookSession,
  newSessionId = generateId("sess"),
  now = new Date().toISOString(),
): NotebookSession {
  const copyTitle = sanitizeUserText(`${session.title} (Copy)`, 200);
  return notebookSessionSchema.parse({
    ...session,
    sessionId: newSessionId,
    revision: 1,
    title: copyTitle,
    createdAt: now,
    updatedAt: now,
    completedAt: undefined,
    status:
      session.observations.length > 0 || session.calculations.length > 0 ? "in_progress" : "draft",
    history: [historyEntry("duplicated", `Duplicated from session ${session.sessionId}.`, now)],
  });
}

/**
 * Reset a session's recorded observations, simulation runs, data table rows,
 * calculations and user notes after explicit user confirmation.
 */
export function resetNotebookSession(
  session: NotebookSession,
  now = new Date().toISOString(),
): NotebookSession {
  return notebookSessionSchema.parse({
    ...session,
    revision: session.revision + 1,
    updatedAt: now,
    completedAt: undefined,
    status: "draft",
    preLabChecklist: {
      objectiveReviewed: false,
      apparatusReviewed: false,
      safetyReviewed: false,
      procedureReviewed: false,
    },
    userNotes: {
      hypothesisOrPlan: "",
      discussion: "",
      conclusion: "",
      errorAnalysis: "",
    },
    simulationRuns: [],
    observations: [],
    dataTables: [...buildDefaultTablesForExperiment(session.experimentId)],
    calculations: [],
    history: [
      ...session.history,
      historyEntry("reset", "Reset session data after user confirmation.", now),
    ],
  });
}

/**
 * Migrate a Phase 05 `ExperimentSession` from `@virtual-chemistry-lab/laboratory-core`
 * into a Phase 07 `NotebookSession` while preserving all provenance tags.
 */
export function migratePhase05SessionToNotebookSession(
  legacy: Phase05ExperimentSession,
  experiment: Pick<ExperimentRecord, "identity" | "references">,
  localProfileId: string,
): NotebookSession {
  let session = createNotebookSession({
    experiment,
    localProfileId,
    sessionId: legacy.sessionId,
    now: legacy.startedAt,
  });

  if (legacy.measurements.length > 0 || legacy.observations.length > 0) {
    session = recordLabRunInSession(
      session,
      {
        engineName: legacy.engineName,
        engineVersion: legacy.engineVersion,
        modelId: "phase05-migrated-model",
        modelVersion: legacy.engineVersion,
        inputs: Object.entries(legacy.inputs).map(([k, v]) => ({
          label: k,
          value: v,
          unit: "input",
        })),
        measurements: legacy.measurements,
        qualitativeNotes: legacy.observations,
        completedStepCount: legacy.status === "completed" ? 1 : 0,
        totalStepCount: 1,
      },
      legacy.completedAt ?? legacy.startedAt,
    );
  }

  if (legacy.status === "completed") {
    session = completeNotebookSession(session, legacy.completedAt ?? legacy.startedAt);
  }

  return session;
}
