import { z } from "zod";
import { getElementBySymbol } from "@virtual-chemistry-lab/simulation-core";

export const MOLECULE_SCHEMA_VERSION = "1.0.0" as const;
export const MAX_ATOMS = 256;
export const MAX_BONDS = 512;
export const MAX_ABS_COORDINATE_ANGSTROM = 100;

const id = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const nonEmpty = z.string().trim().min(1).max(4000);
const semanticVersion = z.string().regex(/^\d+\.\d+\.\d+$/);
const coordinate = z
  .number()
  .finite()
  .min(-MAX_ABS_COORDINATE_ANGSTROM)
  .max(MAX_ABS_COORDINATE_ANGSTROM);

export const atomSchema = z
  .object({
    id,
    element: z.string().regex(/^[A-Z][a-z]?$/),
    positionAngstrom: z.tuple([coordinate, coordinate, coordinate]),
    formalCharge: z.number().int().min(-4).max(4).default(0),
    label: nonEmpty.optional(),
  })
  .strict()
  .superRefine((atom, context) => {
    try {
      getElementBySymbol(atom.element);
    } catch {
      context.addIssue({
        code: "custom",
        message: `Unknown or unsupported element "${atom.element}"`,
        path: ["element"],
      });
    }
  });

export const bondSchema = z
  .object({
    id,
    fromAtomId: id,
    toAtomId: id,
    order: z.enum(["single", "double", "triple", "aromatic"]),
  })
  .strict();

export const structureSourceSchema = z
  .object({
    kind: z.enum(["experimental", "idealized_geometry_model", "computed", "illustrative"]),
    citation: nonEmpty,
    url: z.url().optional(),
    accessedOn: z.iso.date(),
    modelId: id,
    modelVersion: semanticVersion,
    coordinateNote: nonEmpty,
    assumptions: z.array(nonEmpty).max(32),
    limitations: z.array(nonEmpty).min(1).max(32),
    referenceUrls: z.array(z.url()).min(1).max(16),
  })
  .strict();

export const geometryAnnotationSchema = z
  .object({
    centralAtomId: id,
    molecularShape: z.enum([
      "linear",
      "bent",
      "trigonal_planar",
      "tetrahedral",
      "trigonal_pyramidal",
      "diatomic",
      "planar_ring",
      "non_planar",
    ]),
    electronDomainGeometry: nonEmpty.optional(),
    bondingDomains: z.number().int().min(1).max(6).optional(),
    lonePairs: z.number().int().min(0).max(3).optional(),
    idealAngleDegrees: z.number().finite().min(0).max(180).optional(),
    explanation: nonEmpty,
    angleAtomIds: z.tuple([id, id, id]).optional(),
  })
  .strict();

export const moleculeSchema = z
  .object({
    schemaVersion: z.literal(MOLECULE_SCHEMA_VERSION),
    id,
    structureVersion: semanticVersion,
    name: nonEmpty,
    formula: nonEmpty,
    description: nonEmpty,
    atoms: z.array(atomSchema).min(1).max(MAX_ATOMS),
    bonds: z.array(bondSchema).max(MAX_BONDS),
    geometry: geometryAnnotationSchema.optional(),
    source: structureSourceSchema,
    reviewStatus: z.literal("pending_scientific_review"),
  })
  .strict()
  .superRefine((molecule, context) => {
    const atomIds = new Set<string>();
    for (const [index, atom] of molecule.atoms.entries()) {
      if (atomIds.has(atom.id)) {
        context.addIssue({
          code: "custom",
          message: "Atom IDs must be unique",
          path: ["atoms", index, "id"],
        });
      }
      atomIds.add(atom.id);
    }
    const bondIds = new Set<string>();
    const connections = new Set<string>();
    for (const [index, bond] of molecule.bonds.entries()) {
      if (bondIds.has(bond.id)) {
        context.addIssue({
          code: "custom",
          message: "Bond IDs must be unique",
          path: ["bonds", index, "id"],
        });
      }
      bondIds.add(bond.id);
      if (!atomIds.has(bond.fromAtomId) || !atomIds.has(bond.toAtomId)) {
        context.addIssue({
          code: "custom",
          message: "Bond endpoints must reference declared atoms",
          path: ["bonds", index],
        });
      }
      if (bond.fromAtomId === bond.toAtomId) {
        context.addIssue({
          code: "custom",
          message: "Self-bonds are not supported",
          path: ["bonds", index],
        });
      }
      const key = [bond.fromAtomId, bond.toAtomId].sort().join(":");
      if (connections.has(key)) {
        context.addIssue({
          code: "custom",
          message: "Duplicate atom-pair bonds are not supported",
          path: ["bonds", index],
        });
      }
      connections.add(key);
    }
    if (molecule.geometry) {
      const geometry = molecule.geometry;
      if (!atomIds.has(geometry.centralAtomId)) {
        context.addIssue({
          code: "custom",
          message: "Geometry central atom is missing",
          path: ["geometry", "centralAtomId"],
        });
      }
      if (geometry.angleAtomIds) {
        const [a, center, c] = geometry.angleAtomIds;
        if (
          center !== geometry.centralAtomId ||
          a === c ||
          ![a, center, c].every((value) => atomIds.has(value))
        ) {
          context.addIssue({
            code: "custom",
            message: "Angle atoms must be distinct declared atoms around the central atom",
            path: ["geometry", "angleAtomIds"],
          });
        }
      }
    }
  });

export type Atom = z.infer<typeof atomSchema>;
export type Bond = z.infer<typeof bondSchema>;
export type BondOrder = Bond["order"];
export type StructureSource = z.infer<typeof structureSourceSchema>;
export type GeometryAnnotation = z.infer<typeof geometryAnnotationSchema>;
export type Molecule = z.infer<typeof moleculeSchema>;

export function parseMolecule(input: unknown): Molecule {
  return moleculeSchema.parse(input);
}
