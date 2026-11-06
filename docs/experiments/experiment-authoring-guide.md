# Experiment Authoring Guide

Status: guidance for contributors and for AI-assisted authoring; the binding
contract is `packages/experiment-schema` (schema 2.0.0).

## Before you write

1. Read `experiment-specification.md` (what a record contains) and
   `docs/science/content-reference-policy.md` (how sources work).
2. Check the taxonomy registry for the identifiers you need
   (`packages/experiment-library/src/content/taxonomy.json`). New topics must
   be registered before content references them.
3. Plan your references first. If you cannot name a real source for a claim,
   the claim either does not go in, or is explicitly marked `requires_review`.

## The record, section by section

| section | what to write | common mistakes |
| --- | --- | --- |
| `identity` | Stable id/slug (kebab-case, matches the file name), honest title, short and full descriptions. Schema version `2.0.0`; `contentVersion` starts at `1.0.0` (or `0.1.0` for drafts). | Changing the id after release; marketing tone. |
| `classification` | Discipline (must own your topics), subdisciplines, topics, levels, curriculum mappings (`proposed_pending_verification` + `syllabusNote` + evidence), difficulty, duration, prerequisites. | Topics registered under a different discipline; claiming verified curriculum alignment without document verification. |
| `educational` | Objectives, competencies, outcomes; theory with sourced sections, equations (symbols + units + conditions + assumptions), definitions. | Claims without `sourceRefIds`; equations missing variable units. |
| `materials` | Equipment (`eqp-*`) and chemicals (`chem-*`) with amounts, identifiers where verified, hazard kinds. | Inventing CAS numbers; quantities without units. |
| `safety` | Risk class + rationale, hazards with evidence basis, PPE, disposal, supervision, restricted operations, emergency guidance. | Hazard statements without evidence; `published` while `requires_review`. |
| `procedure` | Sequential `step-N` steps with instructions, what to expect and *why*. | Operational detail beyond the approved scope; steps referencing unlisted chemicals. |
| `observations` | `provided` content (measurements with provenance + expected ranges), prompts, error sources, interpretation guidance — or an honest `not_applicable`/`requires_review` rationale. | Presenting expected values as measurements; missing error sources. |
| `calculations` | Sourced equations, assumptions, units, significant figures, worked examples marked `isIllustrative` — or `not_applicable` with a rationale. | Fabricated "results"; significant figures without a convention. |
| `references` | Real entries only, each with `verificationStatus` and `supportsClaims`. | Invented DOIs; orphan references. |
| `simulation` | `planned` model contract (inputs with ranges, outputs with precision, assumptions, limitations) or `not_planned` + rationale. | Model output phrased as measured data. |
| `review` | Authors (AI-assisted drafts say so), honest statuses, revision history, validation notes, outstanding concerns, licensing (`pending_owner_decision` is fine). | Claiming review that did not happen; hiding known concerns. |

## Voice and honesty rules

- Write for the learner level you declared; define jargon on first use.
- Separate observation from inference; expected from measured; model from
  reality. Every quantity carries a unit and provenance.
- Unknowns are marked, not smoothed over. "Requires review" is a legitimate,
  expected value throughout the schema.
- Never write a reviewer name, review date or validation claim that did not
  happen. AI-assisted drafts use the standard author entry
  ("Virtual Chemistry Lab content team (AI-assisted draft)") and stay
  `scientificReviewStatus: draft`.

## Running the checks

```
pnpm --filter @virtual-chemistry-lab/experiment-schema test   # schema tests
pnpm --filter @virtual-chemistry-lab/experiment-library test  # loads your record
```

The library test suite builds the catalog from real content: if your record is
invalid or references a missing taxonomy entry, the suite fails with the exact
issue list. Fix every issue before opening a pull request.
