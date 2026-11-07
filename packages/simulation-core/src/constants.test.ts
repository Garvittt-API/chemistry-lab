import { describe, expect, it } from "vitest";

import {
  CONSTANTS_REGISTRY_VERSION,
  constantValue,
  getConstant,
  listConstants,
} from "./constants.js";
import { UnknownConstantError } from "./errors.js";

describe("constants registry", () => {
  it("exposes a semantic registry version", () => {
    expect(CONSTANTS_REGISTRY_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("has unique identifiers", () => {
    const ids = listConstants().map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every constant carries provenance, a unit, a dimension and precision metadata", () => {
    for (const entry of listConstants()) {
      expect(entry.symbol.length).toBeGreaterThan(0);
      expect(entry.unit.length).toBeGreaterThan(0);
      expect(entry.dimension.length).toBeGreaterThan(0);
      expect(Number.isFinite(entry.value)).toBe(true);
      expect(entry.value).not.toBe(0);
      expect(entry.source.name.length).toBeGreaterThan(0);
      expect(entry.source.reference.length).toBeGreaterThan(0);
      expect(entry.conditions.length).toBeGreaterThan(0);
      if (entry.precision.kind === "measured") {
        expect(entry.precision.relativeStandardUncertainty).toBeGreaterThan(0);
      } else {
        expect(entry.precision.kind).toBe("exact");
      }
    }
  });

  it("exact SI defining constants match the SI Brochure values", () => {
    expect(constantValue("avogadro-constant")).toBe(6.02214076e23);
    expect(constantValue("boltzmann-constant")).toBe(1.380649e-23);
    expect(constantValue("planck-constant")).toBe(6.62607015e-34);
    expect(constantValue("elementary-charge")).toBe(1.602176634e-19);
    expect(constantValue("speed-of-light")).toBe(299792458);
  });

  it("derived exact constants are consistent with their SI definitions", () => {
    const na = constantValue("avogadro-constant");
    const k = constantValue("boltzmann-constant");
    const e = constantValue("elementary-charge");
    expect(constantValue("molar-gas-constant")).toBe(na * k);
    expect(constantValue("faraday-constant")).toBe(na * e);
    expect(constantValue("electron-volt")).toBe(e);
  });

  it("thermochemical calorie is exactly 4.184 J", () => {
    expect(constantValue("thermochemical-calorie")).toBe(4.184);
  });

  it("conventional K_w is the 25 °C educational value", () => {
    expect(constantValue("ion-product-of-water")).toBe(1.0e-14);
  });

  it("throws UnknownConstantError for unregistered identifiers", () => {
    expect(() => getConstant("fine-structure-constant")).toThrow(UnknownConstantError);
    expect(() => getConstant("")).toThrow(UnknownConstantError);
  });
});
