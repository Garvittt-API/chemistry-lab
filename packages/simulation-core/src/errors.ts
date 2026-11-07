/**
 * Error taxonomy for the scientific simulation core.
 *
 * Every failure raised by the engine is a `SimulationError` (or a subclass)
 * carrying a stable, machine-readable `code`. Raw `Error`/`TypeError`
 * instances must never escape the package boundary. Callers outside this
 * package can branch on `error.code` instead of parsing messages.
 */

export const SIMULATION_ERROR_CODES = [
  /** A supplied value is not a finite number, or not a number at all. */
  "NON_FINITE_INPUT",
  /** A supplied value is outside the mathematically or physically permitted domain. */
  "DOMAIN_ERROR",
  /** A unit identifier is not registered in the unit system. */
  "UNKNOWN_UNIT",
  /** A conversion or addition was attempted across incompatible dimensions. */
  "DIMENSION_MISMATCH",
  /** A required ordering (e.g. min <= max) was violated. */
  "INVALID_RANGE",
  /** A chemical formula could not be parsed. */
  "FORMULA_PARSE_ERROR",
  /** A reaction equation could not be parsed. */
  "REACTION_PARSE_ERROR",
  /** A constant identifier is not registered in the constants registry. */
  "UNKNOWN_CONSTANT",
  /** An element symbol is not registered in the element registry. */
  "UNKNOWN_ELEMENT",
  /** Stoichiometric work was requested on an unbalanced reaction. */
  "REACTION_NOT_BALANCED",
  /** The balancing solver found no unique positive integer solution. */
  "BALANCE_NOT_UNIQUE",
  /** A model registry lookup failed. */
  "UNKNOWN_MODEL",
] as const;

export type SimulationErrorCode = (typeof SIMULATION_ERROR_CODES)[number];

export class SimulationError extends Error {
  readonly code: SimulationErrorCode;

  constructor(code: SimulationErrorCode, message: string) {
    super(message);
    this.name = "SimulationError";
    this.code = code;
  }
}

/** Thrown when a number argument is NaN, infinite or not of type number. */
export class NonFiniteInputError extends SimulationError {
  constructor(name: string, value: unknown) {
    super(
      "NON_FINITE_INPUT",
      `${name} must be a finite number; received ${
        typeof value === "number" ? String(value) : `${typeof value} (${String(value)})`
      }`,
    );
    this.name = "NonFiniteInputError";
  }
}

/** Thrown when a value is finite but outside the permitted mathematical domain. */
export class DomainError extends SimulationError {
  constructor(message: string) {
    super("DOMAIN_ERROR", message);
    this.name = "DomainError";
  }
}

/** Thrown for an unregistered unit identifier. */
export class UnknownUnitError extends SimulationError {
  constructor(unitId: string) {
    super("UNKNOWN_UNIT", `Unknown unit identifier: "${unitId}"`);
    this.name = "UnknownUnitError";
  }
}

/**
 * Thrown when an operation mixes incompatible dimensions. This is the
 * enforcement point that prevents silent garbage such as converting grams to
 * litres or adding pascals to joules.
 */
export class DimensionMismatchError extends SimulationError {
  constructor(message: string) {
    super("DIMENSION_MISMATCH", message);
    this.name = "DimensionMismatchError";
  }
}

/** Thrown when a range argument is inconsistent (e.g. min > max). */
export class InvalidRangeError extends SimulationError {
  constructor(message: string) {
    super("INVALID_RANGE", message);
    this.name = "InvalidRangeError";
  }
}

/** Thrown when a chemical formula cannot be parsed. */
export class FormulaParseError extends SimulationError {
  constructor(message: string) {
    super("FORMULA_PARSE_ERROR", message);
    this.name = "FormulaParseError";
  }
}

/** Thrown when a reaction equation cannot be parsed. */
export class ReactionParseError extends SimulationError {
  constructor(message: string) {
    super("REACTION_PARSE_ERROR", message);
    this.name = "ReactionParseError";
  }
}

/** Thrown for an unregistered constant identifier. */
export class UnknownConstantError extends SimulationError {
  constructor(constantId: string) {
    super("UNKNOWN_CONSTANT", `Unknown constant identifier: "${constantId}"`);
    this.name = "UnknownConstantError";
  }
}

/** Thrown for an element symbol that has no usable atomic weight. */
export class UnknownElementError extends SimulationError {
  constructor(symbol: string, detail?: string) {
    super(
      "UNKNOWN_ELEMENT",
      detail === undefined
        ? `Element "${symbol}" is not registered or has no standard atomic weight`
        : `Element "${symbol}" is not usable: ${detail}`,
    );
    this.name = "UnknownElementError";
  }
}

/** Thrown when stoichiometric work is requested for an unbalanced reaction. */
export class ReactionNotBalancedError extends SimulationError {
  constructor(detail: string) {
    super("REACTION_NOT_BALANCED", `Stoichiometry requires a balanced reaction: ${detail}`);
    this.name = "ReactionNotBalancedError";
  }
}

/** Thrown when the balancing solver cannot find a unique positive solution. */
export class BalanceNotUniqueError extends SimulationError {
  constructor(detail: string) {
    super("BALANCE_NOT_UNIQUE", `Reaction cannot be auto-balanced uniquely: ${detail}`);
    this.name = "BalanceNotUniqueError";
  }
}
