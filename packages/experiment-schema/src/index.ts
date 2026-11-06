/**
 * Public surface of @virtual-chemistry-lab/experiment-schema.
 *
 * Schema 1.0.0 (Phase 01 metadata contract) keeps its original export names and
 * stays parseable indefinitely. Schema 2.0.0 (full experiment record) is
 * composed from the sub-schema modules below. `experimentIdSchema` and
 * `difficultySchema` are shared: both versions define them with identical
 * semantics, so a single canonical export is used.
 */

export {
  EXPERIMENT_SCHEMA_VERSION,
  chemistryDisciplineSchema,
  educationalLevelSchema,
  experimentMetadataSchema,
  reviewStatusSchema,
} from "./schema.js";
export type { ExperimentMetadata, ExperimentReviewStatus } from "./schema.js";

// Schema 2.x sub-schema modules (docs/experiments/experiment-specification.md).
export * from "./common.js";
export * from "./taxonomy.js";
export * from "./educational-levels.js";
export * from "./curriculum.js";
export * from "./references.js";
export * from "./safety.js";
export * from "./educational-content.js";
export * from "./materials.js";
export * from "./procedure.js";
export * from "./observations.js";
export * from "./calculations.js";
export * from "./review.js";
export * from "./simulation-config.js";
export {
  EXPERIMENT_RECORD_SCHEMA_VERSION,
  classificationSchema,
  difficultySchema,
  experimentIdSchema,
  experimentRecordSchema,
  experimentSlugSchema,
  identitySchema,
} from "./experiment-record.js";
export type {
  Difficulty,
  ExperimentClassification,
  ExperimentIdentity,
  ExperimentRecord,
} from "./experiment-record.js";
export { migrateLegacyMetadata, type MigrationResult } from "./migrations.js";
