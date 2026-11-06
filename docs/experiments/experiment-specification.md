# Experiment Content Specification

Status: **implemented and versioned** in `packages/experiment-schema`
(`EXPERIMENT_RECORD_SCHEMA_VERSION` = 2.0.0). This document describes the
contract the machine schema enforces; the schema is authoritative.

## Required sections

Every experiment record (schema 2.0.0) contains eleven sections:

1. **identity** — stable id + slug (kebab-case), title, short/full description,
   `schemaVersion`, `contentVersion`, `publicationStatus`, created/updated
   dates.
2. **classification** — discipline, subdisciplines, topics (all registry
   identifiers), educational levels, curriculum mappings (confidence +
   syllabus note + evidence), difficulty, estimated duration, prerequisites.
3. **educational** — learning objectives, expected competencies, learning
   outcomes, theory (overview, sourced sections, scientific background,
   concepts, equations with symbol tables/units/conditions/assumptions,
   definitions).
4. **materials** — equipment (`eqp-*`) and chemicals (`chem-*`) with amounts,
   verified identifiers (e.g. PubChem CID), hazard kinds; `metadataStatus`
   (`complete` or `requires_review` + rationale).
5. **safety** — risk classification + rationale, hazard statements with
   evidence basis, protective equipment, disposal, supervision requirement,
   restricted operations, emergency guidance.
6. **procedure** — overview and sequential steps (`step-1..step-N`) with
   instructions, equipment/chemical ids, precautions, expected observations,
   explanatory notes; troubleshooting.
7. **observations** — discriminated union: `provided` (measurements with
   provenance, expected ranges, prompts, error sources, interpretation
   guidance) | `not_applicable` | `requires_review`, each with rationale where
   applicable.
8. **calculations** — discriminated union like observations; `provided` carries
   calculation objects (equation refs, assumptions, units/dimensions,
   significant-figure convention, worked examples with `isIllustrative`).
9. **references** — real citation entries with `verificationStatus`,
   `supportsClaims`, identifiers and access dates.
10. **simulation** — `planned` (model contract: inputs with ranges, outputs
    with precision, assumptions, limitations) | `in_development` |
    `implemented` | `not_planned` + rationale.
11. **review** — authors, three status axes, review events, revision history,
    validation notes, outstanding concerns, integrity label, licensing block.

## Content rules (enforced or checked in review)

- No fabricated references or results; unknowns are marked `requires_review`.
- No hidden executable scripts in content files (content is inert JSON).
- No unsafe operational detail beyond approved educational scope.
- No ambiguous quantities; every quantity carries a unit.
- Pedagogical procedure is separate from simulation controls.
- Expected results are labelled theoretical / reference-expected / simulated /
  measured / user-entered; never presented as measured readings unless they
  are.
- Published records must have complete safety metadata and may not carry
  `requires_review` safety status.
- `reviewed` scientific status requires named reviewer, date and scope.

## Versioning

See `experiment-versioning.md`. Content changes affecting meaning, procedure,
safety, equations or model configuration require a new `contentVersion` with a
revision-history entry. Schema changes bump `EXPERIMENT_RECORD_SCHEMA_VERSION`
and ship with a migration.
