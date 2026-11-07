export type Representation = "ball-and-stick" | "space-filling";
export type Selection = { kind: "atom" | "bond"; id: string } | null;
export type RenderQuality = "low" | "medium" | "high";

export interface VisualizationState {
  readonly selection: Selection;
  readonly highlighted: Selection;
  readonly representation: Representation;
  readonly showLabels: boolean;
  readonly showAnnotations: boolean;
  readonly highContrast: boolean;
  readonly reducedMotion: boolean;
  readonly quality: RenderQuality;
  readonly rotationY: number;
}

export const initialVisualizationState: VisualizationState = Object.freeze({
  selection: null,
  highlighted: null,
  representation: "ball-and-stick",
  showLabels: true,
  showAnnotations: true,
  highContrast: false,
  reducedMotion: false,
  quality: "medium",
  rotationY: 0,
});

export type VisualizationAction =
  | { type: "select"; selection: Selection }
  | { type: "highlight"; selection: Selection }
  | { type: "representation"; value: Representation }
  | { type: "toggle-labels" }
  | { type: "toggle-annotations" }
  | { type: "toggle-contrast" }
  | { type: "set-reduced-motion"; value: boolean }
  | { type: "set-quality"; value: RenderQuality }
  | { type: "rotate"; radians: number }
  | { type: "reset" };

export function visualizationReducer(
  state: VisualizationState,
  action: VisualizationAction,
): VisualizationState {
  switch (action.type) {
    case "select":
      return { ...state, selection: action.selection };
    case "highlight":
      return { ...state, highlighted: action.selection };
    case "representation":
      return { ...state, representation: action.value };
    case "toggle-labels":
      return { ...state, showLabels: !state.showLabels };
    case "toggle-annotations":
      return { ...state, showAnnotations: !state.showAnnotations };
    case "toggle-contrast":
      return { ...state, highContrast: !state.highContrast };
    case "set-reduced-motion":
      return { ...state, reducedMotion: action.value };
    case "set-quality":
      return { ...state, quality: action.value };
    case "rotate":
      return { ...state, rotationY: state.rotationY + action.radians };
    case "reset":
      return {
        ...initialVisualizationState,
        reducedMotion: state.reducedMotion,
        quality: state.quality,
      };
  }
}

export class ResourceTracker {
  private readonly resources = new Set<{ dispose: () => void }>();
  private disposed = false;

  track<T extends { dispose: () => void }>(resource: T): T {
    if (this.disposed) {
      resource.dispose();
      throw new Error("Cannot track a resource after disposal");
    }
    this.resources.add(resource);
    return resource;
  }

  release(resource: { dispose: () => void }): void {
    if (this.resources.delete(resource)) resource.dispose();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const resource of this.resources) resource.dispose();
    this.resources.clear();
  }

  get size(): number {
    return this.resources.size;
  }
  get isDisposed(): boolean {
    return this.disposed;
  }
}

export interface CameraState {
  readonly zoom: number;
  readonly panX: number;
  readonly panY: number;
}
export const initialCameraState: CameraState = Object.freeze({ zoom: 1, panX: 0, panY: 0 });
export function zoomCamera(state: CameraState, factor: number): CameraState {
  if (!Number.isFinite(factor) || factor <= 0)
    throw new Error("Zoom factor must be positive and finite");
  return { ...state, zoom: Math.max(0.25, Math.min(4, state.zoom * factor)) };
}
export function panCamera(state: CameraState, x: number, y: number): CameraState {
  if (![x, y].every(Number.isFinite)) throw new Error("Pan values must be finite");
  return {
    ...state,
    panX: Math.max(-10, Math.min(10, state.panX + x)),
    panY: Math.max(-10, Math.min(10, state.panY + y)),
  };
}
