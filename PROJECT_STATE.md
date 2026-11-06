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
- Current phase: Phase 03 — Experiment Library, Scientific Content & Curriculum Mapping
- Current milestone: 03.1 — Experiment schema 2.0.0, library package, initial collection
- Overall status: Phase 03 implementation complete and merged (`PR #6`); project-owner gate review and qualified scientific review pending
- Last verified commit: `2c18930` on `main`; remote CI green (run 42223523746, all 14 steps, 2026-11-06)
- Last verification date: 2026-11-06

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

## In progress
- Complete owner review of Phase 01, Phase 02 and Phase 03 ADRs and acceptance evidence.
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
- No scientific model has been independently validated yet; simulation contracts are `planned` only.
- All 10 published experiments are AI-assisted drafts (`scientificReviewStatus: draft`, `integrityLabel: pending_scientific_review`) awaiting independent review; publication reflects editorial readiness, not scientific approval.
- No full security audit or deployment has been performed; dependency audit is configured and recorded.
- Roadmap dates are estimates, not commitments.
- A stray `data.db` file is tracked at the repository root (pre-existing); flagged for owner decision, not removed.
- `react` and `react-dom` in `apps/web` were skewed (19.3.0 vs 19.3.1) after Dependabot's react PR (#2) was closed unmerged while react-dom PR (#5) merged; aligned both to 19.3.1 in the current branch (peer checks clean).
- Local sandbox cannot download Playwright browsers (CDN blocked); e2e evidence comes from remote CI.

## Next actions
1. Review and accept the Phase 01–03 ADRs and acceptance evidence.
2. Arrange qualified scientific review for the experiment collection (`SCIENTIFIC_VALIDATION_LOG.md` tracks status; 0/11 records reviewed).
3. Owner to confirm branch protection on `main`.
4. Do not begin Phase 04 until the project owner accepts the Phase 03 gate.

## Session log
| Date | Work completed | Tests / evidence | Next step |
|---|---|---|---|
| 2026-11-03 | Phase 01 foundation implemented and clean-clone verified | Local checks and clean-clone checks passed; remote CI and owner sign-off pending | Review acceptance evidence and connect remote |
| 2026-11-03 | Phase 02 web foundation implemented | Typecheck, lint, unit tests, web build, Expo compatibility, Playwright and axe scans passed; remote CI and owner sign-off pending | Review Phase 02 evidence; do not start Phase 03 |
| 2026-11-06 | Phase 03 experiment library and content implemented | Schema 31/31, library 23/23, e2e 6/6 (incl. axe), typecheck/lint/build green; Node 22.22.3 used instead of pinned 24.18.1 (CI authoritative); remote CI and owner sign-off pending | Review Phase 03 evidence; do not start Phase 04 |
| 2026-11-06 | Repository audit of Phases 01–03; docs synced to Phase 03 reality (README, ARCHITECTURE, overview, testing); added `SCIENTIFIC_VALIDATION_LOG.md` and `RELEASE_CHECKLIST.md`; aligned react/react-dom to 19.3.1; removed dead ternary in `getCollectionStats` | Local format/lint/typecheck/unit tests/build/mobile/audit re-run green; remote CI green on `2c18930` (run 42223523746, all 14 steps incl. Playwright); e2e UNVERIFIED locally (browser download blocked) | Owner review of gate evidence; arrange qualified scientific review |

## Agent hand-off rules
- Read this file, `TASKS.md`, `ARCHITECTURE.md`, and relevant decision records before changing code.
- Never claim a task is complete without evidence.
- Use `PASS`, `FAIL`, `UNVERIFIED`, or `NOT IMPLEMENTED` for verification.
- Update this file and `CHANGELOG.md` after meaningful changes.
