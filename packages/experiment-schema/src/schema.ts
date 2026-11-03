import { z } from "zod";

const nonEmptyText = z.string().trim().min(1);
const semanticVersion = z.string().regex(/^\d+\.\d+\.\d+$/, "Expected a semantic version");
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date");

export const EXPERIMENT_SCHEMA_VERSION = "1.0.0" as const;

export const experimentIdSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase kebab-case for experiment IDs");

export const chemistryDisciplineSchema = z.enum([
  "analytical-chemistry",
  "biochemistry",
  "inorganic-chemistry",
  "organic-chemistry",
  "physical-chemistry",
  "general-chemistry",
]);

export const educationalLevelSchema = z.enum([
  "primary",
  "secondary",
  "upper-secondary",
  "undergraduate",
  "postgraduate",
  "general",
]);

export const difficultySchema = z.enum(["introductory", "intermediate", "advanced"]);

export const reviewStatusSchema = z.enum([
  "draft",
  "in_review",
  "reviewed",
  "validated_for_education",
  "deprecated",
]);

const theoryEquationSchema = z.object({
  expression: nonEmptyText,
  variables: z
    .array(
      z.object({
        symbol: nonEmptyText,
        meaning: nonEmptyText,
        unit: nonEmptyText.optional(),
      }),
    )
    .default([]),
});

const equipmentSchema = z.object({
  name: nonEmptyText,
  quantity: z.string().trim().min(1).optional(),
  purpose: nonEmptyText.optional(),
});

const materialSchema = z.object({
  name: nonEmptyText,
  category: z.enum(["chemical", "material", "solution", "specimen", "other"]),
  amount: z.string().trim().min(1).optional(),
  hazardSummary: nonEmptyText.optional(),
});

const safetySchema = z.object({
  precautions: z.array(nonEmptyText).min(1),
  requiredPpe: z.array(nonEmptyText),
  wasteDisposal: nonEmptyText,
  emergencyNotes: nonEmptyText.optional(),
});

const procedureStepSchema = z.object({
  stepId: z.string().regex(/^step-\d+$/, "Step IDs must use the step-N format"),
  title: nonEmptyText,
  instructions: nonEmptyText,
  safetyNotes: z.array(nonEmptyText).default([]),
});

const referenceSchema = z.object({
  citation: nonEmptyText,
  url: z.url().optional(),
  accessedOn: dateOnly.optional(),
});

const authorSchema = z.object({
  name: nonEmptyText,
  affiliation: nonEmptyText.optional(),
  contact: z.email().optional(),
});

const reviewSchema = z
  .object({
    status: reviewStatusSchema,
    reviewer: nonEmptyText.optional(),
    reviewedOn: dateOnly.optional(),
    notes: nonEmptyText.optional(),
  })
  .superRefine((review, context) => {
    const requiresReviewer =
      review.status === "reviewed" || review.status === "validated_for_education";

    if (requiresReviewer && !review.reviewer) {
      context.addIssue({
        code: "custom",
        message: "A named reviewer is required for reviewed content",
        path: ["reviewer"],
      });
    }

    if (requiresReviewer && !review.reviewedOn) {
      context.addIssue({
        code: "custom",
        message: "A review date is required for reviewed content",
        path: ["reviewedOn"],
      });
    }
  });

/**
 * Versioned metadata contract for educational experiments.
 *
 * This contract intentionally describes content and review provenance only. It does not execute
 * scripts or define scientific simulation inputs and outputs.
 */
export const experimentMetadataSchema = z.object({
  id: experimentIdSchema,
  schemaVersion: z.literal(EXPERIMENT_SCHEMA_VERSION),
  contentVersion: semanticVersion,
  title: nonEmptyText,
  description: nonEmptyText,
  discipline: chemistryDisciplineSchema,
  educationalLevel: educationalLevelSchema,
  learningObjectives: z.array(nonEmptyText).min(1),
  prerequisites: z.array(nonEmptyText),
  difficulty: difficultySchema,
  estimatedDurationMinutes: z
    .number()
    .int()
    .positive()
    .max(24 * 60),
  theory: z.object({
    overview: nonEmptyText,
    equations: z.array(theoryEquationSchema),
  }),
  equipment: z.array(equipmentSchema),
  materials: z.array(materialSchema),
  safety: safetySchema,
  procedure: z.array(procedureStepSchema).min(1),
  references: z.array(referenceSchema).min(1),
  author: authorSchema,
  review: reviewSchema,
});

export type ExperimentMetadata = z.infer<typeof experimentMetadataSchema>;
export type ExperimentReviewStatus = z.infer<typeof reviewStatusSchema>;
