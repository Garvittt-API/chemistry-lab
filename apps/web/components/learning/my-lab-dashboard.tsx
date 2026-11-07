"use client";

import {
  computeLearnerProgressDashboard,
  getPathwayByIdOrSlug,
  learningCatalog,
} from "@virtual-chemistry-lab/learning-core";
import { ArrowRight, BookOpen, ClipboardList, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { ProgressStatusPill } from "./badges";
import { useLearningStore } from "./learning-store-provider";

export function MyLabDashboard() {
  const { hydrated, snapshot } = useLearningStore();
  const dashboard = useMemo(
    () => (hydrated ? computeLearnerProgressDashboard(snapshot) : null),
    [hydrated, snapshot],
  );

  return (
    <div className="container section section-border">
      <div className="stat-kpi-grid" aria-label="Local learner progress summary">
        <div className="stat-kpi-card">
          <p className="card-meta">Lessons completed</p>
          <div className="stat-kpi-value">
            {dashboard
              ? `${dashboard.completedLessonCount}/${dashboard.totalLessons}`
              : `0/${learningCatalog.lessons.length}`}
          </div>
          <p className="card-meta">
            {dashboard ? `${dashboard.inProgressLessonCount} in progress` : "Loading..."}
          </p>
        </div>

        <div className="stat-kpi-card">
          <p className="card-meta">Experiments completed</p>
          <div className="stat-kpi-value">
            {dashboard ? dashboard.completedExperimentIds.length : 0}
          </div>
          <p className="card-meta">
            {dashboard
              ? `${dashboard.inProgressExperimentIds.length} in progress · ${dashboard.totalSessionsCount} sessions`
              : "Loading..."}
          </p>
        </div>

        <div className="stat-kpi-card">
          <p className="card-meta">Assessments passed</p>
          <div className="stat-kpi-value">
            {dashboard
              ? `${dashboard.passedAssessmentCount}/${learningCatalog.assessments.length}`
              : `0/${learningCatalog.assessments.length}`}
          </div>
          <p className="card-meta">
            {dashboard ? `${dashboard.totalAssessmentAttempts} total attempts` : "Loading..."}
          </p>
        </div>

        <div className="stat-kpi-card">
          <p className="card-meta">Reports generated</p>
          <div className="stat-kpi-value">{dashboard ? dashboard.generatedReportCount : 0}</div>
          <p className="card-meta">
            {dashboard?.lastActivityAt
              ? `Last active ${dashboard.lastActivityAt.slice(0, 10)}`
              : "No activity recorded yet"}
          </p>
        </div>
      </div>

      <div className="notebook-actions-row" style={{ marginBottom: "2rem" }}>
        <Link className="button" href="/notebook">
          <ClipboardList size={16} aria-hidden="true" /> Open Practical Notebook
        </Link>
        <Link className="button button-secondary" href="/learn">
          <GraduationCap size={16} aria-hidden="true" /> Browse Learning Pathways
        </Link>
        <Link className="button button-secondary" href="/explore">
          <BookOpen size={16} aria-hidden="true" /> Explore Experiments
        </Link>
      </div>

      <div className="learning-grid-2">
        <section className="learning-card" aria-labelledby="dashboard-sessions-heading">
          <div className="learning-card-header">
            <h2 id="dashboard-sessions-heading">Recent practical notebook sessions</h2>
            <Link className="text-link" href="/notebook">
              Manage all <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          {!hydrated || snapshot.sessions.length === 0 ? (
            <p className="card-meta">
              No practical notebook sessions saved yet. Create a session to record observations,
              structured data tables, engine calculations and multi-format lab reports.
            </p>
          ) : (
            <div className="pathway-step-list">
              {snapshot.sessions.slice(0, 4).map((s) => (
                <div key={s.sessionId} className="learning-card">
                  <div className="learning-card-header">
                    <strong>{s.title}</strong>
                    <ProgressStatusPill
                      status={
                        s.status === "completed"
                          ? "completed"
                          : s.status === "in_progress"
                            ? "in_progress"
                            : "started"
                      }
                    />
                  </div>
                  <p className="card-meta">
                    {s.experimentTitle} · {s.observations.length} observations ·{" "}
                    {s.calculations.length} calculations
                  </p>
                  <div className="notebook-actions-row">
                    <Link className="text-link" href={`/notebook/${s.sessionId}`}>
                      Open session <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                    <Link className="text-link" href={`/notebook/${s.sessionId}/report`}>
                      <FileText size={14} aria-hidden="true" /> Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="learning-card" aria-labelledby="dashboard-pathways-heading">
          <div className="learning-card-header">
            <h2 id="dashboard-pathways-heading">Pathway progress</h2>
            <Link className="text-link" href="/learn">
              All pathways <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="pathway-step-list">
            {(dashboard?.pathways ?? []).slice(0, 5).map((pwProg) => {
              const pw = getPathwayByIdOrSlug(pwProg.pathwayId);
              if (!pw) return null;
              const pct = Math.round(pwProg.completionFraction * 100);
              return (
                <div key={pw.id} className="learning-card">
                  <div className="learning-card-header">
                    <strong>{pw.title}</strong>
                    <ProgressStatusPill status={pwProg.status} />
                  </div>
                  <div className="progress-bar-track" aria-label={`${pw.title} ${pct}%`}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="learning-card-footer">
                    <span className="card-meta">
                      {pwProg.completedRequiredCount}/{pwProg.totalRequiredCount} required items
                    </span>
                    <Link className="text-link" href={`/learn/pathways/${pw.slug}`}>
                      Continue <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
