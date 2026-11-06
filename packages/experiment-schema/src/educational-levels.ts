import { z } from "zod";

import { nonEmptyText } from "./common.js";

/**
 * Educational-level sub-schemas (schema version 2.x).
 *
 * These labels are platform vocabulary for learner positioning. They are NOT
 * universal academic equivalences: a "school" learner in one education system
 * may differ in age and preparation from a "school" learner in another. Actual
 * curriculum alignment is modelled separately (see curriculum.ts).
 */

export const educationalLevelIdSchema = z.enum([
  "beginner",
  "school",
  "higher-secondary",
  "undergraduate",
  "postgraduate",
  "advanced-research",
]);

export const educationalLevelRecordSchema = z.object({
  id: educationalLevelIdSchema,
  label: nonEmptyText,
  description: nonEmptyText,
  /** Typical characteristics, written as guidance rather than equivalence claims. */
  typicalCharacteristics: z.array(nonEmptyText).default([]),
  ordinal: z.number().int().positive(),
});

export const educationalLevelRegistrySchema = z
  .object({
    registryVersion: nonEmptyText,
    levels: z.array(educationalLevelRecordSchema).min(1),
  })
  .superRefine((registry, context) => {
    const seen = new Set<string>();
    registry.levels.forEach((level, index) => {
      if (seen.has(level.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate educational level identifier "${level.id}"`,
          path: ["levels", index, "id"],
        });
      }
      seen.add(level.id);
    });
  });

export type EducationalLevelId = z.infer<typeof educationalLevelIdSchema>;
export type EducationalLevelRecord = z.infer<typeof educationalLevelRecordSchema>;
export type EducationalLevelRegistry = z.infer<typeof educationalLevelRegistrySchema>;
