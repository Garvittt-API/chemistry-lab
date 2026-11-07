import { DomainError } from "@virtual-chemistry-lab/simulation-core";
import { describe, expect, it } from "vitest";

import { DILUTION_ENGINE_ID, calculateDilution, requiredStockForTarget } from "./dilution.js";

describe("dilution adapter", () => {
  it("applies c1V1 = c2V2 correctly", () => {
    const { result, measurements } = calculateDilution({
      stockConcentration: 1.0,
      stockVolumeMl: 10,
      finalVolumeMl: 100,
    });
    // 1.0 * 10 / 100 = 0.10
    expect(result.finalConcentration).toBeCloseTo(0.1, 10);
    expect(result.dilutionFactor).toBeCloseTo(0.1, 10);
    expect(result.soluteAmountMol).toBeCloseTo(0.01, 10);

    // Measurement provenance is set.
    for (const m of measurements) {
      expect(m.source).toBe("model_calculated");
      expect(m.modelId).toBe(DILUTION_ENGINE_ID);
      expect(m.engineVersion).toBeDefined();
    }
  });

  it("rejects concentrating (V2 < V1)", () => {
    expect(() =>
      calculateDilution({
        stockConcentration: 0.1,
        stockVolumeMl: 50,
        finalVolumeMl: 10,
      }),
    ).toThrow(DomainError);
  });

  it("rejects negative/zero inputs", () => {
    expect(() =>
      calculateDilution({ stockConcentration: 0, stockVolumeMl: 10, finalVolumeMl: 100 }),
    ).toThrow();
  });

  it("computes required stock volume for a target", () => {
    const v1 = requiredStockForTarget(1.0, 100, 0.2);
    expect(v1).toBeCloseTo(20, 10);
  });
});
