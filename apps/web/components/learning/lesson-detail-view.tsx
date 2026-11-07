"use client";

import {
  getAssessmentByIdOrSlug,
  getGlossaryEntryById,
  getLessonProgressState,
  type Lesson,
} from "@virtual-chemistry-lab/learning-core";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { ClaimKindBadge, ProgressStatusPill, StageBadge } from "./badges";
import { DiagramFigure } from "./diagram-figure";
import { useLearningStore } from "./learning-store-provider";

export function LessonDetailView({
  lesson,
  experimentTitles,
}: Readonly<{
  lesson: Lesson;
  experimentTitles: Readonly<Record<string, string>>;
}>) {
  const { hydrated, snapshot, markLessonStarted, toggleLessonCompleted } = useLearningStore();

  useEffect(() => {
    if (hydrated) {
      markLessonStarted(lesson.id);
    }
  }, [hydrated, lesson.id, markLessonStarted]);

  const status = hydrated ? getLessonProgressState(lesson.id, snapshot) : "not_attempted";
  const isCompleted = status === "completed";

  const glossaryEntries = lesson.glossaryTermIds
    .map((id) => getGlossaryEntryById(id))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <div className="container">
      <p className="card-meta">
        <Link className="text-link" href="/learn">
          <ArrowLeft size={16} aria-hidden="true" /> Back to learning hub
        </Link>
      </p>

      <header className="notebook-header-bar">
        <div>
          <div className="learning-pill-row">
            <StageBadge stage={lesson.stage} />
            <ProgressStatusPill status={status} />
            <span className="badge badge-muted">Pending scientific review</span>
          </div>
          <h1>{lesson.title}</h1>
          <p className="detail-summary">{lesson.summary}</p>
          <p className="card-meta">
            <Clock3 size={15} aria-hidden="true" /> Estimated reading &amp; practice time: ~
            {lesson.estimatedDurationMinutes} minutes
          </p>
        </div>
        <div className="notebook-actions-row">
          <button
            type="button"
            className={isCompleted ? "button button-secondary" : "button"}
            onClick={() => toggleLessonCompleted(lesson.id, !isCompleted)}
          >
            {isCompleted ? (
              <>
                <RotateCcw size={16} aria-hidden="true" /> Mark as in progress
              </>
            ) : (
              <>
                <CheckCircle2 size={16} aria-hidden="true" /> Mark lesson completed
              </>
            )}
          </button>
        </div>
      </header>

      <section className="detail-section" aria-labelledby="lesson-intro-heading">
        <h2 id="lesson-intro-heading">Introduction &amp; learning objectives</h2>
        <p>{lesson.introduction}</p>
        <h3>Objectives</h3>
        <ul className="objective-list">
          {lesson.learningObjectives.map((obj) => (
            <li key={obj}>{obj}</li>
          ))}
        </ul>
      </section>

      <section className="detail-section" aria-labelledby="lesson-theory-heading">
        <h2 id="lesson-theory-heading">Theory &amp; key principles</h2>
        <div className="learning-grid-2">
          {lesson.theoryBlocks.map((block) => (
            <article key={block.heading} className="learning-card">
              <div className="learning-card-header">
                <h3>{block.heading}</h3>
                <ClaimKindBadge kind={block.claimKind} />
              </div>
              <p>{block.body}</p>
              {block.claimNote ? <p className="card-meta">{block.claimNote}</p> : null}
            </article>
          ))}
        </div>

        <h3>Important concepts</h3>
        <ul className="objective-list">
          {lesson.importantConcepts.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      {lesson.diagrams.length > 0 ? (
        <section className="detail-section" aria-labelledby="lesson-diagrams-heading">
          <h2 id="lesson-diagrams-heading">Explanatory diagrams</h2>
          {lesson.diagrams.map((diagram) => (
            <DiagramFigure key={diagram.id} diagram={diagram} />
          ))}
        </section>
      ) : null}

      {lesson.chemicalEquations.length > 0 || lesson.formulas.length > 0 ? (
        <section className="detail-section" aria-labelledby="lesson-equations-heading">
          <h2 id="lesson-equations-heading">Equations, formulas &amp; units</h2>
          {lesson.chemicalEquations.map((eq) => (
            <div key={eq.id} className="learning-card">
              <p>
                <code>{eq.equation}</code>
              </p>
              <p>{eq.description}</p>
              {eq.conditions ? <p className="card-meta">Conditions: {eq.conditions}</p> : null}
            </div>
          ))}

          {lesson.formulas.map((f) => (
            <div key={f.id} className="learning-card">
              <h3>{f.displayForm}</h3>
              <p>{f.description}</p>
              <div className="content-table-wrap">
                <table className="content-table">
                  <caption className="sr-only">Variables for {f.displayForm}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Symbol</th>
                      <th scope="col">Meaning</th>
                      <th scope="col">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {f.variables.map((v) => (
                      <tr key={`${f.id}-${v.symbol}`}>
                        <td>
                          <code>{v.symbol}</code>
                        </td>
                        <td>{v.meaning}</td>
                        <td>{v.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {f.assumptions.length > 0 ? (
                <p className="card-meta">Assumptions: {f.assumptions.join(" ")}</p>
              ) : null}
            </div>
          ))}
        </section>
      ) : null}

      {lesson.workedExamples.length > 0 ? (
        <section className="detail-section" aria-labelledby="lesson-examples-heading">
          <h2 id="lesson-examples-heading">Worked examples</h2>
          {lesson.workedExamples.map((ex) => (
            <div key={ex.id} className="learning-card">
              <div className="learning-card-header">
                <h3>{ex.title}</h3>
                <span className="status-pill">Illustrative worked example</span>
              </div>
              <p>{ex.problem}</p>
              <p className="card-meta">
                <strong>Given:</strong> {ex.given.join(" · ")}
              </p>
              <ol className="calc-step-list">
                {ex.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p>
                <strong>Result:</strong> <code>{ex.result}</code> ({ex.unit})
              </p>
              <p className="card-meta">
                {ex.precisionNote} · Illustrative worked example — not a physical laboratory
                reading.
              </p>
            </div>
          ))}
        </section>
      ) : null}

      {glossaryEntries.length > 0 ? (
        <section className="detail-section" aria-labelledby="lesson-glossary-heading">
          <h2 id="lesson-glossary-heading">Key definitions</h2>
          <div className="learning-grid-2">
            {glossaryEntries.map((g) => (
              <div key={g.id} className="learning-card">
                <h3>{g.term}</h3>
                <p>{g.definition}</p>
                {g.units.length > 0 ? (
                  <p className="card-meta">Units: {g.units.join(", ")}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {lesson.relatedExperimentIds.length > 0 || lesson.relatedAssessmentIds.length > 0 ? (
        <section className="detail-section" aria-labelledby="lesson-next-heading">
          <h2 id="lesson-next-heading">Related experiments &amp; assessments</h2>
          <div className="learning-grid-2">
            {lesson.relatedExperimentIds.map((expId) => (
              <div key={expId} className="learning-card">
                <p className="eyebrow">Practical experiment</p>
                <h3>{experimentTitles[expId] ?? expId}</h3>
                <div className="learning-card-footer">
                  <Link className="text-link" href={`/experiments/${expId}`}>
                    Open experiment <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                  <Link className="button button-secondary" href={`/notebook?experiment=${expId}`}>
                    Start notebook
                  </Link>
                </div>
              </div>
            ))}
            {lesson.relatedAssessmentIds.map((quizId) => {
              const quiz = getAssessmentByIdOrSlug(quizId);
              if (!quiz) return null;
              return (
                <div key={quiz.id} className="learning-card">
                  <p className="eyebrow">Assessment</p>
                  <h3>{quiz.title}</h3>
                  <p className="card-meta">
                    {quiz.questions.length} questions · Pass {quiz.passPercentage}%
                  </p>
                  <div className="learning-card-footer">
                    <Link
                      className="button button-secondary"
                      href={`/learn/assessments/${quiz.id}`}
                    >
                      Take quiz <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="detail-section" aria-labelledby="lesson-refs-heading">
        <h2 id="lesson-refs-heading">References &amp; further reading</h2>
        <ul className="objective-list">
          {lesson.references.map((r) => (
            <li key={r.id}>{r.citation}</li>
          ))}
        </ul>
        {lesson.furtherReading.length > 0 ? (
          <>
            <h3>Further reading</h3>
            <ul className="objective-list">
              {lesson.furtherReading.map((fr) => (
                <li key={fr}>{fr}</li>
              ))}
            </ul>
          </>
        ) : null}
      </section>
    </div>
  );
}
