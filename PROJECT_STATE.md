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
- Current phase: Phase 02 — Design System & Web Application Foundation
- Current milestone: 02.1 — Scientific editorial web foundation
- Overall status: Phase 02 implementation complete; project-owner review pending
- Last verified commit: `8bb87bf` (`fix: normalize repository line endings`)
- Last verification date: 2026-11-03

## Completed
- Initial product vision and roadmap documented.
- Starter documentation pack created.
- Local project Git boundary initialized without touching the unrelated parent repository.
- pnpm/Turbo monorepo, web/mobile scaffolds and shared experiment schema implemented.
- Formatting, lint, typecheck, unit tests, web build, Playwright smoke test and mobile validation passed locally.
- Clean-clone install, quality checks, web build, mobile validation and dependency audit passed from the committed revision.
- Phase 02 web shell, semantic design tokens, responsive pages, themes, explicitly labelled demonstration content and accessibility coverage implemented.

## In progress
- Complete owner review of Phase 01 and Phase 02 ADRs and acceptance evidence.
- Connect a private remote repository and configure branch protection.
- Run remote CI after the connected repository receives the Phase 02 changes.

## Blocked / undecided
- Final product name.
- Application and content license selection.
- Exact LLM runtime/model/tool permissions.
- This local Git repository has no commit or remote yet.
- Backend and persistence decisions (deferred until justified).
- Curriculum priorities and educator reviewers.

## Known limitations
- No experiments are implemented by this documentation pack.
- No scientific model has been independently validated yet.
- No full security audit or deployment has been performed; dependency audit is configured and recorded.
- Roadmap dates are estimates, not commitments.

## Next actions
1. Review and accept the Phase 01 and Phase 02 ADRs and acceptance evidence.
2. Run remote CI after pushing the reviewed commits.
3. Do not begin Phase 03 until the project owner accepts the Phase 02 gate.

## Session log
| Date | Work completed | Tests / evidence | Next step |
|---|---|---|---|
| 2026-11-03 | Phase 01 foundation implemented and clean-clone verified | Local checks and clean-clone checks passed; remote CI and owner sign-off pending | Review acceptance evidence and connect remote |
| 2026-11-03 | Phase 02 web foundation implemented | Typecheck, lint, unit tests, web build, Expo compatibility, Playwright and axe scans passed; remote CI and owner sign-off pending | Review Phase 02 evidence; do not start Phase 03 |

## Agent hand-off rules
- Read this file, `TASKS.md`, `ARCHITECTURE.md`, and relevant decision records before changing code.
- Never claim a task is complete without evidence.
- Use `PASS`, `FAIL`, `UNVERIFIED`, or `NOT IMPLEMENTED` for verification.
- Update this file and `CHANGELOG.md` after meaningful changes.
