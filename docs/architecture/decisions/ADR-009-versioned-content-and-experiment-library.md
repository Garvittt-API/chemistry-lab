# ADR-009: Versioned Local Content with a Framework-Free Experiment Library

- Status: Implemented; project-owner review pending
- Date: 2026-11-06
- Decision owner: Project owner

## Context

Phase 03 must turn the experiment schema contract (2.0.0) into real scientific
content with taxonomy, curriculum mapping, safety metadata and honest review
status — consumable by the web app and future mobile app. The open choices were
where content lives (database vs. files vs. CMS), how it is validated, and how
UI code consumes it without duplicating business logic.

Constraints: no backend/DB in this phase; content must be reviewable in diffs;
AI-assisted drafts must never masquerade as validated science; unpublished
content must not leak to public surfaces.

## Decision

1. **Content is versioned local JSON** in
   `packages/experiment-library/src/content/` — one record per experiment file
   plus taxonomy/educational-level/curriculum registries. An explicit
   aggregator (`experiments/index.ts`) imports every record so the bundle is
   deterministic and any addition is a visible diff. No database, no CMS.
2. **Validation is layered and mandatory.** Every record is parsed with the
   versioned Zod schemas (`packages/experiment-schema`, 2.0.0); `buildCatalog`
   adds cross-record referential integrity (unique ids/slugs, taxonomy and
   curriculum resolution) and throws `CatalogValidationError` with per-item
   issues. Invalid content fails the test suite and the app build — it cannot
   ship silently.
3. **The library package is framework-free** (`zod` + schema package only) and
   exposes pure functions: lookups, filter/search/sort/paginate, and
   `getPublicExperimentByIdOrSlug` as the single public-visibility gate
   (`published` only). UI components contain no catalog logic; `apps/web/lib/content.ts`
   adapts library output to view models.
4. **Status honesty is machine-shaped, human-truthed.** Three status axes
   (publication / scientific review / integrity label) plus safety-review state
   are required fields; the schema forbids "reviewed" without a named reviewer
   and forbids publishing with `requires_review` safety metadata. Curriculum
   mappings default to `proposed_pending_verification` with a mandatory
   syllabus note.

## Consequences

- Adding content = adding a JSON file + aggregator entry + green tests; the
  whole collection is greppable and diffable in code review.
- Query behaviour (search weighting, sort tie-breaks, publication filtering)
  is defined once in the library and tested there; web and mobile cannot drift.
- Storage ceilings (~10³ records) are acceptable at this scale; a future
  database phase would re-use the same schemas as its write contract.
- The trade-off (no runtime editing, no remote content) is deliberate and
  recorded; see `docs/experiments/experiment-library-architecture.md`.

## Alternatives considered

- **Database-backed content API** — rejected for this phase (backend out of
  scope; would add deployment surface before content quality is proven).
- **Markdown/MDX content** — rejected: weak machine validation for safety and
  units; JSON + Zod makes invariants enforceable.
- **Content hard-coded in UI** — rejected: duplicates business logic and hides
  provenance.
