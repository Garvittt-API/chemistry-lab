/**
 * Chemical species and reaction representation, validation and balancing.
 *
 * Species syntax (ONE canonical charge notation — no ambiguity, ever):
 *   <formula>              neutral species, e.g. "H2O"
 *   <formula>^<mag><s>     explicit caret form: e.g. "SO4^2-", "Fe^3+", "O2^-", "NH4^+".
 *                          Charge magnitude up to 2 digits; also accepts the sign-first
 *                          caret variant "Fe^+2" / "SO4^-2".
 *   <formula><s>[<mag>]    caret-less form: a trailing sign is a unit charge ONLY when no
 *                          digits directly precede it ("Na+", "Cl-", "OH-", "H+"); a sign
 *                          followed by digits is the charge magnitude ("Fe+3", "SO4-2",
 *                          "Cr2O7-2"). If DIGITS DIRECTLY PRECEDE the sign ("NH4+",
 *                          "NO3-", "Fe3+", "SO42-") the input is AMBIGUOUS and is
 *                          rejected with guidance — write e.g. "NH4^+", "NO3^-", "Fe^3+",
 *                          "SO4^2-". Literal dot separators in formulas ("CuSO4·5H2O") are
 *                          hydrates, never charges.
 *
 * Reaction syntax:
 *   <species> ( "+" <species> )*  "->"  <species> ( "+" <species> )*
 *   with an optional leading positive coefficient per species: "2 H2 + O2 -> 2 H2O".
 *   The Unicode arrow "→" is accepted as a synonym for "->".
 *
 * Balancing uses EXACT rational arithmetic (BigInt numerators/denominators) on
 * the stoichiometry matrix [ reactants | −products ] over element rows plus an
 * optional charge row. The unique-nullspace branch returns lowest-terms
 * positive integer coefficients; anything else raises BalanceNotUniqueError.
 * No floating point participates in the balance computation, so results are
 * deterministic and platform-independent.
 *
 * Parsing success is NOT validity: `analyzeReaction` performs the atom- and
 * charge-balance checks separately.
 */

import { BalanceNotUniqueError, ReactionNotBalancedError, ReactionParseError } from "./errors.js";
import { parseFormula } from "./molar-mass.js";

export interface ChemicalSpecies {
  /** Element count per symbol, in order of first appearance. */
  readonly atoms: Readonly<Record<string, number>>;
  /** Net ionic charge (e.g. +2 for Ca²⁺). Integer. */
  readonly charge: number;
  /** Canonical formula text (trimmed, as supplied). */
  readonly formula: string;
}

export interface ReactionSpecies extends ChemicalSpecies {
  /** Stoichiometric coefficient (positive, finite; 1 when omitted). */
  readonly coefficient: number;
}

export interface ParsedReaction {
  readonly reactants: readonly ReactionSpecies[];
  readonly products: readonly ReactionSpecies[];
  /** Canonical single-line rendering, e.g. "2 H2 + O2 -> 2 H2O". */
  readonly equation: string;
}

export interface ReactionAnalysis {
  readonly reactantAtoms: Readonly<Record<string, number>>;
  readonly productAtoms: Readonly<Record<string, number>>;
  /** Elements whose counts differ between the two sides (empty when balanced). */
  readonly unbalancedElements: readonly string[];
  readonly atomBalanced: boolean;
  /** Sum of species charge × coefficient on the reactant side. */
  readonly reactantCharge: number;
  readonly productCharge: number;
  readonly chargeBalanced: boolean;
  /** True only when both atoms and charge balance. */
  readonly balanced: boolean;
}

const MAX_COEFFICIENT = 1e6;
const MAX_CHARGE = 20;
// Caret form accepts EITHER "^{mag}{sign}" ("SO4^2-", "Fe^3+") or
// "^{sign}{mag}" ("Fe^+2", "NH4^+"): both are unambiguous and both appear in
// handwritten notation. Magnitude at most 2 digits in both forms.
const CARET_CHARGE_PATTERN = /^(?:([+-])(\d{0,2})|(\d{0,2})([+-]))$/;

function requireTrimmed(input: unknown, what: string): string {
  if (typeof input !== "string") {
    throw new ReactionParseError(`${what} must be a string; received ${typeof input}`);
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new ReactionParseError(`${what} must not be empty`);
  }
  if (trimmed.length > 512) {
    throw new ReactionParseError(`${what} exceeds 512 characters`);
  }
  return trimmed;
}

/** Parses a single species (with optional ionic charge). Coefficients are NOT allowed here. */
export function parseSpecies(input: unknown): ChemicalSpecies {
  const raw = requireTrimmed(input, "Species");

  const caretIndex = raw.indexOf("^");
  if (caretIndex !== -1) {
    if (caretIndex !== raw.lastIndexOf("^")) {
      throw new ReactionParseError(`Species "${raw}": multiple "^" charge markers`);
    }
    const body = raw.slice(0, caretIndex).trim();
    const chargePart = raw.slice(caretIndex + 1).trim();
    const match = CARET_CHARGE_PATTERN.exec(chargePart);
    if (!match) {
      throw new ReactionParseError(
        `Species "${raw}": charge after "^" must be an optional integer of at most 2 digits ` +
          `with a sign, e.g. "^2-", "^+2", "^+" or "^-"`,
      );
    }
    if (body.length === 0) {
      throw new ReactionParseError(`Species "${raw}": charge marker without a formula`);
    }
    const magnitudeDigits = match[1] !== undefined ? match[2] : match[3];
    const signSymbol = (match[1] !== undefined ? match[1] : match[4])!;
    const magnitude =
      magnitudeDigits === undefined || magnitudeDigits === ""
        ? 1
        : Number.parseInt(magnitudeDigits, 10);
    if (magnitude < 1 || magnitude > MAX_CHARGE) {
      throw new ReactionParseError(
        `Species "${raw}": charge magnitude must be an integer between 1 and ${MAX_CHARGE}`,
      );
    }
    const charge = signSymbol === "+" ? magnitude : -magnitude;
    const { atoms } = parseFormula(body);
    return Object.freeze({ atoms, charge, formula: body });
  }

  if (/\d+[+-]$/.test(raw)) {
    throw new ReactionParseError(
      `Species "${raw}": charge notation "<digits><sign>" is ambiguous with formula subscripts. ` +
        `Write the charge as sign-then-magnitude (e.g. "Fe+3", "SO4-2") or with a caret (e.g. "Fe^3+", "SO4^2-")`,
    );
  }

  const signFirst = /([+-])(\d{0,2})$/.exec(raw);
  if (signFirst) {
    const [matched, signSymbol, magnitudeDigits] = signFirst as unknown as [string, string, string];
    const body = raw.slice(0, raw.length - matched.length).trim();
    if (body.length === 0) {
      throw new ReactionParseError(`Species "${raw}": charge sign without a formula`);
    }
    const magnitude = magnitudeDigits === "" ? 1 : Number.parseInt(magnitudeDigits, 10);
    if (magnitude < 1 || magnitude > MAX_CHARGE) {
      throw new ReactionParseError(
        `Species "${raw}": charge magnitude must be an integer between 1 and ${MAX_CHARGE}`,
      );
    }
    const charge = signSymbol === "+" ? magnitude : -magnitude;
    const { atoms } = parseFormula(body);
    return Object.freeze({ atoms, charge, formula: body });
  }

  const { atoms } = parseFormula(raw);
  return Object.freeze({ atoms, charge: 0, formula: raw });
}

const REACTION_SPLIT = /\s*(?:->|→)\s*/;
const LEADING_COEFFICIENT = /^(\d+(?:\.\d+)?|\.\d+)\s*/;

/** Parses a full reaction equation. Coefficients are optional and must be positive. */
export function parseReaction(input: unknown): ParsedReaction {
  const raw = requireTrimmed(input, "Reaction");
  const sides = raw.split(REACTION_SPLIT);
  if (sides.length !== 2) {
    throw new ReactionParseError(
      `Reaction "${raw}": expected exactly one "->" or "→" separator between reactants and products`,
    );
  }
  const reactants = parseSide(sides[0]!, "reactants", raw);
  const products = parseSide(sides[1]!, "products", raw);
  if (reactants.length === 0 || products.length === 0) {
    throw new ReactionParseError(`Reaction "${raw}": both sides must contain at least one species`);
  }
  const equation = formatReaction(reactants, products);
  return Object.freeze({
    reactants: Object.freeze(reactants),
    products: Object.freeze(products),
    equation,
  });
}

/**
 * Splits a reaction side into species tokens without breaking charge signs.
 * A '+' terminates a species only when it appears right after the charge
 * suffix position has been passed; species are matched greedily and the
 * separator '+' is expected between them. This avoids splitting inside
 * charged species such as "Fe+3", "NH4+" or "SO4-2".
 */
function splitSpeciesTokens(side: string, whole: string): string[] {
  const FORMULA_CHARS = new Set(
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789()[]{}.·⋅".split(""),
  );
  const isDigit = (char: string): boolean => char >= "0" && char <= "9";
  const tokens: string[] = [];
  let pos = 0;
  let expectSpecies = false;

  while (true) {
    while (pos < side.length && side[pos] === " ") pos += 1;
    if (pos >= side.length) break;
    expectSpecies = false;
    const tokenStart = pos;

    // Optional leading coefficient.
    const coefficientMatch = /^\d+(?:\.\d+)?/.exec(side.slice(pos));
    if (coefficientMatch) {
      pos += coefficientMatch[0].length;
      while (pos < side.length && side[pos] === " ") pos += 1;
    }

    // Formula body: maximal run of formula characters.
    const bodyStart = pos;
    while (pos < side.length && FORMULA_CHARS.has(side[pos]!)) pos += 1;
    if (pos === bodyStart) {
      throw new ReactionParseError(
        `Reaction "${whole}": expected a species near "${side.slice(pos, pos + 16)}"`,
      );
    }

    // Optional charge suffix.
    const chargeChar = side[pos];
    if (chargeChar === "^") {
      pos += 1;
      const chargeStart = pos;
      while (pos < side.length && /[0-9+-]/.test(side[pos]!)) pos += 1;
      if (pos === chargeStart) {
        throw new ReactionParseError(`Reaction "${whole}": "^" is not followed by a charge`);
      }
    } else if (chargeChar === "+" || chargeChar === "-") {
      pos += 1;
      let digits = 0;
      while (pos < side.length && isDigit(side[pos]!) && digits < 2) {
        pos += 1;
        digits += 1;
      }
    }

    tokens.push(side.slice(tokenStart, pos).trim());

    while (pos < side.length && side[pos] === " ") pos += 1;
    if (pos >= side.length) break;
    if (side[pos] === "+") {
      pos += 1;
      expectSpecies = true;
      continue;
    }
    throw new ReactionParseError(
      `Reaction "${whole}": unexpected "${side[pos]}" after species "${tokens[tokens.length - 1]}"; species must be separated by "+"`,
    );
  }
  if (expectSpecies) {
    throw new ReactionParseError(`Reaction "${whole}": trailing "+" without a following species`);
  }
  return tokens;
}

function parseSide(side: string, label: string, whole: string): ReactionSpecies[] {
  const tokens = splitSpeciesTokens(side, whole);
  if (tokens.length === 0 || tokens.some((token) => token.length === 0)) {
    throw new ReactionParseError(`Reaction "${whole}": empty species in ${label} (stray "+"?)`);
  }
  return tokens.map((token) => parseReactionSpecies(token, whole));
}

function parseReactionSpecies(token: string, whole: string): ReactionSpecies {
  const coefficientMatch = LEADING_COEFFICIENT.exec(token);
  let coefficient = 1;
  let rest = token;
  if (coefficientMatch) {
    const coefficientText = coefficientMatch[0].trim();
    coefficient = Number.parseFloat(coefficientText);
    if (!Number.isFinite(coefficient) || coefficient <= 0 || coefficient > MAX_COEFFICIENT) {
      throw new ReactionParseError(
        `Reaction "${whole}": coefficient "${coefficientText}" must be a positive finite number not exceeding ${MAX_COEFFICIENT}`,
      );
    }
    rest = token.slice(coefficientMatch[0].length).trim();
    if (rest.length === 0) {
      throw new ReactionParseError(`Reaction "${whole}": coefficient without a species`);
    }
  }
  const species = parseSpecies(rest);
  return Object.freeze({ ...species, coefficient });
}

/** True when every coefficient is exactly 1 (i.e. unbalanced input with implicit coefficients). */
export function hasImplicitCoefficients(reaction: ParsedReaction): boolean {
  return [...reaction.reactants, ...reaction.products].every((s) => s.coefficient === 1);
}

/** Renders a parsed reaction back to canonical single-line form. */
export function formatReaction(
  reactants: readonly ReactionSpecies[],
  products: readonly ReactionSpecies[],
): string {
  const render = (species: ReactionSpecies): string => {
    const base = species.coefficient === 1 ? "" : `${species.coefficient} `;
    return `${base}${formatSpecies(species)}`;
  };
  return `${reactants.map(render).join(" + ")} -> ${products.map(render).join(" + ")}`;
}

/** Canonical species rendering: formula plus "^{n+}" style charge when charged. */
export function formatSpecies(species: ChemicalSpecies): string {
  if (species.charge === 0) return species.formula;
  const magnitude = Math.abs(species.charge);
  const sign = species.charge > 0 ? "+" : "-";
  const digits = magnitude === 1 ? "" : String(magnitude);
  return `${species.formula}^${digits}${sign}`;
}

/**
 * Computes atom totals and charge totals for both sides.
 * Pure analysis — does not throw for an unbalanced (but well-formed) reaction.
 */
export function analyzeReaction(input: ParsedReaction): ReactionAnalysis {
  const totals = (speciesList: readonly ReactionSpecies[]): Record<string, number> => {
    const acc = new Map<string, number>();
    for (const species of speciesList) {
      for (const [symbol, count] of Object.entries(species.atoms)) {
        acc.set(symbol, (acc.get(symbol) ?? 0) + count * species.coefficient);
      }
    }
    const record: Record<string, number> = {};
    for (const [symbol, count] of acc) record[symbol] = count;
    return Object.freeze(record);
  };
  const chargeOf = (speciesList: readonly ReactionSpecies[]): number =>
    speciesList.reduce((sum, species) => sum + species.charge * species.coefficient, 0);

  const reactantAtoms = totals(input.reactants);
  const productAtoms = totals(input.products);
  const allElements = new Set([...Object.keys(reactantAtoms), ...Object.keys(productAtoms)]);
  const unbalancedElements = [...allElements]
    .filter((symbol) => (reactantAtoms[symbol] ?? 0) !== (productAtoms[symbol] ?? 0))
    .sort();
  const reactantCharge = chargeOf(input.reactants);
  const productCharge = chargeOf(input.products);
  const atomBalanced = unbalancedElements.length === 0;
  const chargeBalanced = reactantCharge === productCharge;
  return Object.freeze({
    reactantAtoms,
    productAtoms,
    unbalancedElements: Object.freeze(unbalancedElements),
    atomBalanced,
    reactantCharge,
    productCharge,
    chargeBalanced,
    balanced: atomBalanced && chargeBalanced,
  });
}

/** Parses and analyzes a reaction string in one step. */
export function validateReaction(input: unknown): ReactionAnalysis {
  return analyzeReaction(parseReaction(input));
}

// ---------------------------------------------------------------------------
// Exact rational arithmetic for balancing (BigInt-backed)
// ---------------------------------------------------------------------------

class Fraction {
  readonly num: bigint;
  readonly den: bigint;

  private constructor(num: bigint, den: bigint) {
    this.num = num;
    this.den = den;
  }

  static of(numerator: bigint | number, denominator: bigint | number = 1n): Fraction {
    let n = typeof numerator === "bigint" ? numerator : BigInt(numerator);
    let d = typeof denominator === "bigint" ? denominator : BigInt(denominator);
    if (d === 0n) throw new Error("Fraction with zero denominator");
    if (n === 0n) return new Fraction(0n, 1n);
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    const g = gcdBigInt(absBigInt(n), d);
    return new Fraction(n / g, d / g);
  }

  isZero(): boolean {
    return this.num === 0n;
  }

  add(other: Fraction): Fraction {
    return Fraction.of(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  subtract(other: Fraction): Fraction {
    return Fraction.of(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  multiply(other: Fraction): Fraction {
    return Fraction.of(this.num * other.num, this.den * other.den);
  }

  divide(other: Fraction): Fraction {
    if (other.isZero()) throw new Error("Division by zero fraction");
    return Fraction.of(this.num * other.den, this.den * other.num);
  }

  negate(): Fraction {
    return new Fraction(-this.num, this.den);
  }
}

function absBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}

function gcdBigInt(a: bigint, b: bigint): bigint {
  let x = a;
  let y = b;
  while (y !== 0n) {
    const r = x % y;
    x = y;
    y = r;
  }
  return x === 0n ? 1n : x;
}

function lcmBigInt(a: bigint, b: bigint): bigint {
  return (a / gcdBigInt(a, b)) * b;
}

interface BalanceSolution {
  readonly coefficients: readonly bigint[];
}

/**
 * Solves for positive integer stoichiometric multipliers.
 * Matrix columns are species (reactants then products); rows are distinct
 * elements plus one charge row (only when at least one species is charged).
 * Reactant columns carry their atom counts, product columns their counts
 * negated, so a solution vector k satisfies:
 *   sum(k_reactant × atoms) − sum(k_product × atoms) = 0  (per element)
 *   sum(k_reactant × charge) − sum(k_product × charge) = 0  (when charged)
 */
function solveBalance(species: readonly ChemicalSpecies[], reactantCount: number): BalanceSolution {
  const elementSymbols = new Set<string>();
  for (const s of species) {
    for (const symbol of Object.keys(s.atoms)) elementSymbols.add(symbol);
  }
  const rows: Fraction[][] = [];
  for (const symbol of [...elementSymbols].sort()) {
    rows.push(
      species.map((s, index) => {
        const count = Fraction.of(BigInt(s.atoms[symbol] ?? 0));
        return index < reactantCount ? count : count.negate();
      }),
    );
  }
  if (species.some((s) => s.charge !== 0)) {
    rows.push(
      species.map((s, index) => {
        const charge = Fraction.of(BigInt(s.charge));
        return index < reactantCount ? charge : charge.negate();
      }),
    );
  }
  const nullVector = uniqueNullspaceVector(rows, species.length);
  return { coefficients: nullVector };
}

/**
 * Finds the 1-dimensional nullspace of `rows` (an m×n matrix over rationals)
 * and returns lowest-terms positive integer coefficients of the solution, or
 * throws BalanceNotUniqueError when the nullity is not exactly 1 or the
 * solution is not strictly one-signed.
 */
function uniqueNullspaceVector(rows: Fraction[][], columnCount: number): bigint[] {
  const matrix = rows.map((row) => [...row]);
  const rowCount = matrix.length;
  const pivotColumnOfRow: number[] = [];
  const freeColumns: number[] = [];
  let pivotRow = 0;

  for (let column = 0; column < columnCount && pivotRow < rowCount; column += 1) {
    let pivot = -1;
    for (let row = pivotRow; row < rowCount; row += 1) {
      if (!matrix[row]![column]!.isZero()) {
        pivot = row;
        break;
      }
    }
    if (pivot === -1) continue;
    [matrix[pivotRow], matrix[pivot]] = [matrix[pivot]!, matrix[pivotRow]!];
    const pivotValue = matrix[pivotRow]![column]!;
    for (let j = 0; j < columnCount; j += 1) {
      matrix[pivotRow]![j] = matrix[pivotRow]![j]!.divide(pivotValue);
    }
    for (let row = 0; row < rowCount; row += 1) {
      if (row === pivotRow) continue;
      const factor = matrix[row]![column]!;
      if (factor.isZero()) continue;
      for (let j = 0; j < columnCount; j += 1) {
        matrix[row]![j] = matrix[row]![j]!.subtract(factor.multiply(matrix[pivotRow]![j]!));
      }
    }
    pivotColumnOfRow.push(column);
    pivotRow += 1;
  }

  const isPivot = new Set(pivotColumnOfRow);
  for (let column = 0; column < columnCount; column += 1) {
    if (!isPivot.has(column)) freeColumns.push(column);
  }

  if (freeColumns.length === 0) {
    throw new BalanceNotUniqueError(
      "no non-trivial nullspace; the only exact solution is the trivial (all-zero) coefficient set — check that every element appears on both sides",
    );
  }
  if (freeColumns.length > 1) {
    throw new BalanceNotUniqueError(
      `the system is underdetermined (${freeColumns.length} free variables); the reaction cannot be auto-balanced uniquely`,
    );
  }

  const freeColumn = freeColumns[0]!;
  // Set the free variable to 1 and solve  x_pivot = -R[pivot][free].
  const solution: Fraction[] = new Array(columnCount).fill(Fraction.of(0n));
  solution[freeColumn] = Fraction.of(1n);
  for (let row = 0; row < pivotColumnOfRow.length; row += 1) {
    const column = pivotColumnOfRow[row]!;
    solution[column] = matrix[row]![freeColumn]!.negate();
  }

  // Check strict one-signedness and non-zeroness.
  const signs = solution.map((entry): 0 | 1 | -1 => (entry.isZero() ? 0 : entry.num > 0n ? 1 : -1));
  if (signs.some((sign) => sign === 0)) {
    throw new BalanceNotUniqueError(
      "at least one species would receive a zero coefficient; it does not participate in any balance",
    );
  }
  const allPositive = signs.every((sign) => sign === 1);
  const allNegative = signs.every((sign) => sign === -1);
  if (allNegative) {
    for (let index = 0; index < solution.length; index += 1) {
      solution[index] = solution[index]!.negate();
    }
  } else if (!allPositive) {
    throw new BalanceNotUniqueError(
      "the nullspace solution assigns mixed signs to species; no all-positive balance exists for this equation as written",
    );
  }

  // Scale to lowest-terms positive integers.
  let denominatorLcm = 1n;
  for (const entry of solution) {
    denominatorLcm = lcmBigInt(denominatorLcm, entry.den);
  }
  const numerators = solution.map((entry) => entry.num * (denominatorLcm / entry.den));
  let numeratorGcd = absBigInt(numerators[0]!);
  for (const numerator of numerators) {
    numeratorGcd = gcdBigInt(numeratorGcd, absBigInt(numerator));
  }
  const integerCoefficients = numerators.map((numerator) => numerator / numeratorGcd);
  return integerCoefficients;
}

/**
 * Attempts to balance a reaction equation exactly.
 *
 * Input coefficients are IGNORED: the canonical lowest-terms positive integer
 * balance is returned, preserving species order. Throws ReactionParseError
 * for malformed input and BalanceNotUniqueError when no unique positive
 * integer solution exists. A successful result is verified against atom and
 * charge balance before being returned.
 */
export function balanceReaction(input: unknown): ParsedReaction {
  const parsed = parseReaction(input);
  const species = [...parsed.reactants, ...parsed.products];
  const { coefficients } = solveBalance(species, parsed.reactants.length);
  const scale = (side: readonly ReactionSpecies[], offset: number): ReactionSpecies[] =>
    side.map((s, index) =>
      Object.freeze({ ...s, coefficient: Number(coefficients[offset + index]!) }),
    );
  const reactants = scale(parsed.reactants, 0);
  const products = scale(parsed.products, parsed.reactants.length);
  const balanced = Object.freeze({
    reactants: Object.freeze(reactants),
    products: Object.freeze(products),
    equation: formatReaction(reactants, products),
  });
  const analysis = analyzeReaction(balanced);
  if (!analysis.balanced) {
    // Defensive: exact rational arithmetic should never land here.
    throw new BalanceNotUniqueError("internal verification of the balanced equation failed");
  }
  return balanced;
}

/**
 * Asserts that a parsed reaction is atom- and charge-balanced, otherwise
 * throws ReactionNotBalancedError. Stoichiometric models call this before
 * using coefficients quantitatively.
 */
export function assertBalanced(reaction: ParsedReaction): ReactionAnalysis {
  const analysis = analyzeReaction(reaction);
  if (!analysis.balanced) {
    const details: string[] = [];
    if (!analysis.atomBalanced) {
      details.push(`unbalanced elements: ${analysis.unbalancedElements.join(", ")}`);
    }
    if (!analysis.chargeBalanced) {
      details.push(
        `charge mismatch: reactants ${analysis.reactantCharge}, products ${analysis.productCharge}`,
      );
    }
    throw new ReactionNotBalancedError(details.join("; "));
  }
  return analysis;
}

/** Convenience: parse (balancing not performed) and assert balance in one step. */
export function requireBalancedReaction(input: unknown): ParsedReaction {
  const parsed = parseReaction(input);
  assertBalanced(parsed);
  return parsed;
}
