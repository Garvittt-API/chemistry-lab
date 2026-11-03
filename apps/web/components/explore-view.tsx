"use client";

import { Filter, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  demoExperiments,
  type ExperimentDifficulty,
  type ExperimentDiscipline,
  type ExperimentLevel,
} from "../lib/content";
import { ExperimentCard, EmptyState } from "./ui";

type SortOrder = "relevance" | "title" | "duration";

export function ExploreView() {
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState<ExperimentDiscipline | "all">("all");
  const [level, setLevel] = useState<ExperimentLevel | "all">("all");
  const [difficulty, setDifficulty] = useState<ExperimentDifficulty | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("relevance");

  useEffect(() => {
    const requestedDiscipline = new URLSearchParams(window.location.search).get("discipline");
    if (
      requestedDiscipline &&
      demoExperiments.some((item) => item.discipline === requestedDiscipline)
    ) {
      setDiscipline(requestedDiscipline as ExperimentDiscipline);
    }
  }, []);

  const filteredExperiments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matching = demoExperiments.filter((experiment) => {
      const matchesQuery =
        !normalizedQuery ||
        `${experiment.title} ${experiment.summary}`.toLowerCase().includes(normalizedQuery);
      const matchesDiscipline = discipline === "all" || experiment.discipline === discipline;
      const matchesLevel = level === "all" || experiment.level === level;
      const matchesDifficulty = difficulty === "all" || experiment.difficulty === difficulty;
      return matchesQuery && matchesDiscipline && matchesLevel && matchesDifficulty;
    });

    return [...matching].sort((first, second) => {
      if (sortOrder === "title") return first.title.localeCompare(second.title);
      if (sortOrder === "duration") return first.duration.localeCompare(second.duration);
      return 0;
    });
  }, [difficulty, discipline, level, query, sortOrder]);

  return (
    <div className="container explore-layout">
      <aside className="filter-panel" aria-labelledby="filter-title">
        <h2 id="filter-title">
          <Filter size={18} aria-hidden="true" /> Refine the view
        </h2>
        <div className="filter-field filter-field-search">
          <label htmlFor="experiment-search">Search demonstration content</label>
          <div className="search-field">
            <Search size={17} aria-hidden="true" />
            <input
              className="input"
              id="experiment-search"
              type="search"
              placeholder="Try a concept or topic"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="filter-field">
          <label htmlFor="discipline-filter">Discipline</label>
          <select
            className="select"
            id="discipline-filter"
            value={discipline}
            onChange={(event) => setDiscipline(event.target.value as ExperimentDiscipline | "all")}
          >
            <option value="all">All disciplines</option>
            <option>General Chemistry</option>
            <option>Analytical Chemistry</option>
            <option>Organic Chemistry</option>
            <option>Physical Chemistry</option>
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="level-filter">Level</label>
          <select
            className="select"
            id="level-filter"
            value={level}
            onChange={(event) => setLevel(event.target.value as ExperimentLevel | "all")}
          >
            <option value="all">All levels</option>
            <option>Secondary</option>
            <option>Upper-secondary</option>
            <option>Undergraduate</option>
          </select>
        </div>
        <div className="filter-field">
          <label htmlFor="difficulty-filter">Difficulty</label>
          <select
            className="select"
            id="difficulty-filter"
            value={difficulty}
            onChange={(event) => setDifficulty(event.target.value as ExperimentDifficulty | "all")}
          >
            <option value="all">All difficulties</option>
            <option>Introductory</option>
            <option>Intermediate</option>
          </select>
        </div>
      </aside>

      <section aria-labelledby="results-title">
        <div className="results-toolbar">
          <p id="results-title" aria-live="polite">
            <strong>{filteredExperiments.length}</strong> demonstration{" "}
            {filteredExperiments.length === 1 ? "record" : "records"}
          </p>
          <div className="sort-field">
            <label htmlFor="sort-order">Sort</label>
            <select
              className="select"
              id="sort-order"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            >
              <option value="relevance">Relevance</option>
              <option value="title">Title</option>
              <option value="duration">Reading time</option>
            </select>
          </div>
        </div>
        {filteredExperiments.length > 0 ? (
          <div className="results-grid">
            {filteredExperiments.map((experiment) => (
              <ExperimentCard key={experiment.id} experiment={experiment} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No demonstration records match"
            description="Try removing a filter or searching for a broader topic. Reviewed experiment content will be added in a later phase."
          />
        )}
      </section>
    </div>
  );
}
