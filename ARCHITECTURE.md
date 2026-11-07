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
- Applications: Next.js `16.4.4` web app and Expo `58.0.23` mobile app.
- Shared package: `@virtual-chemistry-lab/experiment-schema` using Zod `4.6.7`.
- Quality: TypeScript `6.0.3`, ESLint `9.39.1`, Prettier `3.6.2`, and Vitest `5.1.0`.
- No UI-kit, backend, database or authentication package exists yet;
  each remains deferred until it has real behavior and a consumer. (The
  `experiment-library` package was added in Phase 03 and `simulation-core` in Phase 04, see below.)

## Phase 02 implementation

- Web routes remain in `apps/web/app`; shared web presentation components live in
  `apps/web/components`; `apps/web/lib/content.ts` adapts the Phase 03 experiment library into
  view models (Phase 02 originally shipped labelled demonstration content here; it was replaced
  by real catalog content in Phase 03).
- CSS semantic tokens and light/dark themes are centralized in `apps/web/app/global.css`.
- `lucide-react` provides consistent interface icons; `@axe-core/playwright` provides automated
  accessibility scans.
- The future laboratory workspace is an explicit UI integration boundary and does not execute models,
  calculate readings or create notebook data.

## Phase 03 implementation

- `@virtual-chemistry-lab/experiment-schema` now carries the versioned record contract
  `2.0.0` (`EXPERIMENT_RECORD_SCHEMA_VERSION`): taxonomy, educational levels, curriculum
  mapping, safety, procedure, observations/calculations discriminated unions, references,
  review/status axes and simulation model contracts, plus a legacy-metadata migration. The
  legacy 1.0.0 metadata schema remains for compatibility.
- `@virtual-chemistry-lab/experiment-library` is the framework-free content package:
  versioned JSON content (taxonomy/level/curriculum registries + one JSON file per experiment),
  mandatory schema + referential validation at catalog build, and a pure query API
  (filter/search/sort/paginate) with a single public-visibility gate (`published` only).
- Web consumes content exclusively through `apps/web/lib/content.ts` (view-model adaptation);
  UI components hold no catalog logic. Unpublished records render the 404 boundary.
- Content status honesty is machine-shaped: publication status, scientific review status and
  integrity label are independent fields; publishing requires complete safety metadata;
  "reviewed" requires a named human reviewer (AI-assisted content stays draft).
- ADR-009 records the content-storage decision (versioned local JSON, no DB in this phase).

## Phase 04 implementation

- `@virtual-chemistry-lab/simulation-core` is the framework-free scientific simulation engine:
  - `units.ts` — dimension-vector unit system with affine temperature support (kelvin-routed) and typed errors;
  - `constants.ts` — frozen constants registry (SI Brochure 9th ed. exact defining constants, CODATA 2018 measured, conventional 25 °C K_w) with explicit `exact | conventional | measured` precision classes and source attribution;
  - `elements.ts` — CIAAW abridged standard atomic weights, 2021 revision (no elements without a standard weight);
  - `molar-mass.ts` — formula parser (nested brackets, hydrate dots) + molar mass;
  - `amount.ts` — moles ↔ mass ↔ concentration, mass concentration, dilution (C₁V₁ = C₂V₂), percent yield (never clamped), solution composition;
  - `reaction.ts` — species/reaction grammar (single unambiguous charge notation), atom + charge balance analysis, **exact rational** equation balancing (bigint `Fraction`, lowest-terms positive integers; input coefficients ignored; no tolerance-based answers);
  - `stoichiometry.ts` — limiting reagent, reaction extent, theoretical yield (input must be atom+charge balanced);
  - `acid-base.ts` — pH/pOH for strong/weak monoprotic acids/bases at 25 °C in dilute aqueous solution (explicit validity limits: activity = concentration);
  - `models.ts` — machine-checked model registry (8 models; nothing above `reference-verified`, nothing approved for production; `pending_human_review` throughout);
  - `reference-cases.ts` — frozen registry of 52 independently sourced/derived cases; `reference-cases.test.ts` enforces bidirectional model coverage.
- Exactness over convenience: balancing rejects non-unique solutions (`BalanceNotUniqueError`);
  digits directly before a trailing charge sign (`NH4+`) are always rejected as ambiguous with
  guidance (`NH4^+`); no floating tolerance is ever applied to conservation laws.
- ADR-010 records the engine decision (exact arithmetic, framework-free, refuse-ambiguity input).
- Phase 04 deliberately wires NO experiment to the engine: every experiment's
  `simulationContract` remains `planned`; no claim of learner-usable simulation is made.

## Architecture rules
1. Scientific calculations must not depend on React, DOM, Canvas or Three.js.
2. Rendering must consume model state; it must not define scientific truth.
3. Experiment content is versioned data validated against a schema.
4. Platform-specific code stays in app packages.
5. Do not create empty packages or premature abstractions.
6. Backend, accounts, database, cloud sync and AI tutor are deferred until requirements justify them.
7. All decisions with long-term impact get an ADR in `docs/architecture/decisions/`.
