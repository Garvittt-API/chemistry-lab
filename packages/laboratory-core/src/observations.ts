/**
 * Observation session data model.
 *
 * Designed so that Phase 07 (practical notebooks) can consume these records
 * without a rewrite: every observation, measurement and note is tagged with
 * its experiment, step, data source and (when appropriate) the model + engine
 * version that produced it.
 */

import type { DataSource, MeasurementRecord, ObservationNote } from "./procedure.js";

export { type DataSource };

/** A session is one learner's run through one experiment version. */
export interface ExperimentSession {
  /** Unique session id. */
  readonly sessionId: string;
  /** Experiment identifier (matches experiment-schema identity.id). */
  readonly experimentId: string;
  /** Experiment content version (identity.contentVersion). */
  readonly experimentVersion: string;
  /** Simulation engine version used for any model_calculated measurements. */
  readonly engineVersion: string;
  /** Engine name, for provenance. */
  readonly engineName: string;
  /** ISO-8601 timestamp of session start. */
  readonly startedAt: string;
  /** ISO-8601 timestamp of session end (undefined while running). */
  readonly completedAt?: string;
  /** Completion state. */
  readonly status: "not_started" | "running" | "completed" | "reset";
  /** Snapshot of inputs the user entered. */
  readonly inputs: Readonly<Record<string, number | string>>;
  /** All model-calculated and user-entered measurements. */
  readonly measurements: ReadonlyArray<MeasurementRecord>;
  /** Qualitative observation notes. */
  readonly observations: ReadonlyArray<ObservationNote>;
}

/** Create a new empty session. */
export function createSession(
  sessionId: string,
  experimentId: string,
  experimentVersion: string,
  engineVersion: string,
  engineName: string,
): ExperimentSession {
  return {
    sessionId,
    experimentId,
    experimentVersion,
    engineVersion,
    engineName,
    startedAt: new Date().toISOString(),
    status: "not_started",
    inputs: {},
    measurements: [],
    observations: [],
  };
}

/** Append inputs to a session. */
export function appendInputs(
  session: ExperimentSession,
  inputs: Readonly<Record<string, number | string>>,
): ExperimentSession {
  return {
    ...session,
    inputs: { ...session.inputs, ...inputs },
    status: session.status === "not_started" ? "running" : session.status,
  };
}

/** Append measurements to a session. */
export function appendMeasurements(
  session: ExperimentSession,
  measurements: ReadonlyArray<MeasurementRecord>,
): ExperimentSession {
  return {
    ...session,
    measurements: [...session.measurements, ...measurements],
    status: "running",
  };
}

/** Append observation notes to a session. */
export function appendObservations(
  session: ExperimentSession,
  notes: ReadonlyArray<ObservationNote>,
): ExperimentSession {
  return {
    ...session,
    observations: [...session.observations, ...notes],
    status: "running",
  };
}

/** Mark a session completed. */
export function completeSession(session: ExperimentSession): ExperimentSession {
  return { ...session, status: "completed", completedAt: new Date().toISOString() };
}

/** Mark a session reset. */
export function resetSession(session: ExperimentSession): ExperimentSession {
  return { ...session, status: "reset" };
}

/** Count measurements per data source (for display provenance labels). */
export function countBySource(
  measurements: ReadonlyArray<MeasurementRecord>,
): ReadonlyMap<DataSource, number> {
  const counts = new Map<DataSource, number>();
  for (const m of measurements) {
    counts.set(m.source, (counts.get(m.source) ?? 0) + 1);
  }
  return counts;
}
