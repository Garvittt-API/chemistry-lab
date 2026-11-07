"use client";

import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";
import {
  buildPracticalReport,
  buildReportExportFilenames,
  exportReportHtml,
  exportReportPdf,
  exportSessionCsv,
  exportSessionJson,
  getDefaultReportConfigForExperiment,
  PROVENANCE_LABELS,
  REPORT_SECTION_IDS,
  type ReportChartSeries,
  type ReportSectionId,
} from "@virtual-chemistry-lab/learning-core";
import { ArrowLeft, Download, FileSpreadsheet, FileText, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { triggerBlobDownload } from "../../lib/file-download";
import { ProvenancePill } from "./badges";
import { useLearningStore } from "./learning-store-provider";

const SECTION_LABELS: Record<ReportSectionId, string> = {
  title: "Report Title",
  identification: "Experiment Identification",
  session_info: "Date & Session Info",
  objective: "Objective",
  theory: "Theory",
  equations: "Chemical & Mathematical Equations",
  apparatus: "Apparatus",
  chemicals: "Chemicals & Materials",
  safety: "Safety Precautions",
  procedure: "Procedure",
  observations: "Recorded Observations",
  data_tables: "Experimental Data Tables",
  calculations: "Calculations & Formulas",
  results: "Results Summary",
  graphs: "Graphs & Charts",
  discussion: "Discussion",
  conclusion: "Conclusion",
  sources_of_error: "Sources of Error & Limitations",
  references: "References",
  simulation_disclosure: "Simulation & Measurement Disclosure (Mandatory)",
};

export function ReportBuilderView({
  sessionId,
  experimentsById,
}: Readonly<{
  sessionId: string;
  experimentsById: Readonly<Record<string, ExperimentRecord>>;
}>) {
  const { hydrated, snapshot, markReportGenerated } = useLearningStore();
  const session = hydrated ? snapshot.sessions.find((s) => s.sessionId === sessionId) : undefined;
  const experiment = session ? experimentsById[session.experimentId] : undefined;

  const [includedSections, setIncludedSections] = useState<ReportSectionId[]>(() => [
    ...REPORT_SECTION_IDS,
  ]);
  const [includeCharts, setIncludeCharts] = useState(true);
  const [initializedForSession, setInitializedForSession] = useState<string | null>(null);

  useEffect(() => {
    if (session && experiment && initializedForSession !== session.sessionId) {
      const defaults = getDefaultReportConfigForExperiment(experiment);
      setIncludedSections([...defaults.includedSections]);
      setIncludeCharts(defaults.includeCharts);
      setInitializedForSession(session.sessionId);
      markReportGenerated(session.sessionId);
    }
  }, [session, experiment, initializedForSession, markReportGenerated]);

  const report = useMemo(() => {
    if (!session || !experiment) return null;
    return buildPracticalReport(session, experiment, {
      includedSections,
      includeCharts,
    });
  }, [session, experiment, includedSections, includeCharts]);

  if (!hydrated) {
    return (
      <div className="container section">
        <h1>Loading practical report…</h1>
        <p className="card-meta">Reading local laboratory session storage.</p>
      </div>
    );
  }

  if (!session || !experiment || !report) {
    return (
      <div className="container section">
        <div className="learning-card">
          <h1>Report session unavailable</h1>
          <p>
            No local practical session with ID <code>{sessionId}</code> was found in this browser.
          </p>
          <div>
            <Link className="button" href="/notebook">
              Back to Practical Notebook
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filenames = buildReportExportFilenames(session);
  const has = (id: ReportSectionId) => report.includedSections.includes(id);

  const toggleSection = (id: ReportSectionId) => {
    if (id === "title" || id === "simulation_disclosure") return;
    setIncludedSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="container">
      <div className="no-print">
        <p className="card-meta">
          <Link className="text-link" href={`/notebook/${session.sessionId}`}>
            <ArrowLeft size={16} aria-hidden="true" /> Back to notebook session
          </Link>
        </p>

        <header className="notebook-header-bar">
          <div>
            <p className="eyebrow">Practical Report Generator</p>
            <h1>{report.titleSection.experimentTitle}</h1>
            <p className="card-meta">
              Session: <strong>{report.titleSection.sessionTitle}</strong> · Preserves exact data
              provenance, units and model versions.
            </p>
          </div>
          <div className="notebook-actions-row">
            <button
              type="button"
              className="button"
              onClick={() => {
                const pdfBytes = exportReportPdf(report);
                triggerBlobDownload(pdfBytes, "application/pdf", filenames.pdf);
              }}
            >
              <Download size={15} aria-hidden="true" /> Export PDF (.pdf)
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                const html = exportReportHtml(report);
                triggerBlobDownload(html, "text/html;charset=utf-8", filenames.html);
              }}
            >
              <FileText size={15} aria-hidden="true" /> Export HTML (.html)
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
              <FileSpreadsheet size={15} aria-hidden="true" /> Export CSV (.csv)
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() =>
                triggerBlobDownload(
                  exportSessionJson(session),
                  "application/json;charset=utf-8",
                  filenames.json,
                )
              }
            >
              <Download size={15} aria-hidden="true" /> Export JSON (.json)
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => window.print()}
            >
              <Printer size={15} aria-hidden="true" /> Print
            </button>
          </div>
        </header>

        <details className="learning-card" style={{ marginBottom: "1.5rem" }}>
          <summary style={{ cursor: "pointer", fontWeight: 700 }}>
            Configure included report sections ({report.includedSections.length} of{" "}
            {REPORT_SECTION_IDS.length} active)
          </summary>
          <div className="checklist-grid" style={{ marginTop: "1rem" }}>
            {REPORT_SECTION_IDS.map((id) => {
              const mandatory = id === "title" || id === "simulation_disclosure";
              return (
                <label key={id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={report.includedSections.includes(id)}
                    disabled={mandatory}
                    onChange={() => toggleSection(id)}
                  />
                  <span>{SECTION_LABELS[id]}</span>
                </label>
              );
            })}
            <label className="checklist-item">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
              />
              <span>Render XY charts from numeric table columns</span>
            </label>
          </div>
        </details>
      </div>

      <article className="report-document" aria-label="Generated practical report preview">
        <header className="notebook-header-bar">
          <div>
            <p className="eyebrow">Virtual Chemistry Lab · Practical Report</p>
            <h2>{report.titleSection.experimentTitle}</h2>
            <p className="card-meta">
              Session: {report.titleSection.sessionTitle} · Generated {report.generatedAt}
            </p>
          </div>
        </header>

        {report.completenessIssues.length > 0 ? (
          <div
            className="callout-banner callout-banner-warning"
            role="region"
            aria-label="Report completeness audit"
          >
            <strong>
              Report Completeness Audit ({report.completenessIssues.length} missing or incomplete{" "}
              {report.completenessIssues.length === 1 ? "item" : "items"})
            </strong>
            <ul className="objective-list">
              {report.completenessIssues.map((issue) => (
                <li key={`${issue.sectionId}-${issue.message}`}>{issue.message}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {has("identification") ? (
          <section className="detail-section">
            <h3>Experiment Identification</h3>
            <dl className="detail-meta">
              <div>
                <dt>Experiment ID</dt>
                <dd>
                  <code>{report.identificationSection.experimentId}</code>
                </dd>
              </div>
              <div>
                <dt>Version</dt>
                <dd>
                  {report.identificationSection.experimentVersion} (schema{" "}
                  {report.identificationSection.experimentSchemaVersion})
                </dd>
              </div>
              <div>
                <dt>Discipline &amp; Difficulty</dt>
                <dd>
                  {report.identificationSection.disciplineId} ·{" "}
                  {report.identificationSection.difficulty}
                </dd>
              </div>
              <div>
                <dt>Review Status</dt>
                <dd>
                  {report.identificationSection.scientificReviewStatus} (
                  {report.identificationSection.integrityLabel})
                </dd>
              </div>
            </dl>
          </section>
        ) : null}

        {has("session_info") ? (
          <section className="detail-section">
            <h3>Date &amp; Session Information</h3>
            <dl className="detail-meta">
              <div>
                <dt>Session ID</dt>
                <dd>
                  <code>{report.sessionInfoSection.sessionId}</code>
                </dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>
                  {report.sessionInfoSection.status} (revision {report.sessionInfoSection.revision})
                </dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{report.sessionInfoSection.createdAt}</dd>
              </div>
              <div>
                <dt>Completed</dt>
                <dd>{report.sessionInfoSection.completedAt ?? "In progress"}</dd>
              </div>
            </dl>
          </section>
        ) : null}

        {has("objective") ? (
          <section className="detail-section">
            <h3>Objective</h3>
            <p>{report.objectiveSection.shortDescription}</p>
            <ul className="objective-list">
              {report.objectiveSection.learningObjectives.map((obj) => (
                <li key={obj}>{obj}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {has("theory") ? (
          <section className="detail-section">
            <h3>Theory</h3>
            <p>{report.theorySection.overview}</p>
          </section>
        ) : null}

        {has("equations") && report.equationsSection.length > 0 ? (
          <section className="detail-section">
            <h3>Equations</h3>
            {report.equationsSection.map((eq) => (
              <div key={eq.id} className="learning-card">
                <p>
                  <code>{eq.expression}</code>
                </p>
                <p className="card-meta">{eq.description}</p>
              </div>
            ))}
          </section>
        ) : null}

        {has("apparatus") ? (
          <section className="detail-section">
            <h3>Apparatus</h3>
            <div className="content-table-wrap">
              <table className="content-table">
                <caption className="sr-only">Apparatus list</caption>
                <thead>
                  <tr>
                    <th scope="col">Item</th>
                    <th scope="col">Specification</th>
                    <th scope="col">Qty</th>
                    <th scope="col">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  {report.apparatusSection.map((a) => (
                    <tr key={`${a.name}-${a.specification}`}>
                      <td>{a.name}</td>
                      <td>{a.specification}</td>
                      <td>{a.quantity}</td>
                      <td>{a.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {has("chemicals") ? (
          <section className="detail-section">
            <h3>Chemicals &amp; Materials</h3>
            {report.chemicalsSection.length === 0 ? (
              <p className="card-meta">No wet-chemical reagents required.</p>
            ) : (
              <div className="content-table-wrap">
                <table className="content-table">
                  <caption className="sr-only">Chemicals list</caption>
                  <thead>
                    <tr>
                      <th scope="col">Substance</th>
                      <th scope="col">Formula / Description</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Hazards</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.chemicalsSection.map((c) => (
                      <tr key={c.name}>
                        <td>{c.name}</td>
                        <td>{c.formulaOrDescription}</td>
                        <td>{c.amount}</td>
                        <td>{c.hazards}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {has("safety") ? (
          <section className="detail-section">
            <h3>Safety Precautions</h3>
            <p>
              <strong>Risk level:</strong> {report.safetySection.riskClassification} —{" "}
              {report.safetySection.riskRationale}
            </p>
            <ul className="objective-list">
              {report.safetySection.hazards.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {has("procedure") ? (
          <section className="detail-section">
            <h3>Procedure</h3>
            <p>{report.procedureSection.overview}</p>
            <ol className="procedure-list">
              {report.procedureSection.steps.map((st) => (
                <li key={st.stepNumber}>
                  <strong>{st.title}:</strong> {st.instructions}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {has("observations") ? (
          <section className="detail-section">
            <h3>Recorded Observations</h3>
            {report.observationsSection.records.length === 0 ? (
              <p className="card-meta">{report.observationsSection.emptyNotice}</p>
            ) : (
              <div className="content-table-wrap">
                <table className="content-table">
                  <caption className="sr-only">Recorded observations</caption>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Observation</th>
                      <th scope="col">Value &amp; Unit</th>
                      <th scope="col">Apparatus</th>
                      <th scope="col">Provenance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.observationsSection.records.map((obs) => (
                      <tr key={obs.id}>
                        <td>{obs.sequence}</td>
                        <td>
                          <strong>{obs.title}</strong>
                          {obs.description ? <p className="card-meta">{obs.description}</p> : null}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {has("data_tables") ? (
          <section className="detail-section">
            <h3>Experimental Data Tables</h3>
            {report.dataTablesSection.tables.map((tbl) => (
              <div key={tbl.id} style={{ marginBottom: "1rem" }}>
                <h4>{tbl.title}</h4>
                {tbl.rows.length === 0 ? (
                  <p className="card-meta">MISSING DATA: 0 rows recorded in this table.</p>
                ) : (
                  <div className="content-table-wrap">
                    <table className="content-table">
                      <caption className="sr-only">{tbl.title}</caption>
                      <thead>
                        <tr>
                          {tbl.columns.map((c) => (
                            <th key={c.id} scope="col">
                              {c.label} {c.unit ? `(${c.unit})` : ""}
                            </th>
                          ))}
                          <th scope="col">Provenance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tbl.rows.map((r) => (
                          <tr key={r.id}>
                            {tbl.columns.map((c) => {
                              const cell = r.cells[c.id];
                              const text =
                                !cell || (cell.numericValue === null && cell.raw.trim() === "")
                                  ? "—"
                                  : c.kind === "numeric" && cell.numericValue !== null
                                    ? cell.numericValue.toFixed(c.precisionDecimals)
                                    : cell.raw;
                              return <td key={c.id}>{text}</td>;
                            })}
                            <td>
                              <ProvenancePill provenance={r.provenance} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </section>
        ) : null}

        {has("calculations") ? (
          <section className="detail-section">
            <h3>Calculations</h3>
            {report.calculationsSection.sessionCalculations.length === 0 ? (
              <p className="card-meta">
                No engine calculations were executed and saved in this session.
              </p>
            ) : (
              report.calculationsSection.sessionCalculations.map((calc) => (
                <div key={calc.id} className="learning-card">
                  <h4>
                    {calc.title} ({calc.provenance.modelId} v{calc.provenance.modelVersion})
                  </h4>
                  <p>
                    <strong>Formula:</strong> <code>{calc.formula}</code>
                  </p>
                  <ul className="objective-list">
                    {calc.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <p>
                    <strong>Result:</strong> {calc.result.label} ={" "}
                    <code>
                      {calc.result.formattedValue} {calc.result.unit}
                    </code>
                  </p>
                </div>
              ))
            )}
          </section>
        ) : null}

        {has("results") ? (
          <section className="detail-section">
            <h3>Results Summary</h3>
            {report.resultsSection.summaryItems.length === 0 ? (
              <p className="card-meta">{report.resultsSection.emptyNotice}</p>
            ) : (
              <div className="content-table-wrap">
                <table className="content-table">
                  <caption className="sr-only">Results summary</caption>
                  <thead>
                    <tr>
                      <th scope="col">Quantity</th>
                      <th scope="col">Value &amp; Unit</th>
                      <th scope="col">Provenance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.resultsSection.summaryItems.map((item, idx) => (
                      <tr key={`${item.label}-${idx}`}>
                        <td>{item.label}</td>
                        <td>
                          <code>{item.valueWithUnit}</code>
                        </td>
                        <td>
                          <ProvenancePill provenance={item.provenance} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {has("graphs") ? (
          <section className="detail-section">
            <h3>Graphs &amp; Charts</h3>
            {report.graphsSection.charts.length === 0 ? (
              <p className="card-meta">{report.graphsSection.emptyNotice}</p>
            ) : (
              report.graphsSection.charts.map((chart) => (
                <ReportChartFigure key={chart.id} chart={chart} />
              ))
            )}
          </section>
        ) : null}

        {has("discussion") ? (
          <section className="detail-section">
            <h3>Discussion</h3>
            <p>{report.discussionSection.text ?? report.discussionSection.missingNotice}</p>
          </section>
        ) : null}

        {has("conclusion") ? (
          <section className="detail-section">
            <h3>Conclusion</h3>
            <p>{report.conclusionSection.text ?? report.conclusionSection.missingNotice}</p>
          </section>
        ) : null}

        {has("sources_of_error") ? (
          <section className="detail-section">
            <h3>Sources of Error &amp; Model Limitations</h3>
            {report.sourcesOfErrorSection.studentErrorAnalysis ? (
              <p>
                <strong>Student analysis:</strong>{" "}
                {report.sourcesOfErrorSection.studentErrorAnalysis}
              </p>
            ) : null}
            <ul className="objective-list">
              {report.sourcesOfErrorSection.experimentErrorSources.map((err) => (
                <li key={err}>{err}</li>
              ))}
              {report.sourcesOfErrorSection.modelLimitations.map((lim) => (
                <li key={lim}>
                  <em>Model limitation:</em> {lim}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {has("references") ? (
          <section className="detail-section">
            <h3>References</h3>
            <ul className="objective-list">
              {report.referencesSection.map((ref) => (
                <li key={ref}>{ref}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="detail-section">
          <h3>Simulation &amp; Measurement Disclosure</h3>
          <div className="callout-banner">
            <p>{report.disclosureSection.statement}</p>
            <p className="card-meta">{report.disclosureSection.scientificReviewNotice}</p>
          </div>
          <div className="content-table-wrap">
            <table className="content-table">
              <caption className="sr-only">Provenance entry breakdown</caption>
              <thead>
                <tr>
                  <th scope="col">Provenance Category</th>
                  <th scope="col">Recorded Entries</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(PROVENANCE_LABELS) as Array<keyof typeof PROVENANCE_LABELS>).map(
                  (key) => (
                    <tr key={key}>
                      <td>{PROVENANCE_LABELS[key]}</td>
                      <td>{report.disclosureSection.provenanceCounts[key]}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      </article>
    </div>
  );
}

function ReportChartFigure({ chart }: Readonly<{ chart: ReportChartSeries }>) {
  const width = 540;
  const height = 220;
  const left = 62;
  const right = width - 24;
  const top = 28;
  const bottom = height - 42;
  const plotW = right - left;
  const plotH = bottom - top;

  const xs = chart.points.map((p) => p.x);
  const ys = chart.points.map((p) => p.y);
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  if (maxX === minX) {
    minX -= 1;
    maxX += 1;
  }
  if (maxY === minY) {
    minY -= 1;
    maxY += 1;
  }

  const mapX = (x: number) => left + ((x - minX) / (maxX - minX)) * plotW;
  const mapY = (y: number) => bottom - ((y - minY) / (maxY - minY)) * plotH;
  const pointsAttr = chart.points
    .map((pt) => `${mapX(pt.x).toFixed(1)},${mapY(pt.y).toFixed(1)}`)
    .join(" ");

  return (
    <figure className="diagram-figure">
      <figcaption>
        <strong>{chart.title}</strong>
      </figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={chart.title}>
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="var(--color-surface)"
          stroke="var(--color-border)"
        />
        <line x1={left} y1={top} x2={left} y2={bottom} stroke="var(--color-text-primary)" />
        <line x1={left} y1={bottom} x2={right} y2={bottom} stroke="var(--color-text-primary)" />
        <polyline fill="none" stroke="var(--color-primary)" strokeWidth="2.2" points={pointsAttr} />
        {chart.points.map((pt, idx) => (
          <circle key={idx} cx={mapX(pt.x)} cy={mapY(pt.y)} r="4" fill="var(--color-accent)" />
        ))}
        <text x={left} y="16" fontSize="11" fill="var(--color-text-primary)">
          {chart.yLabel} ({chart.yUnit})
        </text>
        <text
          x={left + plotW / 2}
          y={height - 10}
          textAnchor="middle"
          fontSize="11"
          fill="var(--color-text-primary)"
        >
          {chart.xLabel} ({chart.xUnit})
        </text>
      </svg>
      <p className="card-meta">{chart.provenanceSummary}</p>
    </figure>
  );
}
