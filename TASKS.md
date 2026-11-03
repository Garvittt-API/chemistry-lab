# Project Task Register

Statuses: `TODO`, `IN_PROGRESS`, `BLOCKED`, `REVIEW`, `DONE`. A task is `DONE` only when its acceptance criteria have evidence.

## Phase 01 — Foundation
| ID | Task | Priority | Depends on | Status |
|---|---|---:|---|---|
| P01-001 | Create private Git repository and protect `main` | Critical | — | REVIEW |
| P01-002 | Confirm Node/pnpm versions compatible with selected Next.js, Expo and Turborepo releases | Critical | P01-001 | DONE |
| P01-003 | Initialize pnpm/Turborepo workspace | High | P01-002 | DONE |
| P01-004 | Scaffold minimal web app and prove production build | High | P01-003 | DONE |
| P01-005 | Scaffold minimal mobile app and prove supported build/typecheck | High | P01-003 | DONE |
| P01-006 | Define shared TypeScript and lint/format configuration | High | P01-003 | DONE |
| P01-007 | Implement experiment metadata schema and schema tests | High | P01-006 | DONE |
| P01-008 | Add unit-test, typecheck, lint and build scripts | High | P01-004,P01-005 | DONE |
| P01-009 | Add CI workflow and dependency/security baseline | High | P01-008 | REVIEW |
| P01-010 | Complete architecture and developer documentation review | High | P01-001 | REVIEW |
| P01-011 | Run clean-clone reproducibility test | Critical | P01-009 | DONE |
| P01-012 | Phase 01 acceptance review and sign-off | Critical | P01-001..P01-011 | REVIEW |

## Phase 02 — Design system and web foundation
| ID | Task | Priority | Depends on | Status |
|---|---|---:|---|---|
| P02-001 | Audit Phase 01 and confirm web foundation gates | Critical | P01-012 | DONE |
| P02-002 | Document visual direction and implement semantic design tokens | High | P02-001 | DONE |
| P02-003 | Implement responsive shell, navigation and themes | High | P02-002 | DONE |
| P02-004 | Implement home, explore, subjects, detail, about and support pages | High | P02-003 | DONE |
| P02-005 | Add accessibility, responsive and interaction coverage | Critical | P02-004 | DONE |
| P02-006 | Update design, architecture and development documentation | High | P02-005 | DONE |
| P02-007 | Phase 02 acceptance review and sign-off | Critical | P02-001..P02-006 | REVIEW |

- Define visual language, typography, color tokens, spacing, elevation and motion.
- Establish responsive application shell, navigation and component primitives.
- Verify keyboard, screen-reader and contrast requirements.
- Do not add decorative complexity that reduces scientific clarity.

## Phase 03 — Experiment library and content pipeline
- Finalize experiment content schema and versioning.
- Add search, filtering, categories, curriculum tags and provenance.
- Establish editorial review and contribution workflow.

## Phase 04 — Scientific simulation core
- Implement deterministic, independently testable scientific models.
- Define units, precision, conditions, assumptions and error behavior.
- Validate models against trusted reference cases.

## Phase 05 — Interactive 2D experiments
- Implement a small, reviewed set of experiments end-to-end.
- Add measurement tools, state transitions and observation capture.

## Phase 06 — 3D and molecular visualization
- Add 3D only where spatial understanding materially benefits.
- Validate molecular geometry/visual conventions and device performance.

## Phase 07 — Learning, notebooks and reports
- Add learning activities, practical notebook, calculations and export.
- Clearly label generated/simulated observations.

## Phase 08 — Accounts and progress
- Add identity and progress only after privacy and backend requirements are approved.

## Phase 09 — Mobile applications
- Deliver mobile-specific navigation, touch interactions and device testing.

## Phase 10 — Offline and synchronization
- Define conflict resolution, storage limits, data ownership and sync security.

## Phase 11 — Scientific validation, security and quality
- Independent scientific review, accessibility review, penetration/security testing and performance testing.

## Phase 12 — Deployment and open-source launch
- License review, contribution onboarding, release process, operational monitoring and public launch.

## Definition of done
- Requirements and acceptance criteria met.
- Code reviewed; no known critical defects.
- Automated checks pass and evidence is recorded.
- Documentation and project state updated.
- Accessibility, security, scientific integrity and performance considered.
- No fake data, misleading claims, or hidden placeholders.
