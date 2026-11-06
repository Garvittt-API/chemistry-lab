import { z } from "zod";

import { nonEmptyText, numericRangeSchema, reviewRequiredNoteSchema } from "./common.js";
import { referenceIdSchema } from "./references.js";

/**
 * Observation and measurement sub-schemas (schema version 2.x).
 *
 * Expected qualitative observations and reference numerical ranges are only
 * recorded where reliable sources support them. Simulated results must never be
 * written into these fields as if they were laboratory measurements
 * (docs/science/content-validation-policy.md).
 */

export const measurementKindSchema = z.enum([
  "qualitative",
  "quantitative",
  "time",
  "mass",
  "volume",
  "temperature",
  "electrical_potential",
  "absorbance_or_color",
  "ph",
  "other",
]);

export const provenanceLabelSchema = z.enum([
  "theoretical",
  "reference_expected",
  "requires_review",
]);

export const measurementDefinitionSchema = z.object({
  id: z
    .string()
    .regex(
      /^obs-[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Measurement IDs must use the obs-<kebab-case> format",
    ),
  label: nonEmptyText,
  kind: measurementKindSchema,
  unit: nonEmptyText.optional(),
  /** How a learner should take this measurement (instrument, method, timing). */
  method: nonEmptyText,
  /** Reference range; only present when a source supports it. */
  expectedRange: numericRangeSchema.optional(),
  expectedQualitative: z.array(nonEmptyText).default([]),
  provenance: provenanceLabelSchema,
  sourceRefIds: z.array(referenceIdSchema).default([]),
  displayPrecision: nonEmptyText.optional(),
});

export const observationTemplateSchema = z.object({
  measurements: z.array(measurementDefinitionSchema).default([]),
  qualitativePrompts: z.array(nonEmptyText).default([]),
  errorSources: z.array(nonEmptyText).min(1),
  interpretationGuidance: z.array(nonEmptyText).min(1),
});

export const observationsSectionSchema = z
  .discriminatedUnion("mode", [
    z.object({ mode: z.literal("provided"), content: observationTemplateSchema }),
    reviewRequiredNoteSchema.extend({ mode: z.literal("not_applicable") }),
    reviewRequiredNoteSchema.extend({ mode: z.literal("requires_review") }),
  ])
  .superRefine((section, context) => {
    if (section.mode === "provided") {
      section.content.measurements.forEach((measurement, index) => {
        const claimsRange = measurement.expectedRange !== undefined;
        const claimsQualitative = measurement.expectedQualitative.length > 0;
        if ((claimsRange || claimsQualitative) && measurement.sourceRefIds.length === 0) {
          context.addIssue({
            code: "custom",
            message:
              "Expected observations must cite at least one source reference; use requires_review otherwise",
            path: ["content", "measurements", index, "sourceRefIds"],
          });
        }
      });
    }
  });

export type MeasurementDefinition = z.infer<typeof measurementDefinitionSchema>;
export type ObservationTemplate = z.infer<typeof observationTemplateSchema>;
export type ObservationsSection = z.infer<typeof observationsSectionSchema>;
export type ProvenanceLabel = z.infer<typeof provenanceLabelSchema>;
