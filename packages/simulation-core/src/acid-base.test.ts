import { describe, expect, it } from "vitest";

import {
  hydrogenConcentrationFromPh,
  neutralPh,
  phFromHydrogenConcentration,
  phFromHydroxideConcentration,
  phFromPoh,
  pohFromHydroxideConcentration,
  pohFromPh,
  strongAcidSolution,
  strongBaseSolution,
  weakAcidSolution,
  weakBaseSolution,
} from "./acid-base.js";
import { DomainError, NonFiniteInputError } from "./errors.js";

describe("pH ↔ concentration conversions", () => {
  it("converts pH to [H+] and back", () => {
    expect(hydrogenConcentrationFromPh(2)).toBeCloseTo(0.01, 12);
    expect(phFromHydrogenConcentration(0.01)).toBeCloseTo(2, 12);
    expect(hydrogenConcentrationFromPh(7)).toBeCloseTo(1e-7, 12);
  });

  it("converts pOH to [OH-] and back", () => {
    expect(pohFromHydroxideConcentration(0.01)).toBeCloseTo(2, 12);
    expect(phFromHydroxideConcentration(0.01)).toBeCloseTo(12, 6);
  });

  it("enforces pH + pOH = pKw under the conventional constant", () => {
    expect(pohFromPh(2)).toBeCloseTo(12, 12);
    expect(phFromPoh(12)).toBeCloseTo(2, 12);
    expect(phFromPoh(2)).toBeCloseTo(12, 12);
  });

  it("neutral pH is exactly 7 under K_w = 1e-14", () => {
    expect(neutralPh()).toBeCloseTo(7, 12);
  });

  it("rejects zero and negative concentrations", () => {
    expect(() => phFromHydrogenConcentration(0)).toThrow(DomainError);
    expect(() => phFromHydrogenConcentration(-0.1)).toThrow(DomainError);
    expect(() => pohFromHydroxideConcentration(0)).toThrow(DomainError);
  });

  it("rejects non-finite concentrations", () => {
    expect(() => phFromHydrogenConcentration(Number.NaN)).toThrow(NonFiniteInputError);
    expect(() => phFromHydrogenConcentration(Number.POSITIVE_INFINITY)).toThrow(
      NonFiniteInputError,
    );
  });

  it("rejects out-of-range pH inputs", () => {
    expect(() => hydrogenConcentrationFromPh(17)).toThrow(DomainError);
    expect(() => hydrogenConcentrationFromPh(-3)).toThrow(DomainError);
  });
});

describe("strong acids (exact, water autoionization included)", () => {
  it("computes pH 2 for 0.010 mol/L HCl", () => {
    const result = strongAcidSolution(0.01);
    expect(result.ph).toBeCloseTo(2.0, 9);
    expect(result.hydrogenConcentration).toBeCloseTo(0.01, 9);
  });

  it("gives pH 7 (slightly acidic side of neutral is NOT produced) for pure water", () => {
    const result = strongAcidSolution(0);
    expect(result.ph).toBeCloseTo(7.0, 12);
  });

  it("dilute strong acid: pH of 1e-8 mol/L is below 7 but above 6", () => {
    const result = strongAcidSolution(1e-8);
    expect(result.ph).toBeCloseTo(6.978, 3);
    expect(result.ph).toBeLessThan(7);
    expect(result.ph).toBeGreaterThan(6);
  });

  it("respects the equivalents multiplier for diprotic acids", () => {
    const mono = strongAcidSolution(0.05, 1);
    const di = strongAcidSolution(0.05, 2);
    expect(di.ph).toBeCloseTo(1.0, 6);
    expect(di.hydrogenConcentration).toBeCloseTo(2 * mono.acidContribution, 9);
  });

  it("rejects negative concentration and non-integer/excessive equivalents", () => {
    expect(() => strongAcidSolution(-0.1)).toThrow(DomainError);
    expect(() => strongAcidSolution(0.1, 1.5)).toThrow(DomainError);
    expect(() => strongAcidSolution(0.1, 4)).toThrow(DomainError);
  });

  it("strong base: pH of 0.010 mol/L NaOH = 12.00", () => {
    expect(strongBaseSolution(0.01).ph).toBeCloseTo(12.0, 9);
    expect(strongBaseSolution(0.01).poh).toBeCloseTo(2.0, 9);
  });

  it("strong base: pH of 0.020 mol/L Ca(OH)₂ fully dissociated ≈ 12.60", () => {
    const result = strongBaseSolution(0.02, 2);
    expect(result.ph).toBeCloseTo(12.602, 3);
  });

  it("pure water via base model also gives pH 7", () => {
    expect(strongBaseSolution(0).ph).toBeCloseTo(7.0, 12);
  });
});

describe("weak acids (exact quadratic)", () => {
  it("computes pH of 0.100 mol/L acetic acid (K_a = 1.8e-5) ≈ 2.875", () => {
    const result = weakAcidSolution(0.1, 1.8e-5);
    expect(result.hydrogenConcentration).toBeCloseTo(1.3327e-3, 4);
    expect(result.ph).toBeCloseTo(2.8753, 3);
  });

  it("degree of dissociation matches x/C", () => {
    const result = weakAcidSolution(0.1, 1.8e-5);
    expect(result.degreeOfDissociation).toBeCloseTo(0.013327, 4);
    expect(result.approximationValidAt5Percent).toBe(true);
  });

  it("reports when the 5 % approximation is NOT valid (concentrated/weak)", () => {
    // K_a = 1e-4, C = 1e-2: alpha ≈ 0.09 → approximation invalid.
    const result = weakAcidSolution(1e-2, 1e-4);
    expect(result.degreeOfDissociation).toBeGreaterThan(0.05);
    expect(result.approximationValidAt5Percent).toBe(false);
  });

  it("exact result stays within 1 % of the textbook approximation for weak cases", () => {
    const result = weakAcidSolution(0.1, 1.8e-5);
    const rel =
      Math.abs(result.hydrogenConcentration - result.approximationCrossCheck) /
      result.hydrogenConcentration;
    expect(rel).toBeLessThan(1e-2);
  });

  it("handles very small K_a without catastrophic cancellation", () => {
    const result = weakAcidSolution(1e-8, 1e-6);
    expect(Number.isFinite(result.hydrogenConcentration)).toBe(true);
    // Physically: sqrt(K_a·C) = 1e-7 → pH ~7; exact slightly above 1e-7.
    expect(result.hydrogenConcentration).toBeGreaterThan(0);
  });

  it("rejects zero K_a and zero/negative concentration", () => {
    expect(() => weakAcidSolution(0.1, 0)).toThrow(DomainError);
    expect(() => weakAcidSolution(0, 1e-5)).toThrow(DomainError);
    expect(() => weakAcidSolution(-0.1, 1e-5)).toThrow(DomainError);
    expect(() => weakAcidSolution(0.1, Number.NaN)).toThrow(NonFiniteInputError);
  });
});

describe("weak bases (exact quadratic)", () => {
  it("computes pH of 0.100 mol/L ammonia (K_b = 1.8e-5) ≈ 11.125", () => {
    const result = weakBaseSolution(0.1, 1.8e-5);
    expect(result.hydroxideConcentration).toBeCloseTo(1.3327e-3, 4);
    expect(result.ph).toBeCloseTo(11.125, 3);
  });

  it("pOH and pH are consistent", () => {
    const result = weakBaseSolution(0.1, 1.8e-5);
    expect(result.poh + result.ph).toBeCloseTo(14, 9);
  });

  it("rejects invalid inputs", () => {
    expect(() => weakBaseSolution(0.1, 0)).toThrow(DomainError);
    expect(() => weakBaseSolution(0, 1e-5)).toThrow(DomainError);
  });
});
