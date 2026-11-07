import { describe, expect, it } from "vitest";

import {
  formatConcentration,
  formatDecimal,
  formatPh,
  formatSignificantFigures,
  formatVolumeMl,
} from "./format.js";

describe("format helpers", () => {
  it("formats significant figures", () => {
    expect(formatSignificantFigures(1.2345, 3)).toBe("1.23");
    expect(formatSignificantFigures(0.012345, 2)).toBe("0.012");
    expect(formatSignificantFigures(123.4, 3)).toBe("123");
    expect(formatSignificantFigures(0, 3)).toBe("0.00");
    expect(formatSignificantFigures(null, 3)).toBe("");
  });

  it("formats decimals", () => {
    expect(formatDecimal(1.234, 2)).toBe("1.23");
    expect(formatDecimal(null, 2)).toBe("");
  });

  it("formats concentration and pH", () => {
    expect(formatPh(7)).toBe("7.00");
    expect(formatPh(null)).toBe("—");
    expect(formatConcentration(0.1)).toBe("0.100");
    expect(formatConcentration(null)).toBe("—");
  });

  it("formats volume", () => {
    expect(formatVolumeMl(10.0, 1)).toBe("10.0");
    expect(formatVolumeMl(null)).toBe("—");
  });
});
