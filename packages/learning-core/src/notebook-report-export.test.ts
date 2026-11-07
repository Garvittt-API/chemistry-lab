import {
  catalog as experimentCatalog,
  getExperimentById,
} from "@virtual-chemistry-lab/experiment-library";
import { describe, expect, it } from "vitest";

import {
  addCalculationToSession,
  addObservationToSession,
  buildPracticalReport,
  buildReportExportFilenames,
  completeNotebookSession,
  CORRUPTED_LEARNING_BACKUP_KEY,
  createNotebookSession,
  DEFAULT_LEARNING_STORAGE_KEY,
  duplicateNotebookSession,
  exportReportHtml,
  exportReportPdf,
  exportSessionCsv,
  exportSessionJson,
  importSessionJson,
  MemoryStorageAdapter,
  migratePhase05SessionToNotebookSession,
  NotebookStoreRepository,
  parseTableCellInput,
  recordLabRunInSession,
  renameNotebookSession,
  resetNotebookSession,
  runDilutionCalculation,
  sanitizeExportFilename,
  updateSessionChecklist,
  updateSessionUserNotes,
  upsertSessionDataTable,
  verifyGeneratedPdf,
} from "./index.js";

describe("practical notebook lifecycle, provenance & migration", () => {
  it("supports session CRUD, rename, duplicate, reset and strict provenance tracking", () => {
    const storage = new MemoryStorageAdapter();
    const repo = new NotebookStoreRepository(storage);
    const { snapshot } = repo.load();
    const dilutionExp = getExperimentById(experimentCatalog, "solution-dilution")!;

    let session = createNotebookSession({
      experiment: dilutionExp,
      localProfileId: snapshot.localProfileId,
      title: "Dilution Practical #1",
      now: "2026-11-07T11:00:00.000Z",
    });

    session = addObservationToSession(session, {
      title: "Pipette transfer",
      description: "Transferred 25.00 mL stock CuSO4(aq).",
      value: 25.0,
      unit: "mL",
      precisionDecimals: 2,
      apparatusLabel: "25 mL Volumetric Pipette",
      provenance: "user_entered",
    });
    session = addObservationToSession(session, {
      title: "Expected final concentration",
      value: 0.1,
      unit: "mol/L",
      precisionDecimals: 4,
      provenance: "reference_expected",
    });
    session = recordLabRunInSession(session, {
      engineName: "@virtual-chemistry-lab/simulation-core",
      engineVersion: "0.1.0",
      modelId: "chemical-quantity",
      modelVersion: "1.0.0",
      inputs: [
        { label: "Stock c1", value: 1.0, unit: "mol/L" },
        { label: "Aliquot V1", value: 25, unit: "mL" },
      ],
      measurements: [
        {
          id: "m-1",
          stepIndex: 2,
          measurementId: "final-concentration",
          label: "Final concentration",
          value: 0.1,
          unit: "mol/L",
          source: "illustrative",
          modelId: "chemical-quantity",
          engineVersion: "0.1.0",
        },
      ],
      qualitativeNotes: [],
      assumptions: ["Additive volumes"],
      limitations: ["Neglects partial molar volume contraction"],
      completedStepCount: 3,
      totalStepCount: 4,
    });

    expect(session.observations[0]?.provenance).toBe("user_entered");
    expect(session.observations[1]?.provenance).toBe("reference_expected");
    expect(session.observations[2]?.provenance).toBe("simulation_generated");

    session = renameNotebookSession(session, "Dilution Run A (Verified)");
    expect(session.title).toBe("Dilution Run A (Verified)");

    const duplicated = duplicateNotebookSession(session);
    expect(duplicated.sessionId).not.toBe(session.sessionId);
    expect(duplicated.title).toContain("(Copy)");
    expect(duplicated.status).toBe("in_progress");

    const reset = resetNotebookSession(session);
    expect(reset.observations.length).toBe(0);
    expect(reset.simulationRuns.length).toBe(0);
    expect(reset.status).toBe("draft");

    repo.upsertSession(session);
    repo.upsertSession(duplicated);
    expect(repo.load().snapshot.sessions.length).toBe(2);

    repo.deleteSession(duplicated.sessionId);
    expect(repo.load().snapshot.sessions.length).toBe(1);
  });

  it("validates table cell precision and numeric bounds without silent coercion", () => {
    const phExp = getExperimentById(experimentCatalog, "ph-and-indicators")!;
    const session = createNotebookSession({
      experiment: phExp,
      localProfileId: "profile-1",
    });
    const phTable = session.dataTables[0]!;
    const phCol = phTable.columns.find((c) => c.id === "ph-val")!;

    expect(parseTableCellInput(phCol, "not-a-number").ok).toBe(false);
    expect(parseTableCellInput(phCol, "25").ok).toBe(false); // max is 16
    const valid = parseTableCellInput(phCol, "4.76");
    expect(valid.ok).toBe(true);
    if (valid.ok) {
      expect(valid.cell.numericValue).toBeCloseTo(4.76, 4);
    }
  });

  it("migrates Phase 05 ExperimentSession records cleanly", () => {
    const dilutionExp = getExperimentById(experimentCatalog, "solution-dilution")!;
    const migrated = migratePhase05SessionToNotebookSession(
      {
        sessionId: "sess-legacy-1",
        experimentId: "solution-dilution",
        experimentVersion: "1.0.1",
        engineName: "@virtual-chemistry-lab/simulation-core",
        engineVersion: "0.1.0",
        startedAt: "2026-11-06T08:00:00.000Z",
        status: "running",
        inputs: { stockMolarity: 0.5 },
        measurements: [
          {
            id: "m-leg-1",
            stepIndex: 1,
            measurementId: "diluted-concentration",
            source: "model_calculated",
            label: "Diluted concentration",
            value: 0.05,
            unit: "mol/L",
            modelId: "chemical-quantity",
            engineVersion: "0.1.0",
          },
        ],
        observations: [],
      },
      dilutionExp,
      "profile-local-1",
    );

    expect(migrated.observations.length).toBe(1);
    expect(migrated.observations[0]?.provenance).toBe("engine_calculated");
    expect(migrated.observations[0]?.value).toBeCloseTo(0.05, 5);
  });

  it("recovers safely from corrupted storage payloads while preserving a backup", () => {
    const storage = new MemoryStorageAdapter();
    storage.setItem(DEFAULT_LEARNING_STORAGE_KEY, "{broken-json-payload");
    const repo = new NotebookStoreRepository(storage);

    const recovered = repo.load();
    expect(recovered.recoveredFromCorruption).toBe(true);
    expect(recovered.snapshot.sessions.length).toBe(0);
    expect(storage.getItem(CORRUPTED_LEARNING_BACKUP_KEY)).toBe("{broken-json-payload");
  });
});

describe("practical report integrity, multi-page PDF verification & export security", () => {
  it("never fabricates missing observations, results or conclusions on an empty session", () => {
    const exp = getExperimentById(experimentCatalog, "acid-base-titration")!;
    const emptySession = createNotebookSession({
      experiment: exp,
      localProfileId: "profile-1",
    });

    // Attempt to omit mandatory simulation_disclosure — report builder must enforce it!
    const report = buildPracticalReport(emptySession, exp, {
      includedSections: ["title", "observations", "results", "conclusion"],
    });

    expect(report.includedSections).toContain("simulation_disclosure");
    expect(report.isComplete).toBe(false);
    expect(report.observationsSection.records.length).toBe(0);
    expect(report.observationsSection.emptyNotice).toContain("MISSING INFORMATION");
    expect(report.resultsSection.summaryItems.length).toBe(0);
    expect(report.conclusionSection.text).toBeNull();
    expect(report.conclusionSection.missingNotice).toContain("never fabricated");
  });

  it("generates a valid, multi-page PDF 1.4 with verified xref offsets, tables, charts and disclosure", () => {
    const exp = getExperimentById(experimentCatalog, "solution-dilution")!;
    let session = createNotebookSession({
      experiment: exp,
      localProfileId: "profile-1",
      title: "Serial Dilution of CuSO4·5H2O",
      now: "2026-11-07T12:00:00.000Z",
    });

    session = updateSessionChecklist(session, {
      objectiveReviewed: true,
      apparatusReviewed: true,
      safetyReviewed: true,
      procedureReviewed: true,
    });

    session = addObservationToSession(session, {
      title: "Stock meniscus alignment",
      description: "Aligned 25.00 mL pipette at eye level (20 °C ± 0.5 °C).",
      value: 25.0,
      unit: "mL",
      precisionDecimals: 2,
      apparatusLabel: "Class A Pipette",
      provenance: "user_entered",
    });

    const dilCalc = runDilutionCalculation({
      solveFor: "final_concentration",
      stockConcentrationMolL: 1.0,
      stockVolume: 25,
      finalVolume: 250,
      volumeUnit: "mL",
    });
    session = addCalculationToSession(session, dilCalc);

    // Add 3 serial dilution rows to trigger XY chart generation in report + PDF
    const baseTable = session.dataTables[0]!;
    session = upsertSessionDataTable(session, {
      ...baseTable,
      rows: [
        {
          id: "row-1",
          sequence: 1,
          provenance: "simulation_generated",
          modelId: "chemical-quantity",
          cells: {
            "stock-conc": { raw: "1.000", numericValue: 1.0 },
            "aliquot-vol": { raw: "25.0", numericValue: 25 },
            "final-vol": { raw: "100.0", numericValue: 100 },
            "final-conc": { raw: "0.2500", numericValue: 0.25 },
          },
        },
        {
          id: "row-2",
          sequence: 2,
          provenance: "simulation_generated",
          modelId: "chemical-quantity",
          cells: {
            "stock-conc": { raw: "1.000", numericValue: 1.0 },
            "aliquot-vol": { raw: "25.0", numericValue: 25 },
            "final-vol": { raw: "250.0", numericValue: 250 },
            "final-conc": { raw: "0.1000", numericValue: 0.1 },
          },
        },
        {
          id: "row-3",
          sequence: 3,
          provenance: "simulation_generated",
          modelId: "chemical-quantity",
          cells: {
            "stock-conc": { raw: "1.000", numericValue: 1.0 },
            "aliquot-vol": { raw: "25.0", numericValue: 25 },
            "final-vol": { raw: "500.0", numericValue: 500 },
            "final-conc": { raw: "0.0500", numericValue: 0.05 },
          },
        },
      ],
    });

    session = updateSessionUserNotes(session, {
      hypothesisOrPlan: "Final molarity scales inversely with final flask volume V2.",
      discussion:
        "Recorded simulation outputs follow C1V1 = C2V2 under ideal additive volume assumptions.",
      conclusion:
        "Diluting 25.00 mL of 1.000 mol/L stock to 250.0 mL yielded a modelled concentration of 0.1000 mol/L.",
      errorAnalysis:
        "In a physical laboratory, parallax error and thermal expansion away from 20 °C would affect pipette delivery.",
    });
    session = completeNotebookSession(session, "2026-11-07T12:30:00.000Z");

    const report = buildPracticalReport(session, exp, undefined, "2026-11-07T12:31:00.000Z");
    expect(report.isComplete).toBe(true);
    expect(report.graphsSection.charts.length).toBe(1);

    const pdfBytes = exportReportPdf(report);
    expect(pdfBytes.byteLength).toBeGreaterThan(2000);

    const verification = verifyGeneratedPdf(pdfBytes);
    expect(verification.errors).toEqual([]);
    expect(verification.valid).toBe(true);
    expect(verification.pageCount).toBeGreaterThanOrEqual(2);
    expect(verification.extractedText).toContain("Page 1 of");
    expect(verification.extractedText).toContain(
      `Page ${verification.pageCount} of ${verification.pageCount}`,
    );
    expect(verification.extractedText).toContain("Simulation & Measurement Disclosure");
    expect(verification.extractedText).toContain("0.1000 mol/L");
    expect(verification.extractedText).not.toContain("???");
  });

  it("escapes HTML XSS payloads, neutralizes CSV formula injection, and validates JSON imports", () => {
    const exp = getExperimentById(experimentCatalog, "ph-and-indicators")!;
    let session = createNotebookSession({
      experiment: exp,
      localProfileId: "profile-sec",
      title: '<script>alert("xss")</script>',
    });
    session = addObservationToSession(session, {
      title: "=CMD|' /C calc'!A0",
      description: '<img src=x onerror="alert(1)">',
      provenance: "user_entered",
    });

    const report = buildPracticalReport(session, exp);
    const html = exportReportHtml(report);
    expect(html).not.toContain('<script>alert("xss")</script>');
    expect(html).toContain("&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;");
    expect(html).not.toContain('<img src=x onerror="alert(1)">');

    const csv = exportSessionCsv(session);
    expect(csv).toContain("'=CMD|' /C calc'!A0");

    const exportedJson = exportSessionJson(session);
    const reimported = importSessionJson(exportedJson, {
      localProfileId: "profile-2",
      existingSessionIds: new Set([session.sessionId]),
    });
    expect(reimported.ok).toBe(true);
    if (reimported.ok) {
      expect(reimported.session.sessionId).not.toBe(session.sessionId);
    }

    const malformed = importSessionJson('{"format":"wrong"}', {
      localProfileId: "profile-2",
    });
    expect(malformed.ok).toBe(false);

    const oversized = importSessionJson("x".repeat(1024 * 1024 + 50), {
      localProfileId: "profile-2",
    });
    expect(oversized.ok).toBe(false);

    expect(sanitizeExportFilename("../../../etc/passwd", "pdf")).toBe("etc-passwd.pdf");
    const names = buildReportExportFilenames(session);
    expect(names.pdf.endsWith(".pdf")).toBe(true);
    expect(names.csv.endsWith(".csv")).toBe(true);
  });
});
