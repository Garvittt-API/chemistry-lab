# ADR-011: Framework-independent molecular contracts with React Three Fiber on web

- Status: Implemented; owner and qualified scientific review pending
- Date: 2026-11-07

## Context
Phase 06 needs spatial molecular and equipment visualization without making a renderer authoritative for chemistry. The web app uses React 19.3.1 and Next.js 16.4.4; the Expo app is only a scaffold. Accessibility and honest geometry provenance are more important than decorative scenes.

## Decision
Use one web rendering stack: Three.js 0.187.0, React Three Fiber 9.8.2 and Drei 10.7.9. Keep molecular schemas, authored data, coordinate measurements, visualization state, resource tracking and text alternatives in `@virtual-chemistry-lab/molecular-visualization`, independent of React, DOM and Three.js. Keep WebGL components in `apps/web/components/visualization` and dynamically import them with SSR disabled.

The package consumes `simulation-core` element and molar-mass APIs. Equipment scenes consume `laboratory-core` definitions. Experiment identity remains in `experiment-library`; no experiment JSON or scientific model is duplicated.

Use demand rendering, bounded device pixel ratios, low-poly geometries, transparent materials without transmission, adaptive quality, explicit scene cleanup and WebGL/error fallbacks. No animation loop runs while a scene is idle.

## Alternatives
- **Raw Three.js:** viable, but adds manual React lifecycle and scene synchronization work without a scientific benefit.
- **CSS 3D or SVG-only:** useful fallbacks, already supplied as SVG/text, but insufficient for inspectable spatial geometry.
- **Babylon.js or a second renderer:** rejected; no requirement justifies two rendering frameworks.
- **Native Expo GL now:** deferred. R3F has native-compatible peers, but there is no native product integration, device test or accessibility implementation to support a parity claim.

## Consequences
Three.js is loaded only by 3D client chunks. Molecular data and tests remain portable to a future native renderer. The mobile app does not claim 3D support. Independent review is required before structures can be described as scientifically validated.
