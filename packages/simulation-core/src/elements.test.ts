import { describe, expect, it } from "vitest";

import { ELEMENTS_REGISTRY_VERSION, getElementBySymbol, listElements } from "./elements.js";
import { UnknownElementError } from "./errors.js";

describe("elements registry", () => {
  it("exposes a registry version", () => {
    expect(ELEMENTS_REGISTRY_VERSION).toMatch(/^\d{4}\.\d+$/);
  });

  it("atomic numbers are unique", () => {
    const numbers = listElements().map((el) => el.atomicNumber);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it("symbols are unique and case-sensitive IUPAC-style", () => {
    const symbols = listElements().map((el) => el.symbol);
    expect(new Set(symbols).size).toBe(symbols.length);
    for (const symbol of symbols) {
      expect(symbol).toMatch(/^[A-Z][a-z]?$/);
    }
  });

  it("every atomic weight is positive and finite", () => {
    for (const element of listElements()) {
      expect(Number.isFinite(element.standardAtomicWeight)).toBe(true);
      expect(element.standardAtomicWeight).toBeGreaterThan(0);
    }
  });

  it("retains CIAAW 2021 headline values", () => {
    expect(getElementBySymbol("H").standardAtomicWeight).toBe(1.008);
    expect(getElementBySymbol("C").standardAtomicWeight).toBe(12.011);
    expect(getElementBySymbol("O").standardAtomicWeight).toBe(15.999);
    expect(getElementBySymbol("Fe").standardAtomicWeight).toBe(55.845);
    expect(getElementBySymbol("Cu").standardAtomicWeight).toBe(63.546);
    expect(getElementBySymbol("Hf").standardAtomicWeight).toBe(178.486); // 2021 revision
  });

  it("excludes elements without a standard atomic weight", () => {
    for (const missing of ["Tc", "Pm", "Po", "At", "Rn", "Fr", "Ra", "Ac"]) {
      expect(() => getElementBySymbol(missing)).toThrow(UnknownElementError);
    }
  });

  it("rejects unknown and malformed symbols (no silent fixes)", () => {
    expect(() => getElementBySymbol("Xx")).toThrow(UnknownElementError);
    expect(() => getElementBySymbol("na")).toThrow(UnknownElementError);
    expect(() => getElementBySymbol("")).toThrow(UnknownElementError);
  });
});
