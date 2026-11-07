import { describe, expect, it } from "vitest";

import { PH_ENGINE_ID, SUPPORTED_ELECTROLYTES, calculatePh } from "./ph-exploration.js";

describe("pH exploration adapter", () => {
  it("computes pH for 0.01 M HCl ≈ 2", () => {
    const { result, measurements } = calculatePh({
      electrolyteId: "hcl-strong",
      concentration: 0.01,
    });
    expect(result.ph).toBeCloseTo(2, 2);
    expect(measurements.find((m) => m.measurementId === "ph-reading")?.value).toBeCloseTo(2, 2);
  });

  it("computes pH for 0.01 M NaOH ≈ 12", () => {
    const { result } = calculatePh({
      electrolyteId: "naoh-strong",
      concentration: 0.01,
    });
    expect(result.ph).toBeCloseTo(12, 2);
  });

  it("weak acid 0.1 M acetic has pH ~2.87", () => {
    const acetic = SUPPORTED_ELECTROLYTES.find((e) => e.id === "acetic-weak")!;
    const { result } = calculatePh({
      electrolyteId: acetic.id,
      concentration: 0.1,
    });
    // Exact root for Ka=1.8e-5, C=0.1 gives [H+] ≈ 1.33e-3 ⇒ pH ≈ 2.876
    expect(result.ph).toBeGreaterThan(2.7);
    expect(result.ph).toBeLessThan(3.0);
    expect(result.degreeOfDissociation).toBeGreaterThan(0);
    expect(result.approximationValidAt5Percent).toBe(true); // α ≈ 1.3% < 5%
  });

  it("weak base 0.1 M ammonia has pH ~11.13", () => {
    const { result } = calculatePh({
      electrolyteId: "ammonia-weak",
      concentration: 0.1,
    });
    expect(result.ph).toBeGreaterThan(10.9);
    expect(result.ph).toBeLessThan(11.3);
  });

  it("labels measurements with model provenance", () => {
    const { measurements } = calculatePh({
      electrolyteId: "hcl-strong",
      concentration: 0.01,
    });
    for (const m of measurements) {
      expect(m.source).toBe("model_calculated");
      expect(m.modelId).toBe(PH_ENGINE_ID);
    }
  });

  it("pure water (0 concentration strong acid) yields pH 7", () => {
    const { result } = calculatePh({
      electrolyteId: "hcl-strong",
      concentration: 0,
    });
    expect(result.ph).toBeCloseTo(7, 3);
  });

  it("rejects unknown electrolytes", () => {
    expect(() => calculatePh({ electrolyteId: "not-real", concentration: 0.1 })).toThrow(
      /Unknown electrolyte/,
    );
  });
});
