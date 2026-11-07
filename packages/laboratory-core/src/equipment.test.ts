import { describe, expect, it } from "vitest";

import {
  EQUIPMENT_CATALOG,
  getEquipment,
  hasGraduations,
  supportsAllOperations,
  volumeDisplayDecimals,
} from "./equipment.js";

describe("equipment catalog", () => {
  it("exposes a non-empty catalog", () => {
    expect(EQUIPMENT_CATALOG.size).toBeGreaterThan(10);
  });

  it("returns definitions by id", () => {
    const beaker = getEquipment("beaker-100");
    expect(beaker.label).toContain("100 mL");
    expect(beaker.category).toBe("beaker");
  });

  it("throws for unknown ids", () => {
    expect(() => getEquipment("nope")).toThrow(/Unknown equipment/);
  });

  it("correctly reports supported operations", () => {
    const beaker = getEquipment("beaker-100");
    expect(supportsAllOperations(beaker, ["hold_liquid"])).toBe(true);
    expect(supportsAllOperations(beaker, ["measure_ph"])).toBe(false);

    const ph = getEquipment("ph-meter");
    expect(supportsAllOperations(ph, ["measure_ph"])).toBe(true);
  });

  it("flags graduated glassware", () => {
    expect(hasGraduations(getEquipment("measuring-cylinder-10"))).toBe(true);
    expect(hasGraduations(getEquipment("beaker-250"))).toBe(true);
    expect(hasGraduations(getEquipment("ph-meter"))).toBe(false);
  });

  it("gives display decimal counts consistent with tolerance", () => {
    expect(volumeDisplayDecimals(getEquipment("burette-50"))).toBe(2);
    expect(volumeDisplayDecimals(getEquipment("beaker-100"))).toBe(0);
  });
});
