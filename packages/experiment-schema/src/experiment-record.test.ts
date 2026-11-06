import { describe, expect, it } from "vitest";

import {
  EXPERIMENT_RECORD_SCHEMA_VERSION,
  curriculumRegistrySchema,
  experimentRecordSchema,
  taxonomyRegistrySchema,
  type ExperimentRecord,
} from "./index.js";

/**
 * A complete, non-scientific fixture that exercises every section of the
 * schema 2.0.0 contract. Nothing in this fixture is a chemical claim.
 */
const validRecord: ExperimentRecord = {
  identity: {
    id: "contract-check-record",
    slug: "contract-check-record",
    title: "Contract check record",
    shortDescription: "A non-scientific fixture used to exercise the content contract.",
    fullDescription:
      "A non-scientific fixture used to exercise the content contract. It contains no chemical claims.",
    schemaVersion: EXPERIMENT_RECORD_SCHEMA_VERSION,
    contentVersion: "1.0.0",
    publicationStatus: "draft",
    createdOn: "2026-11-05",
    updatedOn: "2026-11-05",
  },
  classification: {
    disciplineId: "general-chemistry",
    subdisciplineIds: ["general-chemistry-lab-techniques"],
    topicIds: ["topic-mixtures"],
    educationalLevels: ["beginner"],
    curriculumMappings: [],
    difficulty: "introductory",
    estimatedDurationMinutes: 10,
    prerequisites: [],
  },
  educational: {
    learningObjectives: ["Identify the fields a validated record requires."],
    expectedCompetencies: ["Reading structured metadata."],
    learningOutcomes: ["Explain why provenance fields are required."],
    theory: {
      overview: "Theory supplied by the fixture author.",
      sections: [
        {
          heading: "Fixture section",
          body: "This section exists to exercise the schema and makes no scientific claims.",
          sourceRefIds: ["ref-fixture-1"],
        },
      ],
      concepts: ["structured data"],
      equations: [
        {
          id: "eq-fixture-1",
          expression: "x = y + z",
          displayForm: "x = y + z",
          description: "A placeholder relation with no scientific meaning.",
          variables: [
            { symbol: "x", meaning: "placeholder quantity", unit: "1" },
            { symbol: "y", meaning: "placeholder quantity", unit: "1" },
            { symbol: "z", meaning: "placeholder quantity", unit: "1" },
          ],
          applicableConditions: ["none; fixture only"],
          assumptions: ["none; fixture only"],
          sourceRefIds: ["ref-fixture-1"],
          kind: "working_relation",
        },
      ],
      definitions: [
        {
          id: "def-fixture-1",
          term: "Fixture",
          definition: "A stand-in record used in tests.",
          sourceRefIds: ["ref-fixture-1"],
        },
      ],
    },
  },
  materials: {
    equipment: [
      {
        id: "eqp-fixture-1",
        name: "Example equipment",
        quantity: "1",
        purpose: "Exercises the equipment schema.",
        alternatives: [],
      },
    ],
    chemicals: [
      {
        id: "chem-fixture-1",
        name: "Example substance",
        category: "other",
        amount: { value: 1, unit: "g" },
        identifiers: {},
        hazardKinds: [],
        notes: "Placeholder only.",
      },
    ],
    metadataStatus: "complete",
  },
  safety: {
    riskClassification: "low",
    riskRationale: "The fixture describes no operation and no hazard.",
    hazards: [],
    protectiveEquipment: ["Example protective item described by the fixture author."],
    disposal: ["Follow the supervising institution's disposal policy."],
    supervision: "self_directed_with_written_guidance",
    restrictedOperations: [],
    emergencyGuidance: [],
    metadataStatus: "complete",
  },
  procedure: {
    overview: "A one-step placeholder procedure.",
    steps: [
      {
        stepId: "step-1",
        title: "Read the fixture",
        instructions: "Read the fixture fields and confirm the contract shape.",
        equipmentIds: ["eqp-fixture-1"],
        chemicalIds: ["chem-fixture-1"],
        precautions: [],
        expectedObservations: ["All required fields are present."],
        explanatoryNotes: [],
      },
    ],
    troubleshooting: [],
  },
  observations: {
    mode: "provided",
    content: {
      measurements: [
        {
          id: "obs-fixture-1",
          label: "Example measurement",
          kind: "qualitative",
          method: "Observe the fixture record.",
          expectedQualitative: ["The record parses successfully."],
          provenance: "reference_expected",
          sourceRefIds: ["ref-fixture-1"],
        },
      ],
      qualitativePrompts: ["What is missing from a record without provenance?"],
      errorSources: ["Fixture placeholder error source."],
      interpretationGuidance: ["Fixture placeholder interpretation."],
    },
  },
  calculations: {
    mode: "provided",
    calculations: [
      {
        id: "calc-fixture-1",
        title: "Example calculation",
        purpose: "Exercises the calculation schema.",
        equationId: "eq-fixture-1",
        variables: [{ symbol: "x", meaning: "placeholder quantity", unit: "1" }],
        assumptions: ["The fixture relation holds."],
        unitsAndDimensions: "All placeholder quantities are dimensionless.",
        significantFigureConvention: "Fixture values are exact.",
        workedExamples: [
          {
            id: "calc-fixture-example",
            title: "Fixture worked example",
            given: ["y = 1", "z = 2"],
            steps: ["x = y + z = 3"],
            result: "x = 3",
            sourceRefIds: ["ref-fixture-1"],
          },
        ],
        sourceRefIds: ["ref-fixture-1"],
      },
    ],
  },
  references: {
    items: [
      {
        id: "ref-fixture-1",
        type: "other",
        citation: "Fixture reference used only in schema tests.",
        authors: ["Virtual Chemistry Lab content team"],
        title: "Fixture reference used only in schema tests",
        identifiers: {},
        verificationStatus: "standard_bibliographic_entry",
        supportsClaims: [],
        notes: "This is a test fixture, not a scientific source.",
      },
    ],
  },
  simulation: {
    status: "not_planned",
    rationale: "The fixture has no scientific model.",
  },
  review: {
    authors: [{ name: "Fixture author", role: "content author" }],
    scientificReviewStatus: "draft",
    safetyReviewStatus: "requires_review",
    reviewEvents: [],
    revisionHistory: [
      {
        contentVersion: "1.0.0",
        date: "2026-11-05",
        summary: "Initial fixture.",
        changedBy: "Fixture author",
      },
    ],
    validationNotes: [],
    outstandingConcerns: [],
    integrityLabel: "pending_scientific_review",
    licensing: {
      license: "unspecified",
      licenseStatus: "pending_owner_decision",
      source: "Original test fixture",
    },
  },
};

function cloneRecord(): ExperimentRecord {
  return structuredClone(validRecord);
}

/** Narrowing helper for mutating the provided observations fixture. */
function providedMeasurements(record: ExperimentRecord) {
  if (record.observations.mode !== "provided") {
    throw new Error("fixture expects provided observations");
  }
  return record.observations.content.measurements;
}

/** Narrowing helper for mutating the provided calculations fixture. */
function providedCalculations(record: ExperimentRecord) {
  if (record.calculations.mode !== "provided") {
    throw new Error("fixture expects provided calculations");
  }
  return record.calculations.calculations;
}

describe("experimentRecordSchema — valid records", () => {
  it("accepts a complete draft record", () => {
    const result = experimentRecordSchema.safeParse(cloneRecord());
    expect(result.success).toBe(true);
  });

  it("accepts explicit not_applicable sections", () => {
    const record = cloneRecord();
    record.observations = {
      mode: "not_applicable",
      rationale: "This fixture makes no measurements.",
    };
    record.calculations = {
      mode: "not_applicable",
      rationale: "This fixture performs no calculations.",
    };
    const result = experimentRecordSchema.safeParse(record);
    expect(result.success).toBe(true);
  });

  it("accepts boundary values for duration and content versions", () => {
    const record = cloneRecord();
    record.identity.contentVersion = "0.0.1";
    record.classification.estimatedDurationMinutes = 24 * 60;
    record.review.revisionHistory[0]!.contentVersion = "0.0.1";
    const result = experimentRecordSchema.safeParse(record);
    expect(result.success).toBe(true);
  });
});

describe("experimentRecordSchema — invalid records", () => {
  it("rejects an unsupported schema version", () => {
    const record = cloneRecord() as unknown as Record<string, unknown>;
    (record.identity as Record<string, unknown>).schemaVersion = "3.0.0";
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);
  });

  it("rejects malformed identifiers", () => {
    const record = cloneRecord();
    record.identity.id = "Not A Valid ID";
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    record2.identity.slug = "Invalid_Slug";
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const record = cloneRecord() as unknown as Record<string, unknown>;
    delete record.educational;
    const result = experimentRecordSchema.safeParse(record);
    expect(result.success).toBe(false);

    const record2 = cloneRecord() as unknown as Record<string, unknown>;
    delete (record2.identity as Record<string, unknown>).title;
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);
  });

  it("rejects empty required collections", () => {
    const record = cloneRecord();
    record.educational.learningObjectives = [];
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    record2.procedure.steps = [];
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);

    const record3 = cloneRecord();
    record3.references.items = [];
    expect(experimentRecordSchema.safeParse(record3).success).toBe(false);

    const record4 = cloneRecord();
    record4.review.revisionHistory = [];
    expect(experimentRecordSchema.safeParse(record4).success).toBe(false);
  });

  it("rejects invalid units and ranges", () => {
    const record = cloneRecord();
    const chemical = record.materials.chemicals[0]!;
    chemical.amount = { value: 1, unit: "" };
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    providedMeasurements(record2)[0]!.expectedRange = {
      min: 10,
      max: 5,
      unit: "mL",
    };
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);

    const record3 = cloneRecord();
    record3.materials.chemicals[0]!.amount = { value: Number.NaN, unit: "g" };
    expect(experimentRecordSchema.safeParse(record3).success).toBe(false);
  });

  it("rejects malformed or unlocatable references", () => {
    const record = cloneRecord();
    record.references.items[0]!.id = "bad-ref-id";
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    record2.references.items[0]!.doi = "not-a-doi";
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);

    const record3 = cloneRecord();
    record3.references.items[0]!.verificationStatus = "requires_review";
    record3.references.items[0]!.supportsClaims = ["claim-x"];
    expect(experimentRecordSchema.safeParse(record3).success).toBe(false);

    const record4 = cloneRecord();
    record4.references.items[0]!.verificationStatus = "cross_checked_2026_11_05";
    record4.references.items[0]!.url = undefined;
    record4.references.items[0]!.doi = undefined;
    expect(experimentRecordSchema.safeParse(record4).success).toBe(false);
  });

  it("rejects dangling reference identifiers used elsewhere in the record", () => {
    const record = cloneRecord();
    record.educational.theory.equations[0]!.sourceRefIds = ["ref-does-not-exist"];
    const result = experimentRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((issue) => issue.message.includes("ref-does-not-exist")),
      ).toBe(true);
    }
  });

  it("rejects calculations or simulations that reference unknown equations", () => {
    const record = cloneRecord();
    providedCalculations(record)[0]!.equationId = "eq-missing";
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    record2.simulation = {
      status: "planned",
      model: {
        id: "fixture-model",
        contractVersion: "1.0.0",
        summary: "Fixture model contract.",
        inputs: [],
        outputs: [],
        assumptions: [],
        limitations: [],
        equations: ["eq-missing"],
        sourceRefIds: ["ref-fixture-1"],
      },
    };
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);
  });

  it("rejects invalid curriculum mappings", () => {
    const record = cloneRecord();
    record.classification.curriculumMappings = [
      {
        curriculumId: "Not A Curriculum",
        academicLevel: "school",
        confidence: "proposed_pending_verification",
        evidenceRefIds: [],
      },
    ];
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    record2.classification.curriculumMappings = [
      {
        curriculumId: "cbse-chemistry-2025-26",
        academicLevel: "higher-secondary",
        confidence: "verified_against_official_document",
        evidenceRefIds: [],
      },
    ];
    const result2 = experimentRecordSchema.safeParse(record2);
    expect(result2.success).toBe(false);
    if (!result2.success) {
      expect(result2.error.issues.some((issue) => issue.message.includes("evidence"))).toBe(true);
    }

    const record3 = cloneRecord();
    record3.classification.curriculumMappings = [
      {
        curriculumId: "cbse-chemistry-2025-26",
        academicLevel: "higher-secondary",
        confidence: "proposed_pending_verification",
        evidenceRefIds: [],
      },
    ];
    const result3 = experimentRecordSchema.safeParse(record3);
    expect(result3.success).toBe(false);
    if (!result3.success) {
      expect(
        result3.error.issues.some(
          (issue) => issue.message.includes("syllabusNote") || issue.path.includes("syllabusNote"),
        ),
      ).toBe(true);
    }
  });

  it("rejects invalid safety metadata", () => {
    const record = cloneRecord();
    record.safety.protectiveEquipment = [];
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    record2.safety.riskClassification = "catastrophic" as never;
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);

    const record3 = cloneRecord();
    record3.safety.hazards = [
      {
        kind: "corrosive",
        statement: "Fixture hazard statement.",
        appliesTo: [],
        evidence: { basis: "official_database" },
      },
    ];
    const result3 = experimentRecordSchema.safeParse(record3);
    expect(result3.success).toBe(false);
    if (!result3.success) {
      expect(result3.error.issues.some((issue) => issue.message.includes("reference"))).toBe(true);
    }
  });

  it("rejects hazard evidence that cites missing references", () => {
    const record = cloneRecord();
    record.safety.hazards = [
      {
        kind: "irritant",
        statement: "Fixture hazard statement.",
        appliesTo: [],
        evidence: { basis: "textbook_or_manual", referenceId: "ref-missing" },
      },
    ];
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);
  });

  it("rejects invalid publication statuses and their inconsistent use", () => {
    const record = cloneRecord();
    (record.identity as { publicationStatus: string }).publicationStatus = "live";
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    record2.identity.publicationStatus = "published";
    record2.safety.metadataStatus = {
      mode: "requires_review",
      rationale: "Fixture rationale.",
    };
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);
  });

  it("rejects dishonest review provenance combinations", () => {
    const record = cloneRecord();
    record.review.scientificReviewStatus = "reviewed";
    const result = experimentRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("scientificReviewer"))).toBe(
        true,
      );
    }

    const record2 = cloneRecord();
    record2.review.integrityLabel = "scientifically_sourced";
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);

    const record3 = cloneRecord();
    record3.review.integrityLabel = "independently_validated";
    expect(experimentRecordSchema.safeParse(record3).success).toBe(false);
  });

  it("requires the latest revision entry to match the content version", () => {
    const record = cloneRecord();
    record.identity.contentVersion = "1.1.0";
    const result = experimentRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) =>
            issue.message.includes("revisionHistory") ||
            issue.path.some((segment) => segment === "revisionHistory"),
        ),
      ).toBe(true);
    }
  });

  it("rejects created dates later than updated dates", () => {
    const record = cloneRecord();
    record.identity.createdOn = "2026-11-06";
    record.identity.updatedOn = "2026-11-05";
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);
  });

  it("rejects duplicate step IDs and non-sequential procedures", () => {
    const record = cloneRecord();
    record.procedure.steps.push({ ...record.procedure.steps[0]! });
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    record2.procedure.steps[0]!.stepId = "step-2";
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);
  });

  it("rejects duplicate equation symbols and malformed equation identifiers", () => {
    const record = cloneRecord();
    record.educational.theory.equations[0]!.variables[1]!.symbol = "x";
    expect(experimentRecordSchema.safeParse(record).success).toBe(false);

    const record2 = cloneRecord();
    record2.educational.theory.equations[0]!.id = "equation-1";
    expect(experimentRecordSchema.safeParse(record2).success).toBe(false);
  });

  it("rejects expected observations without cited sources", () => {
    const record = cloneRecord();
    providedMeasurements(record)[0]!.sourceRefIds = [];
    const result = experimentRecordSchema.safeParse(record);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message.includes("source reference"))).toBe(
        true,
      );
    }
  });
});

describe("taxonomy and curriculum registries", () => {
  it("accepts a valid taxonomy registry and rejects duplicates and dangling IDs", () => {
    const registry = {
      taxonomyVersion: "1.0.0",
      disciplines: [
        {
          id: "general-chemistry",
          label: "General Chemistry",
          description: "Fixture description.",
          parentDisciplineId: null,
          subdisciplines: [
            {
              id: "general-chemistry-lab-techniques",
              label: "Laboratory techniques",
              topicIds: ["topic-mixtures"],
            },
          ],
          topics: [
            { id: "topic-mixtures", label: "Mixtures", relatedTopicIds: [] },
            { id: "topic-mixtures", label: "Duplicate", relatedTopicIds: [] },
          ],
          relatedDisciplineIds: [],
          applicableLevelIds: ["beginner"],
          introducedInTaxonomyVersion: "1.0.0",
        },
      ],
    };
    const duplicateResult = taxonomyRegistrySchema.safeParse(registry);
    expect(duplicateResult.success).toBe(false);

    const validRegistry = structuredClone(registry);
    validRegistry.disciplines[0]!.topics.pop();
    expect(taxonomyRegistrySchema.safeParse(validRegistry).success).toBe(true);

    const dangling = structuredClone(validRegistry);
    dangling.disciplines[0]!.relatedDisciplineIds = ["unknown-chemistry"];
    expect(taxonomyRegistrySchema.safeParse(dangling).success).toBe(false);
  });

  it("accepts a valid curriculum registry and rejects duplicate curricula", () => {
    const registry = {
      registryVersion: "1.0.0",
      curricula: [
        {
          id: "cbse-chemistry-2025-26",
          country: "IN",
          boardOrInstitution: "CBSE",
          name: "Chemistry",
          subject: "Chemistry",
          curriculumVersion: "2025-26",
          applicableAcademicYears: ["2025-2026"],
          academicLevels: ["higher-secondary"],
          source: {
            title: "Fixture curriculum document",
            verificationStatus: "not_verified" as const,
          },
          topics: [
            { id: "cbse-kinetics", label: "Chemical kinetics", syllabusReference: "Unit IV" },
          ],
        },
      ],
    };
    expect(curriculumRegistrySchema.safeParse(registry).success).toBe(true);

    const duplicate = structuredClone(registry);
    duplicate.curricula.push(structuredClone(registry.curricula[0]!));
    expect(curriculumRegistrySchema.safeParse(duplicate).success).toBe(false);

    const badCountry = structuredClone(registry);
    badCountry.curricula[0]!.country = "India";
    expect(curriculumRegistrySchema.safeParse(badCountry).success).toBe(false);
  });
});
