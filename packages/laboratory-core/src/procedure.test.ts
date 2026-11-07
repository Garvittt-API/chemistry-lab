import { describe, expect, it } from "vitest";

import {
  addObservation,
  completeStepWithMeasurements,
  createInitialState,
  getCurrentStep,
  isCompleted,
  resetProcedure,
  startProcedure,
} from "./procedure.js";
import type { MeasurementRecord } from "./procedure.js";

const STEPS = [
  {
    id: "s1",
    instruction: "Place beaker.",
    requiredEquipment: ["beaker-100"],
    requiredAction: "place_equipment" as const,
  },
  {
    id: "s2",
    instruction: "Enter concentration.",
    requiredEquipment: ["beaker-100"],
    requiredAction: "enter_value" as const,
    producesMeasurements: ["c"],
  },
];

const measurement = (value: number): MeasurementRecord => ({
  id: "m1",
  stepIndex: 1,
  measurementId: "c",
  label: "c",
  value,
  unit: "mol/L",
  source: "model_calculated",
  modelId: "m",
  engineVersion: "0.1.0",
});

describe("procedure engine", () => {
  it("starts in not_started", () => {
    const s = createInitialState(STEPS);
    expect(s.status).toBe("not_started");
    expect(s.currentStepIndex).toBe(-1);
    expect(getCurrentStep(s)).toBeUndefined();
  });

  it("startProcedure moves to step 0", () => {
    let s = createInitialState(STEPS);
    s = startProcedure(s);
    expect(s.status).toBe("in_progress");
    expect(getCurrentStep(s)?.id).toBe("s1");
  });

  it("rejects completion when required equipment is missing", () => {
    let s = startProcedure(createInitialState(STEPS));
    s = completeStepWithMeasurements(s, [], new Set());
    expect(s.lastError).toMatch(/Missing equipment/);
    expect(s.stepStatus["s1"]).toBe("invalid_action");
  });

  it("completes steps and advances", () => {
    let s = startProcedure(createInitialState(STEPS));
    s = completeStepWithMeasurements(s, [], new Set(["beaker-100"]));
    expect(s.stepStatus["s1"]).toBe("completed");
    expect(getCurrentStep(s)?.id).toBe("s2");

    s = completeStepWithMeasurements(s, [measurement(0.1)], new Set(["beaker-100"]));
    expect(isCompleted(s)).toBe(true);
    expect(s.status).toBe("completed");
    expect(s.measurements.length).toBe(1);
  });

  it("resets to not_started", () => {
    let s = startProcedure(createInitialState(STEPS));
    s = completeStepWithMeasurements(s, [], new Set(["beaker-100"]));
    s = resetProcedure(s);
    expect(s.status).toBe("not_started");
    expect(s.measurements.length).toBe(0);
  });

  it("adds observations to current step", () => {
    let s = startProcedure(createInitialState(STEPS));
    s = addObservation(s, "colourless", () => "o1");
    expect(s.observations.length).toBe(1);
    expect(s.observations[0]?.stepIndex).toBe(0);

    // empty notes rejected
    const rejected = addObservation(s, "   ", () => "o2");
    expect(rejected.lastError).toMatch(/empty/);
  });

  it("rejects empty step lists", () => {
    expect(() => createInitialState([])).toThrow();
  });
});
