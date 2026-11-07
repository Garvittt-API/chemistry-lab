import type { ReportChartSeries, ReportSectionId } from "./schemas.js";
import { PROVENANCE_LABELS, type PracticalReport } from "./report.js";

type PdfFontKey = "F1" | "F2" | "F3" | "F4";

const PAGE_WIDTH = 595.28; // A4 width in pt
const PAGE_HEIGHT = 841.89; // A4 height in pt
const MARGIN_X = 48;
const TOP_Y = 780;
const BOTTOM_Y = 58;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

const UNICODE_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/₀/g, "0"],
  [/₁/g, "1"],
  [/₂/g, "2"],
  [/₃/g, "3"],
  [/₄/g, "4"],
  [/₅/g, "5"],
  [/₆/g, "6"],
  [/₇/g, "7"],
  [/₈/g, "8"],
  [/₉/g, "9"],
  [/ₐ/g, "a"],
  [/ₑ/g, "e"],
  [/ᵢ/g, "i"],
  [/ᵣ/g, "r"],
  [/⁰/g, "^0"],
  [/¹/g, "\xb9"],
  [/²/g, "\xb2"],
  [/³/g, "\xb3"],
  [/⁴/g, "^4"],
  [/⁵/g, "^5"],
  [/⁶/g, "^6"],
  [/⁷/g, "^7"],
  [/⁸/g, "^8"],
  [/⁹/g, "^9"],
  [/⁺/g, "+"],
  [/⁻/g, "-"],
  [/→/g, "->"],
  [/⇌/g, "<=>"],
  [/≤/g, "<="],
  [/≥/g, ">="],
  [/≈/g, "~="],
  [/≠/g, "!="],
  [/√/g, "sqrt"],
  [/Δ/g, "Delta "],
  [/Σ/g, "Sum "],
  [/ν/g, "nu"],
  [/ξ/g, "xi"],
  [/α/g, "alpha"],
  [/γ/g, "gamma"],
  [/μ/g, "\xb5"],
  [/–/g, "-"],
  [/—/g, " - "],
  [/•/g, "\xb7"],
  [/[“”]/g, '"'],
  [/[‘’]/g, "'"],
];

const WIN_ANSI_HIGH_BYTES = new Set<number>([
  0xb0, // °
  0xb1, // ±
  0xb2, // ²
  0xb3, // ³
  0xb5, // µ
  0xb7, // ·
  0xb9, // ¹
  0xd7, // ×
  0xf7, // ÷
]);

/**
 * Normalize Unicode chemical formulas, subscripts, arrows and Greek symbols into
 * clean WinAnsi-compatible text so PDF standard fonts render every character legibly.
 */
export function normalizePdfText(input: string): string {
  let out = input.replace(/\r\n?/g, "\n");
  for (const [pattern, replacement] of UNICODE_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  let safe = "";
  for (let i = 0; i < out.length; i++) {
    const code = out.charCodeAt(i);
    if (code === 0x0a || code === 0x09 || (code >= 0x20 && code <= 0x7e)) {
      safe += code === 0x09 ? "  " : out[i]!;
    } else if (WIN_ANSI_HIGH_BYTES.has(code)) {
      safe += String.fromCharCode(code);
    } else if (code >= 0xc0 && code <= 0xff) {
      // Latin-1 accented characters supported in WinAnsiEncoding
      safe += String.fromCharCode(code);
    } else {
      safe += "?";
    }
  }
  return safe;
}

function encodePdfStringLiteral(normalizedSingleLine: string): string {
  let escaped = "";
  for (let i = 0; i < normalizedSingleLine.length; i++) {
    const code = normalizedSingleLine.charCodeAt(i);
    if (code === 0x5c) escaped += "\\\\";
    else if (code === 0x28) escaped += "\\(";
    else if (code === 0x29) escaped += "\\)";
    else if (code >= 0x20 && code <= 0x7e) escaped += normalizedSingleLine[i]!;
    else if (code >= 0x80 && code <= 0xff) {
      escaped += "\\" + code.toString(8).padStart(3, "0");
    }
  }
  return `(${escaped})`;
}

function estimateCharWidthFactor(font: PdfFontKey): number {
  switch (font) {
    case "F1":
      return 0.53;
    case "F2":
      return 0.57;
    case "F3":
      return 0.53;
    case "F4":
      return 0.6;
  }
}

function measureLineWidth(text: string, font: PdfFontKey, fontSize: number): number {
  return text.length * fontSize * estimateCharWidthFactor(font);
}

export function wrapPdfLines(
  rawText: string,
  font: PdfFontKey,
  fontSize: number,
  maxWidthPt: number,
): string[] {
  const normalized = normalizePdfText(rawText);
  const paragraphs = normalized.split("\n");
  const lines: string[] = [];
  const maxChars = Math.max(8, Math.floor(maxWidthPt / (fontSize * estimateCharWidthFactor(font))));

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (trimmed.length === 0) {
      lines.push("");
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = "";
    for (const word of words) {
      if (word.length > maxChars) {
        if (current.length > 0) {
          lines.push(current);
          current = "";
        }
        for (let offset = 0; offset < word.length; offset += maxChars) {
          lines.push(word.slice(offset, offset + maxChars));
        }
        continue;
      }
      const candidate = current.length === 0 ? word : `${current} ${word}`;
      if (measureLineWidth(candidate, font, fontSize) <= maxWidthPt) {
        current = candidate;
      } else {
        if (current.length > 0) lines.push(current);
        current = word;
      }
    }
    if (current.length > 0) lines.push(current);
  }
  return lines.length > 0 ? lines : [""];
}

function fmtPt(n: number): string {
  return Number(n.toFixed(2)).toString();
}

class PdfLayoutBuilder {
  private readonly pages: string[][] = [[]];
  private cursorY = TOP_Y;

  private get ops(): string[] {
    return this.pages[this.pages.length - 1]!;
  }

  newPage(): void {
    this.pages.push([]);
    this.cursorY = TOP_Y;
  }

  ensureSpace(requiredPt: number): void {
    if (this.cursorY - requiredPt < BOTTOM_Y) {
      this.newPage();
    }
  }

  addGap(pt: number): void {
    this.cursorY -= pt;
    if (this.cursorY < BOTTOM_Y) {
      this.newPage();
    }
  }

  drawTextLine(
    text: string,
    x: number,
    y: number,
    font: PdfFontKey,
    size: number,
    rgb: readonly [number, number, number] = [0.08, 0.17, 0.18],
  ): void {
    const lit = encodePdfStringLiteral(normalizePdfText(text));
    this.ops.push(
      `BT /${font} ${fmtPt(size)} Tf ${fmtPt(rgb[0])} ${fmtPt(rgb[1])} ${fmtPt(rgb[2])} rg ${fmtPt(x)} ${fmtPt(y)} Td ${lit} Tj ET`,
    );
  }

  drawParagraph(
    text: string,
    options?: {
      font?: PdfFontKey;
      size?: number;
      lineHeight?: number;
      indent?: number;
      rgb?: readonly [number, number, number];
      spaceAfter?: number;
    },
  ): void {
    const font = options?.font ?? "F1";
    const size = options?.size ?? 9.5;
    const lineHeight = options?.lineHeight ?? size + 4;
    const indent = options?.indent ?? 0;
    const rgb = options?.rgb ?? [0.1, 0.18, 0.19];
    const lines = wrapPdfLines(text, font, size, CONTENT_WIDTH - indent);

    for (const line of lines) {
      if (line.length === 0) {
        this.addGap(lineHeight * 0.5);
        continue;
      }
      this.ensureSpace(lineHeight);
      this.drawTextLine(line, MARGIN_X + indent, this.cursorY, font, size, rgb);
      this.cursorY -= lineHeight;
    }
    if (options?.spaceAfter) {
      this.addGap(options.spaceAfter);
    }
  }

  drawBulletList(items: ReadonlyArray<string>, font: PdfFontKey = "F1"): void {
    for (const item of items) {
      const lines = wrapPdfLines(item, font, 9.2, CONTENT_WIDTH - 16);
      for (let i = 0; i < lines.length; i++) {
        this.ensureSpace(13);
        if (i === 0) {
          this.drawTextLine("\xb7", MARGIN_X + 4, this.cursorY, "F2", 10, [0.08, 0.41, 0.42]);
        }
        this.drawTextLine(lines[i]!, MARGIN_X + 14, this.cursorY, font, 9.2);
        this.cursorY -= 13;
      }
    }
    this.addGap(4);
  }

  drawCalloutBox(heading: string, body: string, tone: "teal" | "amber" = "teal"): void {
    const bodyLines = wrapPdfLines(body, "F1", 9, CONTENT_WIDTH - 24);
    const boxHeight = 22 + bodyLines.length * 12.5 + 10;
    this.ensureSpace(boxHeight + 8);

    const top = this.cursorY + 8;
    const bottom = top - boxHeight;
    const bg = tone === "amber" ? [0.98, 0.95, 0.87] : [0.91, 0.96, 0.95];
    const border = tone === "amber" ? [0.62, 0.42, 0.08] : [0.08, 0.41, 0.42];

    this.ops.push(
      `q ${fmtPt(bg[0]!)} ${fmtPt(bg[1]!)} ${fmtPt(bg[2]!)} rg ${fmtPt(border[0]!)} ${fmtPt(border[1]!)} ${fmtPt(border[2]!)} RG 0.8 w ${fmtPt(MARGIN_X)} ${fmtPt(bottom)} ${fmtPt(CONTENT_WIDTH)} ${fmtPt(boxHeight)} re B Q`,
    );

    this.drawTextLine(
      heading,
      MARGIN_X + 12,
      top - 15,
      "F2",
      9.5,
      border as [number, number, number],
    );
    let lineY = top - 29;
    for (const line of bodyLines) {
      this.drawTextLine(line, MARGIN_X + 12, lineY, "F1", 9, [0.1, 0.18, 0.19]);
      lineY -= 12.5;
    }
    this.cursorY = bottom - 10;
  }

  drawSectionHeading(sectionNumber: number, title: string): void {
    this.ensureSpace(46);
    this.addGap(6);
    const label = `${sectionNumber}. ${title}`;
    this.drawTextLine(label, MARGIN_X, this.cursorY, "F2", 12, [0.08, 0.41, 0.42]);
    const ruleY = this.cursorY - 5;
    this.ops.push(
      `q 0.78 0.85 0.84 RG 0.7 w ${fmtPt(MARGIN_X)} ${fmtPt(ruleY)} m ${fmtPt(MARGIN_X + CONTENT_WIDTH)} ${fmtPt(ruleY)} l S Q`,
    );
    this.cursorY -= 18;
  }

  drawTable(
    headers: ReadonlyArray<string>,
    rows: ReadonlyArray<ReadonlyArray<string>>,
    weights?: ReadonlyArray<number>,
  ): void {
    const colCount = headers.length;
    if (colCount === 0) return;
    const rawWeights = weights && weights.length === colCount ? weights : headers.map(() => 1);
    const weightSum = rawWeights.reduce((a, b) => a + b, 0);
    const colWidths = rawWeights.map((w) => (w / weightSum) * CONTENT_WIDTH);

    const renderRow = (cells: ReadonlyArray<string>, isHeader: boolean) => {
      const font: PdfFontKey = isHeader ? "F2" : "F1";
      const fontSize = isHeader ? 8.6 : 8.5;
      const lineStep = 11.2;
      const wrappedCells = cells.map((cell, idx) =>
        wrapPdfLines(cell, font, fontSize, Math.max(24, (colWidths[idx] ?? 60) - 10)),
      );
      const maxLines = Math.max(1, ...wrappedCells.map((lines) => lines.length));
      const rowHeight = maxLines * lineStep + 8;

      if (!isHeader && this.cursorY - rowHeight < BOTTOM_Y) {
        this.newPage();
        renderRow(headers, true);
      }

      const rowTop = this.cursorY + 6;
      const rowBottom = rowTop - rowHeight;

      if (isHeader) {
        this.ops.push(
          `q 0.90 0.94 0.93 rg ${fmtPt(MARGIN_X)} ${fmtPt(rowBottom)} ${fmtPt(CONTENT_WIDTH)} ${fmtPt(rowHeight)} re f Q`,
        );
      }

      let x = MARGIN_X;
      for (let c = 0; c < colCount; c++) {
        const w = colWidths[c]!;
        this.ops.push(
          `q 0.76 0.82 0.81 RG 0.5 w ${fmtPt(x)} ${fmtPt(rowBottom)} ${fmtPt(w)} ${fmtPt(rowHeight)} re S Q`,
        );
        const cellLines = wrappedCells[c]!;
        for (let l = 0; l < cellLines.length; l++) {
          this.drawTextLine(
            cellLines[l]!,
            x + 5,
            rowTop - 11 - l * lineStep,
            font,
            fontSize,
            isHeader ? [0.06, 0.25, 0.26] : [0.1, 0.18, 0.19],
          );
        }
        x += w;
      }

      this.cursorY = rowBottom - 6;
    };

    this.ensureSpace(44);
    renderRow(headers, true);
    for (const row of rows) {
      renderRow(row, false);
    }
    this.addGap(6);
  }

  drawChart(chart: ReportChartSeries): void {
    const boxHeight = 175;
    this.ensureSpace(boxHeight + 36);

    this.drawParagraph(chart.title, { font: "F2", size: 9.8, spaceAfter: 4 });

    const frameTop = this.cursorY;
    const frameBottom = frameTop - boxHeight;
    const plotLeft = MARGIN_X + 54;
    const plotRight = MARGIN_X + CONTENT_WIDTH - 18;
    const plotBottom = frameBottom + 32;
    const plotTop = frameTop - 16;
    const plotW = plotRight - plotLeft;
    const plotH = plotTop - plotBottom;

    this.ops.push(
      `q 0.985 0.99 0.99 rg 0.78 0.84 0.83 RG 0.6 w ${fmtPt(MARGIN_X)} ${fmtPt(frameBottom)} ${fmtPt(CONTENT_WIDTH)} ${fmtPt(boxHeight)} re B Q`,
    );

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

    // Gridlines and Y ticks
    for (let step = 0; step <= 4; step++) {
      const frac = step / 4;
      const gy = plotBottom + frac * plotH;
      const valY = minY + frac * (maxY - minY);
      this.ops.push(
        `q 0.88 0.91 0.91 RG 0.4 w ${fmtPt(plotLeft)} ${fmtPt(gy)} m ${fmtPt(plotRight)} ${fmtPt(gy)} l S Q`,
      );
      this.drawTextLine(valY.toPrecision(3), MARGIN_X + 8, gy - 3, "F4", 7.2, [0.3, 0.4, 0.4]);
    }

    // X ticks
    for (let step = 0; step <= 4; step++) {
      const frac = step / 4;
      const gx = plotLeft + frac * plotW;
      const valX = minX + frac * (maxX - minX);
      this.drawTextLine(valX.toPrecision(3), gx - 10, plotBottom - 12, "F4", 7.2, [0.3, 0.4, 0.4]);
    }

    // Axes
    this.ops.push(
      `q 0.25 0.35 0.36 RG 0.9 w ${fmtPt(plotLeft)} ${fmtPt(plotTop)} m ${fmtPt(plotLeft)} ${fmtPt(plotBottom)} l ${fmtPt(plotRight)} ${fmtPt(plotBottom)} l S Q`,
    );

    // Axis labels
    this.drawTextLine(
      `${chart.xLabel} (${chart.xUnit})`,
      plotLeft + plotW * 0.32,
      frameBottom + 8,
      "F2",
      8,
      [0.15, 0.26, 0.27],
    );
    this.drawTextLine(
      `Y: ${chart.yLabel} (${chart.yUnit})`,
      plotLeft,
      plotTop + 4,
      "F2",
      8,
      [0.15, 0.26, 0.27],
    );

    const mapX = (x: number) => plotLeft + ((x - minX) / (maxX - minX)) * plotW;
    const mapY = (y: number) => plotBottom + ((y - minY) / (maxY - minY)) * plotH;

    // Polyline
    const lineOps: string[] = ["q 0.08 0.41 0.42 RG 1.4 w"];
    chart.points.forEach((pt, idx) => {
      const px = mapX(pt.x);
      const py = mapY(pt.y);
      lineOps.push(`${fmtPt(px)} ${fmtPt(py)} ${idx === 0 ? "m" : "l"}`);
    });
    lineOps.push("S Q");
    this.ops.push(lineOps.join(" "));

    // Point markers
    for (const pt of chart.points) {
      const px = mapX(pt.x);
      const py = mapY(pt.y);
      this.ops.push(`q 0.60 0.31 0.15 rg ${fmtPt(px - 2.2)} ${fmtPt(py - 2.2)} 4.4 4.4 re f Q`);
    }

    this.cursorY = frameBottom - 10;
    this.drawParagraph(chart.provenanceSummary, {
      font: "F3",
      size: 8.2,
      rgb: [0.32, 0.42, 0.43],
      spaceAfter: 6,
    });
  }

  finalizeStreams(headerText: string, sessionId: string): string[] {
    const total = this.pages.length;
    return this.pages.map((pageOps, idx) => {
      const chrome: string[] = [];
      // Running header
      chrome.push(
        `BT /F1 8 Tf 0.35 0.45 0.46 rg ${fmtPt(MARGIN_X)} 808 Td ${encodePdfStringLiteral(normalizePdfText(headerText))} Tj ET`,
      );
      chrome.push(
        `q 0.82 0.87 0.86 RG 0.5 w ${fmtPt(MARGIN_X)} 802 m ${fmtPt(MARGIN_X + CONTENT_WIDTH)} 802 l S Q`,
      );
      // Running footer
      chrome.push(
        `q 0.82 0.87 0.86 RG 0.5 w ${fmtPt(MARGIN_X)} 42 m ${fmtPt(MARGIN_X + CONTENT_WIDTH)} 42 l S Q`,
      );
      const leftFooter = `Session ${sessionId} | Simulated/model values are NOT physical measurements`;
      chrome.push(
        `BT /F3 7.8 Tf 0.35 0.45 0.46 rg ${fmtPt(MARGIN_X)} 30 Td ${encodePdfStringLiteral(normalizePdfText(leftFooter))} Tj ET`,
      );
      const pageLabel = `Page ${idx + 1} of ${total}`;
      const pageLabelX = MARGIN_X + CONTENT_WIDTH - measureLineWidth(pageLabel, "F2", 8.2);
      chrome.push(
        `BT /F2 8.2 Tf 0.20 0.30 0.31 rg ${fmtPt(pageLabelX)} 30 Td ${encodePdfStringLiteral(pageLabel)} Tj ET`,
      );
      return [...chrome, ...pageOps].join("\n");
    });
  }
}

/**
 * Generate a multi-page, paginated, print-friendly A4 PDF 1.4 document from a
 * validated `PracticalReport`.
 */
export function exportReportPdf(report: PracticalReport): Uint8Array {
  const layout = new PdfLayoutBuilder();
  const has = (id: ReportSectionId) => report.includedSections.includes(id);
  let secNum = 0;

  // Title banner
  layout.drawParagraph("VIRTUAL CHEMISTRY LAB — PRACTICAL RECORD & REPORT", {
    font: "F2",
    size: 8.5,
    rgb: [0.08, 0.41, 0.42],
    spaceAfter: 2,
  });
  layout.drawParagraph(report.titleSection.experimentTitle, {
    font: "F2",
    size: 17,
    lineHeight: 21,
    spaceAfter: 3,
  });
  layout.drawParagraph(`Session: ${report.titleSection.sessionTitle}`, {
    font: "F3",
    size: 10.5,
    rgb: [0.28, 0.38, 0.39],
    spaceAfter: 8,
  });

  if (report.completenessIssues.length > 0) {
    const summary = report.completenessIssues.map((i) => `- ${i.message}`).join("\n");
    layout.drawCalloutBox(
      `Report Completeness Audit (${report.completenessIssues.length} item${report.completenessIssues.length === 1 ? "" : "s"} noted)`,
      summary,
      "amber",
    );
  }

  if (has("identification")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Experiment Identification");
    layout.drawTable(
      ["Field", "Value"],
      [
        ["Experiment ID", report.identificationSection.experimentId],
        [
          "Experiment Version",
          `${report.identificationSection.experimentVersion} (schema ${report.identificationSection.experimentSchemaVersion})`,
        ],
        [
          "Discipline / Difficulty",
          `${report.identificationSection.disciplineId} / ${report.identificationSection.difficulty}`,
        ],
        [
          "Scientific Review Status",
          `${report.identificationSection.scientificReviewStatus} (${report.identificationSection.integrityLabel})`,
        ],
      ],
      [1, 2.2],
    );
  }

  if (has("session_info")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Date & Session Information");
    const cl = report.sessionInfoSection.preLabChecklist;
    layout.drawTable(
      ["Session Attribute", "Recorded State"],
      [
        ["Session ID", report.sessionInfoSection.sessionId],
        [
          "Status / Revision",
          `${report.sessionInfoSection.status} (revision ${report.sessionInfoSection.revision})`,
        ],
        ["Created (UTC)", report.sessionInfoSection.createdAt],
        ["Last Updated (UTC)", report.sessionInfoSection.updatedAt],
        [
          "Completed (UTC)",
          report.sessionInfoSection.completedAt ?? "In progress (not marked complete)",
        ],
        ["Report Generated (UTC)", report.generatedAt],
        [
          "Pre-Lab Checklist",
          `Objective: ${cl.objectiveReviewed ? "Yes" : "No"}, Apparatus: ${cl.apparatusReviewed ? "Yes" : "No"}, Safety: ${cl.safetyReviewed ? "Yes" : "No"}, Procedure: ${cl.procedureReviewed ? "Yes" : "No"}`,
        ],
      ],
      [1, 2.2],
    );
    if (report.sessionInfoSection.hypothesisOrPlan.length > 0) {
      layout.drawParagraph(`Plan / Hypothesis: ${report.sessionInfoSection.hypothesisOrPlan}`, {
        spaceAfter: 4,
      });
    }
  }

  if (has("objective")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Objective");
    layout.drawParagraph(report.objectiveSection.shortDescription, { spaceAfter: 4 });
    layout.drawBulletList(report.objectiveSection.learningObjectives);
  }

  if (has("theory")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Theory");
    layout.drawParagraph(report.theorySection.overview, { spaceAfter: 4 });
    if (report.theorySection.keyConcepts.length > 0) {
      layout.drawParagraph(`Key concepts: ${report.theorySection.keyConcepts.join(" | ")}`, {
        font: "F3",
        size: 9,
        spaceAfter: 4,
      });
    }
  }

  if (has("equations") && report.equationsSection.length > 0) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Chemical & Mathematical Equations");
    for (const eq of report.equationsSection) {
      layout.drawParagraph(eq.expression, { font: "F4", size: 9.5, spaceAfter: 2 });
      layout.drawParagraph(eq.description, { size: 9, spaceAfter: 4 });
    }
  }

  if (has("apparatus")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Apparatus Required");
    if (report.apparatusSection.length > 0) {
      layout.drawTable(
        ["Item", "Specification", "Qty", "Purpose"],
        report.apparatusSection.map((a) => [a.name, a.specification, a.quantity, a.purpose]),
        [1.3, 1.3, 0.5, 1.9],
      );
    } else {
      layout.drawParagraph("No apparatus items listed in experiment record.");
    }
  }

  if (has("chemicals")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Chemicals & Materials");
    if (report.chemicalsSection.length > 0) {
      layout.drawTable(
        ["Substance", "Formula / Description", "Amount", "Hazard Classes"],
        report.chemicalsSection.map((c) => [c.name, c.formulaOrDescription, c.amount, c.hazards]),
        [1.3, 1.3, 0.9, 1.5],
      );
    } else {
      layout.drawParagraph("No wet-chemical reagents required for this activity.");
    }
  }

  if (has("safety")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Safety Precautions");
    layout.drawParagraph(
      `Risk classification: ${report.safetySection.riskClassification} | Supervision: ${report.safetySection.supervision}`,
      { font: "F2", size: 9.2, spaceAfter: 3 },
    );
    layout.drawParagraph(report.safetySection.riskRationale, { spaceAfter: 4 });
    if (report.safetySection.hazards.length > 0) {
      layout.drawBulletList(report.safetySection.hazards);
    }
    if (report.safetySection.protectiveEquipment.length > 0) {
      layout.drawParagraph(
        `Protective equipment: ${report.safetySection.protectiveEquipment.join(", ")}`,
        { size: 9, spaceAfter: 4 },
      );
    }
  }

  if (has("procedure")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Procedure");
    layout.drawParagraph(report.procedureSection.overview, { spaceAfter: 4 });
    for (const step of report.procedureSection.steps) {
      layout.drawParagraph(`Step ${step.stepNumber} - ${step.title}: ${step.instructions}`, {
        size: 9.1,
        spaceAfter: 3,
      });
    }
  }

  if (has("observations")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Recorded Observations");
    if (report.observationsSection.records.length === 0) {
      layout.drawParagraph(report.observationsSection.emptyNotice ?? "No observations recorded.", {
        font: "F3",
        rgb: [0.55, 0.25, 0.1],
        spaceAfter: 6,
      });
    } else {
      layout.drawTable(
        ["#", "Title & Description", "Value & Unit", "Apparatus", "Data Provenance"],
        report.observationsSection.records.map((obs) => {
          const valStr =
            obs.value !== null
              ? `${obs.precisionDecimals !== undefined ? obs.value.toFixed(obs.precisionDecimals) : obs.value} ${obs.unit ?? ""}`
              : "Qualitative";
          const desc = [obs.title, obs.description, obs.notes ? `Note: ${obs.notes}` : ""]
            .filter((s) => s && s.length > 0)
            .join(" - ");
          const prov = `${PROVENANCE_LABELS[obs.provenance]}${obs.modelId ? ` [${obs.modelId}]` : ""}`;
          return [String(obs.sequence), desc, valStr, obs.apparatusLabel ?? "—", prov];
        }),
        [0.35, 2.0, 0.9, 0.9, 1.35],
      );
    }
  }

  if (has("data_tables")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Experimental Data Tables");
    if (report.dataTablesSection.tables.length === 0) {
      layout.drawParagraph("No experimental data tables configured for this session.");
    } else {
      for (const tbl of report.dataTablesSection.tables) {
        layout.drawParagraph(tbl.title, { font: "F2", size: 10, spaceAfter: 3 });
        if (tbl.rows.length === 0) {
          layout.drawParagraph("MISSING DATA: 0 rows recorded in this table.", {
            font: "F3",
            rgb: [0.55, 0.25, 0.1],
            spaceAfter: 5,
          });
        } else {
          const headers = [
            ...tbl.columns.map((c) => (c.unit ? `${c.label} (${c.unit})` : c.label)),
            "Provenance",
          ];
          const rows = tbl.rows.map((r) => [
            ...tbl.columns.map((c) => {
              const cell = r.cells[c.id];
              if (!cell || (cell.numericValue === null && cell.raw.trim() === "")) {
                return "— (missing)";
              }
              if (c.kind === "numeric" && cell.numericValue !== null) {
                return cell.numericValue.toFixed(c.precisionDecimals);
              }
              return cell.raw;
            }),
            PROVENANCE_LABELS[r.provenance],
          ]);
          layout.drawTable(headers, rows);
        }
      }
    }
  }

  if (has("calculations")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Calculations & Formulas");
    if (report.calculationsSection.sessionCalculations.length === 0) {
      layout.drawParagraph("No engine calculations were executed and saved in this session.", {
        font: "F3",
        spaceAfter: 4,
      });
    } else {
      for (const calc of report.calculationsSection.sessionCalculations) {
        layout.drawParagraph(
          `${calc.title} (${calc.provenance.modelId} v${calc.provenance.modelVersion})`,
          {
            font: "F2",
            size: 9.8,
            spaceAfter: 2,
          },
        );
        layout.drawParagraph(`Formula: ${calc.formula}`, { font: "F4", size: 9, spaceAfter: 2 });
        layout.drawParagraph(
          `Inputs: ${calc.inputs.map((i) => `${i.symbol} = ${i.value} ${i.unit}`).join("; ")}`,
          { size: 9, spaceAfter: 2 },
        );
        layout.drawBulletList(calc.steps);
        layout.drawParagraph(
          `Result: ${calc.result.label} = ${calc.result.formattedValue} ${calc.result.unit} (${calc.precisionConvention})`,
          { font: "F2", size: 9.2, spaceAfter: 5 },
        );
      }
    }
  }

  if (has("results")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Results Summary");
    if (report.resultsSection.summaryItems.length === 0) {
      layout.drawParagraph(report.resultsSection.emptyNotice ?? "No numerical results recorded.", {
        font: "F3",
        rgb: [0.55, 0.25, 0.1],
        spaceAfter: 4,
      });
    } else {
      layout.drawTable(
        ["Quantity / Output", "Value & Unit", "Provenance & Model"],
        report.resultsSection.summaryItems.map((item) => [
          item.label,
          item.valueWithUnit,
          `${PROVENANCE_LABELS[item.provenance]}${item.modelNote ? ` (${item.modelNote})` : ""}`,
        ]),
        [1.6, 1.0, 1.8],
      );
    }
  }

  if (has("graphs")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Graphs & Charts");
    if (report.graphsSection.charts.length === 0) {
      layout.drawParagraph(
        report.graphsSection.emptyNotice ?? "No plottable numerical series recorded.",
        { font: "F3", spaceAfter: 4 },
      );
    } else {
      for (const chart of report.graphsSection.charts) {
        layout.drawChart(chart);
      }
    }
  }

  if (has("discussion")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Discussion");
    if (report.discussionSection.text) {
      layout.drawParagraph(report.discussionSection.text, { spaceAfter: 4 });
    } else {
      layout.drawParagraph(report.discussionSection.missingNotice ?? "Discussion not entered.", {
        font: "F3",
        rgb: [0.55, 0.25, 0.1],
        spaceAfter: 4,
      });
    }
  }

  if (has("conclusion")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Conclusion");
    if (report.conclusionSection.text) {
      layout.drawParagraph(report.conclusionSection.text, { spaceAfter: 4 });
    } else {
      layout.drawParagraph(report.conclusionSection.missingNotice ?? "Conclusion not entered.", {
        font: "F3",
        rgb: [0.55, 0.25, 0.1],
        spaceAfter: 4,
      });
    }
  }

  if (has("sources_of_error")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "Sources of Error & Model Limitations");
    if (report.sourcesOfErrorSection.studentErrorAnalysis) {
      layout.drawParagraph(
        `Student error analysis: ${report.sourcesOfErrorSection.studentErrorAnalysis}`,
        { spaceAfter: 4 },
      );
    }
    if (report.sourcesOfErrorSection.experimentErrorSources.length > 0) {
      layout.drawParagraph("Documented experimental error sources:", {
        font: "F2",
        size: 9.2,
        spaceAfter: 2,
      });
      layout.drawBulletList(report.sourcesOfErrorSection.experimentErrorSources);
    }
    if (report.sourcesOfErrorSection.modelLimitations.length > 0) {
      layout.drawParagraph("Scientific engine model limitations & assumptions:", {
        font: "F2",
        size: 9.2,
        spaceAfter: 2,
      });
      layout.drawBulletList(report.sourcesOfErrorSection.modelLimitations);
    }
  }

  if (has("references")) {
    secNum += 1;
    layout.drawSectionHeading(secNum, "References");
    layout.drawBulletList(report.referencesSection);
  }

  // Mandatory Section: Simulation & Measurement Disclosure
  secNum += 1;
  layout.drawSectionHeading(secNum, "Simulation & Measurement Disclosure");
  layout.drawCalloutBox(
    "Mandatory Data Provenance & Simulation Integrity Statement",
    `${report.disclosureSection.statement}\n\n${report.disclosureSection.scientificReviewNotice}`,
    "teal",
  );
  const pc = report.disclosureSection.provenanceCounts;
  layout.drawTable(
    ["Provenance Category", "Recorded Entry Count"],
    [
      [PROVENANCE_LABELS.user_entered, String(pc.user_entered)],
      [PROVENANCE_LABELS.engine_calculated, String(pc.engine_calculated)],
      [PROVENANCE_LABELS.simulation_generated, String(pc.simulation_generated)],
      [PROVENANCE_LABELS.reference_expected, String(pc.reference_expected)],
      [PROVENANCE_LABELS.imported_external, String(pc.imported_external)],
    ],
    [2.5, 0.8],
  );

  const pageStreams = layout.finalizeStreams(
    `Virtual Chemistry Lab | Practical Report | ${report.identificationSection.experimentId}`,
    report.sessionInfoSection.sessionId,
  );

  return assemblePdf14Document(pageStreams, report.titleSection.experimentTitle);
}

function assemblePdf14Document(
  pageStreams: ReadonlyArray<string>,
  documentTitle: string,
): Uint8Array {
  const objects: string[] = [];
  // Obj 1: Catalog
  // Obj 2: Pages
  // Obj 3..6: Fonts F1, F2, F3, F4
  // Obj 7: Info
  // For each page i: Page obj (8 + 2*i), Content stream obj (9 + 2*i)
  const pageObjectIds: number[] = [];
  for (let i = 0; i < pageStreams.length; i++) {
    pageObjectIds.push(8 + i * 2);
  }

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push(
    `2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageStreams.length} >>\nendobj\n`,
  );
  objects.push(
    "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n",
  );
  objects.push(
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n",
  );
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>\nendobj\n",
  );
  objects.push(
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>\nendobj\n",
  );
  objects.push(
    `7 0 obj\n<< /Title ${encodePdfStringLiteral(normalizePdfText(documentTitle))} /Producer (Virtual Chemistry Lab learning-core PDF 1.4) >>\nendobj\n`,
  );

  for (let i = 0; i < pageStreams.length; i++) {
    const pageObjId = 8 + i * 2;
    const streamObjId = 9 + i * 2;
    const streamBody = pageStreams[i]!;
    objects.push(
      `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fmtPt(PAGE_WIDTH)} ${fmtPt(PAGE_HEIGHT)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> /Contents ${streamObjId} 0 R >>\nendobj\n`,
    );
    objects.push(
      `${streamObjId} 0 obj\n<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream\nendobj\n`,
    );
  }

  let pdfText = "%PDF-1.4\n";
  const offsets: number[] = [0]; // object 0 free entry
  for (const obj of objects) {
    offsets.push(pdfText.length);
    pdfText += obj;
  }

  const xrefStart = pdfText.length;
  pdfText += `xref\n0 ${offsets.length}\n`;
  pdfText += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i++) {
    pdfText += `${String(offsets[i]!).padStart(10, "0")} 00000 n \n`;
  }
  pdfText += `trailer\n<< /Size ${offsets.length} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  const bytes = new Uint8Array(pdfText.length);
  for (let i = 0; i < pdfText.length; i++) {
    bytes[i] = pdfText.charCodeAt(i) & 0xff;
  }
  return bytes;
}

export interface PdfVerificationSummary {
  readonly valid: boolean;
  readonly pageCount: number;
  readonly objectCount: number;
  readonly extractedText: string;
  readonly errors: ReadonlyArray<string>;
}

/**
 * Programmatically verify structure, xref byte offsets, page tree and text streams
 * of a generated PDF 1.4 byte buffer.
 */
export function verifyGeneratedPdf(bytes: Uint8Array): PdfVerificationSummary {
  const errors: string[] = [];
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += 8192) {
    const slice = bytes.subarray(i, i + 8192);
    chunks.push(String.fromCharCode(...slice));
  }
  const raw = chunks.join("");

  if (!raw.startsWith("%PDF-1.4\n")) {
    errors.push("Missing %PDF-1.4 header.");
  }
  if (!raw.endsWith("%%EOF\n")) {
    errors.push("Missing trailing %%EOF marker.");
  }

  const startxrefMatch = /startxref\n(\d+)\n%%EOF\n$/.exec(raw);
  let objectCount = 0;
  if (!startxrefMatch) {
    errors.push("Could not locate startxref byte offset.");
  } else {
    const xrefOffset = Number.parseInt(startxrefMatch[1]!, 10);
    const xrefSlice = raw.slice(xrefOffset);
    if (!xrefSlice.startsWith("xref\n")) {
      errors.push(`startxref offset ${xrefOffset} does not point to xref table.`);
    } else {
      const lines = xrefSlice.split("\n");
      const headerMatch = /^0 (\d+)$/.exec(lines[1] ?? "");
      if (!headerMatch) {
        errors.push("Invalid xref subsection header.");
      } else {
        objectCount = Number.parseInt(headerMatch[1]!, 10) - 1;
        for (let objNum = 1; objNum <= objectCount; objNum++) {
          const entryLine = lines[2 + objNum] ?? "";
          const entryMatch = /^(\d{10}) 00000 n $/.exec(entryLine);
          if (!entryMatch) {
            errors.push(`Malformed xref entry for object ${objNum}.`);
            continue;
          }
          const offset = Number.parseInt(entryMatch[1]!, 10);
          const expectedPrefix = `${objNum} 0 obj\n`;
          if (raw.slice(offset, offset + expectedPrefix.length) !== expectedPrefix) {
            errors.push(`xref offset ${offset} does not match "${objNum} 0 obj".`);
          }
        }
      }
    }
  }

  const pagesCountMatch = /\/Type \/Pages \/Kids \[[^\]]+\] \/Count (\d+)/.exec(raw);
  const declaredPageCount = pagesCountMatch ? Number.parseInt(pagesCountMatch[1]!, 10) : 0;
  const actualPageObjects = (raw.match(/\/Type \/Page \/Parent/g) ?? []).length;
  if (declaredPageCount < 1 || declaredPageCount !== actualPageObjects) {
    errors.push(
      `Page tree count (${declaredPageCount}) does not match page objects (${actualPageObjects}).`,
    );
  }

  // Decode literal (...) Tj strings including octal escapes
  const textFragments: string[] = [];
  const tjRegex = /\((?:\\.|[^\\()])*\)\s*Tj/g;
  let match: RegExpExecArray | null = null;
  while ((match = tjRegex.exec(raw)) !== null) {
    const literal = match[0].replace(/\)\s*Tj$/, "").slice(1);
    const decoded = literal
      .replace(/\\([0-7]{3})/g, (_, oct: string) => String.fromCharCode(Number.parseInt(oct, 8)))
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\");
    textFragments.push(decoded);
  }

  return {
    valid: errors.length === 0,
    pageCount: actualPageObjects,
    objectCount,
    extractedText: textFragments.join("\n"),
    errors,
  };
}
