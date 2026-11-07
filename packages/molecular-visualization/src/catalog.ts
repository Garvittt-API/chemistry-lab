import { ENGINE_NAME, ENGINE_VERSION, molarMass } from "@virtual-chemistry-lab/simulation-core";
import { describeMolecule } from "./accessibility.js";
import { MOLECULE_CATALOG } from "./data.js";
import { moleculeSchema, type Molecule } from "./schema.js";

export const MOLECULE_CATALOG_VERSION = "1.0.0";

export function listMolecules(): readonly Molecule[] {
  return MOLECULE_CATALOG;
}

export function getMolecule(id: string): Molecule | undefined {
  return MOLECULE_CATALOG.find((molecule) => molecule.id === id);
}

export function requireMolecule(id: string): Molecule {
  const molecule = getMolecule(id);
  if (!molecule) throw new Error(`Unknown molecule "${id}"`);
  return molecule;
}

export async function loadMolecule(
  id: string,
  loader: (id: string) => Promise<unknown> = async (moleculeId) => requireMolecule(moleculeId),
): Promise<Molecule> {
  return moleculeSchema.parse(await loader(id));
}

export function getMoleculeSummary(id: string) {
  const molecule = requireMolecule(id);
  return {
    id: molecule.id,
    name: molecule.name,
    formula: molecule.formula,
    atomCount: molecule.atoms.length,
    bondCount: molecule.bonds.length,
    molarMassGramsPerMole: molarMass(molecule.formula),
    molarMassProvenance: `${ENGINE_NAME} ${ENGINE_VERSION} / molar-mass 1.0.0`,
    sourceKind: molecule.source.kind,
    reviewStatus: molecule.reviewStatus,
    textDescription: describeMolecule(molecule),
  };
}
