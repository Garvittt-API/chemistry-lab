import { describe, expect, it } from "vitest";

import { getModel, listModels } from "./models.js";
import { SimulationError } from "./errors.js";

describe("model registry", () => {
  it("lists every implemented model with a semantic version", () => {
    const models = listModels();
    expect(models.length).toBeGreaterThanOrEqual(8);
    for (const model of models) {
      expect(model.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(model.implementationPath).toContain("packages/simulation-core/src/");
      expect(model.reportPath).toContain("docs/science/models/");
    }
  });

  it("has unique model identifiers", () => {
    const ids = listModels().map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never claims independent scientific review or production approval", () => {
    for (const model of listModels()) {
      expect(model.verification.independentScientificReview).toBe("pending_human_review");
      expect(model.verification.productionApproval).toBe("pending_human_review");
    }
  });

  it("claims reference-case verification only for implemented models", () => {
    for (const model of listModels()) {
      expect(model.verification.referenceCases).toBe("pass");
      expect(model.verification.unitTests).toBe("pass");
    }
  });

  it("every model documents assumptions and limitations", () => {
    for (const model of listModels()) {
      expect(model.assumptions.length).toBeGreaterThan(0);
      expect(model.limitations.length).toBeGreaterThan(0);
    }
  });

  it("throws UNKNOWN_MODEL for unregistered identifiers", () => {
    try {
      getModel("ideal-gas");
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(SimulationError);
      expect((error as SimulationError).code).toBe("UNKNOWN_MODEL");
    }
  });
});
