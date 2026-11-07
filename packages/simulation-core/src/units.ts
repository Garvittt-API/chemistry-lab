/**
 * Deterministic, dependency-free unit system for the scientific engine.
 *
 * Every registered unit maps a value to the coherent SI base unit through a
 * factor and an optional affine offset:
 *
 *     base = value * factor + offset
 *
 * The offset is non-zero only for temperature scales (degree Celsius, degree
 * Fahrenheit, degree Rankine). Conversions are permitted ONLY between units
 * whose dimension vectors are identical; anything else raises
 * {@link DimensionMismatchError}. There is no path that silently converts
 * incompatible dimensions.
 *
 * Unit identifiers are stable ASCII slugs (`"mol/L"` becomes `"mol_per_l"`);
 * display symbols may carry Unicode.
 *
 * This module is pure and deterministic: no randomness, no clocks, no locale
 * dependence.
 */

import { DimensionMismatchError, UnknownUnitError } from "./errors.js";
import { assertFiniteNumber } from "./numerics.js";

/** Exponents of the seven SI base dimensions (ISQ / ISO 80000-1). */
export interface DimensionVector {
  readonly length: number;
  readonly mass: number;
  readonly time: number;
  readonly current: number;
  readonly amountOfSubstance: number;
  readonly temperature: number;
  readonly luminousIntensity: number;
}

const DIM = Object.freeze({
  dimensionless: Object.freeze({
    length: 0,
    mass: 0,
    time: 0,
    current: 0,
    amountOfSubstance: 0,
    temperature: 0,
    luminousIntensity: 0,
  }),
  length: { ...zeroDim(), length: 1 },
  mass: { ...zeroDim(), mass: 1 },
  time: { ...zeroDim(), time: 1 },
  current: { ...zeroDim(), current: 1 },
  amount: { ...zeroDim(), amountOfSubstance: 1 },
  temperature: { ...zeroDim(), temperature: 1 },
  luminousIntensity: { ...zeroDim(), luminousIntensity: 1 },
  volume: { ...zeroDim(), length: 3 },
  molarMass: { ...zeroDim(), mass: 1, amountOfSubstance: -1 },
  pressure: { ...zeroDim(), mass: 1, length: -1, time: -2 },
  energy: { ...zeroDim(), mass: 1, length: 2, time: -2 },
  amountConcentration: { ...zeroDim(), amountOfSubstance: 1, length: -3 },
  massConcentration: { ...zeroDim(), mass: 1, length: -3 },
  molality: { ...zeroDim(), amountOfSubstance: 1, mass: -1 },
} satisfies Record<string, DimensionVector>);

function zeroDim(): DimensionVector {
  return {
    length: 0,
    mass: 0,
    time: 0,
    current: 0,
    amountOfSubstance: 0,
    temperature: 0,
    luminousIntensity: 0,
  };
}

/** Affine offset for the Fahrenheit scale: base = value*(5/9) + offset. */
const FAHRENHEIT_OFFSET = 273.15 - (32 * 5) / 9;

export interface UnitDefinition {
  /** Stable identifier used by the API, e.g. "mol_per_l". */
  readonly id: string;
  /** Display symbol, e.g. "mol/L". */
  readonly symbol: string;
  /** Human-readable name. */
  readonly name: string;
  /** Dimension the unit measures. */
  readonly dimension: DimensionVector;
  /** Multiplicative factor to the coherent SI base unit. */
  readonly factor: number;
  /** Additive offset applied AFTER the factor (non-zero only for temperature). */
  readonly offset: number;
  /** Grouping used in documentation and pickers. */
  readonly category:
    | "si-base"
    | "length"
    | "mass"
    | "time"
    | "current"
    | "amount-of-substance"
    | "temperature"
    | "volume"
    | "molar-mass"
    | "pressure"
    | "energy"
    | "amount-concentration"
    | "mass-concentration"
    | "molality"
    | "dimensionless";
}

function unit(
  id: string,
  symbol: string,
  name: string,
  dimension: DimensionVector,
  factor: number,
  category: UnitDefinition["category"],
  offset = 0,
): UnitDefinition {
  if (!(factor > 0) || !Number.isFinite(factor)) {
    throw new Error(`Internal unit definition error for ${id}: factor must be positive and finite`);
  }
  return Object.freeze({
    id,
    symbol,
    name,
    dimension: Object.freeze(dimension),
    factor,
    offset,
    category,
  });
}

const UNIT_LIST: readonly UnitDefinition[] = Object.freeze([
  // SI base units (factor 1 by definition)
  unit("m", "m", "metre", DIM.length, 1, "si-base"),
  unit("kg", "kg", "kilogram", DIM.mass, 1, "si-base"),
  unit("s", "s", "second", DIM.time, 1, "si-base"),
  unit("A", "A", "ampere", DIM.current, 1, "si-base"),
  unit("mol", "mol", "mole", DIM.amount, 1, "si-base"),
  unit("K", "K", "kelvin", DIM.temperature, 1, "si-base"),
  unit("cd", "cd", "candela", DIM.luminousIntensity, 1, "si-base"),

  // Length
  unit("km", "km", "kilometre", DIM.length, 1000, "length"),
  unit("cm", "cm", "centimetre", DIM.length, 0.01, "length"),
  unit("mm", "mm", "millimetre", DIM.length, 0.001, "length"),
  unit("um", "µm", "micrometre", DIM.length, 1e-6, "length"),
  unit("nm", "nm", "nanometre", DIM.length, 1e-9, "length"),

  // Mass
  unit("t", "t", "tonne", DIM.mass, 1000, "mass"),
  unit("g", "g", "gram", DIM.mass, 1e-3, "mass"),
  unit("mg", "mg", "milligram", DIM.mass, 1e-6, "mass"),
  unit("ug", "µg", "microgram", DIM.mass, 1e-9, "mass"),
  unit("ng", "ng", "nanogram", DIM.mass, 1e-12, "mass"),

  // Time
  unit("ms", "ms", "millisecond", DIM.time, 1e-3, "time"),
  unit("us", "µs", "microsecond", DIM.time, 1e-6, "time"),
  unit("ns", "ns", "nanosecond", DIM.time, 1e-9, "time"),
  unit("min", "min", "minute", DIM.time, 60, "time"),
  unit("h", "h", "hour", DIM.time, 3600, "time"),
  unit("day", "d", "day", DIM.time, 86400, "time"),

  // Electric current
  unit("mA", "mA", "milliampere", DIM.current, 1e-3, "current"),
  unit("kA", "kA", "kiloampere", DIM.current, 1e3, "current"),

  // Amount of substance
  unit("kmol", "kmol", "kilomole", DIM.amount, 1000, "amount-of-substance"),
  unit("mmol", "mmol", "millimole", DIM.amount, 1e-3, "amount-of-substance"),
  unit("umol", "µmol", "micromole", DIM.amount, 1e-6, "amount-of-substance"),
  unit("nmol", "nmol", "nanomole", DIM.amount, 1e-9, "amount-of-substance"),

  // Temperature (affine; factor then offset)
  unit("degC", "°C", "degree Celsius", DIM.temperature, 1, "temperature", 273.15),
  unit("degF", "°F", "degree Fahrenheit", DIM.temperature, 5 / 9, "temperature", FAHRENHEIT_OFFSET),
  unit("degR", "°R", "degree Rankine", DIM.temperature, 5 / 9, "temperature", 0),

  // Volume (length^3). 1 L = 1 dm^3 = 1e-3 m^3 exactly.
  unit("m3", "m³", "cubic metre", DIM.volume, 1, "volume"),
  unit("dm3", "dm³", "cubic decimetre", DIM.volume, 1e-3, "volume"),
  unit("L", "L", "litre", DIM.volume, 1e-3, "volume"),
  unit("dL", "dL", "decilitre", DIM.volume, 1e-4, "volume"),
  unit("mL", "mL", "millilitre", DIM.volume, 1e-6, "volume"),
  unit("cm3", "cm³", "cubic centimetre", DIM.volume, 1e-6, "volume"),
  unit("uL", "µL", "microlitre", DIM.volume, 1e-9, "volume"),
  unit("mm3", "mm³", "cubic millimetre", DIM.volume, 1e-9, "volume"),

  // Molar mass (mass / amount)
  unit("kg_per_mol", "kg/mol", "kilogram per mole", DIM.molarMass, 1, "molar-mass"),
  unit("g_per_mol", "g/mol", "gram per mole", DIM.molarMass, 1e-3, "molar-mass"),

  // Pressure. 1 atm = 101325 Pa (exact); 1 bar = 1e5 Pa (exact);
  // 1 mmHg = 133.322387415 Pa (via 13595.1 kg/m³ and standard gravity);
  // 1 Torr = 101325/760 Pa (exact).
  unit("Pa", "Pa", "pascal", DIM.pressure, 1, "pressure"),
  unit("hPa", "hPa", "hectopascal", DIM.pressure, 1e2, "pressure"),
  unit("mbar", "mbar", "millibar", DIM.pressure, 1e2, "pressure"),
  unit("kPa", "kPa", "kilopascal", DIM.pressure, 1e3, "pressure"),
  unit("MPa", "MPa", "megapascal", DIM.pressure, 1e6, "pressure"),
  unit("bar", "bar", "bar", DIM.pressure, 1e5, "pressure"),
  unit("atm", "atm", "standard atmosphere", DIM.pressure, 101325, "pressure"),
  unit("mmHg", "mmHg", "millimetre of mercury", DIM.pressure, 133.322387415, "pressure"),
  unit("torr", "Torr", "torr", DIM.pressure, 101325 / 760, "pressure"),

  // Energy. Thermochemical calorie is exactly 4.184 J.
  unit("J", "J", "joule", DIM.energy, 1, "energy"),
  unit("kJ", "kJ", "kilojoule", DIM.energy, 1e3, "energy"),
  unit("MJ", "MJ", "megajoule", DIM.energy, 1e6, "energy"),
  unit("cal", "calₜₕ", "thermochemical calorie", DIM.energy, 4.184, "energy"),
  unit("kcal", "kcalₜₕ", "thermochemical kilocalorie", DIM.energy, 4184, "energy"),
  unit("eV", "eV", "electronvolt", DIM.energy, 1.602176634e-19, "energy"),

  // Amount concentration (amount / volume). 1 mol/L = 1000 mol/m³ exactly.
  unit(
    "mol_per_m3",
    "mol/m³",
    "mole per cubic metre",
    DIM.amountConcentration,
    1,
    "amount-concentration",
  ),
  unit(
    "mol_per_l",
    "mol/L",
    "mole per litre (molar, M)",
    DIM.amountConcentration,
    1000,
    "amount-concentration",
  ),
  unit(
    "mol_per_dm3",
    "mol/dm³",
    "mole per cubic decimetre",
    DIM.amountConcentration,
    1000,
    "amount-concentration",
  ),
  unit(
    "mmol_per_l",
    "mmol/L",
    "millimole per litre",
    DIM.amountConcentration,
    1,
    "amount-concentration",
  ),
  unit(
    "umol_per_l",
    "µmol/L",
    "micromole per litre",
    DIM.amountConcentration,
    1e-3,
    "amount-concentration",
  ),
  unit(
    "nmol_per_l",
    "nmol/L",
    "nanomole per litre",
    DIM.amountConcentration,
    1e-6,
    "amount-concentration",
  ),

  // Mass concentration (mass / volume). 1 g/L = 1 kg/m³ exactly.
  unit(
    "kg_per_m3",
    "kg/m³",
    "kilogram per cubic metre",
    DIM.massConcentration,
    1,
    "mass-concentration",
  ),
  unit("g_per_l", "g/L", "gram per litre", DIM.massConcentration, 1, "mass-concentration"),
  unit("g_per_dL", "g/dL", "gram per decilitre", DIM.massConcentration, 10, "mass-concentration"),
  unit(
    "mg_per_l",
    "mg/L",
    "milligram per litre",
    DIM.massConcentration,
    1e-3,
    "mass-concentration",
  ),
  unit(
    "ug_per_l",
    "µg/L",
    "microgram per litre",
    DIM.massConcentration,
    1e-6,
    "mass-concentration",
  ),
  unit("g_per_mL", "g/mL", "gram per millilitre", DIM.massConcentration, 1e3, "mass-concentration"),
  unit(
    "mg_per_mL",
    "mg/mL",
    "milligram per millilitre",
    DIM.massConcentration,
    1,
    "mass-concentration",
  ),
  unit(
    "ug_per_mL",
    "µg/mL",
    "microgram per millilitre",
    DIM.massConcentration,
    1e-3,
    "mass-concentration",
  ),

  // Molality (amount / mass of solvent)
  unit("mol_per_kg", "mol/kg", "mole per kilogram (molal)", DIM.molality, 1, "molality"),
  unit("mmol_per_kg", "mmol/kg", "millimole per kilogram", DIM.molality, 1e-3, "molality"),

  // Dimensionless
  unit("one", "1", "dimensionless (one)", DIM.dimensionless, 1, "dimensionless"),
]);

const UNIT_BY_ID: ReadonlyMap<string, UnitDefinition> = new Map(UNIT_LIST.map((u) => [u.id, u]));

/** Returns the frozen list of registered units. */
export function listUnits(): readonly UnitDefinition[] {
  return UNIT_LIST;
}

/** Returns the registered unit or throws {@link UnknownUnitError}. */
export function getUnit(unitId: string): UnitDefinition {
  const found = UNIT_BY_ID.get(unitId);
  if (!found) {
    throw new UnknownUnitError(unitId);
  }
  return found;
}

/** True when a unit identifier is registered. */
export function isKnownUnit(unitId: string): boolean {
  return UNIT_BY_ID.has(unitId);
}

/** True when two units measure the same dimension. */
export function areCompatible(unitIdA: string, unitIdB: string): boolean {
  return dimensionsEqual(getUnit(unitIdA).dimension, getUnit(unitIdB).dimension);
}

/** Returns the dimension vector of a registered unit. */
export function dimensionOf(unitId: string): DimensionVector {
  return getUnit(unitId).dimension;
}

/** Structural equality for dimension vectors. */
export function dimensionsEqual(a: DimensionVector, b: DimensionVector): boolean {
  return (
    a.length === b.length &&
    a.mass === b.mass &&
    a.time === b.time &&
    a.current === b.current &&
    a.amountOfSubstance === b.amountOfSubstance &&
    a.temperature === b.temperature &&
    a.luminousIntensity === b.luminousIntensity
  );
}

const DIMENSION_LABELS: ReadonlyArray<[keyof DimensionVector, string]> = [
  ["length", "L"],
  ["mass", "M"],
  ["time", "T"],
  ["current", "I"],
  ["amountOfSubstance", "N"],
  ["temperature", "Θ"],
  ["luminousIntensity", "J"],
];

/** Compact ISQ-style rendering of a dimension vector, e.g. "M L^-3" or "1". */
export function formatDimension(dimension: DimensionVector): string {
  const parts: string[] = [];
  for (const [key, symbol] of DIMENSION_LABELS) {
    const exponent = dimension[key];
    if (exponent === 0) continue;
    parts.push(exponent === 1 ? symbol : `${symbol}^${exponent}`);
  }
  return parts.length === 0 ? "1" : parts.join(" ");
}

/**
 * Converts `value` from unit `fromId` to unit `toId`.
 *
 * @throws NonFiniteInputError if value is NaN/±Infinity.
 * @throws UnknownUnitError if either unit identifier is unregistered.
 * @throws DimensionMismatchError if the dimensions differ. Incompatible
 *   conversions are never approximated, scaled or silently dropped.
 */
export function convert(value: number, fromId: string, toId: string): number {
  assertFiniteNumber(value, "value");
  const from = getUnit(fromId);
  const to = getUnit(toId);
  if (!dimensionsEqual(from.dimension, to.dimension)) {
    throw new DimensionMismatchError(
      `Cannot convert ${from.symbol} (${formatDimension(from.dimension)}) to ${to.symbol} ` +
        `(${formatDimension(to.dimension)}): incompatible dimensions`,
    );
  }
  const base = value * from.factor + from.offset;
  return (base - to.offset) / to.factor;
}

/**
 * Asserts that `unitId` belongs to the same dimension as `expected`,
 * throwing {@link DimensionMismatchError} otherwise. Useful at API boundaries
 * where a specific *kind* of quantity is required (e.g. "a volume unit").
 */
export function assertDimension(unitId: string, expected: DimensionVector, context: string): void {
  const dimension = getUnit(unitId).dimension;
  if (!dimensionsEqual(dimension, expected)) {
    throw new DimensionMismatchError(
      `${context} requires dimension ${formatDimension(expected)}, but "${unitId}" has ${formatDimension(dimension)}`,
    );
  }
}
