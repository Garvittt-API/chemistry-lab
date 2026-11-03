# ADR-001: TypeScript-First Monorepo

- Status: Implemented; project-owner review pending
- Date: 2026-11-03
- Decision owner: Project owner

## Context
Web and mobile applications need to share experiment definitions, validation and scientific domain logic. Separate repositories risk duplicated contracts and drift.

## Decision
Use a TypeScript-first monorepo with pnpm workspaces. Evaluate Turborepo for task orchestration. Use Next.js for web and React Native with Expo for mobile, subject to a compatibility check against current stable releases.

## Alternatives
- Separate repositories: stronger isolation, more coordination and duplicated tooling.
- Single app only: simpler initially, but does not support the stated cross-platform direction.
- Flutter/Dart: viable alternative, but would require a different shared-code strategy.

## Consequences
- Shared code and types are easier to maintain.
- Tooling and dependency boundaries need discipline.
- React Native and web do not share every UI primitive; do not force UI parity where it harms UX.

## Acceptance
Pin compatible versions, prove clean install/build for both apps, and document exceptions before accepting this ADR.
