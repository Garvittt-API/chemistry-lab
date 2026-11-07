"use client";

import {
  computePathwayProgress,
  getLessonByIdOrSlug,
  getPathwayByIdOrSlug,
  type LearningPathway,
} from "@virtual-chemistry-lab/learning-core";
import { ArrowLeft, ArrowRight, BookOpen, CheckSquare, Clock3, FlaskConical } from "lucide-react";
import Link from "next/link";

import { getCurriculumLabel, getCurriculumTopicLabel } from "../../lib/content";
import { ProgressStatusPill, StageBadge } from "./badges";
import { useLearningStore } from "./learning-store-provider";

export function PathwayDetailView({ pathway }: Readonly<{ pathway: LearningPathway }>) {
  const { hydrated, snapshot } = useLearningStore();
  const progress = hydrated ? computePathwayProgress(pathway, snapshot) : null;
  const pct = progress ? Math.round(progress.completionFraction * 100) : 0;

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
            <StageBadge stage={pathway.stage} />
            <ProgressStatusPill status={progress?.status ?? "not_attempted"} />
            <span className="badge badge-muted">Pending scientific review</span>
          </div>
          <h1>{pathway.title}</h1>
          <p className="detail-summary">{pathway.description}</p>
          <p className="card-meta">
            <Clock3 size={15} aria-hidden="true" /> Estimated duration: ~
            {pathway.estimatedDurationMinutes} minutes ({pathway.durationJustification})
          </p>
        </div>
      </header>

      <div className="callout-banner">
        <strong>Pathway progress: {pct}% complete</strong>
        <p className="card-meta">
          {progress
            ? `${progress.completedRequiredCount} of ${progress.totalRequiredCount} required items completed in this browser.`
            : "Loading local progress..."}
        </p>
        <div
          className="progress-bar-track"
          role="progressbar"
          aria-label={`${pathway.title} completion`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress ? pct : undefined}
        >
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="learning-grid-2">
        <section className="learning-card" aria-labelledby="pw-objectives-heading">
          <h2 id="pw-objectives-heading">Learning objectives</h2>
          <ul className="objective-list">
            {pathway.learningObjectives.map((obj) => (
              <li key={obj}>{obj}</li>
            ))}
          </ul>
        </section>

        <section className="learning-card" aria-labelledby="pw-prereq-heading">
          <h2 id="pw-prereq-heading">Prerequisites &amp; completion criteria</h2>
          {pathway.prerequisites.length > 0 ? (
            <ul className="objective-list">
              {pathway.prerequisites.map((pr) => (
                <li key={pr}>{pr}</li>
              ))}
            </ul>
          ) : null}
          {pathway.prerequisitePathwayIds.length > 0 ? (
            <p className="card-meta">
              Recommended prior pathway:{" "}
              {pathway.prerequisitePathwayIds.map((id) => {
                const prior = getPathwayByIdOrSlug(id);
                return prior ? (
                  <Link key={id} className="text-link" href={`/learn/pathways/${prior.slug}`}>
                    {prior.title}
                  </Link>
                ) : (
                  id
                );
              })}
            </p>
          ) : null}
          <h3>Completion requirements</h3>
          <ul className="objective-list">
            {pathway.completionRequirements.map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="section section-border" aria-labelledby="pw-sequence-heading">
        <p className="eyebrow">Ordered curriculum sequence</p>
        <h2 id="pw-sequence-heading">Pathway steps ({pathway.items.length})</h2>
        <ol className="pathway-step-list">
          {pathway.items.map((item, idx) => {
            const itemProg = progress?.items[idx];
            const href =
              item.kind === "lesson"
                ? `/learn/lessons/${getLessonByIdOrSlug(item.targetId)?.slug ?? item.targetId}`
                : item.kind === "experiment"
                  ? `/experiments/${item.targetId}`
                  : `/learn/assessments/${item.targetId}`;
            const actionLabel =
              item.kind === "lesson"
                ? "Open lesson"
                : item.kind === "experiment"
                  ? "Open experiment"
                  : "Take assessment";

            return (
              <li key={item.id} className="pathway-step-card">
                <span className="pathway-step-num" aria-hidden="true">
                  {item.order}
                </span>
                <div>
                  <div className="learning-pill-row">
                    <span className="card-meta">
                      {item.kind === "lesson" ? (
                        <>
                          <BookOpen size={14} aria-hidden="true" /> Lesson
                        </>
                      ) : item.kind === "experiment" ? (
                        <>
                          <FlaskConical size={14} aria-hidden="true" /> Practical experiment
                        </>
                      ) : (
                        <>
                          <CheckSquare size={14} aria-hidden="true" /> Assessment
                        </>
                      )}{" "}
                      · ~{item.estimatedDurationMinutes} min
                    </span>
                    <ProgressStatusPill status={itemProg?.status ?? "not_attempted"} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  {itemProg ? <p className="card-meta">{itemProg.detailLabel}</p> : null}
                </div>
                <div>
                  <Link className="button button-secondary" href={href}>
                    {actionLabel} <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {pathway.curriculumNotes.length > 0 ? (
        <section className="section section-border" aria-labelledby="pw-curriculum-heading">
          <h2 id="pw-curriculum-heading">Proposed curriculum alignment (unverified)</h2>
          <p className="card-meta">
            Curriculum notes cite only curricula present in the repository catalog and remain marked{" "}
            <code>proposed_pending_verification</code> until reviewed by a qualified educator.
          </p>
          {pathway.curriculumNotes.map((cn) => (
            <div key={cn.curriculumId} className="learning-card">
              <h3>{getCurriculumLabel(cn.curriculumId)}</h3>
              <p>{cn.note}</p>
              <p className="card-meta">
                Topics:{" "}
                {cn.curriculumTopicIds
                  .map((tId) => getCurriculumTopicLabel(cn.curriculumId, tId))
                  .join(" · ")}
              </p>
            </div>
          ))}
        </section>
      ) : null}

      <section className="section section-border" aria-labelledby="pw-refs-heading">
        <h2 id="pw-refs-heading">References</h2>
        <ul className="objective-list">
          {pathway.references.map((ref) => (
            <li key={ref.id}>{ref.citation}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
