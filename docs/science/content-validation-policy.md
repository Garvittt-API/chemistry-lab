# Content Validation Policy

Status: implemented (`packages/experiment-library/src/catalog.ts` +
`packages/experiment-schema`), enforced in CI by the package test suites.

This policy covers *machine* validation of experiment content. The scientific
integrity rules it enforces are defined in `docs/science/validation-policy.md`;
the reference rules live in `content-reference-policy.md`.

## Validation layers

1. **Schema validation (per record).** Every experiment record must satisfy
   `experimentRecordSchema` (schema version 2.0.0) — types, identifier formats
   (`chem-*`, `eqp-*`, `step-N`, …), required sections, discriminated unions
   for observations/calculations (`provided` | `not_applicable` |
   `requires_review`), and invariants such as:
   - a published record may not carry `requires_review` safety metadata;
   - a record with `scientificReviewStatus: reviewed` must name a reviewer,
     review date and review scope;
   - `integrityLabel: independently_validated` requires
     `validated_for_education`;
   - proposed curriculum mappings must carry `syllabusNote`;
   - hazard statements with `basis: official_database` must carry a
     `referenceId`; `common_laboratory_practice` must also cite one;
   - procedure step ids are sequential (`step-1..step-N`);
   - every claim's `sourceRefIds` resolve within the record's reference list
     and every `supportsClaims` id resolves to a claim in the record.
2. **Catalog validation (cross-record).** `buildCatalog` validates the whole
   bundle: duplicate experiment ids/slugs are rejected; every classification
   identifier (discipline, subdiscipline, topic) must exist in the taxonomy
   registry *under the experiment's discipline*; every curriculum mapping must
   resolve to a registered curriculum and topic; educational levels must be
   registered. Failures throw `CatalogValidationError` listing per-item issues.
3. **Editorial validation (humans).** Schema-valid content can still be wrong.
   Scientific truth is handled by the review workflow
   (`docs/experiments/experiment-review-workflow.md`) and can never be replaced
   by machine checks.

## Publication gates

An experiment may be `published` only when:

- it is schema-valid and catalog-valid (machine-enforced);
- its safety section is complete (`metadataStatus: "complete"`) and its risk
  classification is not `requires_review` (machine-enforced);
- its authors, references and review status are recorded honestly (machine-
  enforced shape; human-enforced truth);
- the maintainers accept its integrity label being shown to learners.

`scientificReviewStatus: validated_for_education` additionally requires a real
qualified review event; nothing in the tooling can set it automatically.

## Failure handling

- Content that fails validation **fails the build/test suite**; it cannot ship.
- Content that is valid but incomplete stays `draft` and is excluded from all
  public surfaces (see `experiment-library-architecture.md`).
- Known scientific defects trigger the correction path in the review workflow;
  critical safety defects trigger immediate unpublishing.
