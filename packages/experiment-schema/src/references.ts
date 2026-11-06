import { z } from "zod";

import { dateOnly, nonEmptyText } from "./common.js";

/**
 * Scientific reference sub-schemas (schema version 2.x).
 *
 * References carry explicit provenance and verification status. Invented
 * citations, DOIs or URLs are forbidden (docs/science/content-reference-policy.md).
 * Where a reference has not been cross-checked, that fact is part of the data.
 */

export const referenceIdSchema = z
  .string()
  .regex(/^ref-[a-z0-9]+(?:-[a-z0-9]+)*$/, "Reference IDs must use the ref-<kebab-case> format");

export const referenceTypeSchema = z.enum([
  "textbook",
  "official_educational_resource",
  "official_curriculum_document",
  "academic_paper",
  "standards_document",
  "authoritative_database",
  "laboratory_manual",
  "other",
]);

/**
 * How the reference itself was verified during content authoring.
 *
 * - `cross_checked_2026_11_05`: bibliographic details or URL confirmed against
 *   the source during the recorded content pass.
 * - `standard_bibliographic_entry`: details taken from widely established
 *   bibliographic knowledge, not re-checked against the source in this pass.
 * - `requires_review`: the entry is incomplete or uncertain and must not be
 *   used to support a scientific claim on its own.
 */
export const referenceVerificationStatusSchema = z.enum([
  "cross_checked_2026_11_05",
  "standard_bibliographic_entry",
  "requires_review",
]);

export const referenceSchema = z
  .object({
    id: referenceIdSchema,
    type: referenceTypeSchema,
    citation: nonEmptyText,
    authors: z.array(nonEmptyText).default([]),
    title: nonEmptyText,
    publisher: nonEmptyText.optional(),
    year: z.number().int().min(1500).max(2100).optional(),
    doi: z
      .string()
      .regex(/^10\.\d{4,9}\/\S+$/, "DOIs must use the canonical 10.xxxx/suffix form")
      .optional(),
    url: z.url().optional(),
    /** Stable secondary identifiers (ISBN, PubChem CID, standard number ...). */
    identifiers: z.record(z.string(), nonEmptyText).default({}),
    accessedOn: dateOnly.optional(),
    verificationStatus: referenceVerificationStatusSchema,
    /** Claim identifiers inside the experiment this reference supports. */
    supportsClaims: z.array(nonEmptyText).default([]),
    notes: nonEmptyText.optional(),
  })
  .superRefine((reference, context) => {
    const weak = reference.verificationStatus === "requires_review";
    if (weak && reference.supportsClaims.length > 0) {
      context.addIssue({
        code: "custom",
        message: "A reference marked requires_review cannot carry supported claims",
        path: ["supportsClaims"],
      });
    }
    if (
      reference.verificationStatus === "cross_checked_2026_11_05" &&
      reference.url === undefined &&
      reference.doi === undefined &&
      Object.keys(reference.identifiers).length === 0
    ) {
      context.addIssue({
        code: "custom",
        message:
          "A cross-checked reference needs at least one stable locator (URL, DOI or identifier)",
        path: ["url"],
      });
    }
  });

export const referencesSectionSchema = z.object({
  items: z.array(referenceSchema).min(1, "At least one reference is required"),
});

export type ExperimentReference = z.infer<typeof referenceSchema>;
export type ReferenceType = z.infer<typeof referenceTypeSchema>;
export type ReferenceVerificationStatus = z.infer<typeof referenceVerificationStatusSchema>;
