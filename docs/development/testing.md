# Testing Strategy

## Layers
- Unit tests: schemas, parsers, unit conversion, scientific functions and utilities.
- Property/invariant tests: dimensional consistency, conservation properties and valid ranges where applicable.
- Integration tests: experiment content -> validation -> model -> output.
- Component tests: controls, labels, errors, keyboard behavior.
- End-to-end tests: critical learner journeys on web.
- Device tests: mobile touch, layout, performance and accessibility.
- Manual scientific review: required; not replaced by automated tests.

## Scientific reference tests
Every implemented model should include independently derived reference cases, tolerances, units, conditions and source citations. Include normal, boundary and invalid cases.

As of Phase 04 this is concrete in `packages/simulation-core`: `reference-cases.ts` is a frozen
registry (`REFERENCE_CASES`) of 52 cases; each case states expected value, unit, tolerance
(absolute or relative), source string and model ID; `reference-cases.test.ts` executes every case
against the implementation and also enforces bidirectional coverage (every registered model has ≥ 1
case; no case targets an unknown model). The human-readable register is
`docs/science/reference-cases.md`. Passing it is necessary evidence, never proof of scientific
correctness — see `docs/science/validation-policy.md`.

## Quality gates
- Formatting check.
- Lint.
- Typecheck.
- Unit/integration tests.
- Production build.
- A Playwright smoke test checks that the Phase 01 web foundation starts and exposes its shared
  schema metadata. It is a scaffold check, not a learner journey.
- Dependency/security checks in CI.

## Reporting
Record exact command, environment, date and outcome. Use `PASS`, `FAIL`, `UNVERIFIED`, `NOT IMPLEMENTED`. Never report a test as passing if it was not run.

## Phase 01–04 commands

Run from the repository root after installation:

```powershell
corepack pnpm format:check
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build:web
corepack pnpm --filter @virtual-chemistry-lab/web exec playwright install chromium
corepack pnpm e2e
corepack pnpm validate:mobile
corepack pnpm security:audit
```

The `experiment-schema` package contains the versioned contract tests (31 tests: schema 1.0.0
metadata, schema 2.0.0 record validation, cross-section referential integrity and legacy
migration). The `experiment-library` package contains 23 catalog tests covering bundled-content
validation, duplicate detection, referential integrity, retrieval, search, filtering, sorting,
pagination and the publication-visibility gate. The `simulation-core` package contains 258
tests across 12 colocated files, including the 52-case machine-checked scientific reference
suite (`reference-cases.test.ts` vs `reference-cases.ts`;
`docs/science/reference-cases.md`) plus an exact-rational balancing suite
(`reaction.test.ts`) — every registered model must have reference coverage, or CI fails.

`simulation-core` also ships two tsconfigs: `tsconfig.json` (emit, excludes colocated tests) for
the `build` task, and `tsconfig.test.json` (noEmit, all sources) folded into its `typecheck`
task so tests are type-checked without shipping in `dist/`.

Phase 05 adds 31 `laboratory-core` tests. Phase 06 adds 28 `molecular-visualization` tests covering schemas, invalid structures, all bond orders, reference/ideal geometry, maximum atom budget, engine integration, text alternatives, camera state and idempotent cleanup. The full Phase 06 local unit total is 371.

Phase 06 browser coverage is authored in `apps/web/e2e/visualization.spec.ts` (5 tests): complete molecule inspection and representations, keyboard controls, blocked-WebGL fallback, 2D/3D laboratory switching and VSEPR integration. It is UNVERIFIED locally because the Playwright Chromium CDN is blocked; do not count it as executed.

Browser coverage (`apps/web/e2e/foundation.spec.ts`, 6 tests, run in CI):

- Home page renders real catalog statistics with light and dark theme axe scans.
- Explore, Subjects, About and Settings axe scans.
- Skip-link and responsive navigation behavior.
- Explore search/filter interaction, including the honest empty state.
- Experiment detail routing, review provenance and the future laboratory boundary.
- Unpublished draft records restricted to the 404 boundary.
