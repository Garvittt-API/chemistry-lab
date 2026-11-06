import { Filter, Search } from "lucide-react";

import type { ExploreFilters, ExperimentCardModel } from "../lib/content";
import {
  getDifficultyFacetOptions,
  getDisciplineFacetOptions,
  getLevelFacetOptions,
} from "../lib/content";
import { EmptyState, ExperimentCard } from "./ui";

/**
 * Server-rendered discovery surface. Filtering and search run through the
 * experiment-library query engine (see lib/content.ts); this component only
 * renders the form and results. Results are real — an empty result set shows
 * the empty state rather than placeholder content.
 */
export function ExploreView({
  filters,
  results,
  errored = false,
}: Readonly<{
  filters: ExploreFilters;
  results: ExperimentCardModel[];
  errored?: boolean;
}>) {
  const disciplineOptions = getDisciplineFacetOptions();
  const levelOptions = getLevelFacetOptions();
  const difficultyOptions = getDifficultyFacetOptions();

  return (
    <div className="container explore-layout">
      <aside className="filter-panel" aria-labelledby="filter-title">
        <h2 id="filter-title">
          <Filter size={18} aria-hidden="true" /> Refine the view
        </h2>
        <form method="get" action="/explore">
          <div className="filter-field filter-field-search">
            <label htmlFor="experiment-search">Search published experiments</label>
            <div className="search-field">
              <Search size={17} aria-hidden="true" />
              <input
                className="input"
                id="experiment-search"
                name="q"
                type="search"
                placeholder="Try a concept or topic"
                defaultValue={filters.query ?? ""}
              />
            </div>
          </div>
          <div className="filter-field">
            <label htmlFor="discipline-filter">Discipline</label>
            <select
              className="select"
              id="discipline-filter"
              name="discipline"
              defaultValue={filters.disciplineId ?? "all"}
            >
              <option value="all">All disciplines</option>
              {disciplineOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="level-filter">Level</label>
            <select
              className="select"
              id="level-filter"
              name="level"
              defaultValue={filters.levelId ?? "all"}
            >
              <option value="all">All levels</option>
              {levelOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="difficulty-filter">Difficulty</label>
            <select
              className="select"
              id="difficulty-filter"
              name="difficulty"
              defaultValue={filters.difficulty ?? "all"}
            >
              <option value="all">All difficulties</option>
              {difficultyOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-field">
            <label htmlFor="sort-filter">Sort by</label>
            <select
              className="select"
              id="sort-filter"
              name="sort"
              defaultValue={filters.sort ?? "relevance"}
            >
              <option value="relevance">Relevance</option>
              <option value="title">Title</option>
              <option value="duration">Duration</option>
              <option value="difficulty">Difficulty</option>
              <option value="updated">Recently updated</option>
            </select>
          </div>
          <button className="button button-secondary" type="submit">
            Apply filters
          </button>
        </form>
      </aside>

      <section aria-labelledby="results-title">
        <div className="results-toolbar">
          <p id="results-title" aria-live="polite">
            <strong>{results.length}</strong> published{" "}
            {results.length === 1 ? "experiment" : "experiments"}
            {filters.query ? (
              <>
                {" "}
                matching <strong>“{filters.query}”</strong>
              </>
            ) : null}
          </p>
          <p className="card-meta">
            Every record is authored for this project and pending independent scientific review.
          </p>
        </div>

        {errored ? (
          <EmptyState
            icon="alert"
            title="The experiment search could not be completed"
            description="Something went wrong while querying the experiment library. Please reload the page or try again with simpler filters. No placeholder results are being shown."
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="No published experiments match these filters"
            description="Try removing a filter or searching for a broader concept such as “solutions”, “titration” or “equilibrium”. The library is young and grows with each reviewed addition."
          />
        ) : (
          <div className="card-grid">
            {results.map((experiment, index) => (
              <ExperimentCard key={experiment.id} experiment={experiment} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
