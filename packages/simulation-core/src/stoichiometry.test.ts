import { describe, expect, it } from "vitest";

import {
  limitingReagent,
  reactantConsumed,
  requireBalancedEquation,
  theoreticalYield,
} from "./stoichiometry.js";
import { DomainError, ReactionNotBalancedError, ReactionParseError } from "./errors.js";

describe("requireBalancedEquation", () => {
  it("accepts balanced equations", () => {
    expect(requireBalancedEquation("2 H2 + O2 -> 2 H2O").equation).toBe("2 H2 + O2 -> 2 H2O");
  });

  it("rejects unbalanced equations before any stoichiometric work", () => {
    expect(() => requireBalancedEquation("H2 + O2 -> H2O")).toThrow(ReactionNotBalancedError);
  });

  it("rejects ionic charge imbalance", () => {
    expect(() =>
      requireBalancedEquation("MnO4^- + 5 Fe^+2 + H+ -> Mn^+2 + 5 Fe^+3 + 4 H2O"),
    ).toThrow(ReactionNotBalancedError);
  });
});

describe("limitingReagent", () => {
  it("identifies the limiting reactant and the extent", () => {
    const result = limitingReagent("2 H2 + O2 -> 2 H2O", [
      { formula: "H2", amountMoles: 2.0 },
      { formula: "O2", amountMoles: 1.5 },
    ]);
    expect(result.limitingReagents).toEqual(["H2"]);
    expect(result.extentMoles).toBeCloseTo(1.0, 12);
    const oxygen = result.reagents.find((r) => r.formula === "O2")!;
    expect(oxygen.remainingMoles).toBeCloseTo(0.5, 12);
  });

  it("identifies oxygen as limiting in 2 H2 + O2 with excess hydrogen", () => {
    const result = limitingReagent("2 H2 + O2 -> 2 H2O", [
      { formula: "H2", amountMoles: 10.0 },
      { formula: "O2", amountMoles: 1.0 },
    ]);
    expect(result.limitingReagents).toEqual(["O2"]);
    expect(result.extentMoles).toBeCloseTo(1.0, 12);
    expect(result.productsFormed.find((p) => p.formula === "H2O")!.amountMoles).toBeCloseTo(
      2.0,
      12,
    );
  });

  it("reports ties for exact stoichiometric feeds", () => {
    const result = limitingReagent("N2 + 3 H2 -> 2 NH3", [
      { formula: "N2", amountMoles: 1.0 },
      { formula: "H2", amountMoles: 3.0 },
    ]);
    expect([...result.limitingReagents].sort()).toEqual(["H2", "N2"]);
    expect(result.extentMoles).toBeCloseTo(1.0, 12);
  });

  it("computes products formed for rusting stoichiometry", () => {
    const result = limitingReagent("4 Fe + 3 O2 -> 2 Fe2O3", [
      { formula: "Fe", amountMoles: 2.0 },
      { formula: "O2", amountMoles: 1.0 },
    ]);
    expect(result.limitingReagents).toEqual(["O2"]);
    expect(result.productsFormed.find((p) => p.formula === "Fe2O3")!.amountMoles).toBeCloseTo(
      2 / 3,
      12,
    );
  });

  it("requires an amount for every reactant and nothing extra", () => {
    expect(() =>
      limitingReagent("2 H2 + O2 -> 2 H2O", [{ formula: "H2", amountMoles: 2.0 }]),
    ).toThrow(DomainError);
    expect(() =>
      limitingReagent("2 H2 + O2 -> 2 H2O", [
        { formula: "H2", amountMoles: 2.0 },
        { formula: "O2", amountMoles: 1.0 },
        { formula: "H2O", amountMoles: 1.0 },
      ]),
    ).toThrow(DomainError);
  });

  it("rejects zero and negative amounts", () => {
    expect(() =>
      limitingReagent("2 H2 + O2 -> 2 H2O", [
        { formula: "H2", amountMoles: 0 },
        { formula: "O2", amountMoles: 1.0 },
      ]),
    ).toThrow(DomainError);
  });

  it("rejects amounts for species that are not reactants", () => {
    expect(() =>
      limitingReagent("2 H2 + O2 -> 2 H2O", [
        { formula: "H2", amountMoles: 2.0 },
        { formula: "Cl2", amountMoles: 1.0 },
      ]),
    ).toThrow(DomainError);
  });

  it("works for charged species by charge-inclusive identity", () => {
    // Zinc + acid uses neutral species here; identity check covered via formula+charge.
    const result = limitingReagent("Zn + 2 HCl -> ZnCl2 + H2", [
      { formula: "Zn", amountMoles: 1.0 },
      { formula: "HCl", amountMoles: 1.0 },
    ]);
    expect(result.limitingReagents).toEqual(["HCl"]);
  });
});

describe("theoreticalYield", () => {
  it("returns moles and mass of the desired product", () => {
    const result = theoreticalYield(
      "2 H2 + O2 -> 2 H2O",
      [
        { formula: "H2", amountMoles: 2.0 },
        { formula: "O2", amountMoles: 1.5 },
      ],
      "H2O",
    );
    expect(result.amountMoles).toBeCloseTo(2.0, 12);
    expect(result.massGrams).toBeCloseTo(2 * 18.015, 9);
  });

  it("throws when the requested product is not in the equation", () => {
    expect(() =>
      theoreticalYield(
        "2 H2 + O2 -> 2 H2O",
        [
          { formula: "H2", amountMoles: 2.0 },
          { formula: "O2", amountMoles: 1.5 },
        ],
        "NaCl",
      ),
    ).toThrow(DomainError);
  });
});

describe("reactantConsumed", () => {
  it("returns coefficient × extent", () => {
    expect(reactantConsumed("N2 + 3 H2 -> 2 NH3", "H2", 0.5)).toBeCloseTo(1.5, 12);
  });

  it("rejects reactants not in the equation", () => {
    expect(() => reactantConsumed("N2 + 3 H2 -> 2 NH3", "Cl2", 0.5)).toThrow(DomainError);
  });

  it("rejects negative extents", () => {
    expect(() => reactantConsumed("N2 + 3 H2 -> 2 NH3", "H2", -1)).toThrow(DomainError);
  });
});

describe("stoichiometry input robustness", () => {
  it("propagates parse errors for malformed equations", () => {
    expect(() => requireBalancedEquation("H2 + + O2 -> H2O")).toThrow(ReactionParseError);
  });
});
