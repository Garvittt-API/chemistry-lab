import { describe, expect, it } from "vitest";

import {
  assertBalanced,
  balanceReaction,
  formatSpecies,
  parseReaction,
  parseSpecies,
  requireBalancedReaction,
  validateReaction,
} from "./reaction.js";
import { BalanceNotUniqueError, ReactionNotBalancedError, ReactionParseError } from "./errors.js";

describe("parseSpecies", () => {
  it("parses neutral formulas", () => {
    const water = parseSpecies("H2O");
    expect(water.charge).toBe(0);
    expect(water.atoms).toEqual({ H: 2, O: 1 });
  });

  it("parses unit charges attached without digits before the sign", () => {
    expect(parseSpecies("Na+").charge).toBe(1);
    expect(parseSpecies("Cl-").charge).toBe(-1);
    expect(parseSpecies("OH-").charge).toBe(-1);
    expect(parseSpecies("H+").charge).toBe(1);
    expect(parseSpecies("NH4^+").charge).toBe(1);
    expect(parseSpecies("NH4^+").atoms).toEqual({ N: 1, H: 4 });
    expect(parseSpecies("NO3^-").charge).toBe(-1);
    expect(parseSpecies("NO3^-").atoms).toEqual({ N: 1, O: 3 });
  });

  it("parses explicit magnitude charges (sign-then-digits)", () => {
    expect(parseSpecies("SO4-2").charge).toBe(-2);
    expect(parseSpecies("CO3-2").charge).toBe(-2);
    expect(parseSpecies("PO4-3").charge).toBe(-3);
    expect(parseSpecies("Fe+3").charge).toBe(3);
    expect(parseSpecies("Cr2O7-2").charge).toBe(-2);
    expect(parseSpecies("Cr2O7-2").atoms).toEqual({ Cr: 2, O: 7 });
  });

  it("parses the caret notation unambiguously", () => {
    expect(parseSpecies("SO4^2-").charge).toBe(-2);
    expect(parseSpecies("Fe^3+").charge).toBe(3);
    expect(parseSpecies("NH4^+").charge).toBe(1);
    expect(parseSpecies("Fe^+").charge).toBe(1);
    expect(parseSpecies("O2^-").charge).toBe(-1);
    expect(parseSpecies("MnO4^-").charge).toBe(-1);
  });

  it("rejects ALL digits-before-sign input as ambiguous — no exceptions, ever", () => {
    for (const ambiguous of ["Fe3+", "SO42-", "NH4+", "NO3-", "MnO4-", "HCO3-"]) {
      expect(() => parseSpecies(ambiguous)).toThrow(ReactionParseError);
      expect(() => parseSpecies(ambiguous)).toThrow(/ambiguous/);
    }
  });

  it("accepts H3O+ (sign directly after a letter = unit charge, digits are subscripts)", () => {
    expect(parseSpecies("H3O+").charge).toBe(1);
    expect(parseSpecies("H3O+").atoms).toEqual({ H: 3, O: 1 });
  });

  it("rejects multiple caret markers", () => {
    expect(() => parseSpecies("SO4^2^-")).toThrow(ReactionParseError);
  });

  it("rejects empty and nonsensical species", () => {
    expect(() => parseSpecies("")).toThrow(ReactionParseError);
    expect(() => parseSpecies("^2-")).toThrow(ReactionParseError);
    expect(() => parseSpecies("+")).toThrow(ReactionParseError);
  });
});

describe("parseReaction", () => {
  it("parses a simple equation with implicit coefficients", () => {
    const parsed = parseReaction("H2 + O2 -> H2O");
    expect(parsed.reactants).toHaveLength(2);
    expect(parsed.products).toHaveLength(1);
    expect(parsed.reactants[0]!.coefficient).toBe(1);
    expect(parsed.equation).toBe("H2 + O2 -> H2O");
  });

  it("parses explicit integer coefficients", () => {
    const parsed = parseReaction("2 H2 + O2 -> 2 H2O");
    expect(parsed.reactants[0]!.coefficient).toBe(2);
    expect(parsed.equation).toBe("2 H2 + O2 -> 2 H2O");
  });

  it("accepts the Unicode arrow", () => {
    const parsed = parseReaction("H2 + O2 → H2O");
    expect(parsed.reactants).toHaveLength(2);
  });

  it("parses charged species", () => {
    const parsed = parseReaction("MnO4^- + Fe^+2 + H+ -> Mn^+2 + Fe^+3 + H2O");
    expect(parsed.reactants).toHaveLength(3);
    expect(parsed.products).toHaveLength(3);
  });

  it("rejects missing separator", () => {
    expect(() => parseReaction("H2 + O2")).toThrow(ReactionParseError);
  });

  it("rejects multiple separators", () => {
    expect(() => parseReaction("H2 -> O2 -> H2O")).toThrow(ReactionParseError);
  });

  it("rejects empty sides and stray plus signs", () => {
    expect(() => parseReaction("-> H2O")).toThrow(ReactionParseError);
    expect(() => parseReaction("H2 + -> H2O")).toThrow(ReactionParseError);
    expect(() => parseReaction("H2 ++ O2 -> H2O")).toThrow(ReactionParseError);
  });

  it("rejects zero or negative coefficients", () => {
    expect(() => parseReaction("0 H2 + O2 -> H2O")).toThrow(ReactionParseError);
    expect(() => parseReaction("-2 H2 + O2 -> H2O")).toThrow(ReactionParseError);
  });

  it("rejects absurdly large coefficients", () => {
    expect(() => parseReaction("99999999 H2 + O2 -> H2O")).toThrow(ReactionParseError);
  });
});

describe("analyzeReaction / validateReaction", () => {
  it("detects a balanced neutral equation", () => {
    const analysis = validateReaction("2 H2 + O2 -> 2 H2O");
    expect(analysis.atomBalanced).toBe(true);
    expect(analysis.chargeBalanced).toBe(true);
    expect(analysis.balanced).toBe(true);
    expect(analysis.unbalancedElements).toEqual([]);
  });

  it("detects an unbalanced equation and names the elements", () => {
    const analysis = validateReaction("H2 + O2 -> H2O");
    expect(analysis.balanced).toBe(false);
    expect(analysis.unbalancedElements).toEqual(["O"]);
  });

  it("detects charge imbalance in ionic equations", () => {
    // Missing H+: atoms balance? Left: Mn 1, O 4, Fe 1; Right: Mn 1, Fe 1, O 4 — O needs H2O too.
    const analysis = validateReaction("MnO4^- + Fe^+2 -> Mn^+2 + Fe^+3 + H2O");
    expect(analysis.chargeBalanced).toBe(false);
    expect(analysis.balanced).toBe(false);
  });

  it("accepts the fully balanced permanganate–iron reaction", () => {
    const analysis = validateReaction("MnO4^- + 5 Fe^2+ + 8 H^+ -> Mn^2+ + 5 Fe^3+ + 4 H2O");
    expect(analysis.atomBalanced).toBe(true);
    expect(analysis.chargeBalanced).toBe(true);
    expect(analysis.balanced).toBe(true);
    expect(analysis.reactantCharge).toBe(17);
    expect(analysis.productCharge).toBe(17);
  });

  it("assertBalanced throws ReactionNotBalancedError with details", () => {
    expect(() => assertBalanced(parseReaction("H2 + O2 -> H2O"))).toThrow(ReactionNotBalancedError);
    expect(() => requireBalancedReaction("H2 -> H2O")).toThrow(ReactionNotBalancedError);
  });
});

describe("balanceReaction — exact rational balancing", () => {
  it("balances the water equation", () => {
    expect(balanceReaction("H2 + O2 -> H2O").equation).toBe("2 H2 + O2 -> 2 H2O");
  });

  it("balances iron(III) oxide formation", () => {
    expect(balanceReaction("Fe + O2 -> Fe2O3").equation).toBe("4 Fe + 3 O2 -> 2 Fe2O3");
  });

  it("balances aluminium combustion", () => {
    expect(balanceReaction("Al + O2 -> Al2O3").equation).toBe("4 Al + 3 O2 -> 2 Al2O3");
  });

  it("balances methane combustion", () => {
    expect(balanceReaction("CH4 + O2 -> CO2 + H2O").equation).toBe("CH4 + 2 O2 -> CO2 + 2 H2O");
  });

  it("balances photosynthesis (C6H12O6)", () => {
    expect(balanceReaction("CO2 + H2O -> C6H12O6 + O2").equation).toBe(
      "6 CO2 + 6 H2O -> C6H12O6 + 6 O2",
    );
  });

  it("balances ionic redox with the charge row active", () => {
    expect(balanceReaction("MnO4^- + Fe^+2 + H+ -> Mn^+2 + Fe^+3 + H2O").equation).toBe(
      "MnO4^- + 5 Fe^2+ + 8 H^+ -> Mn^2+ + 5 Fe^3+ + 4 H2O",
    );
  });

  it("balances permanganate in acidic solution with sulfite", () => {
    expect(balanceReaction("MnO4^- + SO3^-2 + H+ -> Mn^+2 + SO4^-2 + H2O").equation).toBe(
      "2 MnO4^- + 5 SO3^2- + 6 H^+ -> 2 Mn^2+ + 5 SO4^2- + 3 H2O",
    );
  });

  it("balances the chlorate–water disproportionation", () => {
    expect(balanceReaction("Cl2 + OH- -> Cl- + ClO3^- + H2O").equation).toBe(
      "3 Cl2 + 6 OH^- -> 5 Cl^- + ClO3^- + 3 H2O",
    );
  });

  it("returns integer coefficients in lowest terms for fractional-friendly inputs", () => {
    const balanced = balanceReaction("C2H6 + O2 -> CO2 + H2O");
    expect(balanced.equation).toBe("2 C2H6 + 7 O2 -> 4 CO2 + 6 H2O");
  });

  it("returns the canonical lowest-terms balance regardless of input coefficients", () => {
    // Input coefficients are ignored entirely: 4 H2 + 2 O2 -> 4 H2O normalizes
    // to the canonical 2 H2 + O2 -> 2 H2O.
    expect(balanceReaction("4 H2 + 2 O2 -> 4 H2O").equation).toBe("2 H2 + O2 -> 2 H2O");
    expect(balanceReaction("H2 + O2 -> H2O").equation).toBe("2 H2 + O2 -> 2 H2O");
  });

  it("throws BalanceNotUniqueError when an element appears on one side only", () => {
    expect(() => balanceReaction("H2 -> H2O")).toThrow(BalanceNotUniqueError);
  });

  it("throws BalanceNotUniqueError for structurally unrelated species", () => {
    expect(() => balanceReaction("Na -> Cl2")).toThrow(BalanceNotUniqueError);
  });
});

describe("formatSpecies", () => {
  it("renders neutral, unit-charge and multi-charge species", () => {
    expect(formatSpecies(parseSpecies("H2O"))).toBe("H2O");
    expect(formatSpecies(parseSpecies("Na+"))).toBe("Na^+");
    expect(formatSpecies(parseSpecies("SO4-2"))).toBe("SO4^2-");
    expect(formatSpecies(parseSpecies("Fe^+3"))).toBe("Fe^3+");
  });
});
