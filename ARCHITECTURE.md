# Architecture Index

The detailed system architecture is maintained in `docs/architecture/overview.md`.

## Current architectural direction
- TypeScript-first monorepo.
- Web: Next.js + TypeScript.
- Mobile: React Native + Expo.
- Workspace: pnpm workspaces; Turborepo for task orchestration if justified.
- Shared packages: experiment contracts/schema, simulation core, experiment content, shared utilities and carefully scoped UI primitives.
- 2D rendering: SVG/Canvas selected per experiment.
- 3D rendering: Three.js / React Three Fiber only for experiences that need it.
- Validation: Zod at untrusted data boundaries; unit tests with Vitest; web E2E with Playwright.
- CI: GitHub Actions.

## Phase 01 implementation

- Workspace: pnpm `12.16.1` with Turborepo `2.11.10`.
- Applications: Next.js `16.4.4` web app and Expo `58.0.22` mobile app.
- Shared package: `@virtual-chemistry-lab/experiment-schema` using Zod `4.6.7`.
- Quality: TypeScript `6.0.3`, ESLint `9.39.1`, Prettier `3.6.2`, and Vitest `5.1.0`.
- No simulation-core, experiment-library, UI, backend, database or authentication package exists yet;
  each remains deferred until it has real behavior and a consumer.

## Architecture rules
1. Scientific calculations must not depend on React, DOM, Canvas or Three.js.
2. Rendering must consume model state; it must not define scientific truth.
3. Experiment content is versioned data validated against a schema.
4. Platform-specific code stays in app packages.
5. Do not create empty packages or premature abstractions.
6. Backend, accounts, database, cloud sync and AI tutor are deferred until requirements justify them.
7. All decisions with long-term impact get an ADR in `docs/architecture/decisions/`.
