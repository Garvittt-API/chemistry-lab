/**
 * Foundational chemical quantity calculations.
 *
 * Scope:
 * - amount ↔ mass via molar mass
 * - amount concentration (molarity) ↔ amount
 * - mass concentration ↔ molar mass (explicit cross-dimension bridges)
 * - dilution (C₁V₁ = C₂V₂)
 * - theoretical and percent yield helpers (pure arithmetic; stoichiometric
 *   extents live in stoichiometry.ts)
 *
 * All units are SI-coherent: mass in grams (g), amount in moles (mol),
 * volume in litres (L), mass concentration in g/L, molar mass in g/mol.
 * Callers holding other units must convert with the unit system first —
 * no unit guessing happens inside these functions.
 *
 * Every function validates finite, strictly positive inputs where division
 * is involved, and raises SimulationError subclasses otherwise.
 */

import { DomainError } from "./errors.js";
import {
  approxEqual,
  assertFiniteAtLeast,
  assertFiniteGreaterThan,
  assertFiniteNumber,
} from "./numerics.js";
import { molarMass } from "./molar-mass.js";

/** amount(mol) = mass(g) / molar mass(g/mol). */
export function molesFromMass(massGrams: number, molarMassGPerMol: number): number {
  assertFiniteGreaterThan(massGrams, "massGrams", 0);
  assertFiniteGreaterThan(molarMassGPerMol, "molarMassGPerMol", 0);
  return massGrams / molarMassGPerMol;
}

/** mass(g) = amount(mol) × molar mass(g/mol). */
export function massFromMoles(amountMoles: number, molarMassGPerMol: number): number {
  assertFiniteGreaterThan(amountMoles, "amountMoles", 0);
  assertFiniteGreaterThan(molarMassGPerMol, "molarMassGPerMol", 0);
  return amountMoles * molarMassGPerMol;
}

/** Convenience overload: moles from mass for a formula string (e.g. "H2O"). */
export function molesFromMassOfFormula(massGrams: number, formula: string): number {
  return molesFromMass(massGrams, molarMass(formula));
}

/** Convenience overload: mass for a formula string. */
export function massFromMolesOfFormula(amountMoles: number, formula: string): number {
  return massFromMoles(amountMoles, molarMass(formula));
}

/** Molarity (mol/L) from amount (mol) and volume (L). Volume must be > 0. */
export function molarConcentration(amountMoles: number, volumeLitres: number): number {
  assertFiniteGreaterThan(amountMoles, "amountMoles", 0);
  assertFiniteGreaterThan(volumeLitres, "volumeLitres", 0);
  return amountMoles / volumeLitres;
}

/** Amount (mol) from molarity (mol/L) and volume (L). */
export function amountFromConcentrationVolume(molarity: number, volumeLitres: number): number {
  assertFiniteGreaterThan(molarity, "molarity", 0);
  assertFiniteGreaterThan(volumeLitres, "volumeLitres", 0);
  return molarity * volumeLitres;
}

/** Mass concentration (g/L) from molarity (mol/L) and molar mass (g/mol). */
export function massConcentrationFromMolarity(molarity: number, molarMassGPerMol: number): number {
  assertFiniteGreaterThan(molarity, "molarity", 0);
  assertFiniteGreaterThan(molarMassGPerMol, "molarMassGPerMol", 0);
  return molarity * molarMassGPerMol;
}

/** Molarity (mol/L) from mass concentration (g/L) and molar mass (g/mol). */
export function molarityFromMassConcentration(
  massConcentrationGPerL: number,
  molarMassGPerMol: number,
): number {
  assertFiniteGreaterThan(massConcentrationGPerL, "massConcentrationGPerL", 0);
  assertFiniteGreaterThan(molarMassGPerMol, "molarMassGPerMol", 0);
  return massConcentrationGPerL / molarMassGPerMol;
}

/**
 * Dilution law C₁V₁ = C₂V₂. All inputs must be finite and strictly positive.
 */
export function dilutionFinalConcentration(
  stockConcentration: number,
  stockVolumeLitres: number,
  finalVolumeLitres: number,
): number {
  assertFiniteGreaterThan(stockConcentration, "stockConcentration", 0);
  assertFiniteGreaterThan(stockVolumeLitres, "stockVolumeLitres", 0);
  assertFiniteGreaterThan(finalVolumeLitres, "finalVolumeLitres", 0);
  if (finalVolumeLitres < stockVolumeLitres) {
    throw new DomainError(
      `finalVolumeLitres (${finalVolumeLitres} L) must be at least stockVolumeLitres (${stockVolumeLitres} L) for a dilution`,
    );
  }
  return (stockConcentration * stockVolumeLitres) / finalVolumeLitres;
}

/** Final volume required so a stock solution reaches the target concentration. */
export function dilutionFinalVolume(
  stockConcentration: number,
  stockVolumeLitres: number,
  targetConcentration: number,
): number {
  assertFiniteGreaterThan(stockConcentration, "stockConcentration", 0);
  assertFiniteGreaterThan(stockVolumeLitres, "stockVolumeLitres", 0);
  assertFiniteGreaterThan(targetConcentration, "targetConcentration", 0);
  if (targetConcentration > stockConcentration) {
    throw new DomainError(
      `targetConcentration (${targetConcentration}) exceeds stockConcentration (${stockConcentration}); dilution cannot concentrate`,
    );
  }
  return (stockConcentration * stockVolumeLitres) / targetConcentration;
}

/** Volume of stock solution needed to prepare a target dilution. */
export function dilutionRequiredStockVolume(
  targetConcentration: number,
  finalVolumeLitres: number,
  stockConcentration: number,
): number {
  assertFiniteGreaterThan(targetConcentration, "targetConcentration", 0);
  assertFiniteGreaterThan(finalVolumeLitres, "finalVolumeLitres", 0);
  assertFiniteGreaterThan(stockConcentration, "stockConcentration", 0);
  if (targetConcentration > stockConcentration) {
    throw new DomainError(
      `targetConcentration (${targetConcentration}) exceeds stockConcentration (${stockConcentration}); dilution cannot concentrate`,
    );
  }
  return (targetConcentration * finalVolumeLitres) / stockConcentration;
}

/**
 * Percent yield = actual / theoretical × 100.
 *
 * A percent yield above 100 % indicates impure product, an incomplete
 * reaction assumption or measurement error — it is NOT clamped, because
 * hiding it would misreport the experiment. A negative result is rejected.
 */
export function percentYield(actualYield: number, theoreticalYield: number): number {
  assertFiniteAtLeast(actualYield, "actualYield", 0);
  assertFiniteGreaterThan(theoreticalYield, "theoreticalYield", 0);
  return (actualYield / theoreticalYield) * 100;
}

/**
 * Mass percent purity of a sample: pure mass / sample mass × 100.
 * Both arguments must be finite and strictly positive; purity may exceed
 * 100 % only through measurement error and is NOT clamped.
 */
export function massPercent(pureMass: number, sampleMass: number): number {
  assertFiniteGreaterThan(pureMass, "pureMass", 0);
  assertFiniteGreaterThan(sampleMass, "sampleMass", 0);
  return (pureMass / sampleMass) * 100;
}

/** Atom economy = molar mass of desired product / sum of molar masses of all products × 100. */
export function atomEconomy(desiredProductMolarMass: number, allProductsMolarMass: number): number {
  assertFiniteGreaterThan(desiredProductMolarMass, "desiredProductMolarMass", 0);
  assertFiniteGreaterThan(allProductsMolarMass, "allProductsMolarMass", 0);
  if (desiredProductMolarMass > allProductsMolarMass) {
    throw new DomainError(
      "desiredProductMolarMass cannot exceed the combined molar mass of all products",
    );
  }
  return (desiredProductMolarMass / allProductsMolarMass) * 100;
}

/**
 * Conservation check used by tests and by the integration layer: returns true
 * when |a − b| is within the given relative tolerance.
 */
export function massBalanceHolds(
  massIn: number,
  massOut: number,
  relativeTolerance = 1e-9,
): boolean {
  assertFiniteNumber(massIn, "massIn");
  assertFiniteNumber(massOut, "massOut");
  return approxEqual(massIn, massOut, relativeTolerance);
}
