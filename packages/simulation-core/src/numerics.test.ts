import { describe, expect, it } from "vitest";

import {
  DEFAULT_RELATIVE_TOLERANCE,
  approxEqual,
  assertFiniteAtLeast,
  assertFiniteGreaterThan,
  assertFiniteInRange,
  assertFiniteNumber,
  roundToSignificantFigures,
} from "./numerics.js";
import { DomainError, InvalidRangeError, NonFiniteInputError } from "./errors.js";

describe("assertFiniteNumber", () => {
  it("accepts ordinary finite numbers including negatives and zero", () => {
    expect(assertFiniteNumber(0, "v")).toBe(0);
    expect(assertFiniteNumber(-3.25, "v")).toBe(-3.25);
    expect(assertFiniteNumber(1e308, "v")).toBe(1e308);
    expect(assertFiniteNumber(5e-324, "v")).toBe(5e-324);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects %s",
    (value) => {
      expect(() => assertFiniteNumber(value, "v")).toThrow(NonFiniteInputError);
    },
  );

  it("rejects non-number types", () => {
    expect(() => assertFiniteNumber("1" as unknown, "v")).toThrow(NonFiniteInputError);
    expect(() => assertFiniteNumber(null as unknown, "v")).toThrow(NonFiniteInputError);
    expect(() => assertFiniteNumber(undefined as unknown, "v")).toThrow(NonFiniteInputError);
  });

  it("carries the argument name in the message", () => {
    expect(() => assertFiniteNumber(Number.NaN, "volumeLitres")).toThrow(/volumeLitres/);
  });
});

describe("assertFiniteGreaterThan", () => {
  it("accepts values strictly greater than the bound", () => {
    expect(assertFiniteGreaterThan(1, "v", 0)).toBe(1);
    expect(assertFiniteGreaterThan(0.5, "v", 0)).toBe(0.5);
  });

  it("rejects zero by default and negative values", () => {
    expect(() => assertFiniteGreaterThan(0, "v", 0)).toThrow(DomainError);
    expect(() => assertFiniteGreaterThan(-1, "v", 0)).toThrow(DomainError);
  });
});

describe("assertFiniteAtLeast", () => {
  it("accepts zero and positive values", () => {
    expect(assertFiniteAtLeast(0, "v", 0)).toBe(0);
    expect(assertFiniteAtLeast(12, "v", 0)).toBe(12);
  });

  it("rejects negatives", () => {
    expect(() => assertFiniteAtLeast(-0.001, "v", 0)).toThrow(DomainError);
  });
});

describe("assertFiniteInRange", () => {
  it("accepts inclusive bounds", () => {
    expect(assertFiniteInRange(-2, "ph", -2, 16)).toBe(-2);
    expect(assertFiniteInRange(16, "ph", -2, 16)).toBe(16);
  });

  it("rejects values outside the range", () => {
    expect(() => assertFiniteInRange(-2.000001, "ph", -2, 16)).toThrow(DomainError);
    expect(() => assertFiniteInRange(16.000001, "ph", -2, 16)).toThrow(DomainError);
  });

  it("rejects inverted ranges regardless of the value", () => {
    expect(() => assertFiniteInRange(5, "v", 10, 1)).toThrow(InvalidRangeError);
  });
});

describe("approxEqual", () => {
  it("treats exactly equal values as equal", () => {
    expect(approxEqual(1.5, 1.5)).toBe(true);
  });

  it("passes within the default relative tolerance", () => {
    expect(approxEqual(1, 1 + DEFAULT_RELATIVE_TOLERANCE / 2)).toBe(true);
  });

  it("fails beyond the default relative tolerance for large values", () => {
    expect(approxEqual(1e9, 1e9 + 1e3)).toBe(false);
  });

  it("uses the absolute tolerance near zero", () => {
    expect(approxEqual(0, 1e-13)).toBe(true);
    expect(approxEqual(0, 1e-9)).toBe(false);
  });

  it("rejects non-finite inputs", () => {
    expect(() => approxEqual(Number.NaN, 1)).toThrow(NonFiniteInputError);
  });
});

describe("roundToSignificantFigures", () => {
  it("rounds to the requested number of significant figures", () => {
    expect(roundToSignificantFigures(12345, 3)).toBe(12300);
    expect(roundToSignificantFigures(0.0045678, 2)).toBe(0.0046);
    expect(roundToSignificantFigures(9.87654, 4)).toBe(9.877);
  });

  it("keeps the sign and returns zero for zero", () => {
    expect(roundToSignificantFigures(0, 4)).toBe(0);
    expect(roundToSignificantFigures(-1234.5, 3)).toBe(-1230);
  });

  it("rejects invalid figure counts", () => {
    expect(() => roundToSignificantFigures(1, 0)).toThrow(DomainError);
    expect(() => roundToSignificantFigures(1, 22)).toThrow(DomainError);
    expect(() => roundToSignificantFigures(1, 1.5)).toThrow(DomainError);
  });
});
