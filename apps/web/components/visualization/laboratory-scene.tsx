"use client";

import { OrbitControls, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, type ComponentRef } from "react";
import * as THREE from "three";
import type { EquipmentDefinition } from "@virtual-chemistry-lab/laboratory-core";
import { disposeScene } from "./molecule-scene";
import type { CameraCommand } from "./molecule-scene";

export interface LabObject3d {
  definition: EquipmentDefinition;
  position: [number, number, number];
  rotationY: number;
}

export default function LaboratoryScene({
  objects,
  selectedId,
  onSelect,
  cameraCommand,
  onCreated,
}: {
  objects: readonly LabObject3d[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  cameraCommand: CameraCommand;
  onCreated?: () => void;
}) {
  const controlsRef = useRef<ComponentRef<typeof OrbitControls>>(null);
  return (
    <Canvas
      aria-label="Interactive three-dimensional laboratory equipment scene"
      camera={{ position: [6, 5, 9], fov: 45, near: 0.1, far: 100 }}
      dpr={[1, 1.5]}
      frameloop="demand"
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        onCreated?.();
      }}
      onPointerMissed={() => onSelect(null)}
    >
      <AdaptiveLabPerformance />
      <ambientLight intensity={1.7} />
      <directionalLight position={[4, 8, 5]} intensity={2.5} />
      <directionalLight position={[-4, 2, -3]} intensity={0.6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <planeGeometry args={[14, 9]} />
        <meshStandardMaterial color="#dce6e2" roughness={0.9} />
      </mesh>
      <gridHelper args={[14, 28, "#a9bbb6", "#d1dcd8"]} />
      {objects.map((object) => (
        <EquipmentMesh
          key={object.definition.id}
          object={object}
          selected={selectedId === object.definition.id}
          onSelect={onSelect}
        />
      ))}
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping={false}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={4}
        maxDistance={22}
      />
      <LabCameraRig command={cameraCommand} controlsRef={controlsRef} />
      <Cleanup />
    </Canvas>
  );
}

function AdaptiveLabPerformance() {
  const setDpr = useThree((state) => state.setDpr);
  return <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />;
}

function LabCameraRig({
  command,
  controlsRef,
}: {
  command: CameraCommand;
  controlsRef: React.RefObject<ComponentRef<typeof OrbitControls> | null>;
}) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    if (!command.id) return;
    if (command.type === "reset") controlsRef.current?.reset();
    else {
      camera.position.multiplyScalar(command.type === "zoom-in" ? 0.82 : 1.22);
      camera.updateProjectionMatrix();
    }
    invalidate();
  }, [camera, command, controlsRef, invalidate]);
  return null;
}

function Cleanup() {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  useEffect(() => () => disposeScene(scene, gl), [gl, scene]);
  return null;
}

function EquipmentMesh({
  object,
  selected,
  onSelect,
}: {
  object: LabObject3d;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const { definition, position, rotationY } = object;
  const height = Math.max(0.7, definition.visualHeight / 55);
  const width = Math.max(0.22, definition.visualWidth / 55);
  const color = selected ? "#f0a22e" : "#b9d9df";
  const select = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    onSelect(definition.id);
  };
  return (
    <group position={position} rotation={[0, rotationY, 0]} onClick={select}>
      <EquipmentGeometry
        category={definition.category}
        height={height}
        width={width}
        color={color}
        selected={selected}
      />
      {selected ? (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[width * 0.75, width * 0.9, 32]} />
          <meshBasicMaterial color="#d78700" side={THREE.DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
}

function EquipmentGeometry({
  category,
  height,
  width,
  color,
  selected,
}: {
  category: EquipmentDefinition["category"];
  height: number;
  width: number;
  color: string;
  selected: boolean;
}) {
  const material = (
    <meshStandardMaterial
      color={color}
      transparent
      opacity={selected ? 0.82 : 0.48}
      roughness={0.18}
      metalness={0.05}
      side={THREE.DoubleSide}
    />
  );
  if (["beaker", "measuring_cylinder"].includes(category))
    return (
      <group>
        <mesh position={[0, height / 2, 0]}>
          <cylinderGeometry args={[width / 2, width / 2, height, 24, 1, true]} />
          {material}
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[width / 2, width / 2, 0.06, 24]} />
          {material}
        </mesh>
        <Graduations height={height} width={width} />
      </group>
    );
  if (category === "conical_flask" || category === "volumetric_flask")
    return (
      <group>
        <mesh position={[0, height * 0.3, 0]}>
          <cylinderGeometry args={[width * 0.18, width / 2, height * 0.6, 24, 1, true]} />
          {material}
        </mesh>
        <mesh position={[0, height * 0.75, 0]}>
          <cylinderGeometry args={[width * 0.16, width * 0.16, height * 0.42, 20, 1, true]} />
          {material}
        </mesh>
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[width / 2, width / 2, 0.06, 24]} />
          {material}
        </mesh>
      </group>
    );
  if (category === "test_tube")
    return (
      <group>
        <mesh position={[0, height / 2, 0]}>
          <cylinderGeometry args={[width / 2, width / 2, height, 20, 1, true]} />
          {material}
        </mesh>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[width / 2, 20, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          {material}
        </mesh>
      </group>
    );
  if (
    category === "burette" ||
    category === "pipette" ||
    category === "glass_rod" ||
    category === "thermometer"
  )
    return (
      <group>
        <mesh position={[0, height / 2, 0]}>
          <cylinderGeometry
            args={[Math.max(0.045, width / 2), Math.max(0.045, width / 2), height, 12]}
          />
          {material}
        </mesh>
        {category === "burette" ? (
          <mesh position={[0, height * 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.05, 0.05, 0.45, 10]} />
            <meshStandardMaterial color="#63777a" />
          </mesh>
        ) : null}
      </group>
    );
  if (category === "ph_meter")
    return (
      <group>
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[1.4, 0.9, 0.8]} />
          <meshStandardMaterial color={selected ? "#f0a22e" : "#e4e9e8"} />
        </mesh>
        <mesh position={[0, 0.56, 0.41]}>
          <planeGeometry args={[0.8, 0.32]} />
          <meshBasicMaterial color="#284d50" />
        </mesh>
        <mesh position={[0.65, 1.25, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 1.5, 12]} />
          <meshStandardMaterial color="#b9d9df" />
        </mesh>
      </group>
    );
  if (category === "wash_bottle")
    return (
      <group>
        <mesh position={[0, height * 0.4, 0]}>
          <cylinderGeometry args={[width * 0.4, width / 2, height * 0.8, 20]} />
          <meshStandardMaterial
            color={selected ? "#f0a22e" : "#edf3f1"}
            transparent
            opacity={0.75}
          />
        </mesh>
        <mesh position={[0.25, height * 0.95, 0]} rotation={[0, 0, -0.4]}>
          <cylinderGeometry args={[0.05, 0.07, height * 0.6, 10]} />
          <meshStandardMaterial color="#b9d9df" />
        </mesh>
      </group>
    );
  return (
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width, height, width * 0.6]} />
      <meshStandardMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

function Graduations({ height, width }: { height: number; width: number }) {
  return (
    <group>
      {[0.25, 0.45, 0.65, 0.85].map((fraction) => (
        <mesh key={fraction} position={[0, height * fraction, width / 2 + 0.005]}>
          <boxGeometry args={[width * 0.35, 0.015, 0.01]} />
          <meshBasicMaterial color="#527178" />
        </mesh>
      ))}
    </group>
  );
}
