import type { Atom, Molecule } from "./schema.js";

export type Vector3 = readonly [number, number, number];

function atomById(molecule: Molecule, id: string): Atom {
  const atom = molecule.atoms.find((candidate) => candidate.id === id);
  if (!atom) throw new Error(`Unknown atom "${id}"`);
  return atom;
}

export function distanceAngstrom(a: Vector3, b: Vector3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

export function bondLengthAngstrom(molecule: Molecule, bondId: string): number {
  const bond = molecule.bonds.find((candidate) => candidate.id === bondId);
  if (!bond) throw new Error(`Unknown bond "${bondId}"`);
  return distanceAngstrom(
    atomById(molecule, bond.fromAtomId).positionAngstrom,
    atomById(molecule, bond.toAtomId).positionAngstrom,
  );
}

export function bondAngleDegrees(
  molecule: Molecule,
  atomIds: readonly [string, string, string],
): number {
  const a = atomById(molecule, atomIds[0]).positionAngstrom;
  const center = atomById(molecule, atomIds[1]).positionAngstrom;
  const c = atomById(molecule, atomIds[2]).positionAngstrom;
  const u = a.map((value, index) => value - center[index]!) as unknown as Vector3;
  const v = c.map((value, index) => value - center[index]!) as unknown as Vector3;
  const uLength = Math.hypot(...u);
  const vLength = Math.hypot(...v);
  if (uLength === 0 || vLength === 0)
    throw new Error("Bond angle is undefined for coincident atoms");
  const dot = u.reduce((sum, value, index) => sum + value * v[index]!, 0);
  const cosine = Math.max(-1, Math.min(1, dot / (uLength * vLength)));
  return Math.acos(cosine) * (180 / Math.PI);
}

export function moleculeBounds(molecule: Molecule): { center: Vector3; radius: number } {
  const count = molecule.atoms.length;
  const center: Vector3 = [
    molecule.atoms.reduce((sum, atom) => sum + atom.positionAngstrom[0], 0) / count,
    molecule.atoms.reduce((sum, atom) => sum + atom.positionAngstrom[1], 0) / count,
    molecule.atoms.reduce((sum, atom) => sum + atom.positionAngstrom[2], 0) / count,
  ];
  const radius = Math.max(
    1,
    ...molecule.atoms.map((atom) => distanceAngstrom(center, atom.positionAngstrom)),
  );
  return { center, radius };
}
