# ADR-004: Pinned Phase 01 Toolchain

- Status: Implemented; project-owner review pending
- Date: 2026-11-03
- Decision owner: Project owner

## Context

The repository needs a reproducible cross-platform foundation while the host provides Node.js
24.18.1 and Corepack. Framework compatibility must be checked before the first install and captured
in the repository.

## Decision

Phase 01 pins Node.js `24.18.1`, pnpm `12.16.1`, Next.js `16.4.4`, React/React DOM `19.3.0`, Expo
`58.0.22`, React Native `0.88.1`, React Native Web `0.21.4`, Turborepo `2.11.10`, Zod `4.6.7`,
TypeScript `6.0.3`, typescript-eslint `8.72.1`, Vitest `5.1.0`, ESLint `9.39.1`, and Prettier `3.6.2`.
Exact dependency versions
are committed through package manifests and `pnpm-lock.yaml`.

## Rationale

- Node 24.18.1 satisfies the verified engine ranges for Next.js, Expo and React Native.
- pnpm workspaces provide a reproducible lockfile and workspace boundaries.
- Turbo provides task orchestration without introducing a backend or deployment service.
- The schema package is the first shared package because both applications consume its versioned
  contract.

## Consequences

- Native mobile builds still require platform SDKs and device/simulator tooling.
- Future package additions must have a real API, consumer, tests and owner.
- The project owner must review and accept this decision before the Phase 01 gate is signed off.
