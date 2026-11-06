import { z } from "zod";

import { nonEmptyText, reviewRequiredNoteSchema } from "./common.js";
import { equationVariableSchema } from "./educational-content.js";
import { referenceIdSchema } from "./references.js";

/**
 * Calculation sub-schemas (schema version 2.x).
 *
 * Calculations describe worked, verifiable quantitative reasoning: equations,
 * variables with units, assumptions and conventions. Content never embeds
 * executable code; worked examples must be traceable to references or to
 * clearly-marked textbook-style derivations.
 */

export const workedExampleSchema = z.object({
  id: z
    .string()
    .regex(/^calc-[a-z0-9]+(?:-[a-z0-9]+)*$/, "Example IDs must use the calc-<kebab-case> format"),
  title: nonEmptyText,
  given: z.array(nonEmptyText).min(1),
  /** Ordered solution steps as plain text; each step states the relation used. */
  steps: z.array(nonEmptyText).min(1),
  result: nonEmptyText,
  /** Where the numbers and method come from. */
  sourceRefIds: z.array(referenceIdSchema).min(1),
  significantFiguresNote: nonEmptyText.optional(),
  isIllustrative: z
    .boolean()
    .default(true)
    .describe("Worked examples are illustrative unless tied to measured data"),
});

export const calculationSchema = z.object({
  id: z
    .string()
    .regex(
      /^calc-[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Calculation IDs must use the calc-<kebab-case> format",
    ),
  title: nonEmptyText,
  purpose: nonEmptyText,
  equationId: z
    .string()
    .regex(/^eq-[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  variables: z.array(equationVariableSchema).min(1),
  assumptions: z.array(nonEmptyText).min(1),
  unitsAndDimensions: nonEmptyText,
  significantFigureConvention: nonEmptyText,
  workedExamples: z.array(workedExampleSchema).default([]),
  sourceRefIds: z.array(referenceIdSchema).min(1),
});

export const calculationsSectionSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("provided"),
    calculations: z.array(calculationSchema).min(1),
    notes: nonEmptyText.optional(),
  }),
  reviewRequiredNoteSchema.extend({ mode: z.literal("not_applicable") }),
  reviewRequiredNoteSchema.extend({ mode: z.literal("requires_review") }),
]);

export type Calculation = z.infer<typeof calculationSchema>;
export type WorkedExample = z.infer<typeof workedExampleSchema>;
export type CalculationsSection = z.infer<typeof calculationsSectionSchema>;
