# Experiment Safety Policy

Status: policy in force; machine-enforced parts live in
`packages/experiment-schema/src/safety.ts` and the catalog publication gate.

## Principles

1. **Safety metadata is content, not decoration.** Every record carries a
   safety section: risk classification, hazard statements with evidence,
   protective equipment, disposal, supervision level, restricted operations and
   emergency guidance.
2. **No hazard claim without evidence.** Each hazard statement names its
   evidence basis: `official_database` (with a `referenceId` to a verified
   PubChem entry or equivalent), `institutional_sds`, or
   `common_laboratory_practice` (with a cited reference). Anything else is
   `requires_review`, which blocks publication.
3. **Publication requires complete safety metadata.** A record with
   `riskClassification: "requires_review"` or
   `safety.metadataStatus: { mode: "requires_review" }` cannot be `published`.
   Draft records may be incomplete; published ones may not.
4. **The audience sets the supervision level.**
   `self_directed_with_written_guidance` → `adult_supervision_required` →
   `qualified_educator_supervision_required`. Experiments with open flame,
   corrosives or toxic salts require qualified educator supervision and an
   institutional risk assessment before real-world use.

## Scope decisions baked into the current collection

- **Deliberate safety substitutions.** Paper chromatography uses an
  ethanol/water developer instead of the classic butanol/acetic acid mixture,
  and the collection contains no H₂S-generating cation-analysis procedures.
  Substitutions are recorded in the record's notes, not hidden.
- **No flammable-solvent flame tests.** The classic methanol/ethanol flame-test
  accident pattern is excluded by policy; the flame-test record uses aqueous
  solutions on a wire loop only and states the exclusion.
- **Qualitative equilibrium without fabricated constants.** The FeSCN
  experiment reports observations qualitatively; its calculations section is
  `not_applicable` rather than inventing a Kc.
- **Simulation separation.** When simulations arrive, model output must never
  be presented as a measured reading, and simulated values must never be shown
  as safety evidence.

## Classroom-use disclaimer

Publishing an experiment record is **not** authorization to run it. Real-world
execution requires the supervising institution's own risk assessment, equipment
and local rules. Every published record repeats this boundary in its safety
section where relevant.

## Incident response

1. A credible report of a scientific or safety defect opens an issue marked
   `content-safety`.
2. Critical defects (hazard understated, wrong disposal, dangerous procedure):
   the record is unpublished immediately (`publicationStatus: archived` or
   `draft`) while the claim is investigated.
3. Non-critical defects: corrected through the versioning rules
   (`experiment-versioning.md`) with a `revisionHistory` entry.
