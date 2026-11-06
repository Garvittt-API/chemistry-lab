import type { Metadata } from "next";

import { ExploreView } from "../../components/explore-view";
import { ContentStatusBadge, PageIntro } from "../../components/ui";
import {
  searchExperimentCards,
  type ExperimentCardModel,
  type ExperimentDifficulty,
  type ExploreFilters,
} from "../../lib/content";

export const metadata: Metadata = {
  title: "Explore experiments",
  description: "Browse and search the Virtual Chemistry Lab experiment library.",
};

type ExplorePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const difficulties = new Set(["introductory", "intermediate", "advanced"]);

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;

  const difficultyParam = firstValue(params.difficulty) ?? "";
  const filters: ExploreFilters = {
    query: firstValue(params.q),
    disciplineId:
      firstValue(params.discipline) !== "all" ? firstValue(params.discipline) : undefined,
    levelId: firstValue(params.level) !== "all" ? firstValue(params.level) : undefined,
    difficulty: difficulties.has(difficultyParam) ? (difficultyParam as ExperimentDifficulty) : "",
    sort: firstValue(params.sort) as ExploreFilters["sort"],
  };

  let results: ExperimentCardModel[] = [];
  let errored = false;
  try {
    results = searchExperimentCards(filters);
  } catch {
    // Query failures surface as an explicit error state; never as placeholder rows.
    errored = true;
  }

  return (
    <div className="page">
      <PageIntro
        eyebrow="Explore experiments"
        title="Choose a question to investigate"
        description="Search and filter the published experiment library. Every record documents its authors, references, safety context and review status — and all current records are drafts awaiting independent scientific review."
      >
        <ContentStatusBadge
          scientificReviewStatus="draft"
          integrityLabel="pending_scientific_review"
        />
      </PageIntro>
      <ExploreView filters={filters} results={results} errored={errored} />
    </div>
  );
}
