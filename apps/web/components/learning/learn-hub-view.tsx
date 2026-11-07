"use client";

import {
  computePathwayProgress,
  getAssessmentProgressSummary,
  getLessonProgressState,
  listAssessments,
  listLessons,
  listPathways,
  type ChemistryCategory,
  type LearningStage,
} from "@virtual-chemistry-lab/learning-core";
import { ArrowRight, BookMarked, CheckSquare, Clock3, Compass, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProgressStatusPill, StageBadge } from "./badges";
import { useLearningStore } from "./learning-store-provider";

const STAGE_OPTIONS: Array<{ value: "" | LearningStage; label: string }> = [
  { value: "", label: "All stages" },
  { value: "beginner", label: "Beginner" },
  { value: "school", label: "School" },
  { value: "intermediate", label: "Intermediate / Class XI–XII" },
  { value: "college", label: "College / Undergraduate" },
  { value: "advanced", label: "Advanced" },
];

const CATEGORY_OPTIONS: Array<{ value: "" | ChemistryCategory; label: string }> = [
  { value: "", label: "All chemistry tracks" },
  { value: "general-chemistry", label: "General Chemistry" },
  { value: "solutions-and-concentration", label: "Solutions & Concentration" },
  { value: "acid-base-chemistry", label: "Acid–Base Chemistry" },
  { value: "analytical-chemistry", label: "Analytical Chemistry" },
  { value: "physical-chemistry", label: "Physical Chemistry" },
  { value: "chemical-kinetics", label: "Chemical Kinetics" },
  { value: "electrochemistry", label: "Electrochemistry" },
  { value: "inorganic-chemistry", label: "Inorganic Chemistry" },
];

export function LearnHubView() {
  const { hydrated, snapshot } = useLearningStore();
  const [stage, setStage] = useState<"" | LearningStage>("");
  const [category, setCategory] = useState<"" | ChemistryCategory>("");
  const [query, setQuery] = useState("");

  const pathways = useMemo(
    () => listPathways({ stage, category, query }),
    [stage, category, query],
  );
  const lessons = useMemo(() => {
    const all = listLessons();
    const q = query.trim().toLowerCase();
    return all.filter((l) => {
      if (stage && l.stage !== stage) return false;
      if (category && l.category !== category) return false;
      if (q && !`${l.title} ${l.summary} ${l.category}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [stage, category, query]);

  const assessments = useMemo(() => {
    const all = listAssessments();
    const q = query.trim().toLowerCase();
    return all.filter((a) => {
      if (stage && a.stage !== stage) return false;
      if (q && !`${a.title} ${a.description}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [stage, query]);

  return (
    <div className="container">
      <div className="science-integrity-banner">
        <GraduationCap size={22} aria-hidden="true" />
        <div>
          <strong>Structured pathways &amp; scientific review disclosure</strong>
          <p>
            Lessons, worked examples and assessments are grounded in verified textbook and IUPAC
            references and remain marked <em>pending independent scientific review</em>. Progress is
            stored locally in this browser — no account or cloud profile is required.
          </p>
        </div>
      </div>

      <section aria-label="Filter learning content" className="learning-filter-bar">
        <label className="learning-field">
          Search pathways, lessons or quizzes
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. dilution, titration, pH, kinetics..."
          />
        </label>
        <label className="learning-field">
          Educational stage
          <select value={stage} onChange={(e) => setStage(e.target.value as "" | LearningStage)}>
            {STAGE_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="learning-field">
          Chemistry track
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as "" | ChemistryCategory)}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="section" aria-labelledby="pathways-heading">
        <div className="learning-card-header">
          <div>
            <p className="eyebrow">Guided sequences</p>
            <h2 id="pathways-heading">Learning pathways ({pathways.length})</h2>
          </div>
          <Link className="button button-secondary" href="/learn/glossary">
            <BookMarked size={16} aria-hidden="true" /> Chemistry Glossary
          </Link>
        </div>

        {pathways.length === 0 ? (
          <p className="card-meta">No pathways match the current filters.</p>
        ) : (
          <div className="learning-grid-2">
            {pathways.map((pathway) => {
              const prog = hydrated
                ? computePathwayProgress(pathway, snapshot)
                : {
                    status: "not_attempted" as const,
                    completedRequiredCount: 0,
                    totalRequiredCount: pathway.items.length,
                    completionFraction: 0,
                  };
              const pct = Math.round(prog.completionFraction * 100);
              return (
                <article key={pathway.id} className="learning-card">
                  <div className="learning-card-header">
                    <StageBadge stage={pathway.stage} />
                    <ProgressStatusPill status={prog.status} />
                  </div>
                  <h3>{pathway.title}</h3>
                  <p>{pathway.description}</p>
                  <p className="card-meta">
                    <Compass size={14} aria-hidden="true" /> {pathway.items.length} ordered steps ·{" "}
                    <Clock3 size={14} aria-hidden="true" /> ~{pathway.estimatedDurationMinutes} min
                  </p>
                  <div
                    role="progressbar"
                    aria-label={`${pathway.title} completion`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={hydrated ? pct : undefined}
                    className="progress-bar-track"
                  >
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="learning-card-footer">
                    <span className="card-meta">
                      {prog.completedRequiredCount}/{prog.totalRequiredCount} required completed
                    </span>
                    <Link className="text-link" href={`/learn/pathways/${pathway.slug}`}>
                      Open pathway <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section section-border" aria-labelledby="lessons-heading">
        <p className="eyebrow">Concept &amp; theory modules</p>
        <h2 id="lessons-heading">Structured lessons ({lessons.length})</h2>
        {lessons.length === 0 ? (
          <p className="card-meta">No lessons match the current filters.</p>
        ) : (
          <div className="learning-grid-3">
            {lessons.map((lesson) => {
              const st = hydrated ? getLessonProgressState(lesson.id, snapshot) : "not_attempted";
              return (
                <article key={lesson.id} className="learning-card">
                  <div className="learning-card-header">
                    <StageBadge stage={lesson.stage} />
                    <ProgressStatusPill status={st} />
                  </div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.summary}</p>
                  <div className="learning-card-footer">
                    <span className="card-meta">~{lesson.estimatedDurationMinutes} min</span>
                    <Link className="text-link" href={`/learn/lessons/${lesson.slug}`}>
                      Read lesson <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section section-border" aria-labelledby="assessments-heading">
        <p className="eyebrow">Knowledge &amp; calculation checks</p>
        <h2 id="assessments-heading">Assessments &amp; quizzes ({assessments.length})</h2>
        {assessments.length === 0 ? (
          <p className="card-meta">No assessments match the current filters.</p>
        ) : (
          <div className="learning-grid-3">
            {assessments.map((quiz) => {
              const summary = hydrated
                ? getAssessmentProgressSummary(quiz.id, snapshot.assessmentAttempts)
                : { status: "not_attempted" as const, bestPercentage: null, attemptCount: 0 };
              return (
                <article key={quiz.id} className="learning-card">
                  <div className="learning-card-header">
                    <StageBadge stage={quiz.stage} />
                    <ProgressStatusPill status={summary.status} />
                  </div>
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description}</p>
                  <div className="learning-card-footer">
                    <span className="card-meta">
                      <CheckSquare size={14} aria-hidden="true" /> {quiz.questions.length} questions
                      · Pass {quiz.passPercentage}%
                      {summary.bestPercentage !== null ? ` · Best ${summary.bestPercentage}%` : ""}
                    </span>
                    <Link className="text-link" href={`/learn/assessments/${quiz.id}`}>
                      Start quiz <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
