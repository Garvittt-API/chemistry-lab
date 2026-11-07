import { describe, expect, it } from "vitest";

import { molarMass, molarMassBreakdown, parseFormula } from "./molar-mass.js";
import { FormulaParseError, UnknownElementError } from "./errors.js";

describe("parseFormula — valid formulas", () => {
  it("parses single atoms", () => {
    expect(parseFormula("H").atoms).toEqual({ H: 1 });
    expect(parseFormula("Fe").atoms).toEqual({ Fe: 1 });
  });

  it("parses simple compounds", () => {
    expect(parseFormula("H2O").atoms).toEqual({ H: 2, O: 1 });
    expect(parseFormula("CO2").atoms).toEqual({ C: 1, O: 2 });
    expect(parseFormula("C6H12O6").atoms).toEqual({ C: 6, H: 12, O: 6 });
  });

  it("parses parentheses with multipliers", () => {
    expect(parseFormula("Ca(OH)2").atoms).toEqual({ Ca: 1, O: 2, H: 2 });
    expect(parseFormula("Al2(SO4)3").atoms).toEqual({ Al: 2, S: 3, O: 12 });
    expect(parseFormula("Mg(NO3)2").atoms).toEqual({ Mg: 1, N: 2, O: 6 });
  });

  it("parses nested square brackets (coordination compounds)", () => {
    expect(parseFormula("K4[Fe(CN)6]").atoms).toEqual({ K: 4, Fe: 1, C: 6, N: 6 });
  });

  it("parses nested round brackets to depth 2", () => {
    expect(parseFormula("Ca3(PO4)2").atoms).toEqual({ Ca: 3, P: 2, O: 8 });
  });

  it("parses hydrates with middle dot and ASCII dot separators", () => {
    expect(parseFormula("CuSO4·5H2O").atoms).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    expect(parseFormula("CuSO4.5H2O").atoms).toEqual({ Cu: 1, S: 1, O: 9, H: 10 });
    expect(parseFormula("Na2SO4·10H2O").atoms).toEqual({ Na: 2, S: 1, O: 14, H: 20 });
  });

  it("merges duplicate element occurrences", () => {
    expect(parseFormula("H2SO4").atoms).toEqual({ H: 2, S: 1, O: 4 });
  });

  it("handles braces as group brackets", () => {
    expect(parseFormula("{NH4}2SO4").atoms).toEqual({ N: 2, H: 8, S: 1, O: 4 });
  });
});

describe("parseFormula — invalid inputs", () => {
  it.each([
    ["", "empty"],
    ["   ", "whitespace-only"],
    ["h2O", "lower-case element start"],
    ["H2O!", "invalid character"],
    ["(H2O", "unclosed bracket"],
    ["H2O)", "stray closing bracket"],
    ["H0", "explicit zero count"],
    ["()", "empty group"],
  ] as Array<[string, string]>)("rejects %j (%s)", (input, _why) => {
    expect(() => parseFormula(input)).toThrow(FormulaParseError);
  });

  it("accepts well-formed formulas", () => {
    expect(() => parseFormula("Ca(OH)2")).not.toThrow();
  });

  it("rejects unknown elements with UnknownElementError", () => {
    expect(() => parseFormula("Xx2O")).toThrow(UnknownElementError);
    expect(() => parseFormula("H2Qq")).toThrow(UnknownElementError);
  });

  it("rejects stray hydrate separators", () => {
    expect(() => parseFormula("CuSO4·")).toThrow(FormulaParseError);
    expect(() => parseFormula("·5H2O")).toThrow(FormulaParseError);
  });

  it("rejects mismatched brackets", () => {
    expect(() => parseFormula("(H2O]")).toThrow(FormulaParseError);
    expect(() => parseFormula("[Fe(CN)6)")).toThrow(FormulaParseError);
  });

  it("rejects excessively deep nesting", () => {
    const deep = `${"(".repeat(20)}H${")".repeat(20)}`;
    expect(() => parseFormula(deep)).toThrow(FormulaParseError);
  });

  it("rejects non-string inputs", () => {
    expect(() => parseFormula(42 as unknown)).toThrow(FormulaParseError);
    expect(() => parseFormula(null as unknown)).toThrow(FormulaParseError);
  });
});

describe("molarMass", () => {
  it("computes H2O = 18.015 g/mol", () => {
    expect(molarMass("H2O")).toBeCloseTo(18.015, 9);
  });

  it("computes NaCl = 58.44 g/mol", () => {
    expect(molarMass("NaCl")).toBeCloseTo(58.44, 9);
  });

  it("computes H2SO4 = 98.072 g/mol", () => {
    expect(molarMass("H2SO4")).toBeCloseTo(98.072, 9);
  });

  it("computes glucose C6H12O6 = 180.156 g/mol", () => {
    expect(molarMass("C6H12O6")).toBeCloseTo(180.156, 9);
  });

  it("computes nested-bracket potassium ferrocyanide", () => {
    expect(molarMass("K4[Fe(CN)6]")).toBeCloseTo(368.345, 9);
  });

  it("computes hydrates", () => {
    expect(molarMass("CuSO4·5H2O")).toBeCloseTo(249.677, 6);
    expect(molarMass("Na2SO4·10H2O")).toBeCloseTo(322.186, 6);
  });

  it("breakdown sums to the total", () => {
    const { molarMass: total, breakdown } = molarMassBreakdown("Ca(OH)2");
    const sum = breakdown.reduce((acc, entry) => acc + entry.massContribution, 0);
    expect(sum).toBeCloseTo(total, 12);
    expect(breakdown).toHaveLength(3);
  });

  it("reports per-element contributions for teaching", () => {
    const { breakdown } = molarMassBreakdown("H2O");
    const oxygen = breakdown.find((entry) => entry.symbol === "O")!;
    expect(oxygen.count).toBe(1);
    expect(oxygen.massContribution).toBeCloseTo(15.999, 9);
  });
});
