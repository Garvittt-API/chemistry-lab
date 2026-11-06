import { z } from "zod";

import { nonEmptyText, reviewRequiredNoteSchema } from "./common.js";
import { referenceIdSchema } from "./references.js";

/**
 * Chemical safety sub-schemas (schema version 2.x).
 *
 * Safety data must be evidence-based. Hazard statements either cite a
 * reference or explicitly declare that they still require review; fabricated
 * hazard classifications are forbidden (docs/experiments/experiment-safety-policy.md).
 */

export const hazardKindSchema = z.enum([
  "corrosive",
  "irritant",
  "flammable",
  "oxidizing",
  "acutely_toxic",
  "chronic_health_hazard",
  "environmental_hazard",
  "physical_hazard",
  "asphyxiant_or_inert_gas",
  "hot_surface_or_flame",
  "glassware_cuts",
  "biological",
  "other",
]);

export const hazardEvidenceSchema = z.object({
  /** Reference record supporting the hazard statement. */
  referenceId: referenceIdSchema.optional(),
  basis: z.enum([
    "official_database",
    "official_safety_data_sheet",
    "textbook_or_manual",
    "common_laboratory_practice",
    "requires_review",
  ]),
  notes: nonEmptyText.optional(),
});

export const hazardStatementSchema = z
  .object({
    kind: hazardKindSchema,
    statement: nonEmptyText,
    /** Specific chemicals or apparatus the hazard applies to; empty means the whole experiment. */
    appliesTo: z.array(nonEmptyText).default([]),
    evidence: hazardEvidenceSchema,
  })
  .superRefine((hazard, context) => {
    const needsReference = hazard.evidence.basis !== "requires_review";
    if (needsReference && hazard.evidence.referenceId === undefined) {
      context.addIssue({
        code: "custom",
        message:
          "A hazard statement must cite a reference unless its basis is explicitly requires_review",
        path: ["evidence", "referenceId"],
      });
    }
  });

export const riskClassificationSchema = z.enum(["low", "moderate", "high", "requires_review"]);

export const supervisionRequirementSchema = z.enum([
  "self_directed_with_written_guidance",
  "adult_supervision_required",
  "qualified_educator_supervision_required",
  "institutional_laboratory_only",
  "requires_review",
]);

export const safetySectionSchema = z.object({
  riskClassification: riskClassificationSchema,
  /** Basis for the risk classification (for example "dilute reagents, no heating"). */
  riskRationale: nonEmptyText,
  hazards: z.array(hazardStatementSchema).default([]),
  protectiveEquipment: z.array(nonEmptyText).min(1),
  disposal: z.array(nonEmptyText).min(1),
  supervision: supervisionRequirementSchema,
  /** Operations this content deliberately does not describe. */
  restrictedOperations: z.array(nonEmptyText).default([]),
  emergencyGuidance: z.array(nonEmptyText).default([]),
  /**
   * Set when safety metadata is structurally present but not yet evidence-complete.
   * Consumers must surface this to editors.
   */
  metadataStatus: z.union([z.literal("complete"), reviewRequiredNoteSchema]).default("complete"),
});

export type HazardKind = z.infer<typeof hazardKindSchema>;
export type HazardStatement = z.infer<typeof hazardStatementSchema>;
export type SafetySection = z.infer<typeof safetySectionSchema>;
export type RiskClassification = z.infer<typeof riskClassificationSchema>;
export type SupervisionRequirement = z.infer<typeof supervisionRequirementSchema>;
