import type { ExperimentMetadata } from "./schema.js";
import { experimentMetadataSchema } from "./schema.js";
import {
  EXPERIMENT_RECORD_SCHEMA_VERSION,
  experimentRecordSchema,
  type ExperimentRecord,
} from "./experiment-record.js";

/**
 * Schema migration helpers (docs/experiments/experiment-versioning.md).
 *
 * Compatibility policy:
 * - Schema 1.0.0 (Phase 01 metadata contract) remains parseable forever through
 *   `experimentMetadataSchema`; it is never silently reinterpreted.
 * - `migrateLegacyMetadata` performs the mechanical part of the 1.0.0 -> 2.0.0
 *   upgrade and reports EVERY field it derived or left for authors to complete.
 *   Migrated records are always drafts: migration never fabricates scientific
 *   content, references, learning outcomes or safety classifications.
 * - After migration, authors must fill the reported gaps and re-validate with
 *   `experimentRecordSchema` before any editorial review.
 */

export interface MigrationResult {
  record: ExperimentRecord;
  /** Human-readable notes for every derived or incomplete field. */
  warnings: string[];
}

const MIGRATION_MARKER = "Requires completion after migration from schema 1.0.0";

const legacyDisciplineToTaxonomy: Record<ExperimentMetadata["discipline"], string> = {
  "general-chemistry": "general-chemistry",
  "organic-chemistry": "organic-chemistry",
  "inorganic-chemistry": "inorganic-chemistry",
  "physical-chemistry": "physical-chemistry",
  "analytical-chemistry": "analytical-chemistry",
  biochemistry: "biochemistry",
};

const legacyLevelToPlatformLevel: Record<
  ExperimentMetadata["educationalLevel"],
  ExperimentRecord["classification"]["educationalLevels"][number]
> = {
  primary: "beginner",
  secondary: "school",
  "upper-secondary": "higher-secondary",
  undergraduate: "undergraduate",
  postgraduate: "postgraduate",
  general: "beginner",
};

/**
 * Mechanically upgrade a schema 1.0.0 metadata document to a schema 2.0.0
 * experiment record. The result passes `experimentRecordSchema` but stays in
 * draft state with explicit warnings; it must not be published unchanged.
 *
 * Throws when the input is not a valid 1.0.0 metadata document.
 */
export function migrateLegacyMetadata(input: unknown): MigrationResult {
  const parsed = experimentMetadataSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(
      `migrateLegacyMetadata: input is not a valid schema 1.0.0 metadata document: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; ")}`,
    );
  }

  const legacy = parsed.data;
  const warnings: string[] = [];
  const today = legacy.review.reviewedOn ?? new Date().toISOString().slice(0, 10);

  warnings.push(
    "classification.topicIds uses the placeholder topic 'unclassified-requires-review'; register real topics in the taxonomy and update the record.",
  );
  warnings.push(
    "educational.learningOutcomes is a migration marker; replace with reviewed learning outcomes.",
  );
  warnings.push(
    "references.items have been given verificationStatus 'requires_review'; bibliographic details must be completed before any claim relies on them.",
  );
  warnings.push(
    "safety.riskClassification is 'requires_review' unless a reviewer confirms it; legacy hazard summaries were preserved as hazard statements with requires_review evidence.",
  );
  warnings.push(
    "observations and calculations sections were not present in schema 1.0.0 and are marked requires_review.",
  );
  warnings.push(
    "simulation section is marked not_planned; a Phase 04 contract must be authored if a model is intended.",
  );

  const record = {
    identity: {
      id: legacy.id,
      slug: legacy.id,
      title: legacy.title,
      shortDescription: legacy.description,
      fullDescription: legacy.description,
      schemaVersion: EXPERIMENT_RECORD_SCHEMA_VERSION,
      contentVersion: legacy.contentVersion,
      publicationStatus: "draft",
      createdOn: today,
      updatedOn: today,
    },
    classification: {
      disciplineId: legacyDisciplineToTaxonomy[legacy.discipline],
      subdisciplineIds: [],
      topicIds: ["unclassified-requires-review"],
      educationalLevels: [legacyLevelToPlatformLevel[legacy.educationalLevel]],
      curriculumMappings: [],
      difficulty: legacy.difficulty,
      estimatedDurationMinutes: legacy.estimatedDurationMinutes,
      prerequisites: legacy.prerequisites,
    },
    educational: {
      learningObjectives: legacy.learningObjectives,
      expectedCompetencies: [],
      learningOutcomes: [MIGRATION_MARKER],
      theory: {
        overview: legacy.theory.overview,
        sections: [],
        concepts: [],
        equations: legacy.theory.equations.map((equation, index) => ({
          id: `eq-migrated-${index + 1}`,
          expression: equation.expression,
          description: `Migrated equation ${index + 1}; description ${MIGRATION_MARKER.toLowerCase()}.`,
          variables: equation.variables,
          applicableConditions: [],
          assumptions: [],
          sourceRefIds: ["ref-migrated-pending"],
          kind: "theoretical_law" as const,
        })),
        definitions: [],
      },
    },
    materials: {
      equipment: legacy.equipment.map((item, index) => ({
        id: `eqp-migrated-${index + 1}`,
        name: item.name,
        quantity: item.quantity,
        purpose: item.purpose,
        alternatives: [],
      })),
      chemicals: legacy.materials.map((item, index) => ({
        id: `chem-migrated-${index + 1}`,
        name: item.name,
        category: item.category,
        amount: item.amount,
        identifiers: {},
        hazardKinds: [],
        notes: item.hazardSummary,
      })),
      metadataStatus: {
        mode: "requires_review" as const,
        rationale: `Material identifiers and hazards ${MIGRATION_MARKER.toLowerCase()}.`,
      },
    },
    safety: {
      riskClassification: "requires_review" as const,
      riskRationale: `Risk classification ${MIGRATION_MARKER.toLowerCase()}.`,
      hazards: legacy.safety.precautions.map((precaution) => ({
        kind: "other" as const,
        statement: precaution,
        appliesTo: [],
        evidence: {
          basis: "requires_review" as const,
          notes: `Legacy precaution preserved verbatim; hazard basis ${MIGRATION_MARKER.toLowerCase()}.`,
        },
      })),
      protectiveEquipment: legacy.safety.requiredPpe.length
        ? legacy.safety.requiredPpe
        : [`PPE list ${MIGRATION_MARKER.toLowerCase()}.`],
      disposal: [legacy.safety.wasteDisposal],
      supervision: "requires_review" as const,
      restrictedOperations: [],
      emergencyGuidance: legacy.safety.emergencyNotes ? [legacy.safety.emergencyNotes] : [],
      metadataStatus: {
        mode: "requires_review" as const,
        rationale: `Safety metadata ${MIGRATION_MARKER.toLowerCase()}.`,
      },
    },
    procedure: {
      overview: `Procedure overview ${MIGRATION_MARKER.toLowerCase()}.`,
      steps: legacy.procedure.map((step, index) => ({
        stepId: `step-${index + 1}`,
        title: step.title,
        instructions: step.instructions,
        equipmentIds: [],
        chemicalIds: [],
        precautions: step.safetyNotes,
        expectedObservations: [],
        explanatoryNotes: [],
      })),
      troubleshooting: [],
    },
    observations: {
      mode: "requires_review" as const,
      rationale: `Observation templates were not modelled in schema 1.0.0; ${MIGRATION_MARKER.toLowerCase()}.`,
    },
    calculations: {
      mode: "requires_review" as const,
      rationale: `Calculations were not modelled in schema 1.0.0; ${MIGRATION_MARKER.toLowerCase()}.`,
    },
    references: {
      items: [
        {
          id: "ref-migrated-pending",
          type: "other" as const,
          citation: `${MIGRATION_MARKER}: complete the reference list from the legacy citations below.`,
          authors: [],
          title: `${MIGRATION_MARKER}: complete the reference list from the legacy citations below.`,
          identifiers: {},
          verificationStatus: "requires_review" as const,
          supportsClaims: [],
          notes: legacy.references.map((reference) => reference.citation).join(" | "),
        },
      ],
    },
    simulation: {
      status: "not_planned" as const,
      rationale: `Simulation configuration ${MIGRATION_MARKER.toLowerCase()}.`,
    },
    review: {
      authors: [{ ...legacy.author, role: "content author (migrated from schema 1.0.0)" }],
      scientificReviewStatus: "draft" as const,
      safetyReviewStatus: "requires_review" as const,
      reviewEvents: [],
      revisionHistory: [
        {
          contentVersion: legacy.contentVersion,
          date: today,
          summary: `Mechanical migration from schema 1.0.0 metadata. ${MIGRATION_MARKER}.`,
          changedBy: "migrateLegacyMetadata",
        },
      ],
      validationNotes: legacy.review.notes ? [legacy.review.notes] : [],
      outstandingConcerns: warnings.length
        ? ["Migrated record requires editorial and scientific completion before review."]
        : [],
      integrityLabel: "pending_scientific_review" as const,
      licensing: {
        license: "unspecified",
        licenseStatus: "pending_owner_decision" as const,
        source: "Migrated from schema 1.0.0 metadata record",
      },
    },
  };

  const validated = experimentRecordSchema.safeParse(record);
  if (!validated.success) {
    throw new Error(
      `migrateLegacyMetadata: internal migration produced an invalid record: ${validated.error.issues
        .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
        .join("; ")}`,
    );
  }

  return { record: validated.data, warnings };
}
