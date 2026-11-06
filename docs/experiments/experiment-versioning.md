# Experiment Content Versioning

Status: rules in force; the machine contract is `contentVersion` +
`revisionHistory` in `packages/experiment-schema/src/experiment-record.ts` and
`review.ts`.

## Two version numbers, two jobs

| field | changes when | current value |
| --- | --- | --- |
| `schemaVersion` | the *contract* changes (fields, enums, invariants) | `2.0.0` (`EXPERIMENT_RECORD_SCHEMA_VERSION`) |
| `contentVersion` | *this record's content* changes | `1.0.0` for published records, `0.1.0` for early drafts |

Schema migrations are handled by `packages/experiment-schema/src/migrations.ts`
(legacy 1.0.0 metadata → 2.0.0 draft record); records are never silently
reinterpreted.

## When to bump `contentVersion`

Bump (minor for additions, patch for corrections, major for meaning-changing
rewrites) whenever a change affects:

- meaning: theory, equations, definitions, claims;
- procedure or safety (any change — safety corrections are always recorded);
- expected observations, worked examples or model configuration;
- references (adding, removing or correcting a citation);
- classification that changes where the experiment sits (discipline/topic).

Typo fixes that cannot change meaning (whitespace, formatting) may skip a bump.

## Revision history

Every bump appends a `revisionHistory` entry: `contentVersion`, `date`,
`summary` (what changed and why), `changedBy`. The history is append-only: old
entries are never edited to hide what happened.

## Publication and archiving

- `draft` records may change freely (still tracked in revision history).
- `published` records keep their identifier and slug forever; corrections bump
  `contentVersion` in place.
- Retracted content is never deleted: `publicationStatus: archived` +
  `integrityLabel: withdrawn_pending_correction` (or `historical_archive`)
  with a final revision entry explaining why.
- Notebook/data compatibility: learners' saved work references
  `experiment id + contentVersion`; the revision history lets old records be
  interpreted. (Notebook storage is a later phase.)

## Checklist for a content PR

1. `contentVersion` bumped appropriately.
2. `revisionHistory` entry added with an honest summary.
3. `updatedOn` changed; `createdOn` untouched.
4. Outstanding concerns updated if the change resolves or adds any.
5. `pnpm --filter @virtual-chemistry-lab/experiment-library test` passes.
