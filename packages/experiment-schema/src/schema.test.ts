import { describe, expect, it } from "vitest";

import {
  EXPERIMENT_SCHEMA_VERSION,
  experimentMetadataSchema,
  type ExperimentMetadata,
} from "./index.js";

const validMetadata: ExperimentMetadata = {
  id: "metadata-contract-check",
  schemaVersion: EXPERIMENT_SCHEMA_VERSION,
  contentVersion: "1.0.0",
  title: "Metadata contract check",
  description: "A non-scientific fixture used to exercise the content contract.",
  discipline: "general-chemistry",
  educationalLevel: "general",
  learningObjectives: ["Identify the required metadata for a learning activity."],
  prerequisites: [],
  difficulty: "introductory",
  estimatedDurationMinutes: 10,
  theory: {
    overview: "Theory supplied by the content author.",
    equations: [],
  },
  equipment: [],
  materials: [],
  safety: {
    precautions: ["Follow the instructions provided by a qualified educator."],
    requiredPpe: [],
    wasteDisposal: "Follow the supervising institution's disposal policy.",
  },
  procedure: [
    {
      stepId: "step-1",
      title: "Review metadata",
      instructions: "Read the documented learning activity metadata.",
      safetyNotes: [],
    },
  ],
  references: [{ citation: "Reference supplied by the content author." }],
  author: { name: "Content author" },
  review: { status: "draft" },
};

describe("experimentMetadataSchema", () => {
  it("accepts a complete draft metadata document", () => {
    const result = experimentMetadataSchema.safeParse(validMetadata);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe("metadata-contract-check");
    }
  });

  it("rejects an unsupported schema version and malformed ID", () => {
    const result = experimentMetadataSchema.safeParse({
      ...validMetadata,
      id: "Not A Valid ID",
      schemaVersion: "2.0.0",
    });

    expect(result.success).toBe(false);
  });

  it("requires reviewer provenance for reviewed content", () => {
    const result = experimentMetadataSchema.safeParse({
      ...validMetadata,
      review: { status: "reviewed" },
    });

    expect(result.success).toBe(false);
  });

  it("rejects incomplete safety and procedure metadata", () => {
    const result = experimentMetadataSchema.safeParse({
      ...validMetadata,
      safety: { precautions: [], requiredPpe: [], wasteDisposal: "" },
      procedure: [],
    });

    expect(result.success).toBe(false);
  });
});
