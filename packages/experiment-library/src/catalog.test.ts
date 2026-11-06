import { describe, expect, it } from "vitest";

import { CatalogValidationError, buildCatalog, catalog } from "./catalog.js";
import {
  filterExperiments,
  getExperimentById,
  getExperimentByIdOrSlug,
  getExperimentBySlug,
  getPublicExperimentByIdOrSlug,
  isPubliclyVisible,
  queryExperiments,
  scoreMatch,
  searchExperiments,
  toExperimentSummary,
} from "./queries.js";

/**
 * Catalog tests run against the real bundled content: loading it is itself the
 * first validation gate (schema + referential integrity + duplicate detection).
 */
describe("bundled catalog", () => {
  it("loads and validates all bundled content", () => {
    expect(catalog.experiments.length).toBeGreaterThanOrEqual(10);
    expect(catalog.taxonomy.disciplines.length).toBeGreaterThanOrEqual(15);
    expect(catalog.levels.levels.length).toBe(6);
    expect(catalog.curricula.curricula.length).toBeGreaterThanOrEqual(1);
  });

  it("contains stable, unique ids and slugs", () => {
    const ids = catalog.experiments.map((record) => record.identity.id);
    const slugs = catalog.experiments.map((record) => record.identity.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("exercises every publication state used by the workflow", () => {
    const statuses = new Set(
      catalog.experiments.map((record) => record.identity.publicationStatus),
    );
    expect(statuses.has("published")).toBe(true);
    expect(statuses.has("draft")).toBe(true);
  });

  it("never claims scientific validation for bundled content", () => {
    for (const record of catalog.experiments) {
      expect(record.review.scientificReviewStatus).not.toBe("validated_for_education");
      expect(record.review.scientificReviewer).toBeUndefined();
    }
  });
});

describe("buildCatalog validation", () => {
  function minimalValidInput() {
    return {
      experiments: [structuredClone(catalog.experiments[0])],
      taxonomy: structuredClone(catalog.taxonomy),
      educationalLevels: structuredClone(catalog.levels),
      curricula: structuredClone(catalog.curricula),
    };
  }

  it("detects duplicate experiment ids and slugs", () => {
    const input = minimalValidInput();
    input.experiments.push(structuredClone(catalog.experiments[0]));
    expect(() => buildCatalog(input)).toThrow(CatalogValidationError);
    try {
      buildCatalog(input);
    } catch (error) {
      expect(
        (error as CatalogValidationError).issues.some((issue) => issue.includes("duplicate")),
      ).toBe(true);
    }
  });

  it("rejects invalid records with actionable errors", () => {
    const input = minimalValidInput();
    (input.experiments[0] as { identity: { title: string } }).identity.title = "";
    expect(() => buildCatalog(input)).toThrow(CatalogValidationError);
    try {
      buildCatalog(input);
      expect.unreachable("should have thrown");
    } catch (error) {
      expect((error as CatalogValidationError).issues.join("\n")).toContain("experiments[0]");
    }
  });

  it("rejects experiments referencing unregistered taxonomy entries", () => {
    const input = minimalValidInput();
    const record = input.experiments[0] as unknown as {
      classification: { disciplineId: string; topicIds: string[] };
    };
    record.classification.disciplineId = "unknown-chemistry";
    expect(() => buildCatalog(input)).toThrow(/unknown discipline/);

    const input2 = minimalValidInput();
    const record2 = input2.experiments[0] as unknown as {
      classification: { topicIds: string[] };
    };
    record2.classification.topicIds = ["unregistered-topic"];
    expect(() => buildCatalog(input2)).toThrow(/unknown topic/);
  });

  it("rejects experiments referencing unregistered curricula", () => {
    const input = minimalValidInput();
    const record = input.experiments[0] as unknown as {
      classification: {
        curriculumMappings: {
          curriculumId: string;
          academicLevel: string;
          confidence: string;
          evidenceRefIds: string[];
        }[];
      };
    };
    record.classification.curriculumMappings = [
      {
        curriculumId: "missing-curriculum",
        academicLevel: "higher-secondary",
        confidence: "proposed_pending_verification",
        syllabusNote: "Fixture mapping used only to exercise referential validation.",
        evidenceRefIds: [],
      },
    ];
    expect(() => buildCatalog(input)).toThrow(/unknown curriculum/);
  });
});

describe("retrieval", () => {
  it("retrieves by id and by slug", () => {
    const first = catalog.experiments[0];
    expect(getExperimentById(catalog, first?.identity.id ?? "")?.identity.id).toBe(
      first?.identity.id,
    );
    expect(getExperimentBySlug(catalog, first?.identity.slug ?? "")?.identity.id).toBe(
      first?.identity.id,
    );
    expect(getExperimentByIdOrSlug(catalog, first?.identity.slug ?? "")?.identity.id).toBe(
      first?.identity.id,
    );
  });

  it("returns undefined for missing records", () => {
    expect(getExperimentById(catalog, "does-not-exist")).toBeUndefined();
    expect(getExperimentBySlug(catalog, "does-not-exist")).toBeUndefined();
    expect(getExperimentByIdOrSlug(catalog, "does-not-exist")).toBeUndefined();
  });

  it("restricts public retrieval to published records", () => {
    const draft = catalog.experiments.find(
      (record) => record.identity.publicationStatus === "draft",
    );
    expect(draft).toBeDefined();
    if (draft) {
      expect(isPubliclyVisible(draft)).toBe(false);
      expect(getExperimentByIdOrSlug(catalog, draft.identity.id)).toBeDefined();
      expect(getPublicExperimentByIdOrSlug(catalog, draft.identity.id)).toBeUndefined();
    }
  });
});

describe("search", () => {
  it("finds experiments by title terms", () => {
    const results = searchExperiments(catalog, "titration");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.title.toLowerCase()).toContain("titration");
  });

  it("requires all query tokens to match", () => {
    const single = searchExperiments(catalog, "chromatography");
    const combined = searchExperiments(catalog, "chromatography paper");
    expect(single.length).toBeGreaterThan(0);
    expect(combined.length).toBeGreaterThan(0);
    expect(combined.length).toBeLessThanOrEqual(single.length);
    const impossible = searchExperiments(catalog, "chromatography unicorns");
    expect(impossible).toEqual([]);
  });

  it("excludes unpublished records from search by default", () => {
    const results = searchExperiments(catalog, "spectroscopic");
    expect(results.every((summary) => summary.publicationStatus === "published")).toBe(true);
    const withDrafts = searchExperiments(catalog, "spectroscopic", ["published", "draft"]);
    expect(withDrafts.some((summary) => summary.publicationStatus === "draft")).toBe(true);
  });

  it("scores title matches above description matches", () => {
    const record = getExperimentById(catalog, "acid-base-titration");
    expect(record).toBeDefined();
    if (record) {
      expect(scoreMatch(record, "Acid–Base Titration")).toBeGreaterThan(
        scoreMatch(record, "burette"),
      );
      expect(scoreMatch(record, "nonexistent-term")).toBe(-1);
    }
  });
});

describe("filtering and sorting", () => {
  it("filters by discipline, level, difficulty, topic and curriculum", () => {
    const analytical = filterExperiments(catalog, { disciplineIds: ["analytical-chemistry"] });
    expect(analytical.length).toBeGreaterThan(0);
    expect(analytical.every((summary) => summary.disciplineId === "analytical-chemistry")).toBe(
      true,
    );

    const school = filterExperiments(catalog, { levelIds: ["school"] });
    expect(school.every((summary) => summary.educationalLevels.includes("school"))).toBe(true);

    const introductory = filterExperiments(catalog, { difficulties: ["introductory"] });
    expect(introductory.every((summary) => summary.difficulty === "introductory")).toBe(true);

    const kinetics = filterExperiments(catalog, { topicIds: ["chemical-kinetics"] });
    expect(kinetics.some((summary) => summary.id === "reaction-rates-thiosulfate")).toBe(true);

    const cbse = filterExperiments(catalog, { curriculumIds: ["cbse-chemistry-2025-26"] });
    expect(cbse.length).toBeGreaterThan(0);
  });

  it("combines filter groups with AND semantics", () => {
    const combined = filterExperiments(catalog, {
      disciplineIds: ["analytical-chemistry"],
      difficulties: ["introductory"],
      levelIds: ["school"],
    });
    for (const summary of combined) {
      expect(summary.disciplineId).toBe("analytical-chemistry");
      expect(summary.difficulty).toBe("introductory");
      expect(summary.educationalLevels).toContain("school");
    }
  });

  it("supports multiple values within one filter group (OR)", () => {
    const twoDisciplines = filterExperiments(catalog, {
      disciplineIds: ["electrochemistry", "inorganic-chemistry"],
    });
    const ids = new Set(twoDisciplines.map((summary) => summary.disciplineId));
    expect(ids.size).toBe(2);
  });

  it("sorts by title, duration, difficulty and update date", () => {
    const byTitle = queryExperiments(catalog, { sort: "title", sortDirection: "asc" });
    const titles = byTitle.items.map((summary) => summary.title);
    expect([...titles].sort((a, b) => a.localeCompare(b))).toEqual(titles);

    const byDuration = queryExperiments(catalog, { sort: "duration", sortDirection: "asc" });
    const durations = byDuration.items.map((summary) => summary.estimatedDurationMinutes);
    expect(durations).toEqual([...durations].sort((a, b) => a - b));

    const byDifficulty = queryExperiments(catalog, { sort: "difficulty", sortDirection: "asc" });
    const first = byDifficulty.items[0];
    expect(first?.difficulty).toBe("introductory");

    const byUpdatedDesc = queryExperiments(catalog, { sort: "updated", sortDirection: "desc" });
    const dates = byUpdatedDesc.items.map((summary) => summary.updatedOn);
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

describe("pagination and publication filtering", () => {
  it("paginates deterministically", () => {
    const all = queryExperiments(catalog, { sort: "title" });
    const page1 = queryExperiments(catalog, { sort: "title", limit: 3, offset: 0 });
    const page2 = queryExperiments(catalog, { sort: "title", limit: 3, offset: 3 });

    expect(page1.items).toEqual(all.items.slice(0, 3));
    expect(page2.items).toEqual(all.items.slice(3, 6));
    expect(page1.total).toBe(all.total);
    expect(page1.hasMore).toBe(true);
    expect(page1.nextOffset).toBe(3);
  });

  it("reports a null next offset on the final page", () => {
    const all = queryExperiments(catalog, { sort: "title" });
    const lastPage = queryExperiments(catalog, {
      sort: "title",
      limit: all.total,
      offset: 0,
    });
    expect(lastPage.hasMore).toBe(false);
    expect(lastPage.nextOffset).toBeNull();
  });

  it("hides unpublished records by default and reveals them on request", () => {
    const publishedOnly = queryExperiments(catalog, {});
    expect(publishedOnly.items.every((summary) => summary.publicationStatus === "published")).toBe(
      true,
    );

    const everything = queryExperiments(catalog, {
      publicationStatuses: ["draft", "in_review", "approved", "published", "archived"],
    });
    expect(everything.total).toBeGreaterThan(publishedOnly.total);
  });

  it("produces summaries carrying the fields the discovery UI needs", () => {
    const summary = toExperimentSummary(catalog.experiments[0]!);
    expect(summary.id).toBeTruthy();
    expect(summary.slug).toBeTruthy();
    expect(summary.scientificReviewStatus).toBeTruthy();
    expect(summary.integrityLabel).toBeTruthy();
    expect(Array.isArray(summary.curriculumIds)).toBe(true);
  });
});
