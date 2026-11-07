# Phase 07 acceptance evidence

Date: 2026-11-07. Status values reflect actual local verification evidence on `arena/58afb8c1-chemistry-lab`; project-owner sign-off, remote CI Playwright execution, and qualified human scientific review remain open.

| Area | Status | Evidence / limitation |
|---|---|---|
| Shared `@virtual-chemistry-lab/learning-core` architecture & contracts | PASS | Framework-free TypeScript + Zod `4.6.7` schemas (`schemaVersion: "1.0.0"`), ADR-012, 21/21 Vitest tests passing |
| Structured learning pathways, lessons & glossary | PASS (implementation); scientific NEEDS HUMAN REVIEW | 4 staged pathways (Beginner → Advanced), 10 lessons with explicit claim-kind tags & accessible SVG diagrams, 30 IUPAC/NCERT/SI glossary terms; all labelled `pending_scientific_review` |
| Deterministic self-check assessments | PASS | 9 experiment-linked quizzes (6 question types); answer keys stripped pre-submission (`toLearnerQuestions`); unit-aware numerical & `simulation-core` formula/equation grading; retry & attempt history |
| Engine-backed calculation workbench | PASS | 8 calculation adapters delegating exclusively to `@virtual-chemistry-lab/simulation-core` (`CuSO4·5H2O` = 249.677 g/mol CIAAW 2021; `c1V1 = c2V2`; exact rational balancing; limiting reagent; 25 °C pH) |
| Practical notebook & 2D lab bridge | PASS | Multi-session CRUD, pre-lab readiness checklist, observations, schema-derived + custom data tables, saved calculations, user notes, `LabNotebookBridge` on dilution & pH 2D labs, Phase 05 migration helper |
| Provenance & anti-fabrication enforcement | PASS | Every entry tagged (`user_entered`, `simulation_generated`, `engine_calculated`, `reference_expected`, `imported_external`); blank sections flagged in completeness audit and never fabricated |
| Structured practical report & exports (PDF, HTML, CSV, JSON) | PASS | 20-section report with non-removable `title` & `simulation_disclosure`; verified PDF 1.4 (`%PDF-1.4`..`%%EOF`), XSS-escaped HTML with inline SVG XY plot, formula-injection-safe CSV, 2 MB prototype-guarded JSON round-trip |
| Local progress dashboard & data management | PASS | `/my-lab` dashboard aggregates pathway, lesson, quiz, session & report progress locally; `/settings` provides confirmation-gated local storage clear; malformed JSON quarantined safely |
| Pre-existing Phase 05/06 remote CI E2E fixes | PASS (static/HTML verified); browser CI pending | Fixed nested `<main>` landmarks on `/molecules` and 2D labs, added `<h2>` molecule title in `VseprLab`, aligned unavailable-lab `<h2>` copy, and scoped `.lab-bench-readouts` regexes in `lab.spec.ts` |
| Full local static, unit, build & mobile gates | PASS | `pnpm format:check`, `pnpm lint` (8/8 packages), `pnpm typecheck` (14/14 tasks), `pnpm test` (392/392 Vitest tests across 6 packages), `pnpm build:web` (19 Next.js routes), `pnpm validate:mobile` |
| Live HTTP & HTML landmark verification | PASS | Production Next.js server verified across 20 routes (`<main>` count = 1, `<h1>` count = 1 on all valid routes, draft experiment returns 404) |
| Browser Playwright + axe-core E2E suite | UNVERIFIED locally; authored for CI | `apps/web/e2e/learning-notebook.spec.ts` authored alongside existing specs; local sandbox lacks browser binaries and CDN egress |
| Security audit | PASS at high-severity threshold | `pnpm audit --audit-level=high` exit 0 (2 pre-existing moderate transitive advisories, 0 high, 0 critical; zero new runtime third-party dependencies added) |
| Qualified scientific review | NEEDS HUMAN REVIEW | 0/10 published experiments, 0/8 simulation models, 0/10 molecular structures, and 0/10 lessons independently reviewed by a human chemistry educator |
| Phase 07 owner gate | REVIEW | Scoped Phase 07 implementation complete; STOP before Phase 08 (accounts, backend, cloud sync) |

Accounts, authentication, cloud synchronization, multi-user classrooms, server databases, adaptive AI tutoring, and native mobile learning/notebook screens are explicitly out of scope and not implemented in Phase 07.
