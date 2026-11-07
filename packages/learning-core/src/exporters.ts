import { PROVENANCE_LABELS, type PracticalReport } from "./report.js";
import {
  LEARNING_SCHEMA_VERSION,
  sessionExportEnvelopeSchema,
  type NotebookSession,
  type ReportChartSeries,
  type ReportSectionId,
} from "./schemas.js";
import {
  escapeCsvCell,
  escapeHtml,
  MAX_IMPORT_JSON_BYTES,
  sanitizeExportFilename,
  sanitizeUserText,
} from "./security.js";

function renderChartSvgHtml(chart: ReportChartSeries): string {
  const width = 560;
  const height = 230;
  const left = 64;
  const right = width - 22;
  const top = 26;
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

  const polyPoints = chart.points
    .map((pt) => `${mapX(pt.x).toFixed(1)},${mapY(pt.y).toFixed(1)}`)
    .join(" ");

  const circles = chart.points
    .map(
      (pt) =>
        `<circle cx="${mapX(pt.x).toFixed(1)}" cy="${mapY(pt.y).toFixed(1)}" r="3.6" fill="#9a4f26" />`,
    )
    .join("");

  return `
  <figure class="chart-card">
    <figcaption><strong>${escapeHtml(chart.title)}</strong></figcaption>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(chart.title)}">
      <rect x="0" y="0" width="${width}" height="${height}" fill="#fbfdfc" stroke="#c8d6d4" />
      <line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="#355052" stroke-width="1.3" />
      <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="#355052" stroke-width="1.3" />
      <polyline fill="none" stroke="#15686a" stroke-width="2" points="${polyPoints}" />
      ${circles}
      <text x="${left}" y="16" font-size="11" fill="#233b3d">${escapeHtml(`${chart.yLabel} (${chart.yUnit})`)}</text>
      <text x="${(left + plotW / 2 - 45).toFixed(0)}" y="${height - 10}" font-size="11" fill="#233b3d">${escapeHtml(`${chart.xLabel} (${chart.xUnit})`)}</text>
      <text x="8" y="${top + 4}" font-size="10" font-family="monospace" fill="#466062">${escapeHtml(maxY.toPrecision(4))}</text>
      <text x="8" y="${bottom}" font-size="10" font-family="monospace" fill="#466062">${escapeHtml(minY.toPrecision(4))}</text>
      <text x="${left}" y="${bottom + 15}" font-size="10" font-family="monospace" fill="#466062">${escapeHtml(minX.toPrecision(4))}</text>
      <text x="${right - 36}" y="${bottom + 15}" font-size="10" font-family="monospace" fill="#466062">${escapeHtml(maxX.toPrecision(4))}</text>
    </svg>
    <p class="muted">${escapeHtml(chart.provenanceSummary)}</p>
  </figure>`;
}

/**
 * Generate a standalone, XSS-escaped, print-friendly HTML5 laboratory report.
 */
export function exportReportHtml(report: PracticalReport): string {
  const has = (id: ReportSectionId) => report.includedSections.includes(id);
  const sections: string[] = [];

  if (report.completenessIssues.length > 0) {
    sections.push(`
      <div class="callout amber">
        <strong>Report Completeness Audit (${report.completenessIssues.length})</strong>
        <ul>
          ${report.completenessIssues.map((i) => `<li>${escapeHtml(i.message)}</li>`).join("")}
        </ul>
      </div>
    `);
  }

  if (has("identification")) {
    sections.push(`
      <section>
        <h2>Experiment Identification</h2>
        <table>
          <tbody>
            <tr><th>Experiment ID</th><td><code>${escapeHtml(report.identificationSection.experimentId)}</code></td></tr>
            <tr><th>Version</th><td>${escapeHtml(report.identificationSection.experimentVersion)} (schema ${escapeHtml(report.identificationSection.experimentSchemaVersion)})</td></tr>
            <tr><th>Discipline &amp; Difficulty</th><td>${escapeHtml(report.identificationSection.disciplineId)} · ${escapeHtml(report.identificationSection.difficulty)}</td></tr>
            <tr><th>Review Status</th><td>${escapeHtml(report.identificationSection.scientificReviewStatus)} (${escapeHtml(report.identificationSection.integrityLabel)})</td></tr>
          </tbody>
        </table>
      </section>
    `);
  }

  if (has("session_info")) {
    const cl = report.sessionInfoSection.preLabChecklist;
    sections.push(`
      <section>
        <h2>Date &amp; Session Information</h2>
        <table>
          <tbody>
            <tr><th>Session ID</th><td><code>${escapeHtml(report.sessionInfoSection.sessionId)}</code></td></tr>
            <tr><th>Status / Revision</th><td>${escapeHtml(report.sessionInfoSection.status)} (rev ${report.sessionInfoSection.revision})</td></tr>
            <tr><th>Created (UTC)</th><td>${escapeHtml(report.sessionInfoSection.createdAt)}</td></tr>
            <tr><th>Updated (UTC)</th><td>${escapeHtml(report.sessionInfoSection.updatedAt)}</td></tr>
            <tr><th>Completed (UTC)</th><td>${escapeHtml(report.sessionInfoSection.completedAt ?? "In progress")}</td></tr>
            <tr><th>Pre-Lab Readiness</th><td>Objective: ${cl.objectiveReviewed ? "Yes" : "No"}, Apparatus: ${cl.apparatusReviewed ? "Yes" : "No"}, Safety: ${cl.safetyReviewed ? "Yes" : "No"}, Procedure: ${cl.procedureReviewed ? "Yes" : "No"}</td></tr>
          </tbody>
        </table>
      </section>
    `);
  }

  if (has("objective")) {
    sections.push(`
      <section>
        <h2>Objective</h2>
        <p>${escapeHtml(report.objectiveSection.shortDescription)}</p>
        <ul>
          ${report.objectiveSection.learningObjectives.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}
        </ul>
      </section>
    `);
  }

  if (has("theory")) {
    sections.push(`
      <section>
        <h2>Theory</h2>
        <p>${escapeHtml(report.theorySection.overview)}</p>
      </section>
    `);
  }

  if (has("equations") && report.equationsSection.length > 0) {
    sections.push(`
      <section>
        <h2>Equations</h2>
        ${report.equationsSection
          .map(
            (eq) => `
          <div class="equation-block">
            <p><code>${escapeHtml(eq.expression)}</code></p>
            <p class="muted">${escapeHtml(eq.description)}</p>
          </div>`,
          )
          .join("")}
      </section>
    `);
  }

  if (has("apparatus")) {
    sections.push(`
      <section>
        <h2>Apparatus</h2>
        <table>
          <thead><tr><th>Item</th><th>Specification</th><th>Qty</th><th>Purpose</th></tr></thead>
          <tbody>
            ${report.apparatusSection
              .map(
                (a) =>
                  `<tr><td>${escapeHtml(a.name)}</td><td>${escapeHtml(a.specification)}</td><td>${escapeHtml(a.quantity)}</td><td>${escapeHtml(a.purpose)}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </section>
    `);
  }

  if (has("chemicals")) {
    sections.push(`
      <section>
        <h2>Chemicals &amp; Materials</h2>
        <table>
          <thead><tr><th>Substance</th><th>Formula / Description</th><th>Amount</th><th>Hazards</th></tr></thead>
          <tbody>
            ${report.chemicalsSection
              .map(
                (c) =>
                  `<tr><td>${escapeHtml(c.name)}</td><td>${escapeHtml(c.formulaOrDescription)}</td><td>${escapeHtml(c.amount)}</td><td>${escapeHtml(c.hazards)}</td></tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </section>
    `);
  }

  if (has("safety")) {
    sections.push(`
      <section>
        <h2>Safety Precautions</h2>
        <p><strong>Risk level:</strong> ${escapeHtml(report.safetySection.riskClassification)} — ${escapeHtml(report.safetySection.riskRationale)}</p>
        <ul>${report.safetySection.hazards.map((h) => `<li>${escapeHtml(h)}</li>`).join("")}</ul>
      </section>
    `);
  }

  if (has("procedure")) {
    sections.push(`
      <section>
        <h2>Procedure</h2>
        <p>${escapeHtml(report.procedureSection.overview)}</p>
        <ol>
          ${report.procedureSection.steps
            .map(
              (s) =>
                `<li><strong>${escapeHtml(s.title)}:</strong> ${escapeHtml(s.instructions)}</li>`,
            )
            .join("")}
        </ol>
      </section>
    `);
  }

  if (has("observations")) {
    sections.push(`
      <section>
        <h2>Observations</h2>
        ${
          report.observationsSection.records.length === 0
            ? `<p class="missing">${escapeHtml(report.observationsSection.emptyNotice ?? "No observations recorded.")}</p>`
            : `<table>
                <thead><tr><th>#</th><th>Title &amp; Notes</th><th>Value &amp; Unit</th><th>Apparatus</th><th>Provenance</th></tr></thead>
                <tbody>
                  ${report.observationsSection.records
                    .map((obs) => {
                      const val =
                        obs.value !== null
                          ? `${obs.precisionDecimals !== undefined ? obs.value.toFixed(obs.precisionDecimals) : obs.value} ${obs.unit ?? ""}`
                          : "Qualitative";
                      return `<tr>
                        <td>${obs.sequence}</td>
                        <td><strong>${escapeHtml(obs.title)}</strong>${obs.description ? `<br/>${escapeHtml(obs.description)}` : ""}${obs.notes ? `<br/><em>Note: ${escapeHtml(obs.notes)}</em>` : ""}</td>
                        <td>${escapeHtml(val)}</td>
                        <td>${escapeHtml(obs.apparatusLabel ?? "—")}</td>
                        <td><span class="prov-badge">${escapeHtml(PROVENANCE_LABELS[obs.provenance])}</span></td>
                      </tr>`;
                    })
                    .join("")}
                </tbody>
              </table>`
        }
      </section>
    `);
  }

  if (has("data_tables")) {
    sections.push(`
      <section>
        <h2>Experimental Data Tables</h2>
        ${report.dataTablesSection.tables
          .map((tbl) => {
            if (tbl.rows.length === 0) {
              return `<h3>${escapeHtml(tbl.title)}</h3><p class="missing">MISSING DATA: 0 rows recorded in this table.</p>`;
            }
            return `
              <h3>${escapeHtml(tbl.title)}</h3>
              <table>
                <thead>
                  <tr>
                    ${tbl.columns.map((c) => `<th>${escapeHtml(c.unit ? `${c.label} (${c.unit})` : c.label)}</th>`).join("")}
                    <th>Provenance</th>
                  </tr>
                </thead>
                <tbody>
                  ${tbl.rows
                    .map(
                      (r) => `<tr>
                      ${tbl.columns
                        .map((c) => {
                          const cell = r.cells[c.id];
                          if (!cell || (cell.numericValue === null && cell.raw.trim() === "")) {
                            return `<td class="missing">—</td>`;
                          }
                          const formatted =
                            c.kind === "numeric" && cell.numericValue !== null
                              ? cell.numericValue.toFixed(c.precisionDecimals)
                              : cell.raw;
                          return `<td>${escapeHtml(formatted)}</td>`;
                        })
                        .join("")}
                      <td>${escapeHtml(PROVENANCE_LABELS[r.provenance])}</td>
                    </tr>`,
                    )
                    .join("")}
                </tbody>
              </table>`;
          })
          .join("")}
      </section>
    `);
  }

  if (has("calculations")) {
    sections.push(`
      <section>
        <h2>Calculations</h2>
        ${
          report.calculationsSection.sessionCalculations.length === 0
            ? `<p class="muted">No engine calculations were executed and saved in this session.</p>`
            : report.calculationsSection.sessionCalculations
                .map(
                  (calc) => `
              <div class="calc-card">
                <h3>${escapeHtml(calc.title)} <small>(${escapeHtml(calc.provenance.modelId)} v${escapeHtml(calc.provenance.modelVersion)})</small></h3>
                <p><strong>Formula:</strong> <code>${escapeHtml(calc.formula)}</code></p>
                <p><strong>Inputs:</strong> ${escapeHtml(calc.inputs.map((i) => `${i.symbol} = ${i.value} ${i.unit}`).join("; "))}</p>
                <ul>${calc.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
                <p><strong>Result:</strong> ${escapeHtml(calc.result.label)} = <code>${escapeHtml(calc.result.formattedValue)} ${escapeHtml(calc.result.unit)}</code></p>
              </div>`,
                )
                .join("")
        }
      </section>
    `);
  }

  if (has("results")) {
    sections.push(`
      <section>
        <h2>Results Summary</h2>
        ${
          report.resultsSection.summaryItems.length === 0
            ? `<p class="missing">${escapeHtml(report.resultsSection.emptyNotice ?? "No numerical results recorded.")}</p>`
            : `<table>
                <thead><tr><th>Quantity</th><th>Value &amp; Unit</th><th>Provenance</th></tr></thead>
                <tbody>
                  ${report.resultsSection.summaryItems
                    .map(
                      (r) =>
                        `<tr><td>${escapeHtml(r.label)}</td><td><code>${escapeHtml(r.valueWithUnit)}</code></td><td>${escapeHtml(PROVENANCE_LABELS[r.provenance])}${r.modelNote ? ` (${escapeHtml(r.modelNote)})` : ""}</td></tr>`,
                    )
                    .join("")}
                </tbody>
              </table>`
        }
      </section>
    `);
  }

  if (has("graphs")) {
    sections.push(`
      <section>
        <h2>Graphs &amp; Charts</h2>
        ${
          report.graphsSection.charts.length === 0
            ? `<p class="muted">${escapeHtml(report.graphsSection.emptyNotice ?? "No plottable series.")}</p>`
            : report.graphsSection.charts.map(renderChartSvgHtml).join("")
        }
      </section>
    `);
  }

  if (has("discussion")) {
    sections.push(`
      <section>
        <h2>Discussion</h2>
        ${
          report.discussionSection.text
            ? `<p>${escapeHtml(report.discussionSection.text)}</p>`
            : `<p class="missing">${escapeHtml(report.discussionSection.missingNotice ?? "Not entered.")}</p>`
        }
      </section>
    `);
  }

  if (has("conclusion")) {
    sections.push(`
      <section>
        <h2>Conclusion</h2>
        ${
          report.conclusionSection.text
            ? `<p>${escapeHtml(report.conclusionSection.text)}</p>`
            : `<p class="missing">${escapeHtml(report.conclusionSection.missingNotice ?? "Not entered.")}</p>`
        }
      </section>
    `);
  }

  if (has("sources_of_error")) {
    sections.push(`
      <section>
        <h2>Sources of Error &amp; Model Limitations</h2>
        ${
          report.sourcesOfErrorSection.studentErrorAnalysis
            ? `<p><strong>Student analysis:</strong> ${escapeHtml(report.sourcesOfErrorSection.studentErrorAnalysis)}</p>`
            : ""
        }
        <ul>
          ${report.sourcesOfErrorSection.experimentErrorSources.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}
          ${report.sourcesOfErrorSection.modelLimitations.map((m) => `<li><em>Model limitation:</em> ${escapeHtml(m)}</li>`).join("")}
        </ul>
      </section>
    `);
  }

  if (has("references")) {
    sections.push(`
      <section>
        <h2>References</h2>
        <ul>${report.referencesSection.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
      </section>
    `);
  }

  // Mandatory Disclosure
  const pc = report.disclosureSection.provenanceCounts;
  sections.push(`
    <section>
      <h2>Simulation &amp; Measurement Disclosure</h2>
      <div class="callout teal">
        <p>${escapeHtml(report.disclosureSection.statement)}</p>
        <p class="muted">${escapeHtml(report.disclosureSection.scientificReviewNotice)}</p>
      </div>
      <table>
        <thead><tr><th>Provenance Category</th><th>Recorded Entries</th></tr></thead>
        <tbody>
          <tr><td>${escapeHtml(PROVENANCE_LABELS.user_entered)}</td><td>${pc.user_entered}</td></tr>
          <tr><td>${escapeHtml(PROVENANCE_LABELS.engine_calculated)}</td><td>${pc.engine_calculated}</td></tr>
          <tr><td>${escapeHtml(PROVENANCE_LABELS.simulation_generated)}</td><td>${pc.simulation_generated}</td></tr>
          <tr><td>${escapeHtml(PROVENANCE_LABELS.reference_expected)}</td><td>${pc.reference_expected}</td></tr>
          <tr><td>${escapeHtml(PROVENANCE_LABELS.imported_external)}</td><td>${pc.imported_external}</td></tr>
        </tbody>
      </table>
    </section>
  `);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(report.titleSection.experimentTitle)} — Practical Report</title>
  <style>
    :root { color-scheme: light; }
    body {
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      color: #142c2e;
      background: #ffffff;
      line-height: 1.55;
      max-width: 860px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
    header { border-bottom: 2px solid #15686a; padding-bottom: 1rem; margin-bottom: 1.5rem; }
    .eyebrow { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.78rem; color: #15686a; font-weight: 700; margin: 0; }
    h1 { margin: 0.35rem 0; font-size: 1.75rem; }
    h2 { color: #15686a; font-size: 1.18rem; border-bottom: 1px solid #d5e1df; padding-bottom: 0.3rem; margin-top: 1.6rem; page-break-after: avoid; }
    h3 { font-size: 1rem; margin-bottom: 0.4rem; }
    table { width: 100%; border-collapse: collapse; margin: 0.75rem 0 1.1rem; font-size: 0.9rem; }
    th, td { border: 1px solid #cbd7d5; padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }
    th { background: #edf4f3; color: #0f3a3c; font-weight: 600; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 0.88em; background: #f3f7f6; padding: 0.1rem 0.3rem; border-radius: 3px; }
    .callout { border-left: 4px solid #15686a; padding: 0.8rem 1rem; margin: 1rem 0; border-radius: 4px; page-break-inside: avoid; }
    .callout.teal { background: #eef7f6; border-color: #15686a; }
    .callout.amber { background: #fdf6e7; border-color: #9e6a14; }
    .missing { color: #8c3d19; font-style: italic; }
    .muted { color: #4c6466; font-size: 0.88rem; }
    .calc-card, .chart-card { border: 1px solid #d5e1df; padding: 0.85rem 1rem; border-radius: 6px; margin-bottom: 1rem; page-break-inside: avoid; }
    @media print {
      body { padding: 0; max-width: none; }
      section { break-inside: avoid-page; }
      tr { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <header>
    <p class="eyebrow">Virtual Chemistry Lab · Practical Notebook Report</p>
    <h1>${escapeHtml(report.titleSection.experimentTitle)}</h1>
    <p class="muted">Session: ${escapeHtml(report.titleSection.sessionTitle)} · Generated ${escapeHtml(report.generatedAt)}</p>
  </header>
  ${sections.join("\n")}
</body>
</html>`;
}

/**
 * Export all session observations, tabular data rows and calculation results into
 * a spreadsheet-safe CSV dataset preserving explicit units and provenance.
 */
export function exportSessionCsv(session: NotebookSession): string {
  const lines: string[] = [];

  lines.push(
    [
      "record_type",
      "section_or_table",
      "sequence_or_row",
      "field_label",
      "value",
      "unit",
      "provenance",
      "apparatus_or_model",
      "recorded_at",
      "notes",
    ]
      .map(escapeCsvCell)
      .join(","),
  );

  for (const obs of session.observations) {
    lines.push(
      [
        "observation",
        "observations",
        obs.sequence,
        obs.title,
        obs.value !== null
          ? obs.precisionDecimals !== undefined
            ? obs.value.toFixed(obs.precisionDecimals)
            : obs.value
          : (obs.description ?? ""),
        obs.unit ?? "",
        obs.provenance,
        obs.apparatusLabel ?? obs.modelId ?? "",
        obs.timestamp,
        obs.notes ?? "",
      ]
        .map(escapeCsvCell)
        .join(","),
    );
  }

  for (const tbl of session.dataTables) {
    tbl.rows.forEach((row, rIdx) => {
      for (const col of tbl.columns) {
        const cell = row.cells[col.id];
        const cellVal =
          cell && cell.numericValue !== null
            ? cell.numericValue.toFixed(col.precisionDecimals)
            : (cell?.raw ?? "");
        lines.push(
          [
            "table_cell",
            tbl.title,
            rIdx + 1,
            col.label,
            cellVal,
            col.unit ?? "",
            row.provenance,
            row.modelId ?? "",
            session.updatedAt,
            "",
          ]
            .map(escapeCsvCell)
            .join(","),
        );
      }
    });
  }

  for (let i = 0; i < session.calculations.length; i++) {
    const calc = session.calculations[i]!;
    lines.push(
      [
        "calculation_result",
        calc.title,
        i + 1,
        calc.result.label,
        calc.result.formattedValue,
        calc.result.unit,
        "engine_calculated",
        `${calc.provenance.modelId}@${calc.provenance.modelVersion}`,
        calc.timestamp,
        calc.formula,
      ]
        .map(escapeCsvCell)
        .join(","),
    );
  }

  return lines.join("\r\n") + "\r\n";
}

function utf8ByteLength(input: string): number {
  let bytes = 0;
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code >= 0xd800 && code <= 0xdbff) {
      bytes += 4;
      i += 1;
    } else {
      bytes += 3;
    }
  }
  return bytes;
}

export function exportSessionJson(
  session: NotebookSession,
  exportedAt = new Date().toISOString(),
): string {
  const envelope = sessionExportEnvelopeSchema.parse({
    format: "virtual-chemistry-lab-notebook-session",
    schemaVersion: LEARNING_SCHEMA_VERSION,
    exportedAt,
    provenanceDisclosure:
      "Virtual Chemistry Lab notebook session export. Simulated and engine-calculated entries represent deterministic mathematical models, not physical instrument measurements.",
    session,
  });
  return JSON.stringify(envelope, null, 2);
}

export type SessionImportResult =
  | { readonly ok: true; readonly session: NotebookSession }
  | { readonly ok: false; readonly error: string };

/**
 * Safely parse, size-bound and schema-validate an imported JSON notebook session.
 */
export function importSessionJson(
  rawJson: string,
  options: {
    localProfileId: string;
    existingSessionIds?: ReadonlySet<string>;
    nowIso?: string;
  },
): SessionImportResult {
  const byteLength = utf8ByteLength(rawJson);
  if (byteLength > MAX_IMPORT_JSON_BYTES) {
    return {
      ok: false,
      error: `Import rejected: file size (${byteLength} bytes) exceeds 1 MiB safety limit.`,
    };
  }

  let parsedUnknown: unknown;
  try {
    parsedUnknown = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: "Import rejected: file is not valid JSON." };
  }

  const validated = sessionExportEnvelopeSchema.safeParse(parsedUnknown);
  if (!validated.success) {
    const firstIssue = validated.error.issues[0];
    return {
      ok: false,
      error: `Import rejected: session schema validation failed (${firstIssue ? `${firstIssue.path.join(".")}: ${firstIssue.message}` : "invalid contract"}).`,
    };
  }

  const incoming = validated.data.session;
  const now = options.nowIso ?? new Date().toISOString();
  const collides = options.existingSessionIds?.has(incoming.sessionId) ?? false;
  const finalSessionId = collides
    ? `${incoming.sessionId}-imp-${Math.random().toString(36).slice(2, 6)}`
    : incoming.sessionId;

  const sanitized: NotebookSession = {
    ...incoming,
    sessionId: finalSessionId,
    ownerScope: {
      kind: "local_device",
      localProfileId: options.localProfileId,
    },
    importedFromSessionId: incoming.sessionId,
    title: sanitizeUserText(incoming.title, 180) || "Imported Practical Session",
    updatedAt: now,
    userNotes: {
      hypothesisOrPlan: sanitizeUserText(incoming.userNotes.hypothesisOrPlan, 4000),
      discussion: sanitizeUserText(incoming.userNotes.discussion, 6000),
      conclusion: sanitizeUserText(incoming.userNotes.conclusion, 4000),
      errorAnalysis: sanitizeUserText(incoming.userNotes.errorAnalysis, 4000),
    },
  };

  return { ok: true, session: sanitized };
}

export function buildReportExportFilenames(session: NotebookSession): {
  readonly pdf: string;
  readonly html: string;
  readonly csv: string;
  readonly json: string;
} {
  const stem = `${session.experimentSlug}-${session.sessionId.slice(0, 14)}`;
  return {
    pdf: sanitizeExportFilename(`${stem}-report`, "pdf"),
    html: sanitizeExportFilename(`${stem}-report`, "html"),
    csv: sanitizeExportFilename(`${stem}-data`, "csv"),
    json: sanitizeExportFilename(`${stem}-session`, "json"),
  };
}
