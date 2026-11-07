import { bondAngleDegrees, bondLengthAngstrom } from "./geometry.js";
import type { Atom, Bond, Molecule } from "./schema.js";

export function describeAtom(molecule: Molecule, atom: Atom): string {
  const connections = molecule.bonds.filter(
    (bond) => bond.fromAtomId === atom.id || bond.toAtomId === atom.id,
  );
  const charge =
    atom.formalCharge === 0
      ? "neutral formal charge"
      : `formal charge ${atom.formalCharge > 0 ? "+" : ""}${atom.formalCharge}`;
  return `${atom.element} atom ${atom.id}, ${charge}, ${connections.length} ${connections.length === 1 ? "bond" : "bonds"}. Position ${atom.positionAngstrom.map((n) => n.toFixed(3)).join(", ")} ångström in the source coordinate frame.`;
}

export function describeBond(molecule: Molecule, bond: Bond): string {
  return `${bond.order} bond ${bond.id} between ${bond.fromAtomId} and ${bond.toAtomId}. Model-coordinate length ${bondLengthAngstrom(molecule, bond.id).toFixed(3)} ångström. This is ${molecule.source.kind === "experimental" ? "derived from the cited experimental coordinates" : "a model-derived value, not an experimental measurement"}.`;
}

export function describeMolecule(molecule: Molecule): string {
  const atoms = molecule.atoms.map((atom) => `${atom.id}: ${atom.element}`).join("; ");
  const bonds = molecule.bonds.length
    ? molecule.bonds.map((bond) => `${bond.fromAtomId}–${bond.toAtomId} (${bond.order})`).join("; ")
    : "No bonds declared";
  const geometry = molecule.geometry
    ? ` Molecular shape: ${molecule.geometry.molecularShape.replaceAll("_", " ")}. ${molecule.geometry.explanation}`
    : "";
  const angle = molecule.geometry?.angleAtomIds
    ? ` The coordinate-derived angle is ${bondAngleDegrees(molecule, molecule.geometry.angleAtomIds).toFixed(1)} degrees.`
    : "";
  return `${molecule.name}, ${molecule.formula}. ${molecule.description} ${molecule.atoms.length} atoms: ${atoms}. ${molecule.bonds.length} bonds: ${bonds}.${geometry}${angle} Coordinates: ${molecule.source.coordinateNote}`;
}
