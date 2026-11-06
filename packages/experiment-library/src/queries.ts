import type {
  Difficulty,
  EducationalLevelId,
  ExperimentRecord,
  PublicationStatus,
  ScientificReviewStatus,
  IntegrityLabel,
} from "@virtual-chemistry-lab/experiment-schema";

import type { ExperimentCatalog } from "./catalog.js";

/**
 * Pure query API over the experiment catalog.
 *
 * This module is dependency-free at runtime (types only) so client components
 * may import it directly; all filtering, searching, sorting and pagination
 * logic lives here rather than inside UI components.
 *
 * Semantics are deterministic and documented:
 * - Filter groups combine with AND; values inside one group combine with OR.
 * - Text search requires every query token to match somewhere in the indexed
 *   fields; relevance scores title > short description > topics/objectives >
 *   remaining content, with title order as a stable tie-breaker.
 * - Queries default to publication-status "published" only. Unpublished
 *   records require an explicit publicationStatuses filter.
 */

export interface ExperimentSummary {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  disciplineId: string;
  subdisciplineIds: string[];
  topicIds: string[];
  educationalLevels: EducationalLevelId[];
  difficulty: Difficulty;
  estimatedDurationMinutes: number;
  publicationStatus: PublicationStatus;
  scientificReviewStatus: ScientificReviewStatus;
  integrityLabel: IntegrityLabel;
  curriculumIds: string[];
  updatedOn: string;
  contentVersion: string;
}

export type ExperimentSortKey = "relevance" | "title" | "duration" | "difficulty" | "updated";
export type SortDirection = "asc" | "desc";

export interface ExperimentQuery {
  /** Free text matched against title, descriptions, topics and objectives. */
  text?: string;
  disciplineIds?: string[];
  subdisciplineIds?: string[];
  topicIds?: string[];
  levelIds?: EducationalLevelId[];
  difficulties?: Difficulty[];
  curriculumIds?: string[];
  publicationStatuses?: PublicationStatus[];
  sort?: ExperimentSortKey;
  sortDirection?: SortDirection;
  /** Page size; omit for the full result set. */
  limit?: number;
  /** Number of matching items to skip (offset pagination for the local library). */
  offset?: number;
}

export interface ExperimentQueryResult {
  total: number;
  items: ExperimentSummary[];
  hasMore: boolean;
  nextOffset: number | null;
  sort: ExperimentSortKey;
  sortDirection: SortDirection;
}

const difficultyOrder: Record<Difficulty, number> = {
  introductory: 0,
  intermediate: 1,
  advanced: 2,
};

export function toExperimentSummary(record: ExperimentRecord): ExperimentSummary {
  return {
    id: record.identity.id,
    slug: record.identity.slug,
    title: record.identity.title,
    shortDescription: record.identity.shortDescription,
    disciplineId: record.classification.disciplineId,
    subdisciplineIds: [...record.classification.subdisciplineIds],
    topicIds: [...record.classification.topicIds],
    educationalLevels: [...record.classification.educationalLevels],
    difficulty: record.classification.difficulty,
    estimatedDurationMinutes: record.classification.estimatedDurationMinutes,
    publicationStatus: record.identity.publicationStatus,
    scientificReviewStatus: record.review.scientificReviewStatus,
    integrityLabel: record.review.integrityLabel,
    curriculumIds: record.classification.curriculumMappings.map((mapping) => mapping.curriculumId),
    updatedOn: record.identity.updatedOn,
    contentVersion: record.identity.contentVersion,
  };
}

function matchesAny(selected: string[] | undefined, values: string[]): boolean {
  if (!selected || selected.length === 0) return true;
  return selected.some((value) => values.includes(value));
}

function tokenScore(record: ExperimentRecord, token: string): number | null {
  const title = record.identity.title.toLowerCase();
  const short = record.identity.shortDescription.toLowerCase();
  const full = record.identity.fullDescription.toLowerCase();
  const topics = record.classification.topicIds.join(" ").toLowerCase();
  const objectives = record.educational.learningObjectives.join(" ").toLowerCase();
  const theory = record.educational.theory.overview.toLowerCase();

  if (title.includes(token)) return 6;
  if (short.includes(token)) return 4;
  if (topics.includes(token)) return 3;
  if (objectives.includes(token)) return 2;
  if (full.includes(token) || theory.includes(token)) return 1;
  return null;
}

/** Deterministic relevance score; higher is better. Missing tokens score -1. */
export function scoreMatch(record: ExperimentRecord, query: string): number {
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  if (tokens.length === 0) return 0;

  let total = 0;
  for (const token of tokens) {
    const score = tokenScore(record, token);
    if (score === null) return -1;
    total += score;
  }
  return total;
}

/** Filter the catalog records without text search, sorting or pagination. */
export function filterExperiments(
  catalog: ExperimentCatalog,
  filters: Omit<ExperimentQuery, "text" | "sort" | "sortDirection" | "limit" | "offset"> = {},
): ExperimentSummary[] {
  const publicationStatuses = filters.publicationStatuses ?? ["published"];

  return catalog.experiments
    .filter((record) => {
      if (!publicationStatuses.includes(record.identity.publicationStatus)) return false;
      if (!matchesAny(filters.disciplineIds, [record.classification.disciplineId])) return false;
      if (!matchesAny(filters.subdisciplineIds, record.classification.subdisciplineIds))
        return false;
      if (!matchesAny(filters.topicIds, record.classification.topicIds)) return false;
      if (
        !matchesAny(
          filters.levelIds as string[] | undefined,
          record.classification.educationalLevels,
        )
      ) {
        return false;
      }
      if (
        !matchesAny(filters.difficulties as string[] | undefined, [
          record.classification.difficulty,
        ])
      ) {
        return false;
      }
      const curriculumIds = record.classification.curriculumMappings.map(
        (mapping) => mapping.curriculumId,
      );
      if (!matchesAny(filters.curriculumIds, curriculumIds)) return false;
      return true;
    })
    .map(toExperimentSummary);
}

/** Search catalog records by free text (before sorting/pagination). */
export function searchExperiments(
  catalog: ExperimentCatalog,
  text: string,
  publicationStatuses: PublicationStatus[] = ["published"],
): ExperimentSummary[] {
  const query = text.trim();
  if (query === "") return filterExperiments(catalog, { publicationStatuses });

  return catalog.experiments
    .filter((record) => publicationStatuses.includes(record.identity.publicationStatus))
    .map((record) => ({ record, score: scoreMatch(record, query) }))
    .filter((entry) => entry.score >= 0)
    .sort((first, second) => {
      if (second.score !== first.score) return second.score - first.score;
      return first.record.identity.title.localeCompare(second.record.identity.title);
    })
    .map((entry) => toExperimentSummary(entry.record));
}

/** Combined query: text, filters, sorting and offset/limit pagination. */
export function queryExperiments(
  catalog: ExperimentCatalog,
  query: ExperimentQuery = {},
): ExperimentQueryResult {
  const sort = query.sort ?? (query.text && query.text.trim() !== "" ? "relevance" : "title");
  const sortDirection = query.sortDirection ?? "asc";

  const publicationStatuses = query.publicationStatuses ?? ["published"];
  const filtered = filterExperiments(catalog, {
    disciplineIds: query.disciplineIds,
    subdisciplineIds: query.subdisciplineIds,
    topicIds: query.topicIds,
    levelIds: query.levelIds,
    difficulties: query.difficulties,
    curriculumIds: query.curriculumIds,
    publicationStatuses,
  });

  let items = filtered;
  const text = query.text?.trim() ?? "";
  const scores = new Map<string, number>();
  if (text !== "") {
    for (const summary of filtered) {
      const record = catalog.experiments.find((entry) => entry.identity.id === summary.id);
      const score = record ? scoreMatch(record, text) : -1;
      scores.set(summary.id, score);
    }
    items = filtered.filter((summary) => (scores.get(summary.id) ?? -1) >= 0);
  }

  const direction = sortDirection === "desc" ? -1 : 1;
  items = [...items].sort((first, second) => {
    switch (sort) {
      case "relevance": {
        const firstScore = scores.get(first.id) ?? 0;
        const secondScore = scores.get(second.id) ?? 0;
        if (secondScore !== firstScore) return secondScore - firstScore;
        return first.title.localeCompare(second.title);
      }
      case "title":
        return direction * first.title.localeCompare(second.title);
      case "duration":
        return (
          direction *
          (first.estimatedDurationMinutes - second.estimatedDurationMinutes ||
            first.title.localeCompare(second.title))
        );
      case "difficulty":
        return (
          direction *
          (difficultyOrder[first.difficulty] - difficultyOrder[second.difficulty] ||
            first.title.localeCompare(second.title))
        );
      case "updated":
        return (
          direction *
          (first.updatedOn.localeCompare(second.updatedOn) ||
            first.title.localeCompare(second.title))
        );
    }
  });

  const total = items.length;
  const offset = Math.max(0, query.offset ?? 0);
  const limit = query.limit ?? total;
  const page = items.slice(offset, offset + limit);
  const consumed = offset + page.length;

  return {
    total,
    items: page,
    hasMore: consumed < total,
    nextOffset: consumed < total ? consumed : null,
    sort,
    sortDirection,
  };
}

/** Retrieve a record by stable identifier (or slug via getByIdOrSlug). */
export function getExperimentById(
  catalog: ExperimentCatalog,
  id: string,
): ExperimentRecord | undefined {
  return catalog.experiments.find((record) => record.identity.id === id);
}

export function getExperimentBySlug(
  catalog: ExperimentCatalog,
  slug: string,
): ExperimentRecord | undefined {
  return catalog.experiments.find((record) => record.identity.slug === slug);
}

export function getExperimentByIdOrSlug(
  catalog: ExperimentCatalog,
  key: string,
): ExperimentRecord | undefined {
  return getExperimentById(catalog, key) ?? getExperimentBySlug(catalog, key);
}

/**
 * Publicly visible experiments are publication-status "published" only.
 * Draft, in_review, approved and archived records are never exposed to
 * ordinary public browsing.
 */
export function isPubliclyVisible(record: ExperimentRecord): boolean {
  return record.identity.publicationStatus === "published";
}

export function getPublicExperimentByIdOrSlug(
  catalog: ExperimentCatalog,
  key: string,
): ExperimentRecord | undefined {
  const record = getExperimentByIdOrSlug(catalog, key);
  return record && isPubliclyVisible(record) ? record : undefined;
}
