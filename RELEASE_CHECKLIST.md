# Release Checklist

> Required before any tagged release, production deployment or public launch.
> Items marked **OWNER** require explicit project-owner approval and cannot be
> satisfied by automated checks alone. Update this file as items are completed
> with evidence.

Status values: `PASS`, `FAIL`, `UNVERIFIED`, `NOT IMPLEMENTED`, `BLOCKED`,
`NEEDS HUMAN REVIEW`.

## A. Engineering quality (automated)

- [ ] `pnpm format:check` — **PASS** (2026-11-07, local)
- [ ] `pnpm lint` — **PASS** (2026-11-07, local, 8/8 workspace packages)
- [ ] `pnpm typecheck` — **PASS** (2026-11-07, local, 14/14 build + typecheck tasks)
- [ ] `pnpm test` — **PASS** (2026-11-07, local: 392/392 Vitest tests across `simulation-core` 258, `experiment-schema` 31, `laboratory-core` 31, `molecular-visualization` 28, `experiment-library` 23, `learning-core` 21)
- [ ] `pnpm build:web` — **PASS** (2026-11-07, local; 19 App Router routes)
- [ ] `pnpm e2e` (Playwright + axe) — **UNVERIFIED locally** (sandbox cannot download browser binaries; remote CI run required on Phase 07 branch including 5 Phase 05/06 E2E fixes and `learning-notebook.spec.ts`)
- [ ] `pnpm validate:mobile` — **PASS** (2026-11-07, local)
- [ ] `pnpm security:audit` (`--audit-level=high`) — **PASS** (2026-11-07; 0 high/critical, 2 pre-existing moderate transitive Expo toolchain advisories documented in `docs/security/dependency-audit.md`)
- [ ] Remote CI green on the release commit — **UNVERIFIED** for Phase 07 commit until pushed and executed on GitHub Actions
- [ ] Clean-clone install reproducibility — **PASS** (Phase 01 evidence in `PROJECT_STATE.md`)

## B. Scientific integrity

- [ ] Every published experiment reviewed by a qualified chemistry educator — **BLOCKED** (`TASKS.md` P03-011; 0/11 records reviewed)
- [ ] `SCIENTIFIC_VALIDATION_LOG.md` current — **PASS** (updated 2026-11-07 through Phase 07)
- [ ] Model catalog matches implemented models — **PASS** (8 `simulation-core` models registered as `reference-verified`, `pending_human_review`)
- [ ] No unvalidated model presented as scientific truth — **PASS** (all virtual readings, calculations, and practical reports carry explicit provenance tags and mandatory `simulation_disclosure`)
- [ ] Curriculum mappings verified against official documents — **NEEDS HUMAN REVIEW** (P03-012)
- [ ] Safety metadata reviewed for all published experiments — **NEEDS HUMAN REVIEW**
- [ ] Phase 07 lessons, glossary, and quizzes reviewed by a qualified chemistry educator — **NEEDS HUMAN REVIEW** (P07-010)

## C. Security and privacy

- [ ] Threat model reviewed for the release scope — **PARTIAL** (updated 2026-11-07 for Phase 07 import/export/local-storage boundaries; formal security review pending)
- [ ] No secrets in the repository — **PASS** (`.env.example` contains only a public setting)
- [ ] Dependency audit within policy — **PASS** (high/critical: none)
- [ ] Branch protection on `main` confirmed — **UNVERIFIED** (API token lacks admin; owner must confirm)
- [ ] Privacy review before any account/persistence feature — **PASS for local-only Phase 07** (`docs/security/privacy.md`; cloud/account persistence **NOT IMPLEMENTED**)

## D. Documentation

- [ ] README reflects current phase — **PASS** (synced 2026-11-07 for Phase 07)
- [ ] ARCHITECTURE / DECISIONS / CHANGELOG / TASKS / PROJECT_STATE current — **PASS** (2026-11-07)
- [ ] ADRs for all long-term decisions — **PARTIAL** (ADR-005/006 described in `docs/architecture/overview.md` and `LICENSE_SELECTION.md`; dedicated files pending)
- [ ] Third-party attribution complete — **PASS** (`THIRD_PARTY_NOTICES.md`)
- [ ] Installation, self-hosting and contributor docs — **PARTIAL** (setup/contributing exist; self-hosting deferred until deployment scope exists)

## E. Release operations (future)

- [ ] License selected and applied — **OWNER** (TBD: Apache-2.0 vs AGPL-3.0; `LICENSE_SELECTION.md`)
- [ ] Product/brand name finalized — **OWNER**
- [ ] Deployment target, HTTPS and secret management defined — **NOT IMPLEMENTED**
- [ ] Monitoring, error reporting, backup and rollback procedures — **NOT IMPLEMENTED**
- [ ] Versioning policy executed for the tag (`docs/development/release-and-versioning.md`) — pending first tag
- [ ] Release notes drafted from `CHANGELOG.md` — pending first tag

## F. Publication approvals (owner only)

- [ ] Production deployment authorized — **OWNER**
- [ ] Public repository release authorized — **OWNER**
- [ ] Mobile app store submission authorized — **OWNER** (native builds not yet produced)
- [ ] Higher-risk experiment content approved for publication — **OWNER** + qualified reviewer

## Current release recommendation

No release may be tagged until items B1 (qualified scientific review) and F
(owner authorizations) are satisfied. Engineering-quality items (A) are green
as of 2026-11-06.
