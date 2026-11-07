import { describe, expect, it } from "vitest";
import { getMolecule, listMolecules } from "./catalog.js";
import { MAX_ATOMS, moleculeSchema, parseMolecule, requireMolecule } from "./index.js";

const valid = () => structuredClone(requireMolecule("water"));

describe("molecular data validation", () => {
  it("loads and validates every catalog record", () => {
    expect(listMolecules()).toHaveLength(10);
    for (const molecule of listMolecules())
      expect(moleculeSchema.parse(molecule)).toEqual(molecule);
  });
  it("has unique stable IDs and traceable versions", () => {
    expect(new Set(listMolecules().map((m) => m.id)).size).toBe(10);
    for (const molecule of listMolecules()) {
      expect(molecule.source.referenceUrls.length).toBeGreaterThan(0);
      expect(molecule.structureVersion).toMatch(/^\d+\.\d+\.\d+$/);
      expect(molecule.reviewStatus).toBe("pending_scientific_review");
    }
  });
  it("rejects non-finite coordinates", () => {
    const value = valid();
    value.atoms[0]!.positionAngstrom[0] = Number.NaN;
    expect(() => parseMolecule(value)).toThrow();
  });
  it("rejects out-of-bounds coordinates", () => {
    const value = valid();
    value.atoms[0]!.positionAngstrom[0] = 101;
    expect(() => parseMolecule(value)).toThrow();
  });
  it("rejects unknown elements and invalid element casing", () => {
    const value = valid();
    value.atoms[0]!.element = "Xx";
    expect(() => parseMolecule(value)).toThrow(/Unknown|Invalid/);
    const lower = valid();
    lower.atoms[0]!.element = "o";
    expect(() => parseMolecule(lower)).toThrow();
  });
  it("rejects duplicate atoms", () => {
    const value = valid();
    value.atoms[1]!.id = value.atoms[0]!.id;
    expect(() => parseMolecule(value)).toThrow(/unique/);
  });
  it("rejects missing bond endpoints", () => {
    const value = valid();
    value.bonds[0]!.toAtomId = "missing";
    expect(() => parseMolecule(value)).toThrow(/endpoints/);
  });
  it("rejects self-bonds and duplicate bonds", () => {
    const self = valid();
    self.bonds[0]!.toAtomId = self.bonds[0]!.fromAtomId;
    expect(() => parseMolecule(self)).toThrow(/Self-bonds/);
    const duplicate = valid();
    duplicate.bonds.push({ ...duplicate.bonds[0]!, id: "duplicate" });
    expect(() => parseMolecule(duplicate)).toThrow(/Duplicate/);
  });
  it("rejects unsupported bond orders and non-integral charge", () => {
    const value = valid() as unknown as { bonds: Array<{ order: string }> };
    value.bonds[0]!.order = "quadruple";
    expect(() => parseMolecule(value)).toThrow();
    const charge = valid() as unknown as { atoms: Array<{ formalCharge: number }> };
    charge.atoms[0]!.formalCharge = 0.5;
    expect(() => parseMolecule(charge)).toThrow();
  });
  it("enforces resource limits", () => {
    const value = valid();
    value.atoms = Array.from({ length: MAX_ATOMS + 1 }, (_, i) => ({
      id: `h${i}`,
      element: "H",
      positionAngstrom: [0, 0, i * 0.01] as [number, number, number],
      formalCharge: 0,
    }));
    value.bonds = [];
    value.geometry = undefined;
    expect(() => parseMolecule(value)).toThrow();
  });
  it("accepts the maximum atom budget without unbounded rendering work", () => {
    const value = valid();
    value.atoms = Array.from({ length: MAX_ATOMS }, (_, i) => ({
      id: `h${i}`,
      element: "H",
      positionAngstrom: [(i % 16) * 0.7, Math.floor(i / 16) * 0.7, 0] as [number, number, number],
      formalCharge: 0,
    }));
    value.bonds = [];
    value.geometry = undefined;
    expect(parseMolecule(value).atoms).toHaveLength(MAX_ATOMS);
  });
  it("rejects unknown fields rather than silently accepting untrusted data", () => {
    const value = { ...valid(), execute: "alert(1)" };
    expect(() => parseMolecule(value)).toThrow();
  });
  it("validates geometry atom references and angle center", () => {
    const value = valid();
    value.geometry!.angleAtomIds = ["h1", "h2", "o1"];
    expect(() => parseMolecule(value)).toThrow(/Angle atoms/);
  });
  it("returns undefined for unknown IDs and throws for required unknown IDs", () => {
    expect(getMolecule("unknown")).toBeUndefined();
    expect(() => requireMolecule("unknown")).toThrow(/Unknown molecule/);
  });
});
