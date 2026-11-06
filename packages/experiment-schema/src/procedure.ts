import { z } from "zod";

import { nonEmptyText } from "./common.js";

/**
 * Procedure sub-schemas (schema version 2.x).
 *
 * Procedures are ordered, plain-text learning steps. They must stay appropriate
 * for the target educational level and the experiment's risk classification, and
 * they must not contain executable content or unsupported operational detail
 * (docs/experiments/experiment-safety-policy.md).
 */

export const procedureStepSchema = z.object({
  stepId: z.string().regex(/^step-\d+$/, "Step IDs must use the step-N format"),
  title: nonEmptyText,
  instructions: nonEmptyText,
  /** Equipment referenced by this step (equipment IDs from the materials section). */
  equipmentIds: z.array(nonEmptyText).default([]),
  /** Chemicals referenced by this step (chemical IDs from the materials section). */
  chemicalIds: z.array(nonEmptyText).default([]),
  precautions: z.array(nonEmptyText).default([]),
  /** Qualitative observations a learner should notice at this step; never fabricated readings. */
  expectedObservations: z.array(nonEmptyText).default([]),
  explanatoryNotes: z.array(nonEmptyText).default([]),
});

export const procedureSectionSchema = z
  .object({
    overview: nonEmptyText,
    steps: z.array(procedureStepSchema).min(1),
    /** What to do if a step fails or an observation is missing. */
    troubleshooting: z.array(nonEmptyText).default([]),
  })
  .superRefine((procedure, context) => {
    const seen = new Set<string>();
    procedure.steps.forEach((step, index) => {
      if (seen.has(step.stepId)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate step identifier "${step.stepId}"`,
          path: ["steps", index, "stepId"],
        });
      }
      seen.add(step.stepId);
    });
    procedure.steps.forEach((step, index) => {
      if (step.stepId !== `step-${index + 1}`) {
        context.addIssue({
          code: "custom",
          message: `Step IDs must be sequential step-1..step-N; expected "step-${index + 1}"`,
          path: ["steps", index, "stepId"],
        });
      }
    });
  });

export type ProcedureStep = z.infer<typeof procedureStepSchema>;
export type ProcedureSection = z.infer<typeof procedureSectionSchema>;
