"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Camera, Info, Move, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { getEquipment } from "@virtual-chemistry-lab/laboratory-core";
import { SceneErrorBoundary } from "./scene-error-boundary";
import type { CameraCommand } from "./molecule-scene";
import type { LabObject3d } from "./laboratory-scene";

const LaboratoryScene = dynamic(() => import("./laboratory-scene"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading" role="status">
      Loading the 3D laboratory…
    </div>
  ),
});
const EXPERIMENT_EQUIPMENT: Record<string, string[]> = {
  "solution-dilution": [
    "measuring-cylinder-10",
    "measuring-cylinder-100",
    "beaker-250",
    "glass-rod",
    "wash-bottle",
  ],
  "ph-and-indicators": ["beaker-100", "ph-meter", "glass-rod", "wash-bottle"],
};

export function Laboratory3d({ experimentId }: { experimentId: string }) {
  const ids = EXPERIMENT_EQUIPMENT[experimentId] ?? [
    "beaker-100",
    "conical-flask-250",
    "test-tube",
    "burette-50",
  ];
  const initial = useMemo(
    () =>
      ids.map(
        (id, index): LabObject3d => ({
          definition: getEquipment(id),
          position: [(index - (ids.length - 1) / 2) * 2.1, 0, 0],
          rotationY: 0,
        }),
      ),
    [ids],
  );
  const [objects, setObjects] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [webgl, setWebgl] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraCommand, setCameraCommand] = useState<CameraCommand>({ id: 0, type: "reset" });
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setWebgl(Boolean(context));
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setWebgl(false);
    }
  }, []);
  const selected = objects.find((object) => object.definition.id === selectedId);
  const command = (type: CameraCommand["type"]) =>
    setCameraCommand((current) => ({ id: current.id + 1, type }));
  const move = (axis: 0 | 2, amount: number) => {
    if (!selectedId) return;
    setObjects((current) =>
      current.map((object) => {
        if (object.definition.id !== selectedId) return object;
        const position = [...object.position] as [number, number, number];
        position[axis] = Math.max(-5, Math.min(5, position[axis] + amount));
        return { ...object, position };
      }),
    );
  };
  const reset = () => {
    setObjects(initial);
    setSelectedId(null);
    command("reset");
  };
  const fallback = (
    <div className="scene-fallback" role="status">
      <Info size={24} />
      <h3>3D laboratory unavailable</h3>
      <p>
        {error ??
          "WebGL is unavailable. Return to the 2D laboratory; all model-backed calculations and observations remain available there."}
      </p>
    </div>
  );
  return (
    <section className="lab-3d" aria-label="3D laboratory view">
      <div className="viewer-toolbar">
        <p>
          <strong>Equipment scene</strong> · shared Phase 05 definitions
        </p>
        <div className="viewer-toolbar-group">
          <button
            className="icon-button"
            type="button"
            aria-label="Zoom in"
            onClick={() => command("zoom-in")}
          >
            <ZoomIn size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            aria-label="Zoom out"
            onClick={() => command("zoom-out")}
          >
            <ZoomOut size={18} />
          </button>
          <button className="button button-secondary" type="button" onClick={reset}>
            <Camera size={16} />
            Reset scene
          </button>
        </div>
      </div>
      <div className="scene-container lab-scene-container">
        {webgl ? (
          <SceneErrorBoundary fallback={fallback} onError={setError} resetKey={experimentId}>
            <LaboratoryScene
              objects={objects}
              selectedId={selectedId}
              onSelect={setSelectedId}
              cameraCommand={cameraCommand}
            />
          </SceneErrorBoundary>
        ) : (
          fallback
        )}
      </div>
      <div className="lab-3d-bottom">
        <div>
          <h3>Equipment</h3>
          <div className="lab-object-list">
            {objects.map((object) => (
              <button
                type="button"
                key={object.definition.id}
                aria-pressed={selectedId === object.definition.id}
                onClick={() => setSelectedId(object.definition.id)}
              >
                {object.definition.label}
              </button>
            ))}
          </div>
        </div>
        <div className="lab-object-inspector" aria-live="polite">
          <h3>{selected ? selected.definition.label : "Select equipment"}</h3>
          {selected ? (
            <>
              <p>
                {selected.definition.accessibilityLabel}.{" "}
                {selected.definition.capacityMl
                  ? `Nominal capacity ${selected.definition.capacityMl} mL.`
                  : "No liquid capacity."}
              </p>
              <p>
                Supported operations:{" "}
                {selected.definition.supportedOperations.join(", ").replaceAll("_", " ")}.
              </p>
              <div className="button-row">
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => move(0, -0.5)}
                >
                  <Move size={15} />
                  Left
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => move(0, 0.5)}
                >
                  Right
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => move(2, -0.5)}
                >
                  Forward
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => move(2, 0.5)}
                >
                  Back
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() =>
                    setObjects((current) =>
                      current.map((object) =>
                        object.definition.id === selectedId
                          ? { ...object, rotationY: object.rotationY + Math.PI / 6 }
                          : object,
                      ),
                    )
                  }
                >
                  <RotateCw size={15} />
                  Rotate
                </button>
              </div>
            </>
          ) : (
            <p>Select an object in the scene or equipment list to inspect, move or rotate it.</p>
          )}
        </div>
      </div>
      <p className="scene-help">
        This is an equipment-layout visualization only. It does not simulate fluid dynamics, mixing,
        heat transfer, chemical reactions or physical collisions. Procedure calculations stay in the
        2D model-backed workspace.
      </p>
    </section>
  );
}
