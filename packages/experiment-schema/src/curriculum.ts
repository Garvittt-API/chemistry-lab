import { z } from "zod";

import { dateOnly, kebabCaseIdSchema, nonEmptyText, semanticVersion } from "./common.js";
import { educationalLevelIdSchema } from "./educational-levels.js";
import { disciplineIdSchema } from "./taxonomy.js";

/**
 * Curriculum mapping sub-schemas (schema version 2.x).
 *
 * Curriculum data is kept separate from educational-level labels and from the
 * experiment records themselves so additional countries, boards and syllabi can
 * be registered later without touching existing experiments.
 *
 * Mappings must be evidence-based: a mapping record states where its syllabus
 * reference comes from and how strongly it has been verified. Unverified
 * alignment claims are explicitly marked and must not be presented to learners
 * as confirmed curriculum coverage.
 */

export const curriculumIdSchema = kebabCaseIdSchema;
export const curriculumTopicIdSchema = kebabCaseIdSchema;

export const mappingConfidenceSchema = z.enum([
  /** Checked against the official curriculum document by the recorded reviewer. */
  "verified_against_official_document",
  /** Plausible alignment proposed by an author; awaiting documentary verification. */
  "proposed_pending_verification",
  /** Mapping withdrawn or known to be wrong; kept for history. */
  "disputed",
]);

export const curriculumSourceSchema = z.object({
  title: nonEmptyText,
  publisher: nonEmptyText.optional(),
  url: z.url().optional(),
  documentVersion: nonEmptyText.optional(),
  accessedOn: dateOnly.optional(),
  /** How this source was checked. "not_verified" must be shown to editors, never hidden. */
  verificationStatus: z.enum(["verified_2026-11-05", "verified_earlier", "not_verified"]),
  notes: nonEmptyText.optional(),
});

export const curriculumTopicSchema = z.object({
  id: curriculumTopicIdSchema,
  label: nonEmptyText,
  /**
   * Free-text pointer into the curriculum document (for example a chapter or
   * practical-component name). Deliberately not a rigid code: official
   * documents change numbering between years.
   */
  syllabusReference: nonEmptyText,
  disciplineIds: z.array(disciplineIdSchema).default([]),
});

export const curriculumSchema = z.object({
  id: curriculumIdSchema,
  country: z.string().regex(/^[A-Z]{2}$/, "Use an ISO 3166-1 alpha-2 country code"),
  boardOrInstitution: nonEmptyText,
  name: nonEmptyText,
  subject: nonEmptyText,
  curriculumVersion: semanticVersion.or(nonEmptyText),
  applicableAcademicYears: z.array(nonEmptyText).min(1),
  academicLevels: z.array(educationalLevelIdSchema).min(1),
  source: curriculumSourceSchema,
  topics: z.array(curriculumTopicSchema).default([]),
});

/**
 * A mapping stored on an experiment record, referencing a registered curriculum
 * and topic plus an explicit confidence level.
 */
export const experimentCurriculumMappingSchema = z
  .object({
    curriculumId: curriculumIdSchema,
    curriculumTopicId: curriculumTopicIdSchema.optional(),
    academicLevel: educationalLevelIdSchema,
    syllabusNote: nonEmptyText.optional(),
    confidence: mappingConfidenceSchema,
    evidenceRefIds: z.array(nonEmptyText).default([]),
  })
  .superRefine((mapping, context) => {
    const needsEvidence = mapping.confidence === "verified_against_official_document";
    if (needsEvidence && mapping.evidenceRefIds.length === 0) {
      context.addIssue({
        code: "custom",
        message: "A verified curriculum mapping must cite at least one evidence reference",
        path: ["evidenceRefIds"],
      });
    }
    if (
      mapping.confidence === "proposed_pending_verification" &&
      mapping.syllabusNote === undefined
    ) {
      context.addIssue({
        code: "custom",
        message: "A proposed mapping must explain its intended syllabus connection",
        path: ["syllabusNote"],
      });
    }
  });

export const curriculumRegistrySchema = z
  .object({
    registryVersion: nonEmptyText,
    curricula: z.array(curriculumSchema).default([]),
  })
  .superRefine((registry, context) => {
    const seen = new Set<string>();
    registry.curricula.forEach((curriculum, index) => {
      if (seen.has(curriculum.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate curriculum identifier "${curriculum.id}"`,
          path: ["curricula", index, "id"],
        });
      }
      seen.add(curriculum.id);
      const topicSeen = new Set<string>();
      curriculum.topics.forEach((topic, topicIndex) => {
        if (topicSeen.has(topic.id)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate curriculum topic identifier "${topic.id}" in "${curriculum.id}"`,
            path: ["curricula", index, "topics", topicIndex, "id"],
          });
        }
        topicSeen.add(topic.id);
      });
    });
  });

export type Curriculum = z.infer<typeof curriculumSchema>;
export type CurriculumTopic = z.infer<typeof curriculumTopicSchema>;
export type CurriculumRegistry = z.infer<typeof curriculumRegistrySchema>;
export type ExperimentCurriculumMapping = z.infer<typeof experimentCurriculumMappingSchema>;
export type MappingConfidence = z.infer<typeof mappingConfidenceSchema>;
export type CurriculumSource = z.infer<typeof curriculumSourceSchema>;
