/**
 * Foundational acid–base models (dilute aqueous solutions, 25 °C unless noted).
 *
 * Models implemented (docs/science/models/acid-base.md):
 *
 * 1. pH ↔ hydrogen-ion concentration:  pH = −log₁₀[H⁺].
 * 2. pOH ↔ hydroxide-ion concentration: pOH = −log₁₀[OH⁻].
 * 3. pH + pOH = pK_w with K_w = 1.0e-14 (conventional, 25 °C).
 * 4. Strong monoprotic acids/bases, treated EXACTLY including water
 *    autoionization: [H⁺] = (c + √(c² + 4K_w)) / 2 with c = n·Cₐ. No "5 %
 *    rule" approximation is applied — the quadratic handles dilution
 *    down to pure water (c → 0 gives pH 7).
 * 5. Weak monoprotic acids/bases, solved EXACTLY for [H⁺]/[OH⁻] from the
 *    defining equilibrium (x = (−K_a + √(K_a² + 4K_a·C)) / 2). The textbook
 *    approximation x ≈ √(K_a·C) is exposed only as a *diagnostic comparison*
 *    (`approximationCrossCheck`), never as the reported value, and the
 *    5 % dissociation criterion is reported as `lowDissociationApproximationValid`.
 *
 * HARD LIMITATIONS (documented, not enforceable by the API):
 * - Concentrations, not activities. Results are meaningless for solutions
 *   with ionic strength ≳ 10⁻² mol/L, where activity coefficients deviate
 *   substantially (Davies/extended Debye–Hückel territory).
 * - Monoprotic, single-equilibrium systems only. Polyprotic acids (Ka1 vs
 *   Ka2 vs Ka3) are out of scope in this version.
 * - K_w = 1.0e-14 (pK_w = 14.00) is a conventional 25 °C value; K_w is
 *   strongly temperature dependent (pK_w ≈ 13.995 at 25 °C true value by
 *   measurements, and ≠ 14 at other temperatures).
 * - "Strong" means fully dissociated. Very dilute or non-ideal strong
 *   electrolytes are outside this model's valid range.
 * - pH is defined for [H⁺] > 0; pH = −log₁₀[H⁺] is an operational quantity,
 *   not an integer count of anything.
 */

import { DomainError } from "./errors.js";
import { assertFiniteGreaterThan, assertFiniteNumber, assertFiniteInRange } from "./numerics.js";
import { getConstant } from "./constants.js";

function ionProductOfWater(): number {
  return getConstant("ion-product-of-water").value;
}

/** pH from hydrogen-ion concentration (mol/L). Throws for [H⁺] ≤ 0. */
export function phFromHydrogenConcentration(hydrogenConcentration: number): number {
  assertFiniteGreaterThan(hydrogenConcentration, "hydrogenConcentration", 0);
  const ph = -Math.log10(hydrogenConcentration);
  if (!Number.isFinite(ph)) {
    throw new DomainError(
      `hydrogenConcentration ${hydrogenConcentration} is outside the representable pH range`,
    );
  }
  return ph;
}

/** [H⁺] (mol/L) from pH. pH is valid on the operational range (−2, 16). */
export function hydrogenConcentrationFromPh(ph: number): number {
  assertFiniteInRange(ph, "ph", -2, 16);
  const concentration = Math.pow(10, -ph);
  if (!Number.isFinite(concentration)) {
    throw new DomainError(`ph ${ph} yields a non-representable concentration`);
  }
  return concentration;
}

/** pOH from hydroxide-ion concentration (mol/L). Throws for [OH⁻] ≤ 0. */
export function pohFromHydroxideConcentration(hydroxideConcentration: number): number {
  assertFiniteGreaterThan(hydroxideConcentration, "hydroxideConcentration", 0);
  const poh = -Math.log10(hydroxideConcentration);
  if (!Number.isFinite(poh)) {
    throw new DomainError(
      `hydroxideConcentration ${hydroxideConcentration} is outside the representable pOH range`,
    );
  }
  return poh;
}

/** [OH⁻] (mol/L) from pOH. Valid on the operational range (−2, 16). */
export function hydroxideConcentrationFromPoh(poh: number): number {
  assertFiniteInRange(poh, "poh", -2, 16);
  const concentration = Math.pow(10, -poh);
  if (!Number.isFinite(concentration)) {
    throw new DomainError(`poh ${poh} yields a non-representable concentration`);
  }
  return concentration;
}

/** pOH from pH using pK_w (conventional 25 °C value, pK_w = 14.00). */
export function pohFromPh(ph: number): number {
  assertFiniteInRange(ph, "ph", -2, 16);
  return -Math.log10(ionProductOfWater()) - ph;
}

/** pH from pOH using pK_w (conventional 25 °C value, pK_w = 14.00). */
export function phFromPoh(poh: number): number {
  assertFiniteInRange(poh, "poh", -2, 16);
  return -Math.log10(ionProductOfWater()) - poh;
}

/** pH from hydroxide-ion concentration (mol/L): pH = pK_w + log₁₀[OH⁻]. */
export function phFromHydroxideConcentration(hydroxideConcentration: number): number {
  assertFiniteGreaterThan(hydroxideConcentration, "hydroxideConcentration", 0);
  return -Math.log10(ionProductOfWater()) + Math.log10(hydroxideConcentration);
}

/** Neutral pH at the model's ion product: −log₁₀√K_w (= 7.00 for K_w = 1e-14). */
export function neutralPh(): number {
  return -Math.log10(Math.sqrt(ionProductOfWater()));
}

export interface StrongElectrolyteResult {
  readonly analyticalConcentration: number;
  /** Number of acidic protons / basic hydroxide-equivalents per formula unit. */
  readonly equivalents: number;
  /** Free ion concentration from the electrolyte alone (mol/L): n·C. */
  readonly acidContribution: number;
  /** Exact [H⁺] (mol/L), including water autoionization. */
  readonly hydrogenConcentration: number;
  readonly ph: number;
  readonly poh: number;
  /** [OH⁻] (mol/L) implied by pK_w. */
  readonly hydroxideConcentration: number;
}

/**
 * Strong (fully dissociated) monoprotic or n-protic ACID.
 * Solves [H⁺]² = c·[H⁺] + K_w exactly.
 *
 * @param analyticalConcentration mol/L of the acid formula unit (must be ≥ 0; 0 = pure water)
 * @param equivalents number of acidic protons per formula unit (positive integer, default 1)
 */
export function strongAcidSolution(
  analyticalConcentration: number,
  equivalents = 1,
): StrongElectrolyteResult {
  assertFiniteNumber(analyticalConcentration, "analyticalConcentration");
  if (analyticalConcentration < 0) {
    throw new DomainError("analyticalConcentration must be non-negative");
  }
  assertFiniteInRange(equivalents, "equivalents", 1, 3);
  if (!Number.isInteger(equivalents)) {
    throw new DomainError("equivalents must be an integer (monoprotic acids only in practice)");
  }
  const kw = ionProductOfWater();
  const acidContribution = analyticalConcentration * equivalents;
  const hydrogen = (acidContribution + Math.sqrt(acidContribution * acidContribution + 4 * kw)) / 2;
  const hydroxide = kw / hydrogen;
  const ph = -Math.log10(hydrogen);
  const poh = -Math.log10(hydroxide);
  return Object.freeze({
    analyticalConcentration,
    equivalents,
    acidContribution,
    hydrogenConcentration: hydrogen,
    ph,
    poh,
    hydroxideConcentration: hydroxide,
  });
}

export interface StrongBaseResult {
  readonly analyticalConcentration: number;
  readonly equivalents: number;
  readonly baseContribution: number;
  readonly hydroxideConcentration: number;
  readonly poh: number;
  readonly ph: number;
  readonly hydrogenConcentration: number;
}

/**
 * Strong (fully dissociated) BASE. Solves [OH⁻]² = c·[OH⁻] + K_w exactly.
 */
export function strongBaseSolution(
  analyticalConcentration: number,
  equivalents = 1,
): StrongBaseResult {
  assertFiniteNumber(analyticalConcentration, "analyticalConcentration");
  if (analyticalConcentration < 0) {
    throw new DomainError("analyticalConcentration must be non-negative");
  }
  assertFiniteInRange(equivalents, "equivalents", 1, 3);
  if (!Number.isInteger(equivalents)) {
    throw new DomainError("equivalents must be an integer");
  }
  const kw = ionProductOfWater();
  const baseContribution = analyticalConcentration * equivalents;
  const hydroxide =
    (baseContribution + Math.sqrt(baseContribution * baseContribution + 4 * kw)) / 2;
  const hydrogen = kw / hydroxide;
  const poh = -Math.log10(hydroxide);
  const ph = -Math.log10(hydrogen);
  return Object.freeze({
    analyticalConcentration,
    equivalents,
    baseContribution,
    hydroxideConcentration: hydroxide,
    poh,
    ph,
    hydrogenConcentration: hydrogen,
  });
}

export interface WeakAcidResult {
  readonly analyticalConcentration: number;
  readonly ka: number;
  /** Exact [H⁺] (mol/L) from the quadratic, water autoionization neglected relative to K_a. */
  readonly hydrogenConcentration: number;
  readonly ph: number;
  /** Fraction of acid dissociated, x / C. */
  readonly degreeOfDissociation: number;
  /**
   * True when the simple approximation x ≈ √(K_a·C) is within 5 % of the exact
   * value (the usual textbook criterion, α ≤ 0.05). Reported for teaching
   * purposes; the exact value is always the reported one.
   */
  readonly approximationValidAt5Percent: boolean;
  /** Diagnostic: the textbook approximation x ≈ √(K_a·C) (for comparison only). */
  readonly approximationCrossCheck: number;
}

/**
 * Weak monoprotic acid HA ⇌ H⁺ + A⁻.
 * Solves x² + K_a·x − K_a·C = 0 exactly (positive root).
 *
 * @param analyticalConcentration C in mol/L, must be > 0
 * @param ka acid dissociation constant in mol/L, must be > 0
 */
export function weakAcidSolution(analyticalConcentration: number, ka: number): WeakAcidResult {
  assertFiniteGreaterThan(analyticalConcentration, "analyticalConcentration", 0);
  assertFiniteGreaterThan(ka, "ka", 0);
  // Stable positive root of x² + K_a·x − K_a·C = 0; avoids catastrophic
  // cancellation when 4·K_a·C ≪ K_a² (see numerical-recipes quadratic).
  const discriminant = ka * ka + 4 * ka * analyticalConcentration;
  const x = (2 * ka * analyticalConcentration) / (Math.sqrt(discriminant) + ka);
  if (!Number.isFinite(x) || x <= 0) {
    throw new DomainError("weak acid model produced a non-physical [H+]; check inputs");
  }
  const ph = -Math.log10(x);
  const approximation = Math.sqrt(ka * analyticalConcentration);
  const degree = x / analyticalConcentration;
  return Object.freeze({
    analyticalConcentration,
    ka,
    hydrogenConcentration: x,
    ph,
    degreeOfDissociation: degree,
    approximationValidAt5Percent: degree <= 0.05,
    approximationCrossCheck: approximation,
  });
}

export interface WeakBaseResult {
  readonly analyticalConcentration: number;
  readonly kb: number;
  readonly hydroxideConcentration: number;
  readonly poh: number;
  readonly ph: number;
  readonly degreeOfDissociation: number;
  readonly approximationValidAt5Percent: boolean;
  readonly approximationCrossCheck: number;
}

/**
 * Weak monoprotic base B + H₂O ⇌ BH⁺ + OH⁻.
 * Solves x² + K_b·x − K_b·C = 0 exactly (positive root). pH follows from pK_w.
 */
export function weakBaseSolution(analyticalConcentration: number, kb: number): WeakBaseResult {
  assertFiniteGreaterThan(analyticalConcentration, "analyticalConcentration", 0);
  assertFiniteGreaterThan(kb, "kb", 0);
  const x = (-kb + Math.sqrt(kb * kb + 4 * kb * analyticalConcentration)) / 2;
  if (!Number.isFinite(x) || x <= 0) {
    throw new DomainError("weak base model produced a non-physical [OH-]; check inputs");
  }
  const poh = -Math.log10(x);
  const ph = pohFromPhInvert(poh);
  const approximation = Math.sqrt(kb * analyticalConcentration);
  const degree = x / analyticalConcentration;
  return Object.freeze({
    analyticalConcentration,
    kb,
    hydroxideConcentration: x,
    poh,
    ph,
    degreeOfDissociation: degree,
    approximationValidAt5Percent: degree <= 0.05,
    approximationCrossCheck: approximation,
  });
}

function pohFromPhInvert(poh: number): number {
  return -Math.log10(ionProductOfWater()) - poh;
}

/**
 * Sanity constant accessor exported for tests and documentation: K_w as a
 * number (mol² dm⁻⁶). Kept because some call sites need the raw value.
 */
export function ionProductOfWaterConstant(): number {
  return ionProductOfWater();
}
