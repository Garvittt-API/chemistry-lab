import { learningCatalog } from "./catalog.js";
import type {
  AssessmentAttempt,
  LearningPathway,
  LearningProgressState,
  LearningStoreSnapshot,
  NotebookSession,
  PathwayItem,
} from "./schemas.js";

export interface PathwayItemProgress {
  readonly item: PathwayItem;
  readonly status: LearningProgressState;
  readonly detailLabel: string;
}

export interface PathwayProgressSummary {
  readonly pathwayId: string;
  readonly status: LearningProgressState;
  readonly completedRequiredCount: number;
  readonly totalRequiredCount: number;
  readonly completionFraction: number;
  readonly items: ReadonlyArray<PathwayItemProgress>;
}

export interface AssessmentProgressSummary {
  readonly assessmentId: string;
  readonly status: LearningProgressState;
  readonly attemptCount: number;
  readonly bestPercentage: number | null;
  readonly latestPercentage: number | null;
  readonly lastSubmittedAt: string | null;
}

export interface LearnerProgressDashboard {
  readonly totalLessons: number;
  readonly completedLessonCount: number;
  readonly inProgressLessonCount: number;
  readonly completedExperimentIds: ReadonlyArray<string>;
  readonly inProgressExperimentIds: ReadonlyArray<string>;
  readonly startedExperimentIds: ReadonlyArray<string>;
  readonly totalSessionsCount: number;
  readonly completedSessionsCount: number;
  readonly totalObservationsRecorded: number;
  readonly totalCalculationsSaved: number;
  readonly totalAssessmentAttempts: number;
  readonly passedAssessmentCount: number;
  readonly failedOnlyAssessmentCount: number;
  readonly generatedReportCount: number;
  readonly lastActivityAt: string | null;
  readonly pathways: ReadonlyArray<PathwayProgressSummary>;
}

export function getLessonProgressState(
  lessonId: string,
  snapshot: LearningStoreSnapshot,
): LearningProgressState {
  if (snapshot.completedLessonIds.includes(lessonId)) return "completed";
  if (snapshot.startedLessonIds.includes(lessonId)) return "in_progress";
  return "not_attempted";
}

export function getExperimentProgressState(
  experimentId: string,
  sessions: ReadonlyArray<NotebookSession>,
): LearningProgressState {
  const matching = sessions.filter((s) => s.experimentId === experimentId);
  if (matching.length === 0) return "not_attempted";
  if (matching.some((s) => s.status === "completed")) return "completed";
  if (
    matching.some(
      (s) =>
        s.status === "in_progress" ||
        s.observations.length > 0 ||
        s.calculations.length > 0 ||
        s.simulationRuns.length > 0,
    )
  ) {
    return "in_progress";
  }
  return "started";
}

export function getAssessmentProgressSummary(
  assessmentId: string,
  attempts: ReadonlyArray<AssessmentAttempt>,
): AssessmentProgressSummary {
  const matching = attempts
    .filter((a) => a.assessmentId === assessmentId)
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));

  if (matching.length === 0) {
    return {
      assessmentId,
      status: "not_attempted",
      attemptCount: 0,
      bestPercentage: null,
      latestPercentage: null,
      lastSubmittedAt: null,
    };
  }

  const anyPassed = matching.some((a) => a.passed);
  const bestPercentage = matching.reduce((max, a) => Math.max(max, a.percentage), 0);
  const latest = matching[matching.length - 1]!;
  return {
    assessmentId,
    status: anyPassed ? "completed" : "failed",
    attemptCount: matching.length,
    bestPercentage,
    latestPercentage: latest.percentage,
    lastSubmittedAt: latest.submittedAt,
  };
}

export function computePathwayProgress(
  pathway: LearningPathway,
  snapshot: LearningStoreSnapshot,
): PathwayProgressSummary {
  const items: PathwayItemProgress[] = pathway.items.map((item) => {
    if (item.kind === "lesson") {
      const st = getLessonProgressState(item.targetId, snapshot);
      return {
        item,
        status: st,
        detailLabel:
          st === "completed"
            ? "Lesson completed"
            : st === "in_progress"
              ? "Lesson opened"
              : "Not started",
      };
    }
    if (item.kind === "experiment") {
      const st = getExperimentProgressState(item.targetId, snapshot.sessions);
      const count = snapshot.sessions.filter((s) => s.experimentId === item.targetId).length;
      return {
        item,
        status: st,
        detailLabel:
          st === "completed"
            ? `Session completed (${count} session${count === 1 ? "" : "s"})`
            : st === "in_progress"
              ? `Session in progress (${count})`
              : st === "started"
                ? "Draft session created"
                : "No session yet",
      };
    }
    const summary = getAssessmentProgressSummary(item.targetId, snapshot.assessmentAttempts);
    return {
      item,
      status: summary.status,
      detailLabel:
        summary.status === "completed"
          ? `Passed (best ${summary.bestPercentage}%)`
          : summary.status === "failed"
            ? `Below pass threshold (best ${summary.bestPercentage}%, ${summary.attemptCount} attempt${summary.attemptCount === 1 ? "" : "s"})`
            : "Not attempted",
    };
  });

  const requiredItems = items.filter((i) => i.item.required);
  const totalRequiredCount = requiredItems.length;
  const completedRequiredCount = requiredItems.filter((i) => i.status === "completed").length;
  const anyTouched = items.some((i) => i.status !== "not_attempted");
  const allRequiredCompleted =
    totalRequiredCount > 0 && completedRequiredCount === totalRequiredCount;

  let status: LearningProgressState = "not_attempted";
  if (allRequiredCompleted) {
    status = "completed";
  } else if (
    items.some(
      (i) => i.status === "in_progress" || i.status === "completed" || i.status === "failed",
    )
  ) {
    status = "in_progress";
  } else if (anyTouched) {
    status = "started";
  }

  return {
    pathwayId: pathway.id,
    status,
    completedRequiredCount,
    totalRequiredCount,
    completionFraction: totalRequiredCount > 0 ? completedRequiredCount / totalRequiredCount : 0,
    items,
  };
}

export function computeLearnerProgressDashboard(
  snapshot: LearningStoreSnapshot,
): LearnerProgressDashboard {
  const completedExpSet = new Set<string>();
  const inProgressExpSet = new Set<string>();
  const startedExpSet = new Set<string>();

  const distinctExperimentIds = new Set(snapshot.sessions.map((s) => s.experimentId));
  for (const expId of distinctExperimentIds) {
    const state = getExperimentProgressState(expId, snapshot.sessions);
    if (state === "completed") completedExpSet.add(expId);
    else if (state === "in_progress") inProgressExpSet.add(expId);
    else if (state === "started") startedExpSet.add(expId);
  }

  let passedAssessmentCount = 0;
  let failedOnlyAssessmentCount = 0;
  for (const assessment of learningCatalog.assessments) {
    const sum = getAssessmentProgressSummary(assessment.id, snapshot.assessmentAttempts);
    if (sum.status === "completed") passedAssessmentCount += 1;
    else if (sum.status === "failed") failedOnlyAssessmentCount += 1;
  }

  const timestamps: string[] = [];
  for (const s of snapshot.sessions) timestamps.push(s.updatedAt);
  for (const a of snapshot.assessmentAttempts) timestamps.push(a.submittedAt);
  if (snapshot.startedLessonIds.length > 0 || snapshot.completedLessonIds.length > 0) {
    timestamps.push(snapshot.updatedAt);
  }
  timestamps.sort();
  const lastActivityAt = timestamps.length > 0 ? timestamps[timestamps.length - 1]! : null;

  const completedSet = new Set(snapshot.completedLessonIds);
  const inProgressLessonCount = snapshot.startedLessonIds.filter(
    (id) => !completedSet.has(id),
  ).length;

  return {
    totalLessons: learningCatalog.lessons.length,
    completedLessonCount: snapshot.completedLessonIds.length,
    inProgressLessonCount,
    completedExperimentIds: [...completedExpSet].sort(),
    inProgressExperimentIds: [...inProgressExpSet].sort(),
    startedExperimentIds: [...startedExpSet].sort(),
    totalSessionsCount: snapshot.sessions.length,
    completedSessionsCount: snapshot.sessions.filter((s) => s.status === "completed").length,
    totalObservationsRecorded: snapshot.sessions.reduce((sum, s) => sum + s.observations.length, 0),
    totalCalculationsSaved: snapshot.sessions.reduce((sum, s) => sum + s.calculations.length, 0),
    totalAssessmentAttempts: snapshot.assessmentAttempts.length,
    passedAssessmentCount,
    failedOnlyAssessmentCount,
    generatedReportCount: snapshot.generatedReportSessionIds.length,
    lastActivityAt,
    pathways: learningCatalog.pathways.map((p) => computePathwayProgress(p, snapshot)),
  };
}
