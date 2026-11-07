/**
 * Formula parsing and molar mass computation.
 *
 * Supported grammar (see docs/science/models/molar-mass.md):
 *
 *   formula   := segment ( ('.' | '·') segment )*
 *   segment   := DIGITS? group+
 *   group     := element DIGITS* | '(' group+ ')' DIGITS* | '[' group+ ']' DIGITS* | '{' group+ '}' DIGITS*
 *   element   := [A-Z][a-z]?
 *
 * - Case-sensitive element symbols; unknown symbols are rejected.
 * - Nested parentheses/brackets/braces with integer multipliers are supported
 *   (e.g. "Ca(OH)2", "K4[Fe(CN)6]", "Al2(SO4)3").
 * - Hydrate-style dot separators are supported ("CuSO4·5H2O", "CuSO4.5H2O").
 * - Explicit zero counts are rejected.
 * - Parsing never throws raw exceptions; all failures raise FormulaParseError
 *   with an approximate input position.
 *
 * Atomic weights come from the CIAAW 2021 abridged conventional table
 * (elements.ts). Molar mass is reported in g·mol⁻¹.
 */

import { FormulaParseError } from "./errors.js";
import { getElementBySymbol } from "./elements.js";

const MAX_INPUT_LENGTH = 512;
const MAX_NESTING_DEPTH = 16;

export interface FormulaComposition {
  /** Atom count per element symbol (insertion order = order of appearance). */
  readonly atoms: Readonly<Record<string, number>>;
}

export interface MolarMassBreakdownEntry {
  readonly symbol: string;
  readonly count: number;
  /** CIAAW 2021 atomic weight, g·mol⁻¹. */
  readonly atomicWeight: number;
  /** count × atomicWeight, g·mol⁻¹. */
  readonly massContribution: number;
}

export interface MolarMassResult {
  /** Total molar mass, g·mol⁻¹. */
  readonly molarMass: number;
  readonly breakdown: readonly MolarMassBreakdownEntry[];
}

const ELEMENT_PATTERN = /^[A-Z][a-z]?/;
const DIGITS_PATTERN = /^[0-9]+/;
const HYDRATE_SEPARATORS = new Set([".", "·", "⋅"]);
const OPEN_TO_CLOSE: Readonly<Record<string, string>> = {
  "(": ")",
  "[": "]",
  "{": "}",
};
const CLOSE_TO_OPEN: Readonly<Record<string, string>> = {
  ")": "(",
  "]": "[",
  "}": "{",
};

/**
 * Parses a chemical formula string into an atom-count composition.
 *
 * @throws FormulaParseError on any syntax or semantic problem (unknown
 *   element, unbalanced brackets, zero counts, empty input, excessive depth).
 */
export function parseFormula(input: unknown): FormulaComposition {
  const formula = requireFormulaString(input);
  const totals = new Map<string, number>();

  const segments = splitHydrateSegments(formula);
  for (const segment of segments) {
    const match = DIGITS_PATTERN.exec(segment);
    let multiplier = 1;
    let body = segment;
    if (match) {
      multiplier = parseCount(match[0], formula, 0);
      body = segment.slice(match[0].length);
      if (!body) {
        throw new FormulaParseError(
          `Formula "${formula}": hydrate multiplier "${match[0]}" is not followed by a formula`,
        );
      }
    }
    const local = new Map<string, number>();
    parseGroup(body, 0, formula, local, 0);
    for (const [symbol, count] of local) {
      totals.set(symbol, (totals.get(symbol) ?? 0) + count * multiplier);
    }
  }

  if (totals.size === 0) {
    throw new FormulaParseError(`Formula "${formula}" contains no elements`);
  }
  const atoms: Record<string, number> = {};
  for (const [symbol, count] of totals) {
    atoms[symbol] = count;
  }
  return Object.freeze({ atoms: Object.freeze(atoms) });
}

function requireFormulaString(input: unknown): string {
  if (typeof input !== "string") {
    throw new FormulaParseError(`Chemical formula must be a string; received ${typeof input}`);
  }
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new FormulaParseError("Chemical formula must not be empty");
  }
  if (trimmed.length > MAX_INPUT_LENGTH) {
    throw new FormulaParseError(`Chemical formula exceeds ${MAX_INPUT_LENGTH} characters`);
  }
  return trimmed;
}

function splitHydrateSegments(formula: string): string[] {
  const segments: string[] = [];
  let depth = 0;
  let current = "";
  for (const char of formula) {
    if (char in OPEN_TO_CLOSE) depth += 1;
    else if (char in CLOSE_TO_OPEN) depth -= 1;
    if (HYDRATE_SEPARATORS.has(char) && depth === 0) {
      if (current.trim().length === 0) {
        throw new FormulaParseError(`Formula "${formula}": empty segment around "${char}"`);
      }
      segments.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim().length === 0) {
    throw new FormulaParseError(`Formula "${formula}": trailing hydrate separator`);
  }
  segments.push(current.trim());
  return segments;
}

function parseCount(digits: string, formula: string, position: number): number {
  const count = Number.parseInt(digits, 10);
  if (!Number.isSafeInteger(count) || count < 1) {
    throw new FormulaParseError(
      `Formula "${formula}": counts and multipliers must be positive integers (at position ${position})`,
    );
  }
  return count;
}

/**
 * Parses a bracketed-or-flat group starting at `start` and adds element counts
 * into `accumulator`. Returns the index just past the group.
 */
function parseGroup(
  source: string,
  start: number,
  formula: string,
  accumulator: Map<string, number>,
  depth: number,
): number {
  if (depth > MAX_NESTING_DEPTH) {
    throw new FormulaParseError(
      `Formula "${formula}": nesting deeper than ${MAX_NESTING_DEPTH} levels`,
    );
  }
  let i = start;
  let consumedAny = false;
  while (i < source.length) {
    const rest = source.slice(i);
    const char = source[i]!;

    const open = OPEN_TO_CLOSE[char];
    if (open !== undefined) {
      const inner = new Map<string, number>();
      const endIndex = consumeBalancedBracket(source, i, formula);
      const innerSource = source.slice(i + 1, endIndex);
      parseGroup(innerSource, 0, formula, inner, depth + 1);
      const countStart = endIndex + 1;
      const digitsMatch = DIGITS_PATTERN.exec(source.slice(countStart));
      let multiplier = 1;
      if (digitsMatch) {
        multiplier = parseCount(digitsMatch[0], formula, countStart);
        i = countStart + digitsMatch[0].length;
      } else {
        i = countStart;
      }
      for (const [symbol, count] of inner) {
        accumulator.set(symbol, (accumulator.get(symbol) ?? 0) + count * multiplier);
      }
      consumedAny = true;
      continue;
    }

    if (char in CLOSE_TO_OPEN) {
      throw new FormulaParseError(
        `Formula "${formula}": unexpected closing bracket "${char}" at position ${i}`,
      );
    }

    const elementMatch = ELEMENT_PATTERN.exec(rest);
    if (elementMatch) {
      const symbol = elementMatch[0];
      // Validates existence; throws UnknownElementError (a SimulationError) otherwise.
      getElementBySymbol(symbol);
      const digitsMatch = DIGITS_PATTERN.exec(rest.slice(symbol.length));
      const count = digitsMatch ? parseCount(digitsMatch[0], formula, i + symbol.length) : 1;
      accumulator.set(symbol, (accumulator.get(symbol) ?? 0) + count);
      i += symbol.length + (digitsMatch ? digitsMatch[0].length : 0);
      consumedAny = true;
      continue;
    }

    if (HYDRATE_SEPARATORS.has(char)) {
      throw new FormulaParseError(
        `Formula "${formula}": stray hydrate separator "${char}" in group`,
      );
    }

    throw new FormulaParseError(
      `Formula "${formula}": unexpected character "${char}" at position ${i}`,
    );
  }
  if (!consumedAny) {
    throw new FormulaParseError(`Formula "${formula}": empty group`);
  }
  return i;
}

/** Returns the index of the bracket matching source[start]. */
function consumeBalancedBracket(source: string, start: number, formula: string): number {
  const expectedClose = OPEN_TO_CLOSE[source[start]!]!;
  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    const char = source[i]!;
    if (char in OPEN_TO_CLOSE) depth += 1;
    if (char in CLOSE_TO_OPEN) {
      depth -= 1;
      if (depth === 0) {
        if (char !== expectedClose) {
          throw new FormulaParseError(
            `Formula "${formula}": mismatched bracket "${char}" at position ${i}; expected "${expectedClose}"`,
          );
        }
        return i;
      }
    }
  }
  throw new FormulaParseError(
    `Formula "${formula}": unclosed "${source[start]}" at position ${start}`,
  );
}

/**
 * Computes the molar mass of a formula in g·mol⁻¹ (double precision).
 *
 * @throws FormulaParseError if the formula cannot be parsed.
 * @throws UnknownElementError if an element is not in the CIAAW 2021 registry.
 */
export function molarMass(input: string): number {
  return molarMassBreakdown(input).molarMass;
}

/** Computes the molar mass together with a per-element contribution breakdown. */
export function molarMassBreakdown(input: string): MolarMassResult {
  const { atoms } = parseFormula(input);
  const breakdown: MolarMassBreakdownEntry[] = [];
  let total = 0;
  for (const [symbol, count] of Object.entries(atoms)) {
    const element = getElementBySymbol(symbol);
    const massContribution = count * element.standardAtomicWeight;
    breakdown.push({
      symbol,
      count,
      atomicWeight: element.standardAtomicWeight,
      massContribution,
    });
    total += massContribution;
  }
  return Object.freeze({ molarMass: total, breakdown: Object.freeze(breakdown) });
}
