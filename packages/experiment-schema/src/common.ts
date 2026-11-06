import { z } from "zod";

/**
 * Shared primitives for the experiment record schema (schema version 2.x).
 *
 * These building blocks are reused across taxonomy, curriculum, content, safety
 * and review sub-schemas so identifiers, dates and versions stay consistent.
 */

export const nonEmptyText = z.string().trim().min(1);

export const semanticVersion = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, "Expected a semantic version (for example 1.2.0)");

export const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)");

/** Lowercase kebab-case identifier used for experiments, disciplines, topics and curricula. */
export const kebabCaseIdSchema = z
  .string()
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use a lowercase kebab-case identifier (for example acid-base-titration)",
  );

/**
 * Quantity with explicit unit metadata.
 *
 * Numeric values are stored canonically with a unit label; conversion and display
 * formatting belong to tested utility functions (see docs/science/units-and-conventions.md).
 */
export const quantitySchema = z.object({
  value: z.number().finite(),
  unit: nonEmptyText,
  precision: nonEmptyText.optional(),
});

export type Quantity = z.infer<typeof quantitySchema>;

/** Ranges are only meaningful with explicit units on both bounds. */
export const numericRangeSchema = z
  .object({
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    unit: nonEmptyText,
  })
  .refine((range) => range.min !== undefined || range.max !== undefined, {
    message: "A numeric range needs at least one bound",
  })
  .refine((range) => range.min === undefined || range.max === undefined || range.min <= range.max, {
    message: "The minimum bound must not exceed the maximum bound",
  });

export type NumericRange = z.infer<typeof numericRangeSchema>;

/**
 * Explicit marker for content that an author has deliberately not filled in.
 * Used instead of fabricated placeholder data.
 */
export const reviewRequiredNoteSchema = z.object({
  mode: z.enum(["not_applicable", "requires_review"]),
  rationale: nonEmptyText,
});

export type ReviewRequiredNote = z.infer<typeof reviewRequiredNoteSchema>;
