import {
  catalog as experimentCatalog,
  getExperimentById,
} from "@virtual-chemistry-lab/experiment-library";
import { describe, expect, it } from "vitest";

import {
  addObservationToSession,
  completeNotebookSession,
  computeLearnerProgressDashboard,
  computePathwayProgress,
  createNotebookSession,
  evaluateAssessmentAttempt,
  getAssessmentByIdOrSlug,
  getAssessmentsForExperiment,
  getGlossaryEntryById,
  getLessonByIdOrSlug,
  getLessonsForExperiment,
  getPathwayByIdOrSlug,
  learningCatalog,
  listGlossaryEntries,
  listPathways,
  MemoryStorageAdapter,
  NotebookStoreRepository,
} from "./index.js";

describe("learning catalog & curriculum integrity", () => {
  it("exposes validated pathways covering beginner, school, intermediate, college, advanced and subject tracks", () => {
    expect(learningCatalog.pathways.length).toBeGreaterThanOrEqual(8);
    const stages = new Set(learningCatalog.pathways.map((p) => p.stage));
    expect(stages.has("beginner")).toBe(true);
    expect(stages.has("school")).toBe(true);
    expect(stages.has("intermediate")).toBe(true);
    expect(stages.has("college")).toBe(true);
    expect(stages.has("advanced")).toBe(true);

    const analyticalTracks = listPathways({ category: "analytical-chemistry" });
    expect(analyticalTracks.length).toBeGreaterThanOrEqual(1);

    expect(getPathwayByIdOrSlug("beginner-chemistry-solutions-and-quantities")?.stage).toBe(
      "beginner",
    );
  });

  it("never invents unverified curriculum mappings and marks lessons pending scientific review", () => {
    for (const pathway of learningCatalog.pathways) {
      expect(pathway.scientificReviewStatus).toBe("pending_scientific_review");
      for (const note of pathway.curriculumNotes) {
        expect(note.curriculumId).toBe("cbse-chemistry-2025-26");
        expect(note.alignmentConfidence).toBe("proposed_pending_verification");
      }
    }
    for (const lesson of learningCatalog.lessons) {
      expect(lesson.scientificReviewStatus).toBe("pending_scientific_review");
      expect(lesson.workedExamples.length).toBeGreaterThanOrEqual(1);
      expect(lesson.references.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("resolves lessons, assessments and glossary entries by experiment and search query", () => {
    const dilutionLessons = getLessonsForExperiment("solution-dilution");
    expect(dilutionLessons.some((l) => l.id === "lesson-concentration-and-dilution")).toBe(true);
    expect(getLessonByIdOrSlug("lesson-concentration-and-dilution")?.title).toContain(
      "Concentration",
    );

    const phAssessments = getAssessmentsForExperiment("ph-and-indicators");
    expect(phAssessments.some((a) => a.id === "quiz-ph-and-indicators")).toBe(true);

    const molarityEntries = listGlossaryEntries("mol/L");
    expect(molarityEntries.length).toBeGreaterThan(0);
    expect(getGlossaryEntryById(learningCatalog.glossary[0]!.id)).toBeDefined();
  });
});

describe("honest learner progress tracking", () => {
  it("reports zero progress on an untouched local profile without fabricated streaks", () => {
    const repo = new NotebookStoreRepository(new MemoryStorageAdapter());
    const { snapshot } = repo.load();
    const dashboard = computeLearnerProgressDashboard(snapshot);

    expect(dashboard.completedLessonCount).toBe(0);
    expect(dashboard.inProgressLessonCount).toBe(0);
    expect(dashboard.completedExperimentIds.length).toBe(0);
    expect(dashboard.inProgressExperimentIds.length).toBe(0);
    expect(dashboard.passedAssessmentCount).toBe(0);
    expect(dashboard.totalAssessmentAttempts).toBe(0);
    expect(dashboard.totalSessionsCount).toBe(0);

    for (const pw of dashboard.pathways) {
      expect(pw.status).toBe("not_attempted");
      expect(pw.completionFraction).toBe(0);
    }
  });

  it("tracks lesson states, experiment notebook states and assessment pass/fail accurately", () => {
    const repo = new NotebookStoreRepository(new MemoryStorageAdapter());
    repo.toggleLessonCompleted("lesson-moles-molar-mass-units", true, "2026-11-07T09:00:00.000Z");
    repo.markLessonStarted("lesson-concentration-and-dilution", "2026-11-07T09:05:00.000Z");

    const { snapshot: snap0 } = repo.load();
    const dilutionExp = getExperimentById(experimentCatalog, "solution-dilution")!;
    let session = createNotebookSession({
      experiment: dilutionExp,
      localProfileId: snap0.localProfileId,
      now: "2026-11-07T09:10:00.000Z",
    });
    session = addObservationToSession(
      session,
      {
        title: "Meniscus check",
        description: "Bottom of meniscus aligned with calibration line.",
        value: 25,
        unit: "mL",
        precisionDecimals: 2,
        provenance: "user_entered",
      },
      "2026-11-07T09:12:00.000Z",
    );
    session = completeNotebookSession(session, "2026-11-07T09:20:00.000Z");
    repo.upsertSession(session, "2026-11-07T09:20:00.000Z");

    const stdQuiz = getAssessmentByIdOrSlug("quiz-foundations-solutions")!;
    const passingAttempt = evaluateAssessmentAttempt(
      stdQuiz,
      [
        { questionId: "q-std-1", type: "numerical", value: 0.05, unit: "mol" },
        { questionId: "q-std-2", type: "multiple_choice", selectedOptionId: "opt-b" },
        { questionId: "q-std-3", type: "true_false", answer: true },
        { questionId: "q-std-4", type: "chemical_equation", expression: "CuSO4·5H2O" },
      ],
      {
        startedAt: "2026-11-07T09:22:00.000Z",
        submittedAt: "2026-11-07T09:25:00.000Z",
      },
    );
    expect(passingAttempt.passed).toBe(true);
    repo.recordAssessmentAttempt(passingAttempt, "2026-11-07T09:25:00.000Z");

    const { snapshot: updatedSnap } = repo.load();
    const dashboard = computeLearnerProgressDashboard(updatedSnap);
    expect(dashboard.completedLessonCount).toBe(1);
    expect(dashboard.inProgressLessonCount).toBe(1);
    expect(dashboard.completedExperimentIds).toContain("solution-dilution");
    expect(dashboard.passedAssessmentCount).toBe(1);
    expect(dashboard.lastActivityAt).toBe("2026-11-07T09:25:00.000Z");

    const beginnerPathway = getPathwayByIdOrSlug("pathway-beginner-foundations")!;
    const beginnerProg = computePathwayProgress(beginnerPathway, updatedSnap);
    expect(beginnerProg.completedRequiredCount).toBe(3);
    expect(beginnerProg.status).toBe("in_progress");
    expect(beginnerProg.completionFraction).toBeGreaterThan(0);
  });
});
