import { describe, expect, it } from "vitest";

import {
  areCompatible,
  assertDimension,
  convert,
  dimensionOf,
  formatDimension,
  getUnit,
  listUnits,
} from "./units.js";
import { DimensionMismatchError, NonFiniteInputError, UnknownUnitError } from "./errors.js";

describe("unit registry", () => {
  it("registers unique identifiers", () => {
    const ids = listUnits().map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains the seven SI base units", () => {
    for (const id of ["m", "kg", "s", "A", "mol", "K", "cd"]) {
      expect(getUnit(id).symbol.length).toBeGreaterThan(0);
    }
  });

  it("every factor is positive and finite", () => {
    for (const unit of listUnits()) {
      expect(Number.isFinite(unit.factor)).toBe(true);
      expect(unit.factor).toBeGreaterThan(0);
    }
  });

  it("covers the required kitchen-table categories", () => {
    const symbols = listUnits().map((u) => u.id);
    for (const required of [
      "g_per_mol",
      "mol_per_l",
      "mmol_per_l",
      "g_per_l",
      "mg_per_l",
      "atm",
      "bar",
      "mmHg",
      "torr",
      "kPa",
      "J",
      "kJ",
      "cal",
      "kcal",
      "eV",
      "min",
      "h",
      "L",
      "mL",
      "cm3",
      "degC",
      "degF",
      "mol_per_kg",
    ]) {
      expect(symbols).toContain(required);
    }
  });
});

describe("convert — exact definitions", () => {
  it("converts atmospheres to pascals exactly", () => {
    expect(convert(1, "atm", "Pa")).toBe(101325);
  });

  it("converts bar to pascals exactly", () => {
    expect(convert(1, "bar", "Pa")).toBe(100000);
  });

  it("converts torr to pascals against the exact definition", () => {
    expect(convert(760, "torr", "Pa")).toBeCloseTo(101325, 9);
  });

  it("converts mmHg to pascals per the density definition", () => {
    expect(convert(1, "mmHg", "Pa")).toBeCloseTo(133.322387415, 9);
  });

  it("converts litres to millilitres and cubic centimetres", () => {
    // IEEE-754: 1e-3/1e-6 is 1000.0000000000001 in binary floating point;
    // conversions are accurate to a few ulps, not always bit-exact.
    expect(convert(1, "L", "mL")).toBeCloseTo(1000, 12);
    expect(convert(1, "L", "cm3")).toBeCloseTo(1000, 12);
    expect(convert(1, "mL", "L")).toBeCloseTo(0.001, 12);
  });

  it("converts molar concentration between L- and m³-based units", () => {
    expect(convert(1, "mol_per_l", "mol_per_m3")).toBe(1000);
    expect(convert(1000, "mmol_per_l", "mol_per_l")).toBe(1);
    expect(convert(1, "mol_per_dm3", "mol_per_l")).toBe(1);
  });

  it("converts mass concentration coherently", () => {
    expect(convert(1, "g_per_l", "kg_per_m3")).toBe(1);
    expect(convert(1, "g_per_mL", "g_per_l")).toBe(1000);
    expect(convert(1000, "mg_per_l", "g_per_l")).toBe(1);
  });

  it("converts thermochemical calories to joules exactly", () => {
    expect(convert(1, "cal", "J")).toBe(4.184);
    expect(convert(1, "kcal", "kJ")).toBe(4.184);
  });

  it("converts eV to joules exactly", () => {
    expect(convert(1, "eV", "J")).toBe(1.602176634e-19);
  });

  it("converts molar mass units exactly", () => {
    expect(convert(1, "g_per_mol", "kg_per_mol")).toBe(0.001);
  });

  it("converts time units", () => {
    expect(convert(1, "min", "s")).toBe(60);
    expect(convert(1, "h", "s")).toBe(3600);
    expect(convert(1, "day", "s")).toBe(86400);
  });

  it("converts amount of substance", () => {
    expect(convert(1, "mol", "mmol")).toBe(1000);
    expect(convert(1, "kmol", "mol")).toBe(1000);
  });
});

describe("convert — affine temperature", () => {
  it("converts Celsius to kelvin with the exact offset", () => {
    expect(convert(0, "degC", "K")).toBeCloseTo(273.15, 12);
    expect(convert(100, "degC", "K")).toBeCloseTo(373.15, 12);
  });

  it("converts kelvin to Celsius", () => {
    expect(convert(273.15, "K", "degC")).toBeCloseTo(0, 12);
  });

  it("converts Fahrenheit to Celsius (32 °F = 0 °C)", () => {
    expect(convert(32, "degF", "degC")).toBeCloseTo(0, 12);
    expect(convert(212, "degF", "degC")).toBeCloseTo(100, 12);
  });

  it("agrees at the −40 crossover point", () => {
    expect(convert(-40, "degC", "degF")).toBeCloseTo(-40, 12);
    expect(convert(-40, "degF", "degC")).toBeCloseTo(-40, 12);
  });

  it("converts Rankine to kelvin exactly", () => {
    expect(convert(491.67, "degR", "K")).toBeCloseTo(273.15, 10);
  });

  it("round-trips Celsius through Fahrenheit within 1e-9 K", () => {
    const roundTripped = convert(convert(21.5, "degC", "degF"), "degF", "degC");
    expect(Math.abs(roundTripped - 21.5)).toBeLessThan(1e-9);
  });
});

describe("convert — rejection paths", () => {
  it("throws DimensionMismatchError for mass → volume", () => {
    expect(() => convert(1, "g", "L")).toThrow(DimensionMismatchError);
  });

  it("throws DimensionMismatchError for energy → pressure", () => {
    expect(() => convert(1, "J", "Pa")).toThrow(DimensionMismatchError);
  });

  it("throws DimensionMismatchError for amount-concentration → mass-concentration", () => {
    expect(() => convert(1, "mol_per_l", "g_per_l")).toThrow(DimensionMismatchError);
  });

  it("throws DimensionMismatchError for amount → molality-adjacent units", () => {
    expect(() => convert(1, "mol", "mol_per_kg")).toThrow(DimensionMismatchError);
  });

  it("throws UnknownUnitError for unregistered units", () => {
    expect(() => convert(1, "furlong", "m")).toThrow(UnknownUnitError);
    expect(() => convert(1, "m", "cubit")).toThrow(UnknownUnitError);
  });

  it("throws NonFiniteInputError for NaN / ±Infinity", () => {
    expect(() => convert(Number.NaN, "m", "km")).toThrow(NonFiniteInputError);
    expect(() => convert(Number.POSITIVE_INFINITY, "m", "km")).toThrow(NonFiniteInputError);
  });

  it("error message names both units and their dimensions", () => {
    try {
      convert(1, "g", "L");
      expect.unreachable("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DimensionMismatchError);
      expect((error as Error).message).toMatch(/g/);
      expect((error as Error).message).toMatch(/L/);
    }
  });
});

describe("compatibility helpers", () => {
  it("areCompatible is true within a dimension and false across dimensions", () => {
    expect(areCompatible("g", "kg")).toBe(true);
    expect(areCompatible("L", "mL")).toBe(true);
    expect(areCompatible("g", "mol")).toBe(false);
    expect(areCompatible("atm", "J")).toBe(false);
  });

  it("formatDimension renders ISQ exponents", () => {
    expect(formatDimension(dimensionOf("L"))).toBe("L^3");
    expect(formatDimension(dimensionOf("mol_per_l"))).toBe("L^-3 N");
    expect(formatDimension(dimensionOf("one"))).toBe("1");
  });

  it("assertDimension rejects wrong dimension with context", () => {
    expect(() => assertDimension("g", dimensionOf("L"), "concentration feed")).toThrow(
      DimensionMismatchError,
    );
    expect(() => assertDimension("L", dimensionOf("L"), "volume ok")).not.toThrow();
  });
});
