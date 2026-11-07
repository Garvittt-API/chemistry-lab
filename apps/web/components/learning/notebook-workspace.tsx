"use client";

import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";
import { DILUTION_EXPERIMENT_ID, PH_EXPERIMENT_ID } from "@virtual-chemistry-lab/laboratory-core";
import {
  addCalculationToSession,
  addObservationToSession,
  buildReportExportFilenames,
  completeNotebookSession,
  duplicateNotebookSession,
  exportSessionCsv,
  exportSessionJson,
  getAssessmentsForExperiment,
  getLessonsForExperiment,
  parseTableCellInput,
  removeCalculationFromSession,
  removeObservationFromSession,
  renameNotebookSession,
  reopenNotebookSession,
  resetNotebookSession,
  updateSessionChecklist,
  updateSessionUserNotes,
  upsertSessionDataTable,
  type DataTableCell,
  type ExperimentalDataTable,
  type NotebookProvenance,
  type NotebookSession,
} from "@virtual-chemistry-lab/learning-core";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  FlaskConical,
  PlusCircle,
  RotateCcw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { triggerBlobDownload } from "../../lib/file-download";
import { ProgressStatusPill, ProvenancePill } from "./badges";
import { CalculationWorkbench } from "./calculation-workbench";
import { useLearningStore } from "./learning-store-provider";

type TabId = "overview" | "observations" | "tables" | "calculations" | "notes" | "history";

const HAS_INTERACTIVE_LAB = new Set<string>([
  DILUTION_EXPERIMENT_ID,
  PH_EXPERIMENT_ID,
  "vsepr-molecular-geometry",
]);

export function NotebookWorkspace({
  sessionId,
  experimentsById,
}: Readonly<{
  sessionId: string;
  experimentsById: Readonly<Record<string, ExperimentRecord>>;
}>) {
  const router = useRouter();
  const { hydrated, snapshot, saveSession, deleteSession } = useLearningStore();
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  // Observation form state
  const [obsTitle, setObsTitle] = useState("");
  const [obsDesc, setObsDesc] = useState("");
  const [obsValRaw, setObsValRaw] = useState("");
  const [obsUnit, setObsUnit] = useState("");
  const [obsPrecision, setObsPrecision] = useState("2");
  const [obsApparatus, setObsApparatus] = useState("");
  const [obsNotes, setObsNotes] = useState("");
  const [obsProvenance, setObsProvenance] = useState<
    "user_entered" | "reference_expected" | "imported_external"
  >("user_entered");
  const [obsError, setObsError] = useState<string | null>(null);

  // Table row drafts keyed by tableId -> colId -> string
  const [rowDrafts, setRowDrafts] = useState<Record<string, Record<string, string>>>({});
  const [rowProvenance, setRowProvenance] = useState<Record<string, NotebookProvenance>>({});
  const [tableErrors, setTableErrors] = useState<Record<string, string>>({});

  // Custom table form
  const [customTableTitle, setCustomTableTitle] = useState("");
  const [customCol1Label, setCustomCol1Label] = useState("Trial");
  const [customCol2Label, setCustomCol2Label] = useState("Measured quantity");
  const [customCol2Unit, setCustomCol2Unit] = useState("mL");

  // Confirmations & status banners
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <div className="container section">
        <h1>Loading practical notebook session…</h1>
        <p className="card-meta">Reading local laboratory session storage.</p>
      </div>
    );
  }

  const session = snapshot.sessions.find((s) => s.sessionId === sessionId);
  if (!session) {
    return (
      <div className="container section">
        <div className="learning-card">
          <h1>Practical session not found</h1>
          <p>
            No local session with ID <code>{sessionId}</code> exists in this browser. Sessions are
            stored locally per device unless exported and imported as JSON.
          </p>
          <div>
            <Link className="button" href="/notebook">
              Return to Practical Notebook
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const experiment = experimentsById[session.experimentId];
  const relatedLessons = getLessonsForExperiment(session.experimentId);
  const relatedQuizzes = getAssessmentsForExperiment(session.experimentId);
  const filenames = buildReportExportFilenames(session);

  const commit = (next: NotebookSession, message?: string) => {
    saveSession(next);
    if (message) {
      setSavedNotice(message);
    }
  };

  const handleAddObservation = (event: React.FormEvent) => {
    event.preventDefault();
    setObsError(null);
    const hasNumeric = obsValRaw.trim().length > 0;
    let parsedVal: number | null = null;
    if (hasNumeric) {
      parsedVal = Number(obsValRaw.trim());
      if (!Number.isFinite(parsedVal)) {
        setObsError(
          "Observation value must be a finite number (or leave blank for qualitative notes).",
        );
        return;
      }
      if (!obsUnit.trim()) {
        setObsError("Quantitative observations require an explicit unit (e.g. mL, mol/L, pH, °C).");
        return;
      }
    }
    try {
      const updated = addObservationToSession(session, {
        title: obsTitle,
        description: obsDesc,
        value: parsedVal,
        unit: hasNumeric ? obsUnit.trim() : undefined,
        precisionDecimals: hasNumeric ? Number(obsPrecision) : undefined,
        apparatusLabel: obsApparatus || undefined,
        notes: obsNotes || undefined,
        provenance: obsProvenance,
      });
      commit(updated, `Recorded observation #${updated.observations.length}.`);
      setObsTitle("");
      setObsDesc("");
      setObsValRaw("");
      setObsUnit("");
      setObsNotes("");
    } catch (err) {
      setObsError(err instanceof Error ? err.message : "Could not record observation.");
    }
  };

  const handleAddRowToTable = (table: ExperimentalDataTable) => {
    const draft = rowDrafts[table.id] ?? {};
    const cells: Record<string, DataTableCell> = {};
    for (const col of table.columns) {
      const check = parseTableCellInput(col, draft[col.id] ?? "");
      if (!check.ok) {
        setTableErrors((prev) => ({ ...prev, [table.id]: check.error }));
        return;
      }
      cells[col.id] = check.cell;
    }

    const prov = rowProvenance[table.id] ?? "user_entered";
    const updatedTable: ExperimentalDataTable = {
      ...table,
      rows: [
        ...table.rows,
        {
          id: `row-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
          sequence: table.rows.length + 1,
          provenance: prov,
          modelId:
            prov === "engine_calculated" || prov === "simulation_generated"
              ? "chemical-quantity"
              : undefined,
          cells,
        },
      ],
    };
    setTableErrors((prev) => ({ ...prev, [table.id]: "" }));
    setRowDrafts((prev) => ({ ...prev, [table.id]: {} }));
    commit(upsertSessionDataTable(session, updatedTable), `Added row to "${table.title}".`);
  };

  const handleCreateCustomTable = (event: React.FormEvent) => {
    event.preventDefault();
    if (!customTableTitle.trim()) return;
    const newTable: ExperimentalDataTable = {
      id: `tbl-custom-${Date.now().toString(36)}`,
      title: customTableTitle.trim(),
      xAxisColumnId: "col-1",
      yAxisColumnId: "col-2",
      columns: [
        {
          id: "col-1",
          label: customCol1Label.trim() || "X",
          kind: "numeric",
          unit: "dimensionless",
          precisionDecimals: 0,
          required: false,
        },
        {
          id: "col-2",
          label: customCol2Label.trim() || "Y",
          kind: "numeric",
          unit: customCol2Unit.trim() || "dimensionless",
          precisionDecimals: 2,
          required: false,
        },
      ],
      rows: [],
    };
    commit(upsertSessionDataTable(session, newTable), `Created table "${newTable.title}".`);
    setCustomTableTitle("");
  };

  const statusPillState =
    session.status === "completed"
      ? "completed"
      : session.status === "in_progress"
        ? "in_progress"
        : "started";

  return (
    <div className="container">
      <p className="card-meta">
        <Link className="text-link" href="/notebook">
          <ArrowLeft size={16} aria-hidden="true" /> All notebook sessions
        </Link>
      </p>

      <header className="notebook-header-bar">
        <div>
          <div className="learning-pill-row">
            <ProgressStatusPill status={statusPillState} />
            <span className="badge badge-muted">
              Experiment {session.experimentId} v{session.experimentVersion}
            </span>
            <span className="badge badge-muted">Revision {session.revision}</span>
          </div>

          {editingTitle ? (
            <div className="notebook-actions-row" style={{ marginTop: "0.5rem" }}>
              <label className="sr-only" htmlFor="session-title-edit">
                Session title
              </label>
              <input
                id="session-title-edit"
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
              />
              <button
                type="button"
                className="button"
                onClick={() => {
                  if (titleDraft.trim()) {
                    commit(renameNotebookSession(session, titleDraft), "Session title updated.");
                    setEditingTitle(false);
                  }
                }}
              >
                Save
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setEditingTitle(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <h1>{session.title}</h1>
          )}

          <p className="card-meta">
            Experiment: <strong>{session.experimentTitle}</strong> · Local-only lab record (not a
            physical instrument log)
          </p>
        </div>

        <div className="notebook-actions-row">
          {!editingTitle ? (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setTitleDraft(session.title);
                setEditingTitle(true);
              }}
            >
              Rename
            </button>
          ) : null}
          {session.status === "completed" ? (
            <button
              type="button"
              className="button button-secondary"
              onClick={() =>
                commit(reopenNotebookSession(session), "Reopened session for editing.")
              }
            >
              <RotateCcw size={15} aria-hidden="true" /> Reopen session
            </button>
          ) : (
            <button
              type="button"
              className="button"
              onClick={() => commit(completeNotebookSession(session), "Session marked completed.")}
            >
              <CheckCircle2 size={15} aria-hidden="true" /> Mark session completed
            </button>
          )}
          <Link className="button button-secondary" href={`/notebook/${session.sessionId}/report`}>
            <FileText size={15} aria-hidden="true" /> Generate practical report
          </Link>
        </div>
      </header>

      {savedNotice ? (
        <div className="callout-banner" role="status">
          {savedNotice}
        </div>
      ) : null}

      <div className="learning-tabs" role="tablist" aria-label="Practical notebook sections">
        {(
          [
            ["overview", "1. Overview & Pre-Lab"],
            ["observations", `2. Observations (${session.observations.length})`],
            ["tables", `3. Data Tables (${session.dataTables.length})`],
            ["calculations", `4. Calculations (${session.calculations.length})`],
            ["notes", "5. Discussion & Conclusion"],
            ["history", "6. Export & History"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className="learning-tab"
            onClick={() => setActiveTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "overview" ? (
        <div className="pathway-step-list">
          <section className="learning-card" aria-labelledby="prelab-checklist-heading">
            <h2 id="prelab-checklist-heading">Pre-laboratory readiness checklist</h2>
            <p className="card-meta">
              Confirm you have reviewed objectives, apparatus, safety precautions and procedure
              steps before recording observations.
            </p>
            <div className="checklist-grid">
              {(
                [
                  ["objectiveReviewed", "Learning objectives & theory reviewed"],
                  ["apparatusReviewed", "Required glassware & apparatus checked"],
                  ["safetyReviewed", "Hazards, PPE & waste disposal understood"],
                  ["procedureReviewed", "Ordered procedure steps reviewed"],
                ] as const
              ).map(([field, label]) => (
                <label key={field} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={session.preLabChecklist[field]}
                    onChange={(e) =>
                      commit(
                        updateSessionChecklist(session, { [field]: e.target.checked }),
                        "Updated pre-lab readiness checklist.",
                      )
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="learning-grid-2">
            <section className="learning-card" aria-labelledby="hypothesis-heading">
              <h2 id="hypothesis-heading">Plan &amp; expected chemical behaviour</h2>
              <label className="learning-field">
                Pre-lab plan / hypothesis
                <textarea
                  defaultValue={session.userNotes.hypothesisOrPlan}
                  onBlur={(e) => {
                    if (e.target.value !== session.userNotes.hypothesisOrPlan) {
                      commit(
                        updateSessionUserNotes(session, { hypothesisOrPlan: e.target.value }),
                        "Saved pre-lab plan.",
                      );
                    }
                  }}
                  placeholder="State the relationship or expected trend you plan to investigate..."
                />
              </label>
              <p className="card-meta">Changes save automatically when you leave the text box.</p>
            </section>

            <section className="learning-card" aria-labelledby="workflow-links-heading">
              <h2 id="workflow-links-heading">Experiment resources &amp; workspace</h2>
              <div className="notebook-actions-row">
                <Link
                  className="button button-secondary"
                  href={`/experiments/${session.experimentSlug}`}
                >
                  Read experiment manual
                </Link>
                {HAS_INTERACTIVE_LAB.has(session.experimentId) ? (
                  <Link className="button" href={`/experiments/${session.experimentSlug}/lab`}>
                    <FlaskConical size={15} aria-hidden="true" /> Open interactive lab
                  </Link>
                ) : null}
              </div>
              {relatedLessons.length > 0 ? (
                <p className="card-meta">
                  Companion lessons:{" "}
                  {relatedLessons.map((l, idx) => (
                    <span key={l.id}>
                      {idx > 0 ? " · " : ""}
                      <Link className="text-link" href={`/learn/lessons/${l.slug}`}>
                        {l.title}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
              {relatedQuizzes.length > 0 ? (
                <p className="card-meta">
                  Post-lab quiz:{" "}
                  {relatedQuizzes.map((q) => (
                    <Link key={q.id} className="text-link" href={`/learn/assessments/${q.id}`}>
                      {q.title}
                    </Link>
                  ))}
                </p>
              ) : null}
            </section>
          </div>
        </div>
      ) : null}

      {activeTab === "observations" ? (
        <div className="pathway-step-list">
          <section className="learning-card" aria-labelledby="add-obs-heading">
            <h2 id="add-obs-heading">Record an observation</h2>
            <p className="card-meta">
              Tag every entry accurately: user-entered notes, reference/literature expectations, or
              imported external values are kept strictly separate from simulated outputs.
            </p>
            {obsError ? (
              <div className="quiz-feedback-fail" role="alert">
                {obsError}
              </div>
            ) : null}
            <form onSubmit={handleAddObservation} className="pathway-step-list">
              <div className="learning-grid-2">
                <label className="learning-field">
                  Observation title
                  <input
                    type="text"
                    value={obsTitle}
                    onChange={(e) => setObsTitle(e.target.value)}
                    placeholder="e.g. Initial burette meniscus reading"
                    required
                  />
                </label>
                <label className="learning-field">
                  Provenance category
                  <select
                    value={obsProvenance}
                    onChange={(e) =>
                      setObsProvenance(
                        e.target.value as
                          | "user_entered"
                          | "reference_expected"
                          | "imported_external",
                      )
                    }
                  >
                    <option value="user_entered">User-entered observation</option>
                    <option value="reference_expected">Reference / expected textbook value</option>
                    <option value="imported_external">Imported external dataset</option>
                  </select>
                </label>
              </div>

              <div className="learning-grid-3">
                <label className="learning-field">
                  Numeric value (optional)
                  <input
                    type="number"
                    step="any"
                    value={obsValRaw}
                    onChange={(e) => setObsValRaw(e.target.value)}
                    placeholder="Leave blank if qualitative"
                  />
                </label>
                <label className="learning-field">
                  Unit (required if numeric)
                  <input
                    type="text"
                    value={obsUnit}
                    onChange={(e) => setObsUnit(e.target.value)}
                    placeholder="e.g. mL, mol/L, pH, °C, cm"
                  />
                </label>
                <label className="learning-field">
                  Decimal places
                  <select value={obsPrecision} onChange={(e) => setObsPrecision(e.target.value)}>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </label>
              </div>

              <div className="learning-grid-2">
                <label className="learning-field">
                  Associated apparatus (optional)
                  <select value={obsApparatus} onChange={(e) => setObsApparatus(e.target.value)}>
                    <option value="">— None selected —</option>
                    {(experiment?.materials.equipment ?? []).map((eq) => (
                      <option key={eq.id} value={eq.name}>
                        {eq.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="learning-field">
                  Qualitative description
                  <input
                    type="text"
                    value={obsDesc}
                    onChange={(e) => setObsDesc(e.target.value)}
                    placeholder="e.g. Pale pink colour persisted for 30 s"
                  />
                </label>
              </div>

              <label className="learning-field">
                Additional notes (optional)
                <input
                  type="text"
                  value={obsNotes}
                  onChange={(e) => setObsNotes(e.target.value)}
                  placeholder="Condition notes, temperature, parallax check..."
                />
              </label>

              <div>
                <button type="submit" className="button">
                  <PlusCircle size={15} aria-hidden="true" /> Record observation
                </button>
              </div>
            </form>
          </section>

          <section className="learning-card" aria-labelledby="obs-log-heading">
            <h2 id="obs-log-heading">Observation log ({session.observations.length})</h2>
            {session.observations.length === 0 ? (
              <p className="card-meta">
                No observations recorded yet. Entries added above or appended from the virtual lab
                appear here in chronological sequence.
              </p>
            ) : (
              <div className="content-table-wrap">
                <table className="content-table">
                  <caption className="sr-only">Session observations</caption>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Observation &amp; Notes</th>
                      <th scope="col">Value &amp; Unit</th>
                      <th scope="col">Apparatus</th>
                      <th scope="col">Provenance</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {session.observations.map((obs) => (
                      <tr key={obs.id}>
                        <td>{obs.sequence}</td>
                        <td>
                          <strong>{obs.title}</strong>
                          {obs.description ? <p className="card-meta">{obs.description}</p> : null}
                          {obs.notes ? <p className="card-meta">Note: {obs.notes}</p> : null}
                        </td>
                        <td>
                          {obs.value !== null
                            ? `${obs.precisionDecimals !== undefined ? obs.value.toFixed(obs.precisionDecimals) : obs.value} ${obs.unit ?? ""}`
                            : "Qualitative"}
                        </td>
                        <td>{obs.apparatusLabel ?? "—"}</td>
                        <td>
                          <ProvenancePill provenance={obs.provenance} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="button button-danger"
                            onClick={() =>
                              commit(
                                removeObservationFromSession(session, obs.id),
                                "Removed observation.",
                              )
                            }
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      ) : null}

      {activeTab === "tables" ? (
        <div className="pathway-step-list">
          {session.dataTables.map((table) => (
            <section key={table.id} className="learning-card" aria-label={table.title}>
              <div className="learning-card-header">
                <h2>{table.title}</h2>
                <span className="card-meta">{table.rows.length} rows</span>
              </div>
              {table.description ? <p className="card-meta">{table.description}</p> : null}

              <div className="content-table-wrap">
                <table className="content-table">
                  <caption className="sr-only">{table.title}</caption>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      {table.columns.map((col) => (
                        <th key={col.id} scope="col">
                          {col.label} {col.unit ? `(${col.unit})` : ""}
                        </th>
                      ))}
                      <th scope="col">Provenance</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.length === 0 ? (
                      <tr>
                        <td colSpan={table.columns.length + 3} className="card-meta">
                          0 rows recorded — add a row below (empty templates never invent numbers).
                        </td>
                      </tr>
                    ) : (
                      table.rows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.sequence}</td>
                          {table.columns.map((col) => {
                            const cell = row.cells[col.id];
                            const formatted =
                              !cell || (cell.numericValue === null && cell.raw.trim() === "")
                                ? "— (missing)"
                                : col.kind === "numeric" && cell.numericValue !== null
                                  ? cell.numericValue.toFixed(col.precisionDecimals)
                                  : cell.raw;
                            return <td key={col.id}>{formatted}</td>;
                          })}
                          <td>
                            <ProvenancePill provenance={row.provenance} />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="button button-danger"
                              onClick={() => {
                                const filtered = table.rows
                                  .filter((r) => r.id !== row.id)
                                  .map((r, i) => ({ ...r, sequence: i + 1 }));
                                commit(
                                  upsertSessionDataTable(session, { ...table, rows: filtered }),
                                  "Removed table row.",
                                );
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {tableErrors[table.id] ? (
                <div className="quiz-feedback-fail" role="alert">
                  {tableErrors[table.id]}
                </div>
              ) : null}

              <div className="learning-grid-3">
                {table.columns.map((col) => (
                  <label key={col.id} className="learning-field">
                    {col.label} {col.unit ? `(${col.unit})` : ""}
                    <input
                      type="text"
                      value={rowDrafts[table.id]?.[col.id] ?? ""}
                      onChange={(e) =>
                        setRowDrafts((prev) => ({
                          ...prev,
                          [table.id]: { ...prev[table.id], [col.id]: e.target.value },
                        }))
                      }
                      placeholder={
                        col.kind === "numeric" ? `Numeric (${col.unit ?? ""}) or N/A` : "Text"
                      }
                    />
                  </label>
                ))}
                <label className="learning-field">
                  Row provenance
                  <select
                    value={rowProvenance[table.id] ?? "user_entered"}
                    onChange={(e) =>
                      setRowProvenance((prev) => ({
                        ...prev,
                        [table.id]: e.target.value as NotebookProvenance,
                      }))
                    }
                  >
                    <option value="user_entered">User-entered</option>
                    <option value="simulation_generated">Simulation-generated</option>
                    <option value="engine_calculated">Engine-calculated</option>
                    <option value="reference_expected">Reference / expected</option>
                    <option value="imported_external">Imported external</option>
                  </select>
                </label>
              </div>
              <div>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => handleAddRowToTable(table)}
                >
                  <PlusCircle size={15} aria-hidden="true" /> Add row to {table.title}
                </button>
              </div>
            </section>
          ))}

          <section className="learning-card" aria-labelledby="custom-table-heading">
            <h2 id="custom-table-heading">Add a custom two-column table</h2>
            <form onSubmit={handleCreateCustomTable} className="learning-grid-2">
              <label className="learning-field">
                Table title
                <input
                  type="text"
                  value={customTableTitle}
                  onChange={(e) => setCustomTableTitle(e.target.value)}
                  placeholder="e.g. Temperature vs Reaction Time"
                  required
                />
              </label>
              <label className="learning-field">
                Column 1 label (dimensionless index/trial)
                <input
                  type="text"
                  value={customCol1Label}
                  onChange={(e) => setCustomCol1Label(e.target.value)}
                  required
                />
              </label>
              <label className="learning-field">
                Column 2 label
                <input
                  type="text"
                  value={customCol2Label}
                  onChange={(e) => setCustomCol2Label(e.target.value)}
                  required
                />
              </label>
              <label className="learning-field">
                Column 2 unit
                <input
                  type="text"
                  value={customCol2Unit}
                  onChange={(e) => setCustomCol2Unit(e.target.value)}
                  required
                />
              </label>
              <div>
                <button type="submit" className="button button-secondary">
                  Create custom table
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {activeTab === "calculations" ? (
        <div className="pathway-step-list">
          <CalculationWorkbench
            onSaveCalculation={(calc) =>
              commit(
                addCalculationToSession(session, calc),
                `Saved engine calculation: ${calc.title}.`,
              )
            }
          />

          <section className="learning-card" aria-labelledby="saved-calcs-heading">
            <h2 id="saved-calcs-heading">
              Saved session calculations ({session.calculations.length})
            </h2>
            {session.calculations.length === 0 ? (
              <p className="card-meta">
                No calculations saved in this session yet. Compute above to store full formula
                derivations and model provenance.
              </p>
            ) : (
              <div className="pathway-step-list">
                {session.calculations.map((calc) => (
                  <article key={calc.id} className="learning-card">
                    <div className="learning-card-header">
                      <h3>{calc.title}</h3>
                      <ProvenancePill provenance="engine_calculated" />
                    </div>
                    <p>
                      <strong>Formula:</strong> <code>{calc.formula}</code>
                    </p>
                    <p>
                      <strong>Result:</strong> {calc.result.label} ={" "}
                      <code>
                        {calc.result.formattedValue} {calc.result.unit}
                      </code>
                    </p>
                    <p className="card-meta">
                      Model: {calc.provenance.modelId} v{calc.provenance.modelVersion} (engine v
                      {calc.provenance.engineVersion})
                    </p>
                    <div>
                      <button
                        type="button"
                        className="button button-danger"
                        onClick={() =>
                          commit(
                            removeCalculationFromSession(session, calc.id),
                            "Removed calculation.",
                          )
                        }
                      >
                        Remove calculation
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {activeTab === "notes" ? (
        <div className="pathway-step-list">
          <section className="learning-card" aria-labelledby="notes-section-heading">
            <h2 id="notes-section-heading">Discussion, conclusion &amp; error analysis</h2>
            <p className="card-meta">
              Write your scientific interpretation based on your recorded observations and model
              calculations. Practical reports never auto-generate or fabricate conclusions.
            </p>
            <label className="learning-field">
              Discussion (interpret trends, stoichiometry and model assumptions)
              <textarea
                defaultValue={session.userNotes.discussion}
                onBlur={(e) => {
                  if (e.target.value !== session.userNotes.discussion) {
                    commit(
                      updateSessionUserNotes(session, { discussion: e.target.value }),
                      "Saved discussion.",
                    );
                  }
                }}
                placeholder="Discuss how your observations and calculations relate to the chemical theory..."
              />
            </label>
            <label className="learning-field">
              Conclusion (concise summary of findings with units)
              <textarea
                defaultValue={session.userNotes.conclusion}
                onBlur={(e) => {
                  if (e.target.value !== session.userNotes.conclusion) {
                    commit(
                      updateSessionUserNotes(session, { conclusion: e.target.value }),
                      "Saved conclusion.",
                    );
                  }
                }}
                placeholder="Summarize the quantitative or qualitative result and state that values derive from virtual simulation/models..."
              />
            </label>
            <label className="learning-field">
              Sources of error &amp; physical vs. model limitations
              <textarea
                defaultValue={session.userNotes.errorAnalysis}
                onBlur={(e) => {
                  if (e.target.value !== session.userNotes.errorAnalysis) {
                    commit(
                      updateSessionUserNotes(session, { errorAnalysis: e.target.value }),
                      "Saved error analysis.",
                    );
                  }
                }}
                placeholder="Note systematic/random errors in a real lab (parallax, temperature, ionic strength)..."
              />
            </label>
          </section>
        </div>
      ) : null}

      {activeTab === "history" ? (
        <div className="pathway-step-list">
          <section className="learning-card" aria-labelledby="session-exports-heading">
            <h2 id="session-exports-heading">Export, duplicate, reset or delete</h2>
            <div className="notebook-actions-row">
              <button
                type="button"
                className="button"
                onClick={() =>
                  triggerBlobDownload(
                    exportSessionJson(session),
                    "application/json;charset=utf-8",
                    filenames.json,
                  )
                }
              >
                <Download size={15} aria-hidden="true" /> Export session JSON
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() =>
                  triggerBlobDownload(
                    exportSessionCsv(session),
                    "text/csv;charset=utf-8",
                    filenames.csv,
                  )
                }
              >
                <Download size={15} aria-hidden="true" /> Export CSV dataset
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  const copy = duplicateNotebookSession(session);
                  saveSession(copy);
                  router.push(`/notebook/${copy.sessionId}`);
                }}
              >
                Duplicate session
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={() => setConfirmReset(true)}
              >
                <RotateCcw size={15} aria-hidden="true" /> Reset session data
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={15} aria-hidden="true" /> Delete session
              </button>
            </div>

            {confirmReset ? (
              <div className="confirm-box" role="alert">
                <p>
                  <strong>Reset all observations, table rows, calculations and notes?</strong> This
                  action clears recorded data in this session and cannot be undone.
                </p>
                <div className="notebook-actions-row">
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => {
                      commit(resetNotebookSession(session), "Session reset to empty state.");
                      setConfirmReset(false);
                    }}
                  >
                    Confirm reset
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {confirmDelete ? (
              <div className="confirm-box" role="alert">
                <p>
                  <strong>Permanently delete this session?</strong>
                </p>
                <div className="notebook-actions-row">
                  <button
                    type="button"
                    className="button button-danger"
                    onClick={() => {
                      deleteSession(session.sessionId);
                      router.push("/notebook");
                    }}
                  >
                    Confirm delete
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          <section className="learning-card" aria-labelledby="history-log-heading">
            <h2 id="history-log-heading">Session revision history ({session.history.length})</h2>
            <ul className="objective-list">
              {[...session.history].reverse().map((h) => (
                <li key={h.id}>
                  <code>{h.timestamp.slice(0, 19).replace("T", " ")}Z</code> —{" "}
                  <strong>{h.action.replace(/_/g, " ")}:</strong> {h.summary}
                </li>
              ))}
            </ul>
          </section>
        </div>
      ) : null}
    </div>
  );
}
