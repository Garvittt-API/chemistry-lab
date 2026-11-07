"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Box, Camera, Contrast, Info, RotateCcw, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import {
  bondAngleDegrees,
  describeAtom,
  describeBond,
  describeMolecule,
  initialVisualizationState,
  visualizationReducer,
  type Molecule,
  type Selection,
} from "@virtual-chemistry-lab/molecular-visualization";
import { Molecule2d } from "./molecule-2d";
import { SceneErrorBoundary } from "./scene-error-boundary";
import type { CameraCommand } from "./molecule-scene";

const MoleculeScene = dynamic(() => import("./molecule-scene"), {
  ssr: false,
  loading: () => (
    <div className="scene-loading" role="status">
      <span className="loading-spinner" />
      Loading the 3D renderer…
    </div>
  ),
});

export function MoleculeViewer({ molecule }: { molecule: Molecule }) {
  const [state, dispatch] = useReducer(visualizationReducer, initialVisualizationState);
  const [cameraCommand, setCameraCommand] = useState<CameraCommand>({ id: 0, type: "reset" });
  const [webgl, setWebgl] = useState<"checking" | "available" | "unavailable">("checking");
  const [mode, setMode] = useState<"3d" | "2d">("3d");
  const [error, setError] = useState<string | null>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const selection = state.selection;
  const selectedAtom =
    selection?.kind === "atom"
      ? molecule.atoms.find((atom) => atom.id === selection.id)
      : undefined;
  const selectedBond =
    selection?.kind === "bond"
      ? molecule.bonds.find((bond) => bond.id === selection.id)
      : undefined;
  const textDescription = useMemo(() => describeMolecule(molecule), [molecule]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    dispatch({ type: "set-reduced-motion", value: reduced });
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setWebgl(context ? "available" : "unavailable");
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setWebgl("unavailable");
    }
  }, []);

  useEffect(() => {
    setError(null);
    dispatch({ type: "select", selection: null });
  }, [molecule.id]);

  const command = (type: CameraCommand["type"]) =>
    setCameraCommand((current) => ({ id: current.id + 1, type }));
  const reset = () => {
    dispatch({ type: "reset" });
    command("reset");
    sceneRef.current?.focus();
  };
  const onSelect = (next: Selection) => dispatch({ type: "select", selection: next });
  const fallback = (
    <div className="scene-fallback" role="status">
      <Info size={24} aria-hidden="true" />
      <h3>
        {webgl === "unavailable"
          ? "3D is unavailable on this device"
          : "The 3D view could not be displayed"}
      </h3>
      <p>
        {error ??
          "WebGL is disabled or unsupported. The complete structure remains available in the 2D view and text description."}
      </p>
      <button className="button button-secondary" type="button" onClick={() => setMode("2d")}>
        Use 2D structure
      </button>
    </div>
  );

  return (
    <section className="molecule-viewer" aria-labelledby="viewer-title">
      <div className="viewer-toolbar">
        <div className="segmented-control" aria-label="Structure view">
          <button type="button" aria-pressed={mode === "3d"} onClick={() => setMode("3d")}>
            <Box size={16} aria-hidden="true" />
            3D model
          </button>
          <button type="button" aria-pressed={mode === "2d"} onClick={() => setMode("2d")}>
            2D alternative
          </button>
        </div>
        <div className="viewer-toolbar-group">
          <button
            className="icon-button"
            type="button"
            title="Rotate left"
            aria-label="Rotate molecule left"
            onClick={() => dispatch({ type: "rotate", radians: -Math.PI / 8 })}
          >
            <RotateCcw size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            title="Rotate right"
            aria-label="Rotate molecule right"
            onClick={() => dispatch({ type: "rotate", radians: Math.PI / 8 })}
          >
            <RotateCw size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            title="Zoom in"
            aria-label="Zoom in"
            onClick={() => command("zoom-in")}
          >
            <ZoomIn size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            title="Zoom out"
            aria-label="Zoom out"
            onClick={() => command("zoom-out")}
          >
            <ZoomOut size={18} />
          </button>
          <button
            className="icon-button"
            type="button"
            title="Reset view"
            aria-label="Reset molecule view"
            onClick={reset}
          >
            <Camera size={18} />
          </button>
        </div>
      </div>
      <div className="viewer-options">
        <label>
          Representation
          <select
            value={state.representation}
            onChange={(event) =>
              dispatch({
                type: "representation",
                value: event.target.value as "ball-and-stick" | "space-filling",
              })
            }
          >
            <option value="ball-and-stick">Ball and stick</option>
            <option value="space-filling">Space filling (schematic)</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.showLabels}
            onChange={() => dispatch({ type: "toggle-labels" })}
          />
          Atom labels
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.showAnnotations}
            onChange={() => dispatch({ type: "toggle-annotations" })}
          />
          Bond annotations
        </label>
        <label>
          <input
            type="checkbox"
            checked={state.highContrast}
            onChange={() => dispatch({ type: "toggle-contrast" })}
          />
          <Contrast size={15} aria-hidden="true" />
          High contrast
        </label>
        <label>
          Quality
          <select
            value={state.quality}
            onChange={(event) =>
              dispatch({
                type: "set-quality",
                value: event.target.value as "low" | "medium" | "high",
              })
            }
          >
            <option value="low">Low</option>
            <option value="medium">Balanced</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      {mode === "3d" ? (
        <div
          ref={sceneRef}
          className="scene-container"
          tabIndex={0}
          role="application"
          aria-label={`${molecule.name} 3D scene. Drag to rotate, scroll to zoom, or use the named controls. Arrow keys rotate; plus and minus zoom; Home resets.`}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              dispatch({
                type: "rotate",
                radians: event.key === "ArrowLeft" ? -Math.PI / 12 : Math.PI / 12,
              });
            }
            if (event.key === "+" || event.key === "=") {
              event.preventDefault();
              command("zoom-in");
            }
            if (event.key === "-") {
              event.preventDefault();
              command("zoom-out");
            }
            if (event.key === "Home") {
              event.preventDefault();
              reset();
            }
          }}
        >
          {webgl === "checking" ? (
            <div className="scene-loading" role="status">
              Checking 3D support…
            </div>
          ) : webgl === "unavailable" ? (
            fallback
          ) : (
            <SceneErrorBoundary fallback={fallback} onError={setError} resetKey={molecule.id}>
              <MoleculeScene
                molecule={molecule}
                selection={selection}
                representation={state.representation}
                showLabels={state.showLabels}
                showAnnotations={state.showAnnotations}
                highContrast={state.highContrast}
                reducedMotion={state.reducedMotion}
                quality={state.quality}
                rotationY={state.rotationY}
                cameraCommand={cameraCommand}
                onSelect={onSelect}
                onQualityChange={(quality) => dispatch({ type: "set-quality", value: quality })}
              />
            </SceneErrorBoundary>
          )}
        </div>
      ) : (
        <div className="molecule-2d-wrap">
          <Molecule2d molecule={molecule} selection={selection} onSelect={onSelect} />
        </div>
      )}

      <p className="scene-help" id="viewer-title">
        Select an atom or bond in the scene or in the lists below. Scientific information does not
        depend on 3D interaction.
      </p>
      <div className="molecule-inspector" aria-live="polite">
        <h3>Selection details</h3>
        <p>
          {selectedAtom
            ? describeAtom(molecule, selectedAtom)
            : selectedBond
              ? describeBond(molecule, selectedBond)
              : "No atom or bond selected."}
        </p>
        {molecule.geometry?.angleAtomIds ? (
          <p>
            <strong>Coordinate-derived angle:</strong>{" "}
            {bondAngleDegrees(molecule, molecule.geometry.angleAtomIds).toFixed(1)}°{" "}
            {molecule.source.kind === "experimental" ? "(reference geometry)" : "(idealized model)"}
          </p>
        ) : null}
      </div>
      <details className="molecule-selection-lists">
        <summary>Atom and bond selection lists</summary>
        <div className="selection-list-grid">
          <div>
            <h4>Atoms</h4>
            <ul>
              {molecule.atoms.map((atom) => (
                <li key={atom.id}>
                  <button
                    type="button"
                    aria-pressed={selection?.kind === "atom" && selection.id === atom.id}
                    onClick={() => onSelect({ kind: "atom", id: atom.id })}
                  >
                    {atom.element} · {atom.id}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Bonds</h4>
            <ul>
              {molecule.bonds.map((bond) => (
                <li key={bond.id}>
                  <button
                    type="button"
                    aria-pressed={selection?.kind === "bond" && selection.id === bond.id}
                    onClick={() => onSelect({ kind: "bond", id: bond.id })}
                  >
                    {bond.id} · {bond.order}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </details>
      <details className="molecule-text-alternative">
        <summary>Full text description of {molecule.name}</summary>
        <p>{textDescription}</p>
      </details>
    </section>
  );
}
