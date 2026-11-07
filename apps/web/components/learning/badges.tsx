import {
  PROVENANCE_LABELS,
  type LearningProgressState,
  type LearningStage,
  type NotebookProvenance,
  type ScientificClaimKind,
} from "@virtual-chemistry-lab/learning-core";
import { CheckCircle2, Circle, Clock, PlayCircle, XCircle } from "lucide-react";

const PROGRESS_LABELS: Record<LearningProgressState, string> = {
  not_attempted: "Not attempted",
  started: "Started",
  in_progress: "In progress",
  completed: "Completed",
  failed: "Needs retry",
};

export function ProgressStatusPill({ status }: Readonly<{ status: LearningProgressState }>) {
  return (
    <span className={`status-pill status-pill-${status}`}>
      {status === "completed" ? (
        <CheckCircle2 size={13} aria-hidden="true" />
      ) : status === "in_progress" ? (
        <Clock size={13} aria-hidden="true" />
      ) : status === "started" ? (
        <PlayCircle size={13} aria-hidden="true" />
      ) : status === "failed" ? (
        <XCircle size={13} aria-hidden="true" />
      ) : (
        <Circle size={12} aria-hidden="true" />
      )}
      {PROGRESS_LABELS[status]}
    </span>
  );
}

export function ProvenancePill({ provenance }: Readonly<{ provenance: NotebookProvenance }>) {
  return (
    <span className={`prov-pill prov-pill-${provenance}`}>{PROVENANCE_LABELS[provenance]}</span>
  );
}

const STAGE_LABELS: Record<LearningStage, string> = {
  beginner: "Beginner",
  school: "School",
  intermediate: "Intermediate / Class XI–XII",
  college: "College / Undergraduate",
  advanced: "Advanced",
};

export function StageBadge({ stage }: Readonly<{ stage: LearningStage }>) {
  return <span className="badge badge-muted">{STAGE_LABELS[stage]}</span>;
}

const CLAIM_LABELS: Record<ScientificClaimKind, string> = {
  established_fact: "Established chemical principle",
  model_approximation: "Idealized mathematical model",
  illustrative_example: "Illustrative pedagogical example",
};

export function ClaimKindBadge({ kind }: Readonly<{ kind: ScientificClaimKind }>) {
  return <span className="status-pill">{CLAIM_LABELS[kind]}</span>;
}
