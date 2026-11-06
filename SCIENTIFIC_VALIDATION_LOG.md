# Scientific Validation Log

> Traceable record of scientific model validation and content verification for
> Virtual Chemistry Lab. Update this file whenever a model, reference case or
> content review changes status. Never mark an item validated without evidence.

## How to use this log

- **Model validation** entries track implemented simulation/scientific models
  against independently verified reference cases (see
  `docs/science/validation-policy.md` and `docs/science/model-catalog.md`).
- **Content verification** entries track experiment records through editorial
  and scientific review (see `docs/experiments/experiment-review-workflow.md`).
- Status values: `PASS`, `FAIL`, `UNVERIFIED`, `NOT IMPLEMENTED`, `BLOCKED`,
  `NEEDS HUMAN REVIEW`.
- An automated test pass is not scientific validation. Only a qualified human
  reviewer may move content to `reviewed` or `validated_for_education`.

## 1. Scientific model validation

| Model ID | Model version | Reference case | Expected value | Actual value | Tolerance | Status | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | NOT IMPLEMENTED | — | — | No scientific model exists yet. Simulation contracts in experiment records are `planned`. First models are expected in Phase 04. |

Evidence command (once models exist): `pnpm test` (scientific reference suites
must be listed here with exact counts and dates).

## 2. Experiment content review status

Last verified: 2026-11-06 against commit `2c18930` (schema 2.0.0, library
catalog build validation).

| Record ID | Publication status | Scientific review status | Integrity label | Reviewer | Date |
|---|---|---|---|---|---|
| acid-base-titration | published | draft | pending_scientific_review | — | — |
| chemical-equilibrium-fescn | published | draft | pending_scientific_review | — | — |
| electrochemical-cell-daniell | published | draft | pending_scientific_review | — | — |
| flame-tests-qualitative-inorganic | published | draft | pending_scientific_review | — | — |
| paper-chromatography | published | draft | pending_scientific_review | — | — |
| ph-and-indicators | published | draft | pending_scientific_review | — | — |
| reaction-rates-thiosulfate | published | draft | pending_scientific_review | — | — |
| solution-dilution | published | draft | pending_scientific_review | — | — |
| standard-solution-preparation | published | draft | pending_scientific_review | — | — |
| vsepr-molecular-geometry | published | draft | pending_scientific_review | — | — |
| basic-spectroscopic-interpretation | draft | draft | demonstration_content | — | — | Deliberately incomplete draft; not publicly visible. |

Summary: 0 of 11 records are scientifically reviewed. 10 published records are
editorially ready and publicly visible with honest `pending_scientific_review`
labelling; publication does not imply scientific approval
(`TASKS.md` P03-011, blocked on a qualified human reviewer).

## 3. Curriculum mapping verification

| Curriculum | Mapping status | Verifier | Date |
|---|---|---|---|
| cbse-chemistry-2025-26 | Source circular verified (`verified_2026-11-05`); per-experiment topic mappings remain `proposed_pending_verification` | — | — |

## 4. Reference datasets

| Dataset | Source | Version | Status |
|---|---|---|---|
| Physics/chemistry constants | Not yet bundled | — | NOT IMPLEMENTED (Phase 04) |
| Spectral line databases | Not yet bundled | — | NOT IMPLEMENTED |

## 5. Unresolved discrepancies

None recorded.

## 6. Reviewer registry

| Reviewer | Qualification | Scope | Date |
|---|---|---|---|
| — | — | — | No qualified scientific reviewer has reviewed this repository's content yet. |
