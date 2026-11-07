import { describe, expect, it } from "vitest";

import {
  appendInputs,
  appendMeasurements,
  appendObservations,
  completeSession,
  countBySource,
  createSession,
} from "./observations.js";

describe("observation session", () => {
  it("creates a fresh session", () => {
    const s = createSession("sess-1", "solution-dilution", "1.0.0", "0.1.0", "test-engine");
    expect(s.sessionId).toBe("sess-1");
    expect(s.status).toBe("not_started");
    expect(s.measurements.length).toBe(0);
  });

  it("accumulates inputs/measurements/observations", () => {
    let s = createSession("s1", "sol", "1", "0", "e");
    s = appendInputs(s, { c1: 0.5 });
    expect(s.status).toBe("running");
    s = appendMeasurements(s, [
      {
        id: "m1",
        stepIndex: 0,
        measurementId: "c2",
        label: "c2",
        value: 0.05,
        unit: "mol/L",
        source: "model_calculated",
      },
    ]);
    s = appendObservations(s, [{ id: "o1", stepIndex: 0, text: "paler blue", sequence: 0 }]);
    expect(s.measurements.length).toBe(1);
    expect(s.observations.length).toBe(1);
    const counts = countBySource(s.measurements);
    expect(counts.get("model_calculated")).toBe(1);
  });

  it("completeSession sets completedAt", () => {
    let s = createSession("s1", "sol", "1", "0", "e");
    s = completeSession(s);
    expect(s.status).toBe("completed");
    expect(s.completedAt).toBeDefined();
  });
});
