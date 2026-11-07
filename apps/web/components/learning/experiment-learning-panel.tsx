"use client";

import type { ExperimentRecord } from "@virtual-chemistry-lab/experiment-schema";
import {
  getAssessmentsForExperiment,
  getExperimentProgressState,
  getLessonsForExperiment,
  getPathwaysForExperiment,
} from "@virtual-chemistry-lab/learning-core";
import { ArrowRight, BookOpen, CheckSquare, ClipboardList, Compass } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ProgressStatusPill } from "./badges";
import { useLearningStore } from "./learning-store-provider";

export function ExperimentLearningPanel({
  experiment,
}: Readonly<{
  experiment: Pick<ExperimentRecord, "identity" | "references">;
}>) {
  const router = useRouter();
  const { hydrated, snapshot, createSession } = useLearningStore();

  const lessons = getLessonsForExperiment(experiment.identity.id);
  const pathways = getPathwaysForExperiment(experiment.identity.id);
  const quizzes = getAssessmentsForExperiment(experiment.identity.id);
  const matchingSessions = hydrated
    ? snapshot.sessions.filter((s) => s.experimentId === experiment.identity.id)
    : [];
  const expState = hydrated
    ? getExperimentProgressState(experiment.identity.id, snapshot.sessions)
    : "not_attempted";

  const handleStartNotebook = () => {
    const created = createSession({ experiment });
    router.push(`/notebook/${created.sessionId}`);
  };

  return (
    <section
      className="detail-section"
      id="practical-workflow"
      aria-labelledby="practical-workflow-title"
    >
      <div className="learning-card-header">
        <h2 id="practical-workflow-title">Practical notebook, lessons &amp; assessment</h2>
        <ProgressStatusPill status={expState} />
      </div>
      <p>
        Prepare with companion theory lessons, record structured observations and engine
        calculations in your local Practical Notebook, generate a provenance-tagged report, and
        verify understanding with a checkpoint quiz.
      </p>

      <div className="notebook-actions-row" style={{ marginBottom: "1rem" }}>
        <button type="button" className="button" onClick={handleStartNotebook}>
          <ClipboardList size={16} aria-hidden="true" /> Start new practical notebook session
        </button>
        {matchingSessions[0] ? (
          <Link
            className="button button-secondary"
            href={`/notebook/${matchingSessions[0].sessionId}`}
          >
            Resume latest session ({matchingSessions[0].title})
          </Link>
        ) : null}
      </div>

      <div className="learning-grid-3">
        {lessons.map((lesson) => (
          <div key={lesson.id} className="learning-card">
            <p className="eyebrow">
              <BookOpen size={14} aria-hidden="true" /> Companion lesson
            </p>
            <h3>{lesson.title}</h3>
            <Link className="text-link" href={`/learn/lessons/${lesson.slug}`}>
              Read lesson <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        ))}

        {quizzes.map((quiz) => (
          <div key={quiz.id} className="learning-card">
            <p className="eyebrow">
              <CheckSquare size={14} aria-hidden="true" /> Post-lab assessment
            </p>
            <h3>{quiz.title}</h3>
            <Link className="text-link" href={`/learn/assessments/${quiz.id}`}>
              Take quiz <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        ))}

        {pathways.map((pathway) => (
          <div key={pathway.id} className="learning-card">
            <p className="eyebrow">
              <Compass size={14} aria-hidden="true" /> Learning pathway
            </p>
            <h3>{pathway.title}</h3>
            <Link className="text-link" href={`/learn/pathways/${pathway.slug}`}>
              View pathway <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
