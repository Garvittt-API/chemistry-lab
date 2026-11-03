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

The schema package currently contains the Phase 01 unit tests. They cover a valid draft document,
unsupported versions and IDs, missing review provenance, and incomplete safety/procedure data.
