import { describe, expect, it, vi } from "vitest";
import {
  ResourceTracker,
  initialCameraState,
  initialVisualizationState,
  panCamera,
  visualizationReducer,
  zoomCamera,
} from "./state.js";

describe("visualization state", () => {
  it("selects atoms and bonds and clears selection on reset", () => {
    const atom = visualizationReducer(initialVisualizationState, {
      type: "select",
      selection: { kind: "atom", id: "o1" },
    });
    const bond = visualizationReducer(atom, {
      type: "select",
      selection: { kind: "bond", id: "oh1" },
    });
    expect(bond.selection).toEqual({ kind: "bond", id: "oh1" });
    expect(visualizationReducer(bond, { type: "reset" }).selection).toBeNull();
  });
  it("toggles representations, labels, annotations and contrast", () => {
    let state = visualizationReducer(initialVisualizationState, {
      type: "representation",
      value: "space-filling",
    });
    state = visualizationReducer(state, { type: "toggle-labels" });
    state = visualizationReducer(state, { type: "toggle-annotations" });
    state = visualizationReducer(state, { type: "toggle-contrast" });
    expect(state).toMatchObject({
      representation: "space-filling",
      showLabels: false,
      showAnnotations: false,
      highContrast: true,
    });
  });
  it("preserves motion and quality preferences on reset but resets rotation", () => {
    let state = visualizationReducer(initialVisualizationState, {
      type: "set-reduced-motion",
      value: true,
    });
    state = visualizationReducer(state, { type: "set-quality", value: "low" });
    state = visualizationReducer(state, { type: "rotate", radians: 1 });
    expect(visualizationReducer(state, { type: "reset" })).toMatchObject({
      reducedMotion: true,
      quality: "low",
      rotationY: 0,
    });
  });
  it("clamps camera zoom and pan and rejects invalid input", () => {
    expect(zoomCamera(initialCameraState, 100).zoom).toBe(4);
    expect(zoomCamera(initialCameraState, 0.001).zoom).toBe(0.25);
    expect(panCamera(initialCameraState, 20, -20)).toMatchObject({ panX: 10, panY: -10 });
    expect(() => zoomCamera(initialCameraState, 0)).toThrow();
    expect(() => panCamera(initialCameraState, Number.NaN, 0)).toThrow();
  });
});

describe("resource lifecycle", () => {
  it("disposes each tracked resource exactly once", () => {
    const tracker = new ResourceTracker();
    const resource = { dispose: vi.fn() };
    tracker.track(resource);
    tracker.dispose();
    tracker.dispose();
    expect(resource.dispose).toHaveBeenCalledTimes(1);
    expect(tracker.size).toBe(0);
    expect(tracker.isDisposed).toBe(true);
  });
  it("releases individual resources and refuses tracking after cleanup", () => {
    const tracker = new ResourceTracker();
    const resource = { dispose: vi.fn() };
    tracker.track(resource);
    tracker.release(resource);
    tracker.release(resource);
    expect(resource.dispose).toHaveBeenCalledTimes(1);
    tracker.dispose();
    const late = { dispose: vi.fn() };
    expect(() => tracker.track(late)).toThrow(/after disposal/);
    expect(late.dispose).toHaveBeenCalledTimes(1);
  });
});
