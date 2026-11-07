# Project State

> This file is the durable hand-off record for humans and AI engineering agents. Update it at the end of every work session.

## Identity
- Working product name: Virtual Chemistry Lab
- Repository slug: `virtual-chemistry-lab`
- Product name: **TBD**
- Repository visibility: private during initial development
- Intended license: **TBD; evaluate Apache-2.0 vs AGPL-3.0**
- Content license: **TBD; evaluate CC BY 4.0 for original educational content**
- Primary audience: school and college students
- Platforms: web first, Android/iOS later
- Long-term scope: broad chemistry curriculum, 2D and 3D simulations

## Current status
- Current phase: Phase 07 — Learning System, Practical Notebook, Calculations & Report Exports
- Current milestone: 07.1 — `@virtual-chemistry-lab/learning-core`, `/learn` & `/notebook` & `/my-lab` workflows, provenance-tagged practical reports, and PDF 1.4/HTML/CSV/JSON exports
- Overall status: Phase 07 scoped implementation complete on `arena/58afb8c1-chemistry-lab` (branched from `4e4d8b7` on `main`); project-owner acceptance gate, remote CI Playwright verification, and qualified human scientific review pending. STOP before Phase 08 (accounts, backend, cloud sync).
- Last verified commit: working branch `arena/58afb8c1-chemistry-lab` after Phase 07 verification; baseline `4e4d8b7` on `main`.
- Last verification date: 2026-11-07

## Completed
- Initial product vision and roadmap documented.
- Starter documentation pack created.
- Local project Git boundary initialized without touching the unrelated parent repository.
- pnpm/Turbo monorepo, web/mobile scaffolds and shared experiment schema implemented.
- Formatting, lint, typecheck, unit tests, web build, Playwright smoke test and mobile validation passed locally.
- Clean-clone install, quality checks, web build, mobile validation and dependency audit passed from the committed revision.
- Phase 02 web shell, semantic design tokens, responsive pages, themes, explicitly labelled demonstration content and accessibility coverage implemented.
- Phase 03: versioned experiment schema 2.0.0 (taxonomy, educational levels, curriculum mapping, safety, procedure, observations, calculations, references, review) with 31 passing tests and a legacy migration path.
- Phase 03: framework-free `experiment-library` package (validated catalog, filter/search/sort/paginate, publication gating) with 23 passing tests.
- Phase 03: initial collection of 11 experiment records (10 published + 1 deliberate draft) with traceable references (NCERT, PubChem, CBSE circular) and honest review status — all `pending_scientific_review`.
- Phase 03: web integration — real explore/search/filter surfaces, full experiment detail rendering, taxonomy-based subjects, unpublished content restricted (404), 6 passing Playwright e2e tests incl. axe scans.
- Phase 03: docs set (`docs/science/*`, `docs/experiments/*`, `docs/contributing/experiment-submission.md`, ADR-009) and governance updates.
- Phase 04: `@virtual-chemistry-lab/simulation-core` implemented — units (affine temperature), constants (SI/CODATA, precision-classed), elements (CIAAW 2021, Hf 178.486 regression-tested), molar-mass (hydrates, nested brackets), quantity arithmetic (dilution never over 100 % clamped yield), reaction grammar with refuse-ambiguity charge rules, exact rational balancing (bigint nullspace; atom+charge conservation; lowest-terms positive integers), limiting-reagent stoichiometry, 25 °C monoprotic acid/base pH.
- Phase 04: 52 independently sourced reference cases authored, all PASS under `pnpm test` (simulation-core 258/258, schema 31/31, library 23/23), plus model registry with honest `reference-verified` status (nothing human-reviewed), 8 model reports, ADR-010, `docs/science/reference-cases.md` register.
- Phase 04: PR #8 opened for owner gate review (not merged). Local gates green — format, lint, typecheck (both tsconfigs), tests, `build:web`, `validate:mobile`, `security:audit` (2 moderate, 0 high; unchanged from Phase 03).

- Phase 05: `laboratory-core` equipment/procedure/observation subsystem and model-backed 2D dilution/pH workspaces (31 unit tests), with Playwright journeys and honest unavailable states. Present in baseline; owner acceptance was not recorded.
- Phase 06: framework-free `molecular-visualization` package (strict schemas, ten traceable structures, geometry/accessibility helpers, state/resource tests) and R3F/Three.js web scenes with dynamic loading, demand rendering, disposal, adaptive quality, 2D/text fallbacks and experiment integration.
- Phase 07: framework-free `@virtual-chemistry-lab/learning-core` package (21/21 Vitest tests) with 4 pathways, 10 lessons, 30 glossary entries, 9 deterministic `simulation-core`-backed quizzes, 8 calculation workbench adapters, multi-session Practical Notebook CRUD + Phase 05 migration, versioned local storage (`vcl-learning-store-v1`) with corrupted-payload quarantine, 20-section Practical Report builder (mandatory `title` & `simulation_disclosure`), and zero-dependency PDF 1.4/HTML/CSV/JSON exporters; Next.js App Router surfaces (`/learn/*`, `/notebook/*`, `/my-lab`, `/settings`, `LabNotebookBridge`, `ExperimentLearningPanel`), 5 pre-existing Phase 05/06 remote CI E2E fixes, `learning-notebook.spec.ts`, ADR-012, and `docs/development/phase-07-acceptance.md`.

## In progress
- Phase 07 owner review of ADR-012 and `docs/development/phase-07-acceptance.md`; no Phase 08 (accounts/backend/cloud sync) work authorized.
- Complete owner review of Phase 01–06 ADRs and acceptance evidence.
- Confirm branch protection on the configured private remote repository (API check returns 403 for the integration token; must be confirmed by the owner in repository settings).

## Blocked / undecided
- Final product name.
- Application and content license selection.
- Exact LLM runtime/model/tool permissions.
- Remote `origin` is configured; branch protection and hosted CI remain unverified.
- Backend and persistence decisions (deferred until justified).
- Curriculum priorities and educator reviewers (all curriculum mappings are `proposed_pending_verification`).
- Scientific review of the content collection by a qualified chemistry educator (nothing is scientifically validated yet).

## Known limitations
- Phase 04 models are reference-verified (52 cases), NOT scientifically validated; 0/8 models have qualified human review. Phase 05 wires dilution/pH adapters to the engine despite stale earlier documentation.
- Phase 06 structures are internally validated but 0/10 have qualified scientific review. Experimental and idealized coordinates are distinguished; glucose and electronic-property visualizations are not implemented.
- Native mobile 3D is NOT IMPLEMENTED. Browser e2e, axe, FPS, memory and physical-device performance are UNVERIFIED locally because Playwright browser download is blocked.
- All 10 published experiments are AI-assisted drafts (`scientificReviewStatus: draft`, `integrityLabel: pending_scientific_review`) awaiting independent review; publication reflects editorial readiness, not scientific approval.
- No full security audit or deployment has been performed; dependency audit is configured and recorded.
- Roadmap dates are estimates, not commitments.
- A stray `data.db` file is tracked at the repository root (pre-existing); flagged for owner decision, not removed.
- `react` and `react-dom` in `apps/web` were skewed (19.3.0 vs 19.3.1) after Dependabot's react PR (#2) was closed unmerged while react-dom PR (#5) merged; aligned both to 19.3.1 in the current branch (peer checks clean).
- Local sandbox cannot download Playwright browsers (CDN blocked); e2e evidence comes from remote CI.

## Next actions
1. Review the Phase 07 gate (`docs/development/phase-07-acceptance.md`, ADR-012, `SCIENTIFIC_VALIDATION_LOG.md`); do not begin Phase 08 automatically.
2. Execute remote GitHub Actions CI on the Phase 07 branch to verify all Playwright + `axe-core` suites (`foundation`, `lab`, `visualization`, `learning-notebook`) with real browser binaries.
3. Arrange qualified human scientific review for the 10 published experiments, 8 simulation models, 10 molecular structures, and Phase 07 lessons/glossary/assessments.
4. Owner to confirm branch protection on `main`.

## Session log
| Date | Work completed | Tests / evidence | Next step |
|---|---|---|---|
| 2026-11-03 | Phase 01 foundation implemented and clean-clone verified | Local checks and clean-clone checks passed; remote CI and owner sign-off pending | Review acceptance evidence and connect remote |
| 2026-11-03 | Phase 02 web foundation implemented | Typecheck, lint, unit tests, web build, Expo compatibility, Playwright and axe scans passed; remote CI and owner sign-off pending | Review Phase 02 evidence; do not start Phase 03 |
| 2026-11-06 | Phase 03 experiment library and content implemented | Schema 31/31, library 23/23, e2e 6/6 (incl. axe), typecheck/lint/build green; Node 22.22.3 used instead of pinned 24.18.1 (CI authoritative); remote CI and owner sign-off pending | Review Phase 03 evidence; do not start Phase 04 |
| 2026-11-06 | Repository audit of Phases 01–03; docs synced to Phase 03 reality (README, ARCHITECTURE, overview, testing); added `SCIENTIFIC_VALIDATION_LOG.md` and `RELEASE_CHECKLIST.md`; aligned react/react-dom to 19.3.1; removed dead ternary in `getCollectionStats` | Local format/lint/typecheck/unit tests/build/mobile/audit re-run green; remote CI green on `2c18930` (run 42223523746, all 14 steps incl. Playwright); e2e UNVERIFIED locally (browser download blocked) | Owner review of gate evidence; arrange qualified scientific review |
| 2026-11-07 | Phase 04 scientific simulation engine implemented (`@virtual-chemistry-lab/simulation-core`), 52 reference cases, 8 model reports, ADR-010, docs catalogs updated, PR opened (not merged) | Schema 31/31, library 23/23, simulation-core 258/258 (52/52 reference cases), typecheck/lint/build:web/mobile/audit green; e2e not re-run (browser download blocked locally; CI authoritative) | Owner review of Phase 04 gate; qualified scientific review of the 8 models before any experiment wires the engine |
| 2026-11-07 | Phase 06 shared molecular package, ten structures, R3F molecular/equipment scenes and experiment integration implemented | 371/371 unit tests (28 molecular); format/lint/typecheck/web build/mobile validation/audit green; local e2e/device checks blocked by browser CDN | Owner Phase 06 gate, CI browser evidence and qualified scientific review; stop before Phase 07 |
| 2026-11-07 | Phase 07 `@virtual-chemistry-lab/learning-core`, web learning/notebook/report/My Lab routes, PDF 1.4/HTML/CSV/JSON exporters, 5 Phase 05/06 E2E fixes, ADR-012, and governance/security/science docs implemented | 392/392 unit tests (`learning-core` 21/21); 8/8 lint, 14/14 typecheck, 19-route Next.js build, Expo validate, live 20-route HTTP/landmark audit, and high-severity audit green; browser Playwright UNVERIFIED locally (CDN blocked) | Owner Phase 07 gate, remote CI Playwright verification, and qualified scientific review; stop before Phase 08 |

## Agent hand-off rules
- Read this file, `TASKS.md`, `ARCHITECTURE.md`, and relevant decision records before changing code.
- Never claim a task is complete without evidence.
- Use `PASS`, `FAIL`, `UNVERIFIED`, or `NOT IMPLEMENTED` for verification.
- Update this file and `CHANGELOG.md` after meaningful changes.
