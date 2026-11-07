/**
 * Reference-case verification: runs every entry in the reference registry
 * through the public model API and compares against the recorded expected
 * value within the recorded tolerance.
 *
 * These tests establish SOFTWARE BEHAVIOR against published references —
 * they are not, and must never be presented as, independent scientific
 * validation (see SCIENTIFIC_VALIDATION_LOG.md).
 */

import { describe, expect, it } from "vitest";

import { REFERENCE_CASES, evaluateReferenceCase, type ReferenceCase } from "./reference-cases.js";
import { listModels } from "./models.js";

const MODEL_IDS = new Set(listModels().map((model) => model.id));

function compare(referenceCase: ReferenceCase, actual: number): boolean {
  const { expected, tolerance, toleranceKind } = referenceCase;
  const difference = Math.abs(actual - expected);
  if (toleranceKind === "absolute") {
    return difference <= tolerance;
  }
  return difference <= Math.max(tolerance * Math.max(Math.abs(actual), Math.abs(expected)), 1e-12);
}

describe("reference-case registry integrity", () => {
  it("has unique identifiers", () => {
    const ids = REFERENCE_CASES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("references only registered models with matching versions", () => {
    const versions = new Map(listModels().map((m) => [m.id, m.version]));
    for (const referenceCase of REFERENCE_CASES) {
      expect(MODEL_IDS).toContain(referenceCase.modelId);
      expect(referenceCase.modelVersion).toBe(versions.get(referenceCase.modelId));
    }
  });

  it("every registered model has at least one reference case", () => {
    const covered = new Set(REFERENCE_CASES.map((c) => c.modelId));
    for (const modelId of MODEL_IDS) {
      expect(covered).toContain(modelId);
    }
  });

  it("every case carries a source, a unit and a positive-or-zero tolerance", () => {
    for (const referenceCase of REFERENCE_CASES) {
      expect(referenceCase.source.length).toBeGreaterThan(10);
      expect(referenceCase.expectedUnit.length).toBeGreaterThan(0);
      expect(referenceCase.tolerance).toBeGreaterThanOrEqual(0);
    }
  });
});

describe.each(REFERENCE_CASES.map((c) => [c.id, c] as const))(
  "reference case %s",
  (_id, referenceCase) => {
    it(`${referenceCase.description}`, () => {
      const actual = evaluateReferenceCase(referenceCase);
      expect(
        compare(referenceCase, actual),
        `expected ${referenceCase.expected} ${referenceCase.expectedUnit} ` +
          `(±${referenceCase.tolerance} ${referenceCase.toleranceKind}), got ${actual}`,
      ).toBe(true);
    });
  },
);
