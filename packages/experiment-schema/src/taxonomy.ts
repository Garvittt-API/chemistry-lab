import { z } from "zod";

import { kebabCaseIdSchema, nonEmptyText } from "./common.js";

/**
 * Chemistry subject taxonomy sub-schemas (schema version 2.x).
 *
 * Discipline and topic identities are validated as stable identifiers here; the
 * taxonomy registry itself lives as versioned data in the experiment-library
 * package so new disciplines can be added without invalidating experiment
 * records that reference existing identifiers.
 */

export const disciplineIdSchema = kebabCaseIdSchema;
export const subdisciplineIdSchema = kebabCaseIdSchema;
export const topicIdSchema = kebabCaseIdSchema;

export const taxonomyTopicSchema = z.object({
  id: topicIdSchema,
  label: nonEmptyText,
  description: nonEmptyText.optional(),
  relatedTopicIds: z.array(topicIdSchema).default([]),
});

export const taxonomySubdisciplineSchema = z.object({
  id: subdisciplineIdSchema,
  label: nonEmptyText,
  description: nonEmptyText.optional(),
  topicIds: z.array(topicIdSchema).default([]),
});

export const taxonomyDisciplineSchema = z
  .object({
    id: disciplineIdSchema,
    label: nonEmptyText,
    description: nonEmptyText,
    /**
     * Optional parent discipline. Reserved for future hierarchical taxonomy
     * growth; the initial registry keeps disciplines top-level and expresses
     * connections through `relatedDisciplineIds` instead of claiming
     * parentage that subject-matter experts have not agreed on.
     */
    parentDisciplineId: disciplineIdSchema.nullable().default(null),
    subdisciplines: z.array(taxonomySubdisciplineSchema).default([]),
    topics: z.array(taxonomyTopicSchema).default([]),
    relatedDisciplineIds: z.array(disciplineIdSchema).default([]),
    /** Educational levels this discipline commonly serves in the platform taxonomy. */
    applicableLevelIds: z.array(nonEmptyText).default([]),
    /** Knowledge of the registry version this entry was written against. */
    introducedInTaxonomyVersion: nonEmptyText,
  })
  .superRefine((discipline, context) => {
    const subdisciplineIds = new Set<string>();
    discipline.subdisciplines.forEach((subdiscipline, index) => {
      if (subdisciplineIds.has(subdiscipline.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate subdiscipline identifier "${subdiscipline.id}"`,
          path: ["subdisciplines", index, "id"],
        });
      }
      subdisciplineIds.add(subdiscipline.id);
    });

    const topicIds = new Set<string>();
    discipline.topics.forEach((topic, index) => {
      if (topicIds.has(topic.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate topic identifier "${topic.id}"`,
          path: ["topics", index, "id"],
        });
      }
      topicIds.add(topic.id);
    });

    discipline.subdisciplines.forEach((subdiscipline, index) => {
      subdiscipline.topicIds.forEach((topicId, topicIndex) => {
        if (!topicIds.has(topicId)) {
          context.addIssue({
            code: "custom",
            message: `Subdiscipline "${subdiscipline.id}" references unknown topic "${topicId}"`,
            path: ["subdisciplines", index, "topicIds", topicIndex],
          });
        }
      });
    });
  });

export const taxonomyRegistrySchema = z
  .object({
    taxonomyVersion: nonEmptyText,
    disciplines: z.array(taxonomyDisciplineSchema).min(1),
  })
  .superRefine((registry, context) => {
    const seen = new Set<string>();
    registry.disciplines.forEach((discipline, index) => {
      if (seen.has(discipline.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate discipline identifier "${discipline.id}"`,
          path: ["disciplines", index, "id"],
        });
      }
      seen.add(discipline.id);
    });

    registry.disciplines.forEach((discipline, index) => {
      if (discipline.parentDisciplineId !== null && !seen.has(discipline.parentDisciplineId)) {
        context.addIssue({
          code: "custom",
          message: `Discipline "${discipline.id}" references unknown parent "${discipline.parentDisciplineId}"`,
          path: ["disciplines", index, "parentDisciplineId"],
        });
      }
      discipline.relatedDisciplineIds.forEach((relatedId, relatedIndex) => {
        if (!seen.has(relatedId)) {
          context.addIssue({
            code: "custom",
            message: `Discipline "${discipline.id}" references unknown related discipline "${relatedId}"`,
            path: ["disciplines", index, "relatedDisciplineIds", relatedIndex],
          });
        }
      });
    });
  });

export type TaxonomyRegistry = z.infer<typeof taxonomyRegistrySchema>;
export type TaxonomyDiscipline = z.infer<typeof taxonomyDisciplineSchema>;
export type TaxonomySubdiscipline = z.infer<typeof taxonomySubdisciplineSchema>;
export type TaxonomyTopic = z.infer<typeof taxonomyTopicSchema>;
