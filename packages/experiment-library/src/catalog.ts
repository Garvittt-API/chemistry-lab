import {
  curriculumRegistrySchema,
  educationalLevelRegistrySchema,
  experimentRecordSchema,
  taxonomyRegistrySchema,
  type Curriculum,
  type CurriculumRegistry,
  type EducationalLevelRegistry,
  type ExperimentRecord,
  type TaxonomyDiscipline,
  type TaxonomyRegistry,
} from "@virtual-chemistry-lab/experiment-schema";

import curriculaData from "./content/curricula.json";
import educationalLevelsData from "./content/educational-levels.json";
import experimentDocuments from "./content/experiments/index.js";
import taxonomyData from "./content/taxonomy.json";

/**
 * Experiment catalog: validated local content, independent of React and Next.js.
 *
 * All bundled content is treated as untrusted input and validated at load time
 * with the versioned schema from @virtual-chemistry-lab/experiment-schema.
 * Referential integrity (taxonomy, curricula, duplicate identifiers) is checked
 * when a catalog is built; `buildCatalog` throws a CatalogValidationError with
 * actionable details instead of returning partial data.
 */

export interface ExperimentCatalog {
  experiments: ExperimentRecord[];
  taxonomy: TaxonomyRegistry;
  levels: EducationalLevelRegistry;
  curricula: CurriculumRegistry;
}

export interface CatalogInput {
  experiments: unknown;
  taxonomy: unknown;
  educationalLevels: unknown;
  curricula: unknown;
}

export class CatalogValidationError extends Error {
  readonly issues: string[];

  constructor(message: string, issues: string[]) {
    super(`${message}\n- ${issues.join("\n- ")}`);
    this.name = "CatalogValidationError";
    this.issues = issues;
  }
}

function formatZodIssues(
  prefix: string,
  error: { issues: { path: PropertyKey[]; message: string }[] },
): string[] {
  return error.issues.map(
    (issue) => `${prefix}${issue.path.length ? issue.path.join(".") : "(root)"}: ${issue.message}`,
  );
}

function parseOrThrow<T>(
  schema: {
    safeParse: (
      input: unknown,
    ) =>
      | { success: true; data: T }
      | { success: false; error: { issues: { path: PropertyKey[]; message: string }[] } };
  },
  input: unknown,
  label: string,
): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new CatalogValidationError(
      `Invalid ${label}`,
      formatZodIssues(`${label} `, result.error),
    );
  }
  return result.data;
}

/** Build a validated catalog from raw, untrusted content data. */
export function buildCatalog(input: CatalogInput): ExperimentCatalog {
  const taxonomy = parseOrThrow(taxonomyRegistrySchema, input.taxonomy, "taxonomy registry");
  const levels = parseOrThrow(
    educationalLevelRegistrySchema,
    input.educationalLevels,
    "educational level registry",
  );
  const curricula = parseOrThrow(curriculumRegistrySchema, input.curricula, "curriculum registry");

  if (!Array.isArray(input.experiments)) {
    throw new CatalogValidationError("Invalid experiment collection", [
      "experiments: expected an array of experiment documents",
    ]);
  }

  const issues: string[] = [];
  const experiments: ExperimentRecord[] = [];

  input.experiments.forEach((document, index) => {
    const result = experimentRecordSchema.safeParse(document);
    if (!result.success) {
      issues.push(...formatZodIssues(`experiments[${index}] `, result.error));
      return;
    }
    experiments.push(result.data);
  });

  // Duplicate identifier detection across the whole collection.
  const idsSeen = new Map<string, number>();
  const slugsSeen = new Map<string, number>();
  experiments.forEach((record, index) => {
    const idIndex = idsSeen.get(record.identity.id);
    if (idIndex !== undefined) {
      issues.push(
        `experiments[${index}]: duplicate experiment id "${record.identity.id}" (already used by experiments[${idIndex}])`,
      );
    } else {
      idsSeen.set(record.identity.id, index);
    }
    const slugIndex = slugsSeen.get(record.identity.slug);
    if (slugIndex !== undefined) {
      issues.push(
        `experiments[${index}]: duplicate experiment slug "${record.identity.slug}" (already used by experiments[${slugIndex}])`,
      );
    } else {
      slugsSeen.set(record.identity.slug, index);
    }
  });

  // Referential integrity: taxonomy.
  const disciplineById = new Map<string, TaxonomyDiscipline>();
  taxonomy.disciplines.forEach((discipline) => disciplineById.set(discipline.id, discipline));

  const levelIds = new Set(levels.levels.map((level) => level.id));
  const curriculumById = new Map<string, Curriculum>();
  curricula.curricula.forEach((curriculum) => curriculumById.set(curriculum.id, curriculum));

  experiments.forEach((record, index) => {
    const discipline = disciplineById.get(record.classification.disciplineId);
    if (!discipline) {
      issues.push(
        `experiments[${index}]: unknown discipline "${record.classification.disciplineId}" (not registered in the taxonomy)`,
      );
    } else {
      const subdisciplineIds = new Set(discipline.subdisciplines.map((item) => item.id));
      record.classification.subdisciplineIds.forEach((subdisciplineId) => {
        if (!subdisciplineIds.has(subdisciplineId)) {
          issues.push(
            `experiments[${index}]: unknown subdiscipline "${subdisciplineId}" (not registered under discipline "${discipline.id}")`,
          );
        }
      });
      const topicIds = new Set(discipline.topics.map((topic) => topic.id));
      record.classification.topicIds.forEach((topicId) => {
        if (!topicIds.has(topicId)) {
          issues.push(
            `experiments[${index}]: unknown topic "${topicId}" (not registered under discipline "${discipline.id}")`,
          );
        }
      });
    }

    record.classification.educationalLevels.forEach((levelId) => {
      if (!levelIds.has(levelId)) {
        issues.push(`experiments[${index}]: unknown educational level "${levelId}"`);
      }
    });

    record.classification.curriculumMappings.forEach((mapping, mappingIndex) => {
      const curriculum = curriculumById.get(mapping.curriculumId);
      if (!curriculum) {
        issues.push(
          `experiments[${index}].classification.curriculumMappings[${mappingIndex}]: unknown curriculum "${mapping.curriculumId}"`,
        );
      } else if (mapping.curriculumTopicId !== undefined) {
        const topicIds = new Set(curriculum.topics.map((topic) => topic.id));
        if (!topicIds.has(mapping.curriculumTopicId)) {
          issues.push(
            `experiments[${index}].classification.curriculumMappings[${mappingIndex}]: unknown curriculum topic "${mapping.curriculumTopicId}" in curriculum "${curriculum.id}"`,
          );
        }
      }
    });
  });

  if (issues.length > 0) {
    throw new CatalogValidationError("Experiment catalog failed referential validation", issues);
  }

  return { experiments, taxonomy, levels, curricula };
}

/** Build the catalog from the bundled, version-controlled content. */
export function loadBundledCatalog(): ExperimentCatalog {
  return buildCatalog({
    experiments: experimentDocuments,
    taxonomy: taxonomyData,
    educationalLevels: educationalLevelsData,
    curricula: curriculaData,
  });
}

/** The default catalog built from bundled content. Validated at module load. */
export const catalog: ExperimentCatalog = loadBundledCatalog();
