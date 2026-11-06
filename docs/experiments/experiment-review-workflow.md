# Experiment Review Workflow

Status: workflow in force for the content pipeline; builds on
`authoring-and-review.md` (the conceptual workflow) with the concrete states
implemented in `packages/experiment-schema/src/review.ts`.

## The three status axes

Every record carries three independent status axes — never conflate them:

1. **`publicationStatus`** — editorial state controlling visibility:
   `draft` → `in_review` → `approved` → `published` → `archived`.
   Only `published` records appear on public surfaces (machine-enforced).
2. **`scientificReviewStatus`** — the honesty axis:
   `draft` → `in_review` → `reviewed` → `validated_for_education`.
   `reviewed` and above require a named reviewer, review date and review scope
   (machine-enforced). The current collection is entirely `draft`.
3. **`safetyReviewStatus`** — `not_started` → `in_review` → `reviewed` /
   `requires_review`. Publication requires complete safety metadata.

Plus **`integrityLabel`** — what the learner is told:
`pending_scientific_review` (current collection),
`independently_validated` (requires `validated_for_education`),
`demonstration_content` (workflow fixtures), `historical_archive`,
`withdrawn_pending_correction`.

## Stages

1. **Proposal** — topic, audience, outcomes, source plan
   (`docs/contributing/experiment-submission.md`).
2. **Draft** — record authored; `publicationStatus: draft`; AI-assisted drafts
   declare their authorship.
3. **Technical review** — schema, catalog validation, references resolve, units
   and ids correct. Runs in CI automatically; a maintainer checks the diff.
4. **Scientific review** — a qualified reviewer (chemistry educator or
   equivalent) checks theory, equations, expected observations, worked
   examples and claims against sources. Recorded as a `reviewEvent` with
   reviewer name, date and scope; flips `scientificReviewStatus` to `reviewed`.
   **The author cannot be the sole scientific approver.**
5. **Safety review** — hazards, evidence, disposal and supervision assessed
   (qualified educator or institutional safety officer). Flips
   `safetyReviewStatus`.
6. **Curriculum verification (optional)** — a reviewer with the official
   subject document in hand may flip a mapping from
   `proposed_pending_verification` to `verified_against_official_document`.
7. **Approval & publication** — maintainer sets `publicationStatus: published`
   only when safety metadata is complete; the integrity label stays honest
   (a scientifically reviewed record shows `reviewed`, not more).
8. **Maintenance** — corrections and versioning per
   `experiment-versioning.md`; critical defects → immediate unpublish
   (`experiment-safety-policy.md`).

## Review independence and AI-assisted content

- Where feasible the scientific approver must not be the content author.
- **AI-generated content is always a draft until a qualified human reviews it.**
  Nothing in the tooling can set `validated_for_education` automatically; the
  current collection (10 published + 1 draft records) is explicitly
  `pending_scientific_review` and is labelled as such on every surface.

## What a scientific review must record

`reviewEvents[]` entries carry: `status`
(`approved | changes_requested | reviewed_with_concerns`), `date`, `scope`
(e.g. "theory sections, equations and worked examples"), optional `notes`, and
the reviewer identity via `scientificReviewer` (name, role, optional ORCID).
No anonymous or invented reviewers — ever.
