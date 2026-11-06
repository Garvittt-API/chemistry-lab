import { z } from "zod";

import { nonEmptyText, quantitySchema, reviewRequiredNoteSchema } from "./common.js";
import { hazardKindSchema } from "./safety.js";

/**
 * Equipment and materials sub-schemas (schema version 2.x).
 *
 * Quantities are recorded only where they are scientifically and pedagogically
 * appropriate; where an amount is a starting recipe rather than a measured
 * property, a plain description is used instead of a fake precise number.
 */

export const equipmentSchema = z.object({
  id: z
    .string()
    .regex(/^eqp-[a-z0-9]+(?:-[a-z0-9]+)*$/, "Equipment IDs must use the eqp-<kebab-case> format"),
  name: nonEmptyText,
  specification: nonEmptyText.optional(),
  quantity: nonEmptyText.optional(),
  purpose: nonEmptyText.optional(),
  alternatives: z.array(nonEmptyText).default([]),
});

export const chemicalSubstanceSchema = z.object({
  id: z
    .string()
    .regex(/^chem-[a-z0-9]+(?:-[a-z0-9]+)*$/, "Chemical IDs must use the chem-<kebab-case> format"),
  name: nonEmptyText,
  /** Common name or formula as taught at the target level (for example "CuSO4·5H2O"). */
  formulaOrDescription: nonEmptyText.optional(),
  category: z.enum(["chemical", "solution", "material", "specimen", "other"]),
  /** Preparer's recipe amount; a quantity where appropriate, plain text otherwise. */
  amount: z.union([quantitySchema, nonEmptyText]).optional(),
  concentration: nonEmptyText.optional(),
  /** Authoritative chemical identifiers where available (PubChem CID, CAS, InChIKey). */
  identifiers: z.record(z.string(), nonEmptyText).default({}),
  hazardKinds: z.array(hazardKindSchema).default([]),
  notes: nonEmptyText.optional(),
});

export const materialsSectionSchema = z.object({
  equipment: z.array(equipmentSchema).default([]),
  chemicals: z.array(chemicalSubstanceSchema).default([]),
  notes: nonEmptyText.optional(),
  metadataStatus: z.union([z.literal("complete"), reviewRequiredNoteSchema]).default("complete"),
});

export type EquipmentItem = z.infer<typeof equipmentSchema>;
export type ChemicalSubstance = z.infer<typeof chemicalSubstanceSchema>;
export type MaterialsSection = z.infer<typeof materialsSectionSchema>;
