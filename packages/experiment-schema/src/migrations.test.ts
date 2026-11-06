import { describe, expect, it } from "vitest";

import {
  EXPERIMENT_RECORD_SCHEMA_VERSION,
  experimentRecordSchema,
  migrateLegacyMetadata,
  type ExperimentMetadata,
} from "./index.js";

const legacyMetadata: ExperimentMetadata = {
  id: "legacy-metadata-record",
  schemaVersion: "1.0.0",
  contentVersion: "1.0.0",
  title: "Legacy metadata record",
  description: "A non-scientific fixture exercising the migration path.",
  discipline: "general-chemistry",
  educationalLevel: "upper-secondary",
  learningObjectives: ["Identify the fields carried across schema versions."],
  prerequisites: ["None; fixture."],
  difficulty: "introductory",
  estimatedDurationMinutes: 10,
  theory: {
    overview: "Fixture theory overview.",
    equations: [
      {
        expression: "a = b",
        variables: [{ symbol: "a", meaning: "fixture symbol", unit: "1" }],
      },
    ],
  },
  equipment: [{ name: "Fixture equipment", quantity: "1" }],
  materials: [{ name: "Fixture material", category: "other", amount: "1" }],
  safety: {
    precautions: ["Fixture precaution."],
    requiredPpe: ["Fixture PPE."],
    wasteDisposal: "Fixture disposal guidance.",
  },
  procedure: [
    {
      stepId: "step-1",
      title: "Fixture step",
      instructions: "Fixture instructions.",
      safetyNotes: [],
    },
  ],
  references: [{ citation: "Fixture citation." }],
  author: { name: "Fixture author" },
  review: { status: "draft", reviewedOn: "2026-11-05" },
};

describe("migrateLegacyMetadata", () => {
  it("upgrades a valid 1.0.0 metadata document to a valid 2.0.0 draft record", () => {
    const { record, warnings } = migrateLegacyMetadata(legacyMetadata);

    expect(record.identity.schemaVersion).toBe(EXPERIMENT_RECORD_SCHEMA_VERSION);
    expect(record.identity.publicationStatus).toBe("draft");
    expect(record.review.integrityLabel).toBe("pending_scientific_review");
    expect(record.identity.id).toBe(legacyMetadata.id);
    expect(record.classification.disciplineId).toBe("general-chemistry");
    expect(record.classification.educationalLevels).toEqual(["higher-secondary"]);
    expect(record.observations.mode).toBe("requires_review");
    expect(record.calculations.mode).toBe("requires_review");
    expect(record.simulation.status).toBe("not_planned");
    expect(warnings.length).toBeGreaterThan(3);
    expect(experimentRecordSchema.safeParse(record).success).toBe(true);
  });

  it("preserves legacy safety, procedure and reference content without inventing evidence", () => {
    const { record } = migrateLegacyMetadata(legacyMetadata);

    expect(record.safety.hazards[0]!.statement).toBe("Fixture precaution.");
    expect(record.safety.hazards[0]!.evidence.basis).toBe("requires_review");
    expect(record.safety.riskClassification).toBe("requires_review");
    expect(record.procedure.steps).toHaveLength(1);
    expect(record.procedure.steps[0]!.title).toBe("Fixture step");
    expect(record.references.items[0]!.verificationStatus).toBe("requires_review");
    expect(record.references.items[0]!.notes).toContain("Fixture citation.");
  });

  it("never migrates legacy review status as scientific approval", () => {
    const reviewedLegacy: ExperimentMetadata = {
      ...legacyMetadata,
      review: {
        status: "validated_for_education",
        reviewer: "Fixture reviewer",
        reviewedOn: "2026-11-05",
      },
    };

    const { record } = migrateLegacyMetadata(reviewedLegacy);
    expect(record.review.scientificReviewStatus).toBe("draft");
    expect(record.review.scientificReviewer).toBeUndefined();
    expect(record.review.validationNotes.length).toBeGreaterThanOrEqual(0);
  });

  it("rejects invalid or non-legacy input with an informative error", () => {
    expect(() => migrateLegacyMetadata({ id: "missing-everything" })).toThrow(
      /not a valid schema 1\.0\.0 metadata document/,
    );
    expect(() => migrateLegacyMetadata("not an object")).toThrow(/not a valid schema/);
    expect(() => migrateLegacyMetadata({ ...legacyMetadata, schemaVersion: "2.0.0" })).toThrow(
      /not a valid schema 1\.0\.0/,
    );
  });
});
