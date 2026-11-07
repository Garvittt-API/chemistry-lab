import { describe, expect, it } from "vitest";

import {
  amountFromConcentrationVolume,
  atomEconomy,
  dilutionFinalConcentration,
  dilutionFinalVolume,
  dilutionRequiredStockVolume,
  massBalanceHolds,
  massConcentrationFromMolarity,
  massFromMoles,
  massPercent,
  molarConcentration,
  molarityFromMassConcentration,
  molesFromMass,
  percentYield,
} from "./amount.js";
import { DomainError, NonFiniteInputError } from "./errors.js";

describe("moles ↔ mass", () => {
  it("computes moles from mass (water)", () => {
    expect(molesFromMass(18.015, 18.015)).toBeCloseTo(1, 12);
    expect(molesFromMass(5, 58.44)).toBeCloseTo(0.0855578, 6);
  });

  it("computes mass from moles", () => {
    expect(massFromMoles(0.5, 18.015)).toBeCloseTo(9.0075, 12);
    expect(massFromMoles(2, 98.072)).toBeCloseTo(196.144, 9);
  });

  it("rejects zero or negative masses and molar masses", () => {
    expect(() => molesFromMass(0, 18.015)).toThrow(DomainError);
    expect(() => molesFromMass(1, 0)).toThrow(DomainError);
    expect(() => molesFromMass(-1, 18.015)).toThrow(DomainError);
    expect(() => massFromMoles(0, 18.015)).toThrow(DomainError);
  });

  it("rejects non-finite values", () => {
    expect(() => molesFromMass(Number.NaN, 18.015)).toThrow(NonFiniteInputError);
  });
});

describe("concentration", () => {
  it("computes molarity", () => {
    expect(molarConcentration(0.25, 0.5)).toBeCloseTo(0.5, 12);
  });

  it("computes amount from molarity and volume", () => {
    expect(amountFromConcentrationVolume(0.5, 0.5)).toBeCloseTo(0.25, 12);
  });

  it("converts between molarity and mass concentration via molar mass", () => {
    expect(massConcentrationFromMolarity(1, 58.44)).toBeCloseTo(58.44, 12);
    expect(molarityFromMassConcentration(58.44, 58.44)).toBeCloseTo(1, 12);
  });

  it("rejects zero volume", () => {
    expect(() => molarConcentration(1, 0)).toThrow(DomainError);
  });

  it("rejects zero molar mass in cross-dimension bridges", () => {
    expect(() => molarityFromMassConcentration(10, 0)).toThrow(DomainError);
  });
});

describe("dilution (C₁V₁ = C₂V₂)", () => {
  it("computes final concentration", () => {
    expect(dilutionFinalConcentration(2, 0.1, 0.5)).toBeCloseTo(0.4, 12);
    expect(dilutionFinalConcentration(1, 0.025, 0.25)).toBeCloseTo(0.1, 12);
  });

  it("computes required final volume", () => {
    expect(dilutionFinalVolume(2, 0.1, 0.4)).toBeCloseTo(0.5, 12);
  });

  it("computes required stock volume", () => {
    expect(dilutionRequiredStockVolume(0.4, 0.5, 2)).toBeCloseTo(0.1, 12);
  });

  it("rejects attempts to concentrate by dilution", () => {
    expect(() => dilutionFinalConcentration(1, 0.5, 0.4)).toThrow(DomainError);
    expect(() => dilutionFinalVolume(1, 0.1, 2)).toThrow(DomainError);
    expect(() => dilutionRequiredStockVolume(2, 0.5, 1)).toThrow(DomainError);
  });

  it("rejects zero and negative inputs", () => {
    expect(() => dilutionFinalConcentration(0, 0.1, 0.5)).toThrow(DomainError);
    expect(() => dilutionFinalConcentration(1, 0, 0.5)).toThrow(DomainError);
    expect(() => dilutionFinalConcentration(1, 0.1, 0)).toThrow(DomainError);
  });
});

describe("yields and economy", () => {
  it("computes percent yield without clamping above 100 %", () => {
    expect(percentYield(9.6, 10)).toBeCloseTo(96, 12);
    expect(percentYield(11, 10)).toBeCloseTo(110, 12);
    expect(() => percentYield(-1, 10)).toThrow(DomainError);
    expect(() => percentYield(1, 0)).toThrow(DomainError);
  });

  it("computes mass percent", () => {
    expect(massPercent(9.5, 10)).toBeCloseTo(95, 12);
    expect(() => massPercent(0, 10)).toThrow(DomainError);
  });

  it("computes atom economy", () => {
    expect(atomEconomy(98.072, 98.072 + 2 * 18.015)).toBeGreaterThan(70);
    expect(() => atomEconomy(200, 100)).toThrow(DomainError);
  });

  it("mass balance holds within tolerance", () => {
    expect(massBalanceHolds(100, 100, 1e-9)).toBe(true);
    expect(massBalanceHolds(100, 101, 1e-9)).toBe(false);
    expect(() => massBalanceHolds(Number.NaN, 100)).toThrow(NonFiniteInputError);
  });
});
