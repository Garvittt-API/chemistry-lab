import { describe, expect, it } from "vitest";

import * as engine from "./index.js";

describe("public API surface", () => {
  it("exposes the engine identity", () => {
    expect(engine.ENGINE_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
    expect(engine.ENGINE_NAME).toBe("@virtual-chemistry-lab/simulation-core");
  });

  it("exposes the error taxonomy for programmatic handling", () => {
    expect(engine.SIMULATION_ERROR_CODES).toContain("DIMENSION_MISMATCH");
    expect(engine.SIMULATION_ERROR_CODES).toContain("REACTION_NOT_BALANCED");
    expect(engine.SIMULATION_ERROR_CODES).toContain("BALANCE_NOT_UNIQUE");
    expect(engine.SIMULATION_ERROR_CODES).toContain("UNKNOWN_UNIT");
    expect(engine.SIMULATION_ERROR_CODES).toContain("UNKNOWN_CONSTANT");
    expect(engine.SIMULATION_ERROR_CODES).toContain("UNKNOWN_MODEL");
  });

  it("exports the scientific surface without presentation dependencies", () => {
    // Spot-check the exported contract rather than the implementation.
    for (const fn of [
      "convert",
      "molarMass",
      "molesFromMass",
      "molarConcentration",
      "dilutionFinalConcentration",
      "percentYield",
      "parseReaction",
      "balanceReaction",
      "validateReaction",
      "analyzeReaction",
      "limitingReagent",
      "theoreticalYield",
      "phFromHydrogenConcentration",
      "strongAcidSolution",
      "weakAcidSolution",
      "listConstants",
      "listElements",
      "listUnits",
      "listModels",
    ] as const) {
      expect(typeof (engine as unknown as Record<string, unknown>)[fn]).toBe("function");
    }
  });

  it("does not export mutable internals (constants list is frozen)", () => {
    expect(Object.isFrozen(engine.listConstants())).toBe(true);
    expect(Object.isFrozen(engine.listUnits())).toBe(true);
    expect(Object.isFrozen(engine.listElements())).toBe(true);
    expect(Object.isFrozen(engine.listModels())).toBe(true);
  });
});
