import { z } from "zod";

import { dateOnly, kebabCaseIdSchema, nonEmptyText, semanticVersion } from "./common.js";
import { experimentCurriculumMappingSchema } from "./curriculum.js";
import { educationalContentSchema } from "./educational-content.js";
import { educationalLevelIdSchema } from "./educational-levels.js";
import { materialsSectionSchema } from "./materials.js";
import { calculationsSectionSchema } from "./calculations.js";
import { observationsSectionSchema } from "./observations.js";
import { procedureSectionSchema } from "./procedure.js";
import { publicationStatusSchema, reviewSectionSchema } from "./review.js";
import { referencesSectionSchema } from "./references.js";
import { safetySectionSchema } from "./safety.js";
import { simulationConfigSchema } from "./simulation-config.js";
import { disciplineIdSchema, subdisciplineIdSchema, topicIdSchema } from "./taxonomy.js";

/**
 * Experiment record schema — version 2.0.0.
 *
 * This is the complete content contract described in
 * docs/experiments/experiment-specification.md. It composes the separated
 * sub-schemas (identity, classification, educational content, materials,
 * safety, procedure, observations, calculations, references, simulation
 * contract and review metadata).
 *
 * Compatibility rules (docs/experiments/experiment-versioning.md):
 * - Records carry an explicit `schemaVersion` (the contract) and
 *   `contentVersion` (this particular content).
 * - Older schema versions remain parseable through `experimentDocumentSchema`
 *   and can be mechanically upgraded with `migrateLegacyMetadata`.
 * - Schema versions change only when the contract changes; content versions
 *   change whenever meaning, procedure, safety, equations or model
 *   configuration change.
 */

export const EXPERIMENT_RECORD_SCHEMA_VERSION = "2.0.0" as const;

export const experimentIdSchema = kebabCaseIdSchema;
export const experimentSlugSchema = kebabCaseIdSchema;

export const difficultySchema = z.enum(["introductory", "intermediate", "advanced"]);

export const identitySchema = z.object({
  id: experimentIdSchema,
  slug: experimentSlugSchema,
  title: nonEmptyText,
  shortDescription: nonEmptyText,
  fullDescription: nonEmptyText,
  schemaVersion: z.literal(EXPERIMENT_RECORD_SCHEMA_VERSION),
  contentVersion: semanticVersion,
  publicationStatus: publicationStatusSchema,
  createdOn: dateOnly,
  updatedOn: dateOnly,
});

export const classificationSchema = z.object({
  disciplineId: disciplineIdSchema,
  subdisciplineIds: z.array(subdisciplineIdSchema).default([]),
  topicIds: z.array(topicIdSchema).min(1),
  educationalLevels: z.array(educationalLevelIdSchema).min(1),
  curriculumMappings: z.array(experimentCurriculumMappingSchema).default([]),
  difficulty: difficultySchema,
  estimatedDurationMinutes: z
    .number()
    .int()
    .positive()
    .max(24 * 60),
  prerequisites: z.array(nonEmptyText).default([]),
});

export const experimentRecordSchema = z
  .object({
    identity: identitySchema,
    classification: classificationSchema,
    educational: educationalContentSchema,
    materials: materialsSectionSchema,
    safety: safetySectionSchema,
    procedure: procedureSectionSchema,
    observations: observationsSectionSchema,
    calculations: calculationsSectionSchema,
    references: referencesSectionSchema,
    simulation: simulationConfigSchema,
    review: reviewSectionSchema,
  })
  .superRefine((record, context) => {
    // Referential checks that span sections: every equation referenced by a
    // calculation or the simulation contract must exist in the theory section.
    const equationIds = new Set(record.educational.theory.equations.map((equation) => equation.id));

    const checkEquationRef = (equationId: string | undefined, path: (string | number)[]) => {
      if (equationId !== undefined && !equationIds.has(equationId)) {
        context.addIssue({
          code: "custom",
          message: `Unknown equation reference "${equationId}"; declare the equation in educational.theory.equations`,
          path,
        });
      }
    };

    if (record.calculations.mode === "provided") {
      record.calculations.calculations.forEach((calculation, index) => {
        checkEquationRef(calculation.equationId, [
          "calculations",
          "calculations",
          index,
          "equationId",
        ]);
      });
    }
    if (record.simulation.status === "planned" || record.simulation.status === "implemented") {
      record.simulation.model.equations.forEach((equationId, index) => {
        checkEquationRef(equationId, ["simulation", "model", "equations", index]);
      });
    }

    // Reference identifiers used across sections must exist in the reference list.
    const referenceIds = new Set(record.references.items.map((reference) => reference.id));
    const checkReference = (refId: string, path: (string | number)[]) => {
      if (!referenceIds.has(refId)) {
        context.addIssue({
          code: "custom",
          message: `Unknown reference "${refId}"; add it to references.items`,
          path,
        });
      }
    };

    record.educational.theory.equations.forEach((equation, index) => {
      equation.sourceRefIds.forEach((refId, refIndex) => {
        checkReference(refId, [
          "educational",
          "theory",
          "equations",
          index,
          "sourceRefIds",
          refIndex,
        ]);
      });
    });
    record.educational.theory.sections.forEach((section, index) => {
      section.sourceRefIds.forEach((refId, refIndex) => {
        checkReference(refId, [
          "educational",
          "theory",
          "sections",
          index,
          "sourceRefIds",
          refIndex,
        ]);
      });
    });
    record.safety.hazards.forEach((hazard, index) => {
      if (hazard.evidence.referenceId !== undefined) {
        checkReference(hazard.evidence.referenceId, [
          "safety",
          "hazards",
          index,
          "evidence",
          "referenceId",
        ]);
      }
    });
    if (record.observations.mode === "provided") {
      record.observations.content.measurements.forEach((measurement, index) => {
        measurement.sourceRefIds.forEach((refId, refIndex) => {
          checkReference(refId, [
            "observations",
            "content",
            "measurements",
            index,
            "sourceRefIds",
            refIndex,
          ]);
        });
      });
    }
    if (record.calculations.mode === "provided") {
      record.calculations.calculations.forEach((calculation, index) => {
        calculation.sourceRefIds.forEach((refId, refIndex) => {
          checkReference(refId, ["calculations", "calculations", index, "sourceRefIds", refIndex]);
        });
        calculation.workedExamples.forEach((example, exampleIndex) => {
          example.sourceRefIds.forEach((refId, refIndex) => {
            checkReference(refId, [
              "calculations",
              "calculations",
              index,
              "workedExamples",
              exampleIndex,
              "sourceRefIds",
              refIndex,
            ]);
          });
        });
      });
    }
    record.classification.curriculumMappings.forEach((mapping, index) => {
      mapping.evidenceRefIds.forEach((refId, refIndex) => {
        checkReference(refId, [
          "classification",
          "curriculumMappings",
          index,
          "evidenceRefIds",
          refIndex,
        ]);
      });
    });
    if (record.simulation.status === "planned" || record.simulation.status === "implemented") {
      record.simulation.model.sourceRefIds.forEach((refId, refIndex) => {
        checkReference(refId, ["simulation", "model", "sourceRefIds", refIndex]);
      });
    }

    // Dates: created <= updated; revision history covers the current content version.
    if (record.identity.createdOn > record.identity.updatedOn) {
      context.addIssue({
        code: "custom",
        message: "identity.createdOn must not be later than identity.updatedOn",
        path: ["identity", "updatedOn"],
      });
    }
    const lastRevision = record.review.revisionHistory.at(-1);
    if (lastRevision && lastRevision.contentVersion !== record.identity.contentVersion) {
      context.addIssue({
        code: "custom",
        message: `The latest revision entry (${lastRevision.contentVersion}) must match identity.contentVersion (${record.identity.contentVersion})`,
        path: ["review", "revisionHistory"],
      });
    }

    // Publication integrity: published content must not be marked as still
    // requiring structural review of its core safety metadata.
    if (
      record.identity.publicationStatus === "published" &&
      typeof record.safety.metadataStatus !== "string" &&
      record.safety.metadataStatus.mode === "requires_review"
    ) {
      context.addIssue({
        code: "custom",
        message: "Published experiments cannot carry safety metadata still marked requires_review",
        path: ["safety", "metadataStatus"],
      });
    }
  });

export type ExperimentRecord = z.infer<typeof experimentRecordSchema>;
export type ExperimentIdentity = z.infer<typeof identitySchema>;
export type ExperimentClassification = z.infer<typeof classificationSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
