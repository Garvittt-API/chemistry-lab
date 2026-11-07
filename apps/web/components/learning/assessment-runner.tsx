"use client";

import {
  evaluateAssessmentAttempt,
  getAssessmentProgressSummary,
  toLearnerQuestions,
  type Assessment,
  type AssessmentAttempt,
  type LearnerAssessmentQuestion,
  type QuestionResponse,
} from "@virtual-chemistry-lab/learning-core";
import { ArrowLeft, CheckCircle2, RotateCcw, Send, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { ProgressStatusPill, StageBadge } from "./badges";
import { useLearningStore } from "./learning-store-provider";

type DraftAnswerMap = Record<
  string,
  {
    selectedOptionId?: string;
    selectedOptionIds?: string[];
    boolAnswer?: "true" | "false";
    numericRaw?: string;
    numericUnit?: string;
    text?: string;
  }
>;

export function AssessmentRunner({ assessment }: Readonly<{ assessment: Assessment }>) {
  const { hydrated, snapshot, recordAssessmentAttempt } = useLearningStore();
  const learnerQuestions = useMemo(() => toLearnerQuestions(assessment), [assessment]);

  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [drafts, setDrafts] = useState<DraftAnswerMap>({});
  const [submittedAttempt, setSubmittedAttempt] = useState<AssessmentAttempt | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const priorAttempts = useMemo(
    () =>
      hydrated ? snapshot.assessmentAttempts.filter((a) => a.assessmentId === assessment.id) : [],
    [hydrated, snapshot.assessmentAttempts, assessment.id],
  );
  const progressSummary = useMemo(
    () => getAssessmentProgressSummary(assessment.id, priorAttempts),
    [assessment.id, priorAttempts],
  );

  const updateDraft = (questionId: string, patch: DraftAnswerMap[string]) => {
    setDrafts((prev) => ({
      ...prev,
      [questionId]: { ...prev[questionId], ...patch },
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    const responses: QuestionResponse[] = [];
    for (const q of learnerQuestions) {
      const d = drafts[q.id];
      if (!d) continue;

      if (q.type === "multiple_choice" && d.selectedOptionId) {
        responses.push({
          questionId: q.id,
          type: "multiple_choice",
          selectedOptionId: d.selectedOptionId,
        });
      } else if (
        q.type === "multiple_select" &&
        d.selectedOptionIds &&
        d.selectedOptionIds.length > 0
      ) {
        responses.push({
          questionId: q.id,
          type: "multiple_select",
          selectedOptionIds: d.selectedOptionIds,
        });
      } else if (q.type === "true_false" && d.boolAnswer) {
        responses.push({
          questionId: q.id,
          type: "true_false",
          answer: d.boolAnswer === "true",
        });
      } else if (
        q.type === "numerical" &&
        d.numericRaw !== undefined &&
        d.numericRaw.trim() !== ""
      ) {
        const parsed = Number(d.numericRaw.trim());
        if (!Number.isFinite(parsed)) {
          setValidationError(
            `Question "${q.prompt.slice(0, 48)}..." requires a finite numerical value.`,
          );
          return;
        }
        responses.push({
          questionId: q.id,
          type: "numerical",
          value: parsed,
          unit: d.numericUnit ?? q.expectedUnit,
        });
      } else if (q.type === "short_answer" && d.text !== undefined && d.text.trim() !== "") {
        responses.push({
          questionId: q.id,
          type: "short_answer",
          text: d.text.trim(),
        });
      } else if (q.type === "chemical_equation" && d.text !== undefined && d.text.trim() !== "") {
        responses.push({
          questionId: q.id,
          type: "chemical_equation",
          expression: d.text.trim(),
        });
      }
    }

    const evaluated = evaluateAssessmentAttempt(assessment, responses, {
      startedAt,
      submittedAt: new Date().toISOString(),
    });
    recordAssessmentAttempt(evaluated);
    setSubmittedAttempt(evaluated);
  };

  const handleRetry = () => {
    setDrafts({});
    setSubmittedAttempt(null);
    setValidationError(null);
    setStartedAt(new Date().toISOString());
  };

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
            <StageBadge stage={assessment.stage} />
            <ProgressStatusPill status={progressSummary.status} />
            <span className="badge badge-muted">Pass threshold: {assessment.passPercentage}%</span>
          </div>
          <h1>{assessment.title}</h1>
          <p className="detail-summary">{assessment.description}</p>
          <p className="card-meta">
            {learnerQuestions.length} questions · Deterministic rule &amp; simulation-core grading
            (not adaptive AI grading) · Attempts recorded locally: {priorAttempts.length}
            {progressSummary.bestPercentage !== null
              ? ` · Best score: ${progressSummary.bestPercentage}%`
              : ""}
          </p>
        </div>
      </header>

      {submittedAttempt ? (
        <section aria-labelledby="attempt-review-heading">
          <div
            className={submittedAttempt.passed ? "quiz-feedback-pass" : "quiz-feedback-fail"}
            role="status"
          >
            <h2 id="attempt-review-heading">
              {submittedAttempt.passed ? (
                <>
                  <CheckCircle2 size={20} aria-hidden="true" /> Assessment passed:{" "}
                  {submittedAttempt.percentage}% ({submittedAttempt.earnedMarks}/
                  {submittedAttempt.totalMarks} marks)
                </>
              ) : (
                <>
                  <XCircle size={20} aria-hidden="true" /> Score: {submittedAttempt.percentage}% (
                  {submittedAttempt.earnedMarks}/{submittedAttempt.totalMarks} marks —{" "}
                  {assessment.passPercentage}% required to pass)
                </>
              )}
            </h2>
            <p className="card-meta">
              Review every question explanation and source citation below before retrying or moving
              to the next step.
            </p>
            {assessment.allowRetry ? (
              <button type="button" className="button" onClick={handleRetry}>
                <RotateCcw size={15} aria-hidden="true" /> Retry assessment
              </button>
            ) : null}
          </div>

          <div className="pathway-step-list" style={{ marginTop: "1.5rem" }}>
            {learnerQuestions.map((q, idx) => {
              const ev = submittedAttempt.evaluations.find((e) => e.questionId === q.id);
              if (!ev) return null;
              return (
                <article key={q.id} className="learning-card">
                  <div className="learning-card-header">
                    <span className="eyebrow">
                      Question {idx + 1} · {ev.earnedMarks}/{ev.maxMarks} marks
                    </span>
                    <ProgressStatusPill status={ev.correct ? "completed" : "failed"} />
                  </div>
                  <h3>{q.prompt}</h3>
                  <p>
                    <strong>Your answer:</strong> <code>{ev.submittedDisplay}</code>
                  </p>
                  <p>
                    <strong>Expected answer:</strong> <code>{ev.expectedDisplay}</code>
                  </p>
                  {ev.validationDetail ? (
                    <p className="card-meta">Validation check: {ev.validationDetail}</p>
                  ) : null}
                  <p>
                    <strong>Scientific explanation:</strong> {ev.explanation}
                  </p>
                  <p className="card-meta">
                    Objective: {ev.learningObjective} · Source: {ev.referenceCitation}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <form onSubmit={handleSubmit} className="pathway-step-list">
          {validationError ? (
            <div className="quiz-feedback-fail" role="alert">
              {validationError}
            </div>
          ) : null}

          {learnerQuestions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              index={idx}
              question={q}
              draft={drafts[q.id]}
              onChange={(patch) => updateDraft(q.id, patch)}
            />
          ))}

          <div className="notebook-actions-row">
            <button type="submit" className="button">
              <Send size={16} aria-hidden="true" /> Submit answers for evaluation
            </button>
            {assessment.experimentId ? (
              <Link
                className="button button-secondary"
                href={`/experiments/${assessment.experimentId}`}
              >
                Review related experiment
              </Link>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}

function QuestionCard({
  index,
  question,
  draft,
  onChange,
}: Readonly<{
  index: number;
  question: LearnerAssessmentQuestion;
  draft: DraftAnswerMap[string] | undefined;
  onChange: (patch: DraftAnswerMap[string]) => void;
}>) {
  return (
    <fieldset className="learning-card" style={{ border: "1px solid var(--color-border)" }}>
      <legend className="eyebrow">
        Question {index + 1} · {question.marks} {question.marks === 1 ? "mark" : "marks"} ·{" "}
        {question.difficulty}
      </legend>
      <h3>{question.prompt}</h3>
      <p className="card-meta">Objective: {question.learningObjective}</p>

      {question.type === "multiple_choice" ? (
        <div className="quiz-option-list">
          {question.options.map((opt) => (
            <label key={opt.id} className="quiz-option-label">
              <input
                type="radio"
                name={`q-${question.id}`}
                value={opt.id}
                checked={draft?.selectedOptionId === opt.id}
                onChange={() => onChange({ selectedOptionId: opt.id })}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      ) : question.type === "multiple_select" ? (
        <div className="quiz-option-list">
          {question.options.map((opt) => {
            const current = draft?.selectedOptionIds ?? [];
            const checked = current.includes(opt.id);
            return (
              <label key={opt.id} className="quiz-option-label">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? current.filter((id) => id !== opt.id)
                      : [...current, opt.id];
                    onChange({ selectedOptionIds: next });
                  }}
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      ) : question.type === "true_false" ? (
        <div className="quiz-option-list">
          {(["true", "false"] as const).map((val) => (
            <label key={val} className="quiz-option-label">
              <input
                type="radio"
                name={`q-${question.id}`}
                value={val}
                checked={draft?.boolAnswer === val}
                onChange={() => onChange({ boolAnswer: val })}
              />
              <span>{val === "true" ? "True" : "False"}</span>
            </label>
          ))}
        </div>
      ) : question.type === "numerical" ? (
        <div className="learning-grid-2">
          <label className="learning-field">
            Numerical value
            <input
              type="number"
              step="any"
              value={draft?.numericRaw ?? ""}
              onChange={(e) =>
                onChange({
                  numericRaw: e.target.value,
                  numericUnit: draft?.numericUnit ?? question.expectedUnit,
                })
              }
              placeholder="Enter numeric value"
            />
          </label>
          <label className="learning-field">
            Unit
            <select
              value={draft?.numericUnit ?? question.expectedUnit}
              onChange={(e) => onChange({ numericUnit: e.target.value })}
            >
              {question.acceptedUnits.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : question.type === "short_answer" ? (
        <label className="learning-field">
          Concise scientific response
          <input
            type="text"
            value={draft?.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Write your concise scientific explanation..."
          />
        </label>
      ) : (
        <label className="learning-field">
          Chemical formula or balanced equation
          <input
            type="text"
            value={draft?.text ?? ""}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder={question.hintNotation}
          />
          <span className="card-meta">{question.hintNotation}</span>
        </label>
      )}
    </fieldset>
  );
}
