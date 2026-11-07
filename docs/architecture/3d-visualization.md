# 3D visualization architecture

## Boundaries

```text
experiment-library (identity/content) ───────────────┐
simulation-core (elements, molar mass, models) ─────┤
laboratory-core (equipment definitions/procedures) ─┤
                                                    ▼
                    molecular-visualization (framework-free)
          schemas + catalog + coordinate measurements + state
                                                    │
                                                    ▼
                         web R3F/Three.js render adapters
                                                    │
                          2D SVG + HTML + text equivalents
```

Scientific data, molecular data, coordinate geometry, scene objects, rendering, camera controls, selection state, annotations and accessibility alternatives have separate owners. R3F never changes ångström coordinates or computes chemical outputs. Uniform scene scaling and rotations are presentation only.

## Modules

- `packages/molecular-visualization/src/schema.ts`: strict Zod 1.0.0 contract, 256-atom/512-bond limits, finite ±100 Å coordinates, supported elements, unique IDs, endpoint and geometry-reference checks.
- `data.ts`: ten authored catalog records with per-structure versions, sources, model versions, assumptions and limitations.
- `geometry.ts`: pure distance, angle and bounds calculations. Values are explicitly coordinate-derived.
- `state.ts`: selection/representation/annotation/quality state, bounded camera helpers and generic disposal tracker.
- `accessibility.ts`: complete structure, atom and bond descriptions.
- `apps/web/components/visualization/molecule-scene.tsx`: demand-rendered R3F scene, meshes, OrbitControls, quality adaptation and disposal.
- `molecule-viewer.tsx`: dynamic import, WebGL detection, loading/error states, keyboard commands, inspector and alternatives.
- `laboratory-scene.tsx`: generic apparatus geometry driven by shared equipment definitions.

## Lifecycle and performance

Canvases mount only when the 3D tab is active. `frameloop="demand"` prevents idle animation. Device pixel ratio is capped at 1.5 by default (2 only in explicit high quality); the performance monitor reduces quality on decline. Atoms use 24×16 spheres (20 segments in space-filling mode), bonds use 10-segment cylinders, and lab equipment uses simple primitives. No textures, postprocessing, transmission, physics or auto-rotation are used.

Unmount cleanup traverses meshes and disposes geometries and materials, then disposes renderer render lists. R3F owns canvas/renderer teardown. State changes reuse the scene; molecule identity changes update data rather than creating a second canvas. Reduced-motion mode has no autorotation or damping. The loading spinner is disabled by the reduced-motion media query.

## Failure behavior

Unsupported WebGL displays a fallback and keeps the 2D/text/list representations available. A renderer error boundary prevents a scene failure from taking down the route. Invalid external structures fail Zod parsing before rendering. Loading functions accept injected async loaders and propagate safe errors; no file/code execution is implemented.

## Platform support

- Next.js web with WebGL: implemented; browser verification pending CI in this sandbox.
- Web without WebGL: 2D and text fallback implemented.
- Expo native: **NOT IMPLEMENTED**. A future native adapter can consume the shared contracts, but touch, GL lifecycle, accessibility and physical-device performance need separate implementation and verification.

See `docs/development/3d-performance.md` for measured and unverified evidence.
