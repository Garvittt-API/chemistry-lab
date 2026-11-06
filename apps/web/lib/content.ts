/**
 * Web content access layer.
 *
 * All experiment data comes from the versioned `experiment-library` package
 * (validated content records + query API). This module only adapts library
 * types to serializable view models for the UI — it contains no scientific or
 * catalog logic of its own, and it never exposes unpublished records to the
 * public surfaces.
 */
import {
  catalog,
  getPublicExperimentByIdOrSlug,
  queryExperiments,
  toExperimentSummary,
  type ExperimentSortKey,
  type ExperimentSummary,
} from "@virtual-chemistry-lab/experiment-library";
import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";

export type ExperimentDifficulty = "introductory" | "intermediate" | "advanced";

export interface ExperimentCardModel {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  disciplineId: string;
  disciplineLabel: string;
  topicLabels: string[];
  levelLabels: string[];
  difficulty: ExperimentDifficulty;
  estimatedDurationMinutes: number;
  publicationStatus: string;
  scientificReviewStatus: string;
  integrityLabel: string;
  updatedOn: string;
}

export interface SubjectModel {
  id: string;
  label: string;
  description: string;
  publishedExperimentCount: number;
  accent: "ochre" | "blue" | "violet" | "green" | "rose";
}

export interface ExploreFacetOption {
  id: string;
  label: string;
}

export interface ExploreFilters {
  query?: string;
  disciplineId?: string;
  levelId?: string;
  difficulty?: ExperimentDifficulty | "";
  sort?: ExperimentSortKey;
}

const disciplineLabels = new Map<string, string>(
  catalog.taxonomy.disciplines.map((discipline) => [discipline.id, discipline.label]),
);

const topicLabels = new Map<string, string>(
  catalog.taxonomy.disciplines.flatMap((discipline) =>
    discipline.topics.map((topic) => [topic.id, topic.label] as const),
  ),
);

const levelLabels = new Map<string, string>(
  catalog.levels.levels.map((level) => [level.id, level.label]),
);

type EducationalLevelId = (typeof catalog.levels.levels)[number]["id"];

function toCardModel(summary: ExperimentSummary): ExperimentCardModel {
  return {
    id: summary.id,
    slug: summary.slug,
    title: summary.title,
    shortDescription: summary.shortDescription,
    disciplineId: summary.disciplineId,
    disciplineLabel: disciplineLabels.get(summary.disciplineId) ?? summary.disciplineId,
    topicLabels: summary.topicIds.map((id) => topicLabels.get(id) ?? id),
    levelLabels: summary.educationalLevels.map((id) => levelLabels.get(id) ?? id),
    difficulty: summary.difficulty,
    estimatedDurationMinutes: summary.estimatedDurationMinutes,
    publicationStatus: summary.publicationStatus,
    scientificReviewStatus: summary.scientificReviewStatus,
    integrityLabel: summary.integrityLabel,
    updatedOn: summary.updatedOn,
  };
}

/** All publicly visible (published) experiment cards, ordered by title. */
export function getExperimentCards(): ExperimentCardModel[] {
  const result = queryExperiments(catalog, {
    publicationStatuses: ["published"],
    sort: "title",
    sortDirection: "asc",
  });
  return result.items.map(toCardModel);
}

/** A single published experiment card by id or slug; undefined when not public. */
export function getExperimentCard(idOrSlug: string): ExperimentCardModel | undefined {
  const record = getPublicExperimentByIdOrSlug(catalog, idOrSlug);
  return record ? toCardModel(toExperimentSummary(record)) : undefined;
}

/** The full published record for the detail page; undefined when not public. */
export function getExperimentRecord(idOrSlug: string): ExperimentRecord | undefined {
  return getPublicExperimentByIdOrSlug(catalog, idOrSlug);
}

/** Real search + filter + sort over published records (library query engine). */
export function searchExperimentCards(filters: ExploreFilters): ExperimentCardModel[] {
  const trimmedQuery = filters.query?.trim() ?? "";
  const result = queryExperiments(catalog, {
    text: trimmedQuery.length > 0 ? trimmedQuery : undefined,
    disciplineIds: filters.disciplineId ? [filters.disciplineId] : undefined,
    levelIds: filters.levelId ? [filters.levelId as EducationalLevelId] : undefined,
    difficulties: filters.difficulty ? [filters.difficulty] : undefined,
    publicationStatuses: ["published"],
    sort: filters.sort ?? (trimmedQuery ? "relevance" : "title"),
    sortDirection: "asc",
  });
  return result.items.map(toCardModel);
}

/**
 * Subject cards derived from the taxonomy registry. Experiment counts are
 * computed through the query API (discipline -> experiment references are
 * derived, never stored in the taxonomy itself).
 */
const subjectAccents = ["ochre", "blue", "violet", "green", "rose"] as const;

export function getSubjects(): SubjectModel[] {
  return catalog.taxonomy.disciplines.map((discipline, index) => ({
    id: discipline.id,
    label: discipline.label,
    description: discipline.description,
    publishedExperimentCount: queryExperiments(catalog, {
      disciplineIds: [discipline.id],
      publicationStatuses: ["published"],
      limit: 1,
    }).total,
    accent: subjectAccents[index % subjectAccents.length] ?? "ochre",
  }));
}

export function getDisciplineFacetOptions(): ExploreFacetOption[] {
  return catalog.taxonomy.disciplines.map((discipline) => ({
    id: discipline.id,
    label: discipline.label,
  }));
}

export function getDisciplineLabel(id: string): string {
  return disciplineLabels.get(id) ?? id;
}

export function getTopicLabel(id: string): string {
  return topicLabels.get(id) ?? id;
}

export function getLevelLabel(id: string): string {
  return levelLabels.get(id) ?? id;
}

export function getCurriculumLabel(curriculumId: string): string {
  const curriculum = catalog.curricula.curricula.find((item) => item.id === curriculumId);
  return curriculum?.name ?? curriculumId;
}

export function getCurriculumTopicLabel(curriculumId: string, topicId: string): string {
  const curriculum = catalog.curricula.curricula.find((item) => item.id === curriculumId);
  return curriculum?.topics.find((topic) => topic.id === topicId)?.label ?? topicId;
}

export function getLevelFacetOptions(): ExploreFacetOption[] {
  return catalog.levels.levels.map((level) => ({ id: level.id, label: level.label }));
}

export function getDifficultyFacetOptions(): ExploreFacetOption[] {
  return [
    { id: "introductory", label: "Introductory" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
  ];
}

export interface CollectionStats {
  publishedExperimentCount: string;
  disciplineCount: number;
  levelCount: number;
}

export function getCollectionStats(): CollectionStats {
  const published = queryExperiments(catalog, {
    publicationStatuses: ["published"],
    limit: 1,
  }).total;
  return {
    publishedExperimentCount: published < 10 ? `${published}` : `${published}`,
    disciplineCount: catalog.taxonomy.disciplines.length,
    levelCount: catalog.levels.levels.length,
  };
}
