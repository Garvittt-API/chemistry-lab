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
- Current phase: Phase 01 — Product Foundation, Architecture & Repository
- Current milestone: 01.1 — Repository and project foundation
- Overall status: Foundation implemented; project-owner review pending
- Last verified commit: Working tree (no commit created)
- Last verification date: 2026-11-03

## Completed
- Initial product vision and roadmap documented.
- Starter documentation pack created.
- Local project Git boundary initialized without touching the unrelated parent repository.
- pnpm/Turbo monorepo, web/mobile scaffolds and shared experiment schema implemented.
- Formatting, lint, typecheck, unit tests, web build, Playwright smoke test and mobile validation passed locally.

## In progress
- Complete owner review of ADRs and Phase 01 acceptance.
- Connect a private remote repository and configure branch protection.
- Run a clean-clone reproducibility test from a committed revision.

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
1. Create the private remote repository and protect `main`.
2. Commit the Phase 01 foundation and lockfile.
3. Review and accept the Phase 01 ADRs and acceptance evidence.
4. Run the clean-clone reproducibility test.

## Session log
| Date | Work completed | Tests / evidence | Next step |
|---|---|---|---|
| 2026-11-03 | Phase 01 foundation implemented | Local checks passed; CI and clean clone unverified; owner review pending | Review acceptance evidence and connect remote |

## Agent hand-off rules
- Read this file, `TASKS.md`, `ARCHITECTURE.md`, and relevant decision records before changing code.
- Never claim a task is complete without evidence.
- Use `PASS`, `FAIL`, `UNVERIFIED`, or `NOT IMPLEMENTED` for verification.
- Update this file and `CHANGELOG.md` after meaningful changes.
