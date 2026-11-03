# ADR-002: Separate Scientific Models from Rendering

- Status: Implemented in architecture; project-owner review pending
- Date: 2026-11-03

## Context
The same chemistry model should power different visualizations and platforms. UI frameworks and 3D engines change faster than scientific equations.

## Decision
Implement scientific calculations as pure, typed functions in a platform-independent package. Renderers consume model outputs and never become the source of scientific truth.

## Consequences
- Models can be tested without a browser or device.
- The UI can change without changing scientific calculations.
- Animation may interpolate visuals, but must not change authoritative readings.
- Model inputs, outputs, units, assumptions and validity ranges must be documented.
