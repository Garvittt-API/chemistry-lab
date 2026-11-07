import { describe, expect, it } from "vitest";
import {
  bondAngleDegrees,
  bondLengthAngstrom,
  describeBond,
  describeMolecule,
  distanceAngstrom,
  getMoleculeSummary,
  loadMolecule,
  moleculeBounds,
  requireMolecule,
} from "./index.js";

describe("geometry and shared engine integration", () => {
  it("measures water reference geometry without changing it", () => {
    const water = requireMolecule("water");
    expect(bondLengthAngstrom(water, "oh1")).toBeCloseTo(0.958, 10);
    expect(bondAngleDegrees(water, ["h1", "o1", "h2"])).toBeCloseTo(104.5, 8);
  });
  it("distinguishes ideal methane geometry", () => {
    const methane = requireMolecule("methane");
    expect(bondAngleDegrees(methane, ["h1", "c1", "h2"])).toBeCloseTo(109.4712, 3);
    expect(methane.source.kind).toBe("idealized_geometry_model");
  });
  it("checks all supported bond orders and lengths", () => {
    expect(requireMolecule("carbon-dioxide").bonds.every((b) => b.order === "double")).toBe(true);
    expect(requireMolecule("nitrogen").bonds[0]!.order).toBe("triple");
    expect(requireMolecule("benzene").bonds.filter((b) => b.order === "aromatic")).toHaveLength(6);
    expect(bondLengthAngstrom(requireMolecule("hydrogen"), "a1-a2")).toBeCloseTo(0.7414, 10);
  });
  it("computes finite bounds for all molecules", () => {
    for (const id of ["water", "ethanol", "benzene"]) {
      const bounds = moleculeBounds(requireMolecule(id));
      expect(bounds.radius).toBeGreaterThan(0);
      expect(bounds.center.every(Number.isFinite)).toBe(true);
    }
  });
  it("rejects coincident angle atoms", () => {
    const water = structuredClone(requireMolecule("water"));
    water.atoms[1]!.positionAngstrom = [0, 0, 0];
    expect(() => bondAngleDegrees(water, ["h1", "o1", "h2"])).toThrow(/coincident/);
  });
  it("uses simulation-core molar mass with provenance", () => {
    const summary = getMoleculeSummary("water");
    expect(summary.molarMassGramsPerMole).toBeCloseTo(18.015, 6);
    expect(summary.molarMassProvenance).toContain("simulation-core");
    expect(summary.textDescription).toContain("104.5 degrees");
  });
  it("validates asynchronous external loads", async () => {
    await expect(loadMolecule("water")).resolves.toMatchObject({ id: "water" });
    await expect(loadMolecule("bad", async () => ({ invalid: true }))).rejects.toThrow();
    await expect(
      loadMolecule("bad", async () => {
        throw new Error("network unavailable");
      }),
    ).rejects.toThrow("network unavailable");
  });
  it("provides complete text alternatives and honest measurement labels", () => {
    const methane = requireMolecule("methane");
    expect(describeBond(methane, methane.bonds[0]!)).toContain("not an experimental measurement");
    expect(describeMolecule(methane)).toContain("Idealized educational construction");
    expect(distanceAngstrom([0, 0, 0], [3, 4, 0])).toBe(5);
  });
});
