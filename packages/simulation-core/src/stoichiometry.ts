/**
 * Stoichiometric calculations on a BALANCED reaction.
 *
 * These functions refuse to compute on an unbalanced equation
 * (ReactionNotBalancedError): using coefficients from an unbalanced equation
 * produces silently wrong amounts, which is exactly the failure mode this
 * engine exists to prevent.
 *
 * Model: reaction extent ξ (xi) in moles. For every reactant i with
 * coefficient ν_i, the extent consumed from a starting amount n_i^0 is
 * n_i^0 / ν_i. The limiting reagent(s) minimize that quotient; ties (all
 * reactants limiting simultaneously, e.g. exact stoichiometric feeds) are
 * reported as an array instead of being broken arbitrarily.
 */

import { DomainError, ReactionNotBalancedError } from "./errors.js";
import { assertFiniteGreaterThan, assertFiniteNumber } from "./numerics.js";
import { molarMass } from "./molar-mass.js";
import {
  analyzeReaction,
  formatSpecies,
  parseReaction,
  parseSpecies,
  type ChemicalSpecies,
  type ParsedReaction,
  type ReactionSpecies,
} from "./reaction.js";

export interface ReagentAmount {
  /** Species formula exactly as written in the reaction's species syntax. */
  readonly formula: string;
  /** Amount in moles; must be finite and > 0. */
  readonly amountMoles: number;
}

export interface ExtentResult {
  readonly formula: string;
  /** Starting amount (mol). */
  readonly amountMoles: number;
  /** Stoichiometric coefficient in the balanced equation. */
  readonly coefficient: number;
  /** Maximum reaction extent permitted by this reactant (mol). */
  readonly maxExtentMoles: number;
  /** True when this reactant limits the reaction. */
  readonly isLimiting: boolean;
  /** Amount remaining after the reaction completes (mol). */
  readonly remainingMoles: number;
}

export interface LimitingReagentResult {
  /** Limiting reagent formula(s); more than one entry on an exact-feed tie. */
  readonly limitingReagents: readonly string[];
  /** Reaction extent at completion (mol). */
  readonly extentMoles: number;
  /** Per-reactant accounting in balanced-equation order. */
  readonly reagents: readonly ExtentResult[];
  /** Amount of each product formed at the limiting extent (mol). */
  readonly productsFormed: ReadonlyArray<{
    readonly formula: string;
    readonly amountMoles: number;
  }>;
}

function speciesKey(species: ChemicalSpecies): string {
  return formatSpecies(species);
}

function requireBalanced(reaction: ParsedReaction): ParsedReaction {
  const analysis = analyzeReaction(reaction);
  if (!analysis.balanced) {
    throw new ReactionNotBalancedError(
      `unbalanced equation "${reaction.equation}" (atoms: ${analysis.unbalancedElements.join(", ") || "ok"}; charge: reactants ${analysis.reactantCharge} vs products ${analysis.productCharge})`,
    );
  }
  return reaction;
}

/**
 * Parses `equation` (if a string), verifies the atom/charge balance and
 * returns the parsed reaction. Throws ReactionParseError / ReactionNotBalancedError.
 */
export function requireBalancedEquation(
  equationOrReaction: string | ParsedReaction,
): ParsedReaction {
  const parsed =
    typeof equationOrReaction === "string" ? parseReaction(equationOrReaction) : equationOrReaction;
  return requireBalanced(parsed);
}

/**
 * Limiting-reagent analysis for a balanced reaction.
 *
 * `amounts` must cover exactly the reactant set (no missing/extra species).
 * Amounts are matched to reactants by species identity (formula + charge).
 */
export function limitingReagent(
  equationOrReaction: string | ParsedReaction,
  amounts: readonly ReagentAmount[],
): LimitingReagentResult {
  const reaction = requireBalancedEquation(equationOrReaction);
  if (amounts.length !== reaction.reactants.length) {
    throw new DomainError(
      `Expected amounts for exactly the ${reaction.reactants.length} reactant(s) ` +
        `(${reaction.reactants.map((s) => formatSpecies(s)).join(", ")}); received ${amounts.length} entr${amounts.length === 1 ? "y" : "ies"}`,
    );
  }

  const used = new Array<boolean>(amounts.length).fill(false);
  const perReactant: ExtentResult[] = new Array(reaction.reactants.length);

  const findAmount = (species: ReactionSpecies): number => {
    const key = speciesKey(species);
    for (let index = 0; index < amounts.length; index += 1) {
      if (used[index]) continue;
      const candidate = amounts[index]!;
      const candidateKey = speciesKey(parseSpecies(candidate.formula));
      if (candidateKey === key) {
        used[index] = true;
        return assertFiniteGreaterThan(candidate.amountMoles, `amounts[${key}].amountMoles`, 0);
      }
    }
    throw new DomainError(`No amount supplied for reactant "${key}"`);
  };

  let maxExtent = Number.POSITIVE_INFINITY;
  for (let i = 0; i < reaction.reactants.length; i += 1) {
    const species = reaction.reactants[i]!;
    const amount = findAmount(species);
    const extent = amount / species.coefficient;
    perReactant[i] = {
      formula: formatSpecies(species),
      amountMoles: amount,
      coefficient: species.coefficient,
      maxExtentMoles: extent,
      isLimiting: false,
      remainingMoles: 0,
    };
    if (extent < maxExtent) maxExtent = extent;
  }

  const TICK = 1e-12;
  const limitingReagents: string[] = [];
  const reagents = perReactant.map((entry) => {
    const isLimiting = Math.abs(entry.maxExtentMoles - maxExtent) <= TICK * Math.max(1, maxExtent);
    if (isLimiting) limitingReagents.push(entry.formula);
    return Object.freeze({
      ...entry,
      isLimiting,
      remainingMoles: Math.max(0, entry.amountMoles - maxExtent * entry.coefficient),
    });
  });

  const productsFormed = reaction.products.map((species) =>
    Object.freeze({
      formula: formatSpecies(species),
      amountMoles: maxExtent * species.coefficient,
    }),
  );

  return Object.freeze({
    limitingReagents: Object.freeze(limitingReagents),
    extentMoles: maxExtent,
    reagents: Object.freeze(reagents),
    productsFormed: Object.freeze(productsFormed),
  });
}

/**
 * Theoretical yield of `productFormula` for the given reactant amounts.
 * Returns moles and, when `molarMassGPerMol` is supplied or the product
 * formula parses, the corresponding mass in grams.
 */
export function theoreticalYield(
  equationOrReaction: string | ParsedReaction,
  amounts: readonly ReagentAmount[],
  productFormula: string,
): { productFormula: string; amountMoles: number; massGrams: number } {
  const reaction = requireBalancedEquation(equationOrReaction);
  const analysis = limitingReagent(reaction, amounts);
  const wanted = parseSpecies(productFormula);
  const wantedKey = speciesKey(wanted);
  const product = reaction.products.find((species) => speciesKey(species) === wantedKey);
  if (!product) {
    const available = reaction.products.map((species) => formatSpecies(species)).join(", ");
    throw new DomainError(
      `"${productFormula}" is not a product of "${reaction.equation}". Products: ${available}`,
    );
  }
  const amountMoles = analysis.extentMoles * product.coefficient;
  // The formulas appearing in reactions may omit the leading coefficient; molar
  // mass ignores charge (ions and their neutral atoms have the same molar mass
  // to better than 1e-6 g/mol for education purposes — electrons are 5.486e-4
  // u, below reportable precision).
  const massGrams = amountMoles * molarMass(product.formula);
  return Object.freeze({
    productFormula: formatSpecies(product),
    amountMoles,
    massGrams,
  });
}

/**
 * Amount of a reactant consumed to reach the given extent (mol).
 * Convenience for titration-style bookkeeping.
 */
export function reactantConsumed(
  equationOrReaction: string | ParsedReaction,
  reactantFormula: string,
  extentMoles: number,
): number {
  const reaction = requireBalancedEquation(equationOrReaction);
  assertFiniteNumber(extentMoles, "extentMoles");
  if (extentMoles < 0) {
    throw new DomainError("extentMoles must be non-negative");
  }
  const wanted = parseSpecies(reactantFormula);
  const wantedKey = speciesKey(wanted);
  const reactant = reaction.reactants.find((species) => speciesKey(species) === wantedKey);
  if (!reactant) {
    throw new DomainError(`"${reactantFormula}" is not a reactant of "${reaction.equation}"`);
  }
  return reactant.coefficient * extentMoles;
}
