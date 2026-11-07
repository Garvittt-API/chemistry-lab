/**
 * Reusable experiment procedure execution engine.
 *
 * A procedure is an ordered list of steps. Each step describes what the
 * learner should do, what equipment is required, what inputs it accepts,
 * and which outputs (measurements/observations) it produces. The engine is
 * intentionally minimal: it tracks the current step index, validates
 * transitions, records that a step was completed, and stores any data the
 * step produced.
 *
 * Design rules (ADR-002 — science/rendering separation):
 *
 *  - The procedure engine never imports React or any rendering library.
 *  - It never computes scientific results itself. It stores the results
 *    that adapters (experiment implementations) have computed via the
 *    simulation-core engine, and tags their data source.
 *  - It runs in the UI layer's state (React/Redux/whatever the consumer
 *    uses) — this module exposes pure functions over immutable state
 *    values.
 */

/** Status of a single step. */
export type StepStatus =
  | "not_started"
  | "in_progress"
  | "waiting_input"
  | "completed"
  | "invalid_action";

/** Status of the overall experiment run. */
export type ExperimentRunStatus =
  | "not_started"
  | "in_progress"
  | "waiting_input"
  | "completed"
  | "reset";

/** Classifies where a measurement value came from (never mix silently). */
export type DataSource =
  /** Calculated by a simulation-core model (always identify model + version). */
  | "model_calculated"
  /** Entered by the user into a form/control. */
  | "user_entered"
  /** Drawn from a documented reference dataset. */
  | "reference_dataset"
  /** Purely illustrative visual element (must be labelled as such). */
  | "illustrative";

/** A measurement reading captured during a run. */
export interface MeasurementRecord {
  readonly id: string;
  /** Step in which the measurement was recorded (0-based). */
  readonly stepIndex: number;
  /** Stable measurement id (e.g. "final-concentration"). */
  readonly measurementId: string;
  /** Human label for display. */
  readonly label: string;
  /** Numeric value (or null if unavailable/NA). */
  readonly value: number | null;
  /** Unit string (e.g. "mol/L", "mL", "pH"). */
  readonly unit: string;
  /** Origin of the value. */
  readonly source: DataSource;
  /** When `source === "model_calculated"`, identify the model. */
  readonly modelId?: string;
  /** When `source === "model_calculated"`, identify engine version. */
  readonly engineVersion?: string;
  /** Optional user note attached at capture time. */
  readonly note?: string;
}

/** A user-authored qualitative observation note. */
export interface ObservationNote {
  readonly id: string;
  readonly stepIndex: number;
  readonly text: string;
  /** Ordering index within the step (in case of multiple notes). */
  readonly sequence: number;
}

/** Definition of a single procedure step (data; experiment config). */
export interface ProcedureStep {
  readonly id: string;
  /** Instruction shown to the learner. */
  readonly instruction: string;
  /** Longer explanation (e.g. why this step matters). */
  readonly explanation?: string;
  /** Equipment ids that must be placed on the workspace before the step can complete. */
  readonly requiredEquipment: ReadonlyArray<string>;
  /** What the learner must do before the step is considered complete. */
  readonly requiredAction:
    | "place_equipment"
    | "enter_value"
    | "run_calculation"
    | "record_observation"
    | "review_result";
  /** Input fields the step expects (descriptive only; adapters enforce types). */
  readonly expectedInputs?: ReadonlyArray<{
    readonly id: string;
    readonly label: string;
    readonly unit: string;
    readonly description?: string;
  }>;
  /** Optional measurement ids this step is expected to produce. */
  readonly producesMeasurements?: ReadonlyArray<string>;
}

/** Mutable-at-the-boundary state of an experiment run (treat as immutable from UI). */
export interface ProcedureState {
  /** 0-based index of the current step; -1 means not started. */
  readonly currentStepIndex: number;
  readonly status: ExperimentRunStatus;
  readonly steps: ReadonlyArray<ProcedureStep>;
  /** Map stepId → StepStatus. */
  readonly stepStatus: Readonly<Record<string, StepStatus>>;
  /** Measurements recorded so far. */
  readonly measurements: ReadonlyArray<MeasurementRecord>;
  /** Observation notes recorded so far. */
  readonly observations: ReadonlyArray<ObservationNote>;
  /** If the last action was invalid, this holds an explanation string. */
  readonly lastError?: string;
}

/** Create an initial (not_started) state for a given step list. */
export function createInitialState(steps: ReadonlyArray<ProcedureStep>): ProcedureState {
  if (steps.length === 0) {
    throw new Error("Procedure must contain at least one step");
  }
  const stepStatus: Record<string, StepStatus> = {};
  for (const step of steps) stepStatus[step.id] = "not_started";
  return {
    currentStepIndex: -1,
    status: "not_started",
    steps,
    stepStatus,
    measurements: [],
    observations: [],
  };
}

/** Begin the procedure (move to step 0). */
export function startProcedure(state: ProcedureState): ProcedureState {
  if (state.status !== "not_started" && state.status !== "reset") {
    return state;
  }
  const first = state.steps[0];
  if (!first) return state;
  return {
    ...state,
    currentStepIndex: 0,
    status: "in_progress",
    stepStatus: { ...state.stepStatus, [first.id]: "in_progress" },
    lastError: undefined,
  };
}

/** Reset the procedure to its initial (not started) state. */
export function resetProcedure(state: ProcedureState): ProcedureState {
  return createInitialState(state.steps);
}

/** Record the supplied measurements as produced by the current step and advance. */
export function completeStepWithMeasurements(
  state: ProcedureState,
  measurements: ReadonlyArray<MeasurementRecord>,
  requiredEquipmentPresent: ReadonlySet<string>,
): ProcedureState {
  if (state.currentStepIndex < 0 || state.currentStepIndex >= state.steps.length) {
    return { ...state, lastError: "No step is in progress." };
  }
  const step = state.steps[state.currentStepIndex]!;

  // Validate required equipment is present.
  const missing = step.requiredEquipment.filter((eq) => !requiredEquipmentPresent.has(eq));
  if (missing.length > 0) {
    return {
      ...state,
      stepStatus: { ...state.stepStatus, [step.id]: "invalid_action" },
      lastError: `Missing equipment: ${missing.join(", ")}`,
    };
  }

  const nextStepStatus = { ...state.stepStatus, [step.id]: "completed" as const };
  const nextIndex = state.currentStepIndex + 1;
  const completed = nextIndex >= state.steps.length;
  const nextState: ProcedureState = {
    ...state,
    currentStepIndex: completed ? state.currentStepIndex : nextIndex,
    status: completed ? "completed" : "in_progress",
    stepStatus: completed
      ? nextStepStatus
      : { ...nextStepStatus, [state.steps[nextIndex]!.id]: "in_progress" },
    measurements: [...state.measurements, ...measurements],
    lastError: undefined,
  };
  return nextState;
}

/** Add a qualitative observation note to the current step. */
export function addObservation(
  state: ProcedureState,
  text: string,
  idGen: () => string,
): ProcedureState {
  if (state.currentStepIndex < 0) {
    return { ...state, lastError: "Start the experiment before recording observations." };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { ...state, lastError: "Observation text cannot be empty." };
  }
  const step = state.steps[state.currentStepIndex]!;
  const existingInStep = state.observations.filter((o) => o.stepIndex === state.currentStepIndex);
  const note: ObservationNote = {
    id: idGen(),
    stepIndex: state.currentStepIndex,
    text: trimmed,
    sequence: existingInStep.length,
  };
  return {
    ...state,
    observations: [...state.observations, note],
    stepStatus: { ...state.stepStatus, [step.id]: "in_progress" },
    lastError: undefined,
  };
}

/** Returns the current step, or undefined if not started/completed. */
export function getCurrentStep(state: ProcedureState): ProcedureStep | undefined {
  if (state.currentStepIndex < 0) return undefined;
  return state.steps[state.currentStepIndex];
}

/** Is the procedure fully complete? */
export function isCompleted(state: ProcedureState): boolean {
  return state.status === "completed";
}
