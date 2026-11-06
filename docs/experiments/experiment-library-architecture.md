# Experiment Library Architecture

Status: implemented in `packages/experiment-library`.

## Role

`@virtual-chemistry-lab/experiment-library` is the single source of experiment
content for every surface (web today, mobile later). It is **framework-free**:
pure TypeScript + JSON with two dependencies only (`zod`, the schema package).
No React, no Next.js, no I/O — it can run in any JS runtime.

## Package layout

```
packages/experiment-library/
  src/
    catalog.ts        buildCatalog / loadBundledCatalog / catalog
    queries.ts        pure query API (filter, search, sort, paginate)
    index.ts          public surface
    content/
      taxonomy.json             discipline registry (version 1.0.0)
      educational-levels.json   level registry (6 levels)
      curricula.json            curriculum registries (CBSE 2025-26)
      experiments/
        index.ts                content aggregator (explicit imports)
        <experiment-id>.json    one record per file (schema 2.0.0)
  dist/               tsc output, incl. copied JSON (runtime data)
```

Content is **local, version-controlled JSON** — no database or backend in this
phase (recorded in ADR-009). The aggregator (`experiments/index.ts`) imports
each record explicitly so the bundle is deterministic and reviewable in diffs.

## Catalog construction

`buildCatalog(input)` (also used for tests with custom inputs):

1. Parses taxonomy, levels and curricula registries with their schemas.
2. Parses every experiment with `experimentRecordSchema`.
3. Enforces cross-record rules: unique ids and slugs; classification ids must
   resolve inside the taxonomy (topics under the record's own discipline);
   curriculum mappings must resolve inside the curriculum registries.
4. Throws `CatalogValidationError` with per-item issues on any failure.

`loadBundledCatalog()` runs this on the bundled content at module load, so an
invalid record **fails the consuming app's build** — broken content cannot
silently ship. `catalog` is the validated, frozen result.

## Query API (all pure functions)

- `getExperimentById` / `getExperimentBySlug` / `getExperimentByIdOrSlug` —
  direct lookup (all statuses).
- `getPublicExperimentByIdOrSlug` — **the only lookup public surfaces may
  use**; returns `undefined` unless `publicationStatus: "published"`.
- `filterExperiments(catalog, filters)` — AND across filter groups (discipline,
  subdiscipline, topic, level, difficulty, curriculum, publication status, risk
  class), OR within a group.
- `searchExperiments(catalog, text, publicationStatuses?)` — all query tokens
  must match (title/short description/topics/objectives/body weighted 6/4/3/2/1,
  deterministic title-order tie-break). Unpublished records are excluded by
  default.
- `queryExperiments(catalog, query)` — combined text + filters + sort
  (`relevance | title | duration | difficulty | updated`, stable tie-breaks,
  explicit directions) + offset/limit pagination returning
  `{ items, total, hasMore, nextOffset, sort, sortDirection }`.
- `toExperimentSummary(record)` — serializable summary for list UIs.

## Public visibility contract

| publication status | browse/search | direct URL |
| --- | --- | --- |
| `draft`, `in_review`, `approved` | hidden | 404 |
| `published` | visible | visible |
| `archived` | hidden (unless explicitly requested) | 404 |

The web app enforces this via `getPublicExperimentByIdOrSlug` (see
`apps/web/lib/content.ts`); e2e tests assert the 404 behaviour for an
unpublished record.

## Adding content

One file per experiment under `content/experiments/`, registered in
`content/experiments/index.ts`. The authoring rules are in
`experiment-authoring-guide.md`; submission process in
`docs/contributing/experiment-submission.md`.
