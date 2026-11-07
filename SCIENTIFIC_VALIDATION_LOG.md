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

Last verified: **2026-11-07** — `pnpm test` on branch `arena/d66f498a-chemistry-lab`
(experiment-schema 31/31, experiment-library 23/23, simulation-core 258/258;
reference suite: **52/52 PASS**, all eight models covered. Case-level register:
`docs/science/reference-cases.md`. Model reports: `docs/science/models/*.md`.)

Evidence command: `pnpm test` (scientific reference suites live in
`packages/simulation-core`; exact counts and dates recorded per phase).

| Model ID | Model version | Reference cases | Expected vs actual | Tolerance | Status | Reviewer | Date | Notes |
|---|---|---|---|---|---|---|---|---|
| unit-system | 1.0.0 | REF-UNIT-001…012 (12) | 12/12 match | 1e-9 (abs/rel as stated) | PASS | — | 2026-11-07 | Definitions: SI/ITS-90/conventional |
| constants-registry | 1.0.0 | REF-CON-001…004 (4) | 4/4 match | 1e-9 rel; K_w exact | PASS | — | 2026-11-07 | R, F exact by 2019 SI; K_w conventional 25 °C |
| elements-registry | 1.0.0 | REF-EL-001…002 (2) | 2/2 match | absolute 0 | PASS | — | 2026-11-07 | Fe 55.845; Hf 178.486 (2021 revision regression test) |
| molar-mass | 1.0.0 | REF-MM-001…008 (8) | 8/8 match | 1e-6 rel | PASS | — | 2026-11-07 | Nested brackets, hydrates |
| chemical-quantity | 1.0.0 | REF-QTY-001…006 (6) | 6/6 match | 1e-12…1e-9 rel | PASS | — | 2026-11-07 | Moles/mass/c/γ/dilution/%yield |
| reaction-stoichiometry | 1.0.0 | REF-STOICH-001…005 (5) | 5/5 match | 1e-12 rel / 0 (exact) | PASS | — | 2026-11-07 | Limiting reagent; input balance enforced |
| reaction | 1.0.0 | REF-RXN-001…005 (5) | 5/5 match | absolute 0 (integer) | PASS | — | 2026-11-07 | Exact rational balancing; atom+charge conservation |
| acid-base | 1.0.0 | REF-AB-001…010 (10) | 10/10 match | ≤ 1e-3 pH (stated per case) | PASS | — | 2026-11-07 | Dilute aqueous 25 °C; K_w conventional |

Simulation contracts in experiment records remain `planned` — the engine is
implemented and reference-verified but is **not wired** into any experiment, and no
experiment record's simulation status changes in this phase. An automated test pass
is not scientific validation; qualified human review is still required before any
`reviewed` / `validated_for_education` claim, and before any experiment advertises a
running simulation to learners.

## 2. Experiment content review status

Last verified: 2026-11-06 against commit `2c18930` (schema 2.0.0, library
catalog build validation). Re-affirmed 2026-11-07: Phase 04 added the simulation
engine but did NOT change any experiment record, publication status, scientific
review status or integrity label; the simulation-engine landing is recorded in
section 1.

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
| Physical constants | Bundled in `packages/simulation-core/src/constants.ts` (SI Brochure 9th ed.; CODATA 2018; conventional K_w; CRC 104th ed.) | registry v1.0.0 | IMPLEMENTED (reference-verified 2026-11-07; not human-reviewed) |
| Element atomic weights | Bundled in `packages/simulation-core/src/elements.ts` (CIAAW abridged standard atomic weights, 2021 revision) | registry v1.0.0 | IMPLEMENTED (reference-verified 2026-11-07; not human-reviewed) |
| Spectral line databases | Not yet bundled | — | NOT IMPLEMENTED |

## 5. Unresolved discrepancies

None recorded.

## 6. Reviewer registry

| Reviewer | Qualification | Scope | Date |
|---|---|---|---|
| — | — | — | No qualified scientific reviewer has reviewed this repository's content yet. |
