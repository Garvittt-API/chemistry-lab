# Phase 07 acceptance evidence and owner review

Verification date: 2026-11-07. Baseline under review: merge commit
`5a45318a9386b8907c38f2bbe653a671ae7a4378` (PR #11), on branch
`arena/76f4e8a9-chemistry-lab`. **Owner acceptance remains UNVERIFIED.** PR #11
was merged, but has no recorded reviews or review decision; merging is not evidence
of explicit owner acceptance. Phase 08 has not been started.

## Current CI and browser evidence

| Run / check | Result | Evidence |
|---|---|---|
| [PR #11](https://github.com/Garvittt-API/chemistry-lab/pull/11), head `d34ec437ff2cd059aad9462c8a7b5383f2dc444d`, `CI / quality` | FAIL | [Job 128371733197](https://github.com/Garvittt-API/chemistry-lab/actions/runs/42361857291/job/128371733197): completed; Web smoke test failed. Playwright summary: 11 passed, 1 flaky, 5 failed. |
| PR #11, `Sourcery review` | UNVERIFIED | Check completed as **SKIPPED**, not a successful review. [Check](https://sourcery.ai). |
| Merge commit `5a45318`, `CI / quality` | FAIL | [Job 128371868587](https://github.com/Garvittt-API/chemistry-lab/actions/runs/42361901296/job/128371868587): completed; Web smoke test failed. Playwright summary: 12 passed, 5 failed, 59.7 seconds. |
| Required-check configuration | UNVERIFIED | GitHub branch protection API returned HTTP 403 `Resource not accessible by integration`; an owner must check the required check list. The observed `quality` check is not green regardless. |

Both `quality` jobs passed checkout, pnpm and Node setup, dependency installation,
formatting, lint, typecheck, unit tests, web production build and Playwright browser
installation. Both failed `Web smoke test`; `Mobile validation` and `Dependency
audit` were skipped in CI after the failure. The merge-commit failures were:

- `lab.spec.ts`: dilution and pH journeys, each failing a strict locator assertion
  for a model identifier found in multiple elements. This establishes a test
  selector defect, not by itself a simulation defect.
- `learning-notebook.spec.ts`: learning hub/lesson/glossary, assessment/My Lab,
  and notebook/report journeys all failed. The learning-hub failure includes an
  axe `aria-prohibited-attr` serious violation: progress-track `div` elements use
  `aria-label` without a valid role. The API annotations do not include the
  detailed causes of the other two Phase 07 failures; downloaded run logs could
  not be accessed from this sandbox (GitHub Actions results host returned EOF).
  Do not assume those failures share the same cause.
- The PR run additionally classified the foundation search test as flaky; its
  annotation shows a strict selector matching two result-title elements. The
  merge-commit run did not classify that test as flaky.

Local environment: Linux x86-64 (Debian 12), Node `24.18.1`, pnpm `12.16.1`,
Playwright `1.64.1`; frozen lockfile installed. Commands run:

- `corepack pnpm --filter @virtual-chemistry-lab/web exec playwright install chromium`:
  FAIL, five `ECONNRESET` attempts to `cdn.playwright.dev`; pinned Chrome for
  Testing 156 / Playwright Chromium revision 1248 could not be downloaded.
- `pnpm e2e`: FAIL, 17/17 reported failed at browser launch because
  `chromium_headless_shell-1248` was absent; zero browser test bodies or axe
  scans ran locally. This is an environment failure, not 17 application defects.
- `pnpm --filter @virtual-chemistry-lab/learning-core test`: PASS, 21/21 tests
  in 3 files. This is not a substitute for the failed browser journeys.

The Playwright config uses Desktop Chrome, a Next dev server on port 3101, and
CI retries twice. The three Phase 07 tests cover a hub-to-lesson journey and
lesson completion, a dilution assessment and My Lab, and notebook creation,
observation, calculation, completion, report and PDF download. Their failure means
these complete end-to-end journeys are **not verified**. The notebook test name
mentions four export formats, but its browser assertions only exercise the PDF
download; HTML, CSV and JSON have unit-level evidence, not browser export evidence.

## Acceptance criteria compared with evidence

`PASS` below is scoped to the evidence stated, not a claim of complete browser
verification or scientific approval. Historical Phase 07 local results refer to
the original acceptance run on `arena/58afb8c1-chemistry-lab`; they were not all
rerun during this review.

| Requirement | Implementation evidence | Test evidence | Status |
|---|---|---|---|
| Shared, versioned learning contracts | `packages/learning-core/src/schemas.ts`, `storage.ts`; ADR-012 | Learning-core tests 21/21 locally; CI unit step passed | PASS |
| Pathways, lessons and glossary | `src/content/pathways.ts`, `lessons.ts`, `glossary.ts`; eight pathways across stages, 10 lessons, 32 glossary entries (source counts; earlier acceptance text incorrectly said four pathways and 30 terms) | Catalog unit checks pass; hub E2E fails at axe before pathway/lesson flow completes | UNVERIFIED |
| Self-check assessment and progress | `assessment-engine.ts`, `assessment-runner.tsx`, nine quizzes | Grading unit tests pass; assessment/My Lab E2E failed in both current CI runs, cause not available in retrieved annotations | UNVERIFIED |
| Engine-backed calculation workbench | `calculations.ts`, `calculation-workbench.tsx`; eight adapters | Calculation unit tests pass; notebook E2E including calculation failed, so interactive flow not established | UNVERIFIED |
| Practical notebook, Phase 05 migration and 2D bridge | `notebook.ts`, `notebook-workspace.tsx`, `lab-notebook-bridge.tsx` | Unit tests cover CRUD, migration and storage; notebook and both lab journeys fail in CI | UNVERIFIED |
| Provenance and no fabricated report sections | `schemas.ts`, `notebook.ts`, `report.ts` | Unit tests check provenance in migration and missing report content; end-to-end notebook journey failed | PASS |
| Structured report and PDF/HTML/CSV/JSON export | `report.ts`, `exporters.ts`, `pdf-generator.ts`, `report-builder-view.tsx` | Unit tests check PDF structure, HTML escaping, CSV injection and JSON round-trip; browser report/PDF test failed; other exports not tested in browser | UNVERIFIED |
| Local progress dashboard and data management | `progress.ts`, `storage.ts`, `my-lab-dashboard.tsx`, `settings-view.tsx` | Unit tests cover progress and corrupted storage; assessment/My Lab E2E failed | UNVERIFIED |
| Phase 05/06 E2E fixes | `lab.spec.ts` and relevant laboratory/visualization components | Current CI lab tests fail due to non-unique provenance selectors; other visualization tests are included in 12 passes but individual passing tests are not listed by summary | FAIL |
| Static checks, unit tests and web build | CI `quality` steps | Merge-commit formatting, lint, typecheck, unit and web build steps succeeded; prior local evidence recorded 392 unit tests | PASS |
| Mobile validation | Expo scaffold; no native Phase 07 learning screens | Prior acceptance reported `pnpm validate:mobile` passed locally; merge-commit CI skipped it after browser failure | UNVERIFIED |
| HTTP and HTML landmarks | Existing routes and layouts | Prior acceptance recorded 20-route HTTP/landmark checks; not repeated in this review; these are not interactive browser verification | PASS |
| Browser E2E and automated accessibility | `apps/web/e2e/*.spec.ts`, axe-core | Merge CI 12 passed, 5 failed including all three Phase 07 journeys; local browser unavailable | FAIL |
| Dependency audit | `pnpm security:audit` | Prior local report: no high/critical and two moderate advisories; merge CI skipped audit; not rerun in this review | UNVERIFIED |
| Qualified scientific review | Pending labels in content and `SCIENTIFIC_VALIDATION_LOG.md` | No qualified reviewer evidence; automated reference tests are not approval | NEEDS HUMAN REVIEW |
| Phase 07 owner gate | This evidence and ADR-012 | No explicit owner sign-off recorded | UNVERIFIED |

## Accessibility inspection

- **FAIL:** CI axe scan on the learning hub found serious `aria-prohibited-attr`
  violations on progress tracks. Similar markup exists in
  `pathway-detail-view.tsx` and `my-lab-dashboard.tsx`; those other pages have
  not been independently scanned in this review.
- **NEEDS HUMAN REVIEW:** Source inspection of `notebook-workspace.tsx` shows a
  `tablist` with `role="tab"` buttons and `aria-selected`, but no arrow-key
  handler, roving tab index, or associated `tabpanel`/`aria-controls` in that
  component. Verify and remediate against the chosen tabs pattern; actual keyboard
  behavior and screen-reader impact were not exercised locally.
- Labels are present in inspected notebook creation, assessment and calculation
  forms; assessment questions use fieldsets, although the question prompt is a
  heading rather than part of the legend. Observation, table, calculation and
  assessment validation errors use `role="alert"`. Dynamic focus movement and
  whether errors are associated with individual fields remain UNVERIFIED.
- CSS supplies `:focus-visible` outlines for `.learning-field` inputs, selects
  and textareas; notebook tabs wrap and a pathway layout breakpoint exists. Actual
  focus visibility, keyboard order, zoom, responsive layout and touch behavior on
  Phase 07 routes remain UNVERIFIED. Existing foundation E2E includes a 390px
  skip-link/mobile-menu check; no dedicated Phase 07 responsive keyboard audit was
  established. No WCAG conformance claim is made.

## Scientific review required

The following remain `NEEDS HUMAN REVIEW`; no scientific status was changed:

- All eight pathways, ten lessons, 32 glossary entries and nine assessments in
  `packages/learning-core/src/content/` (including worked examples, diagrams,
  sources and proposed curriculum mappings).
- All eight simulation models: `unit-system`, `constants-registry`,
  `elements-registry`, `molar-mass`, `chemical-quantity`,
  `reaction-stoichiometry`, `reaction`, and `acid-base`; reference tests do not
  replace educator review.
- The ten published experiment records and ten molecular structures listed in
  `SCIENTIFIC_VALIDATION_LOG.md`; the unpublished draft and curriculum mappings
  also remain unreviewed as described there.

## Owner review and decision

**Delivered:** shared learning catalog and assessments, calculation adapters,
local progress, notebook sessions and lab bridge, and report/export interfaces.
These are implemented locally on web; cross-device accounts, server persistence,
and native mobile learning/notebook screens are outside Phase 07.

**Known defects and limitations:** current CI is red; three Phase 07 journeys
fail, including a confirmed serious axe issue. Two lab tests have ambiguous
selectors; PR search was flaky. The precise other two Phase 07 failure causes
need full CI logs or a browser rerun. Local browser and manual accessibility
checks were blocked by the unavailable pinned browser. Scientific review, device
accessibility review and owner sign-off remain open. Local data is per-browser;
exports are not cloud backup. Prior Phase 05 owner acceptance is also unrecorded.

**Owner decisions:** determine whether to require fixes and a green CI rerun before
acceptance; arrange qualified scientific and accessibility review and decide on
publication/use of pending-review content; verify required branch checks; and
explicitly record acceptance or rejection of the Phase 07 gate. This document
is preparation only, not acceptance. Do not proceed to Phase 08 until the owner
has made the decision and its prerequisites are resolved.

## Limited remediation verification — 2026-11-07

The previous failure evidence above remains the historical baseline. On branch
`arena/76f4e8a9-chemistry-lab`, uncommitted changes add named progressbar roles
and percentage values on the learning hub, pathway detail and My Lab; progress
is indeterminate until local data loads. The dilution and pH tests now scope
provenance assertions to their respective main model displays and require exactly
one visible match. No scientific calculations or references were changed.
`learning-progress-accessibility.spec.ts` adds axe scans and checks progress
values before and after lesson completion across the three views.

Local environment: Debian Linux x86-64, Node 24.18.1, pnpm 12.16.1, frozen
lockfile. Results:

| Command | Result |
|---|---|
| `pnpm format:check` | PASS |
| `pnpm lint` | PASS, 8/8 tasks |
| `pnpm typecheck` | PASS, 14/14 tasks |
| `pnpm test` | PASS, 392/392 tests, including learning-core 21/21 and laboratory-core 31/31 |
| `pnpm build:web` | PASS |
| `pnpm validate:mobile` | PASS (TypeScript and Expo configuration; not device testing) |
| `pnpm security:audit` | PASS at high severity threshold; 2 moderate advisories |
| `pnpm --filter @virtual-chemistry-lab/web exec playwright install chromium` | BLOCKED: five `ECONNRESET` failures from `cdn.playwright.dev` |
| `pnpm e2e` | BLOCKED: all 18 tests failed at launch because the pinned Chromium headless shell is absent; zero test bodies or axe scans ran |

The pH and dilution journeys, learning journey, and new accessibility regression
remain UNVERIFIED until run with the pinned browser; selector uniqueness and
progress semantics have not been demonstrated in a live browser. The previous
CI run remains red and does not test this uncommitted work. The unrelated
assessment and notebook failures, notebook keyboard review, qualified scientific
review and owner acceptance remain open. Phase 08 remains blocked.

## Follow-up accessibility review — 2026-11-07

The My Lab KPI summary now exposes a named group for its related statistics.
The progress accessibility test identifies the beginner pathway and its SI-units
lesson by headings instead of list position, checks one completed required item,
and checks the named summary. The focused command
`pnpm --filter @virtual-chemistry-lab/web exec playwright test e2e/learning-progress-accessibility.spec.ts`
was BLOCKED at browser launch (one test, zero test bodies run; the pinned
Chromium headless shell is absent). The selectors and axe results therefore
remain UNVERIFIED in a browser.

The registry audit reports moderate `glob` 13.0.6 and `minimatch` 10.2.6
advisories, GHSA-3g3m-2fjr-6pw4 and GHSA-g3hv-75wg-m249. Fixed versions
`glob` 14.0.2 and `minimatch` 11.0.1 are outside the current parent dependency
ranges; compatible parent updates or a carefully tested override require separate
review. No dependency was changed. See the session report for final-tree gate
results. Owner and scientific acceptance remain unchanged.
