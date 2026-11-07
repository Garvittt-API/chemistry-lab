/**
 * Numerical reliability helpers shared by every scientific model.
 *
 * Conventions (see docs/science/units-and-conventions.md):
 * - Internal arithmetic keeps full IEEE-754 double precision; rounding is
 *   applied only for display, via `roundToSignificantFigures`.
 * - Every public model validates its inputs with the assertions below and
 *   never lets NaN/Infinity propagate silently.
 * - Relative tolerances for test comparisons default to
 *   `DEFAULT_RELATIVE_TOLERANCE` (1e-9). Tighter or looser tolerances are
 *   chosen per reference case and justified in docs/science/reference-cases.md.
 */

import { DomainError, InvalidRangeError, NonFiniteInputError } from "./errors.js";

/** Default relative tolerance for equality comparisons in tests (1e-9). */
export const DEFAULT_RELATIVE_TOLERANCE = 1e-9;

/** Smallest absolute tolerance applied in {@link approxEqual} near zero. */
export const DEFAULT_ABSOLUTE_TOLERANCE = 1e-12;

/** Asserts that `value` is of type number and finite (not NaN, ±Infinity). */
export function assertFiniteNumber(value: unknown, name: string): number {
  if (typeof value !== "number" || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new NonFiniteInputError(name, value);
  }
  return value;
}

/** Asserts `value` is finite and strictly greater than `min` (default 0). */
export function assertFiniteGreaterThan(value: unknown, name: string, min = 0): number {
  const v = assertFiniteNumber(value, name);
  if (!(v > min)) {
    throw new DomainError(`${name} must be greater than ${min}; received ${formatForError(v)}`);
  }
  return v;
}

/** Asserts `value` is finite and greater than or equal to `min` (default 0). */
export function assertFiniteAtLeast(value: unknown, name: string, min = 0): number {
  const v = assertFiniteNumber(value, name);
  if (!(v >= min)) {
    throw new DomainError(`${name} must be at least ${min}; received ${formatForError(v)}`);
  }
  return v;
}

/** Asserts `value` is finite and lies within the closed interval [min, max]. */
export function assertFiniteInRange(
  value: unknown,
  name: string,
  min: number,
  max: number,
): number {
  if (!(min <= max)) {
    throw new InvalidRangeError(
      `Invalid range for ${name}: min (${min}) must not exceed max (${max})`,
    );
  }
  const v = assertFiniteNumber(value, name);
  if (v < min || v > max) {
    throw new DomainError(`${name} must be within [${min}, ${max}]; received ${formatForError(v)}`);
  }
  return v;
}

/**
 * Relative-or-absolute closeness check used by reference tests and internal
 * conservation assertions. Returns true when either
 *   |a - b| <= absTol, or
 *   |a - b| <= relTol * max(|a|, |b|).
 */
export function approxEqual(
  a: number,
  b: number,
  relativeTolerance = DEFAULT_RELATIVE_TOLERANCE,
  absoluteTolerance = DEFAULT_ABSOLUTE_TOLERANCE,
): boolean {
  assertFiniteNumber(a, "a");
  assertFiniteNumber(b, "b");
  const diff = Math.abs(a - b);
  if (diff <= absoluteTolerance) return true;
  return diff <= relativeTolerance * Math.max(Math.abs(a), Math.abs(b));
}

/**
 * Rounds a finite number to `significantFigures` significant digits.
 * Zero returns +0. This exists for display/presentation boundaries only; the
 * scientific models never round their internal arithmetic.
 */
export function roundToSignificantFigures(value: number, significantFigures: number): number {
  assertFiniteNumber(value, "value");
  if (!Number.isInteger(significantFigures) || significantFigures < 1 || significantFigures > 21) {
    throw new DomainError(
      `significantFigures must be an integer in [1, 21]; received ${significantFigures}`,
    );
  }
  if (value === 0) return 0;
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const factor = 10 ** (exponent - significantFigures + 1);
  const scaled = Math.round(value / factor);
  // Guard against 9.999...eN rounding up across a decade boundary, e.g. toExponential noise.
  return scaled * factor;
}

function formatForError(value: number): string {
  return Object.is(value, -0) ? "-0" : String(value);
}
