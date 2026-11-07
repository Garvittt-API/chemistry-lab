"use client";

import { Html, OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type ComponentRef } from "react";
import * as THREE from "three";
import {
  moleculeBounds,
  type Atom,
  type Molecule,
  type RenderQuality,
  type Representation,
  type Selection,
} from "@virtual-chemistry-lab/molecular-visualization";

const ELEMENT_COLORS: Record<string, string> = {
  H: "#f4f6f7",
  C: "#36474f",
  N: "#326fd1",
  O: "#d64b45",
};
const CONTRAST_COLORS: Record<string, string> = {
  H: "#ffffff",
  C: "#111111",
  N: "#005fcc",
  O: "#d00000",
};
const BALL_RADII: Record<string, number> = { H: 0.25, C: 0.38, N: 0.4, O: 0.42 };
const SPACE_RADII: Record<string, number> = { H: 0.72, C: 1.02, N: 0.93, O: 0.91 };

export type CameraCommand = { id: number; type: "reset" | "zoom-in" | "zoom-out" };

export default function MoleculeScene({
  molecule,
  selection,
  representation,
  showLabels,
  showAnnotations,
  highContrast,
  reducedMotion,
  quality,
  rotationY,
  cameraCommand,
  onSelect,
  onQualityChange,
  onCreated,
}: {
  molecule: Molecule;
  selection: Selection;
  representation: Representation;
  showLabels: boolean;
  showAnnotations: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  quality: RenderQuality;
  rotationY: number;
  cameraCommand: CameraCommand;
  onSelect: (selection: Selection) => void;
  onQualityChange: (quality: RenderQuality) => void;
  onCreated?: () => void;
}) {
  const bounds = useMemo(() => moleculeBounds(molecule), [molecule]);
  const cameraDistance = Math.max(5, bounds.radius * 4.8);
  return (
    <Canvas
      aria-label={`Interactive 3D model of ${molecule.name}`}
      camera={{
        position: [cameraDistance * 0.45, cameraDistance * 0.25, cameraDistance],
        fov: 42,
        near: 0.1,
        far: 200,
      }}
      dpr={quality === "low" ? 1 : quality === "medium" ? [1, 1.5] : [1, 2]}
      frameloop="demand"
      gl={{ antialias: quality !== "low", alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onCreated?.();
      }}
      onPointerMissed={() => onSelect(null)}
    >
      <PerformanceMonitor onDecline={() => onQualityChange("low")} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[4, 6, 8]} intensity={2.4} />
      <directionalLight position={[-5, -2, 3]} intensity={0.7} />
      <group
        position={bounds.center.map((value) => -value) as [number, number, number]}
        rotation={[0, rotationY, 0]}
      >
        {representation === "ball-and-stick"
          ? molecule.bonds.map((bond) => (
              <BondMesh
                key={bond.id}
                molecule={molecule}
                bondId={bond.id}
                selected={selection?.kind === "bond" && selection.id === bond.id}
                showLabel={showAnnotations}
                onSelect={onSelect}
              />
            ))
          : null}
        {molecule.atoms.map((atom) => (
          <AtomMesh
            key={atom.id}
            atom={atom}
            representation={representation}
            selected={selection?.kind === "atom" && selection.id === atom.id}
            showLabel={showLabels}
            highContrast={highContrast}
            onSelect={onSelect}
          />
        ))}
      </group>
      <CameraRig
        command={cameraCommand}
        reducedMotion={reducedMotion}
        controlsRef={useRef<ComponentRef<typeof OrbitControls>>(null)}
      />
      <SceneCleanup />
    </Canvas>
  );
}

function CameraRig({
  command,
  reducedMotion,
  controlsRef,
}: {
  command: CameraCommand;
  reducedMotion: boolean;
  controlsRef: React.RefObject<ComponentRef<typeof OrbitControls> | null>;
}) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (command.id === 0) return;
    if (command.type === "reset") controlsRef.current?.reset();
    else {
      camera.position.multiplyScalar(command.type === "zoom-in" ? 0.82 : 1.22);
      camera.updateProjectionMatrix();
    }
    invalidate();
  }, [camera, command, controlsRef, invalidate]);
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping={false}
      enablePan
      minDistance={2}
      maxDistance={40}
      zoomSpeed={0.8}
      rotateSpeed={reducedMotion ? 1 : 0.7}
    />
  );
}

function AtomMesh({
  atom,
  representation,
  selected,
  showLabel,
  highContrast,
  onSelect,
}: {
  atom: Atom;
  representation: Representation;
  selected: boolean;
  showLabel: boolean;
  highContrast: boolean;
  onSelect: (selection: Selection) => void;
}) {
  const radius =
    (representation === "space-filling" ? SPACE_RADII : BALL_RADII)[atom.element] ?? 0.38;
  const palette = highContrast ? CONTRAST_COLORS : ELEMENT_COLORS;
  return (
    <group position={atom.positionAngstrom}>
      <mesh
        scale={selected ? 1.13 : 1}
        onClick={(event) => {
          event.stopPropagation();
          onSelect({ kind: "atom", id: atom.id });
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[radius, representation === "space-filling" ? 20 : 24, 16]} />
        <meshStandardMaterial
          color={selected ? "#f0a22e" : (palette[atom.element] ?? "#a07ac7")}
          roughness={0.42}
          metalness={0.05}
        />
      </mesh>
      {selected ? (
        <mesh scale={1.2}>
          <sphereGeometry args={[radius, 16, 12]} />
          <meshBasicMaterial color="#ffd166" wireframe transparent opacity={0.8} />
        </mesh>
      ) : null}
      {showLabel ? (
        <Html
          center
          distanceFactor={8}
          position={[0, radius + 0.18, 0]}
          className="scene-atom-label"
          aria-hidden="true"
        >
          {atom.element}
        </Html>
      ) : null}
    </group>
  );
}

function BondMesh({
  molecule,
  bondId,
  selected,
  showLabel,
  onSelect,
}: {
  molecule: Molecule;
  bondId: string;
  selected: boolean;
  showLabel: boolean;
  onSelect: (selection: Selection) => void;
}) {
  const bond = molecule.bonds.find((candidate) => candidate.id === bondId)!;
  const from = molecule.atoms.find((atom) => atom.id === bond.fromAtomId)!;
  const to = molecule.atoms.find((atom) => atom.id === bond.toAtomId)!;
  const start = new THREE.Vector3(...from.positionAngstrom);
  const end = new THREE.Vector3(...to.positionAngstrom);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize(),
  );
  const lineCount =
    bond.order === "double" || bond.order === "aromatic" ? 2 : bond.order === "triple" ? 3 : 1;
  const offsets = lineCount === 1 ? [0] : lineCount === 2 ? [-0.075, 0.075] : [-0.12, 0, 0.12];
  return (
    <group position={midpoint} quaternion={quaternion}>
      {offsets.map((offset, index) => (
        <mesh
          key={offset}
          position={[offset, 0, 0]}
          onClick={(event) => {
            event.stopPropagation();
            onSelect({ kind: "bond", id: bond.id });
          }}
        >
          <cylinderGeometry
            args={[
              selected ? 0.075 : bond.order === "aromatic" && index === 1 ? 0.025 : 0.055,
              selected ? 0.075 : 0.055,
              length,
              10,
            ]}
          />
          <meshStandardMaterial
            color={
              selected
                ? "#f0a22e"
                : bond.order === "aromatic" && index === 1
                  ? "#79a9ad"
                  : "#a8b4b8"
            }
            transparent={bond.order === "aromatic" && index === 1}
            opacity={bond.order === "aromatic" && index === 1 ? 0.55 : 1}
            roughness={0.5}
          />
        </mesh>
      ))}
      {showLabel && (bond.order !== "single" || selected) ? (
        <Html center className="scene-bond-label" aria-hidden="true">
          {bond.order}
        </Html>
      ) : null}
    </group>
  );
}

export function disposeScene(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) material.dispose();
  });
  renderer.renderLists.dispose();
}

export function SceneCleanup() {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  useEffect(() => () => disposeScene(scene, gl), [gl, scene]);
  return null;
}
