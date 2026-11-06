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

## Phase 01 commands

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
pagination and the publication-visibility gate.

Browser coverage (`apps/web/e2e/foundation.spec.ts`, 6 tests, run in CI):

- Home page renders real catalog statistics with light and dark theme axe scans.
- Explore, Subjects, About and Settings axe scans.
- Skip-link and responsive navigation behavior.
- Explore search/filter interaction, including the honest empty state.
- Experiment detail routing, review provenance and the future laboratory boundary.
- Unpublished draft records restricted to the 404 boundary.
