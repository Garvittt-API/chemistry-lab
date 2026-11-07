# ADR-010: Exact-Arithmetic, Framework-Free Scientific Simulation Engine

- Status: Implemented; project-owner review pending
- Date: 2026-11-07
- Decision owner: Project owner

## Context

Phase 04 must deliver the scientific core that later phases (03 content in
production, Phase 05+ interactive experiments) can rely on: units, constants,
elements, formula/molar-mass math, reaction parsing and balancing, stoichiometry,
and basic solution chemistry. Earlier phases established two hard constraints:
(1) libraries must be framework-free (ADR-009); (2) scientific honesty is
machine-checked, not asserted (ADR-002, ADR-009) — no content may claim
validation without evidence, and no model may claim review without a named
qualified reviewer. The open choices were language-level precision strategy
(how to handle fractions, exact constants, and ambiguity vs. convenience) and
where the engine lives in the monorepo.

Constraints: no backend/DB; deterministic outputs; CI-friendly (`pnpm test`);
exactness wherever physics and pedagogy permit (stoichiometric balancing,
defining constants); refuse-ambiguity input rules rather than silent misreads.

## Decision

1. **One new package `@virtual-chemistry-lab/simulation-core`** under
   `packages/simulation-core`, framework-free (zero runtime dependencies),
   TypeScript strict, ESM, consumed by web/mobile in later phases via the
   workspace. ADR-002's separation (science code vs. rendering) is enforced by
   construction — this package imports nothing from Next.js/React/Expo.
2. **Exact rational arithmetic for everything that must be exact.** A small
   `Fraction` implementation (bigint numerator/denominator, gcd reduction)
   backs stoichiometric balancing: the stoichiometry matrix rows are elements
   plus an optional charge row; the nullspace is computed exactly and reduced
   to positive lowest-terms integers. Balancing has NO floating tolerance and
   NO unique-solution repair — unsolvable systems throw `BalanceNotUniqueError`.
   Input coefficients are ignored; output is always canonical lowest terms.
3. **SI-coherent registry data with explicit precision classes.** Constants
   carry `exact | conventional | measured` metadata with source attribution
   (SI Brochure 9th ed.; CODATA 2018; CRC 104th ed.; conventional 25 °C K_w).
   Element atomic weights are CIAAW abridged 2021 (incl. the 2021 Hf revision,
   178.486 — regression-tested at absolute tolerance 0).
4. **Refuse-ambiguity charge notation.** Species charge suffixes use one
   canonical caret form plus a strictly limited suffix form. Digits directly
   before a trailing sign (`NH4+`, `NO3-`, `Fe3+`) are always rejected with
   guidance — the alternative silently misreads formula subscripts. This
   mirrors the phase-wide policy: wrong-but-plausible is worse than rejected.
5. **Reference-case validation as a first-class registry.** 52 independently
   sourced/derived cases live in `reference-cases.ts` with tolerance metadata
   and source strings; `reference-cases.test.ts` executes them all. Passing
   means "reproduces independently checked numbers within stated tolerances" —
   never "validated science". Every model is registered as at most
   `reference-verified` and `pending_human_review`; no experiment's
   `simulationContract` is promoted by this phase.
6. **No new runtime dependencies.** The engine is dependency-free; test stack
   (vitest, tsc, eslint) matches existing workspace conventions.

## Consequences

- Downstream UIs get typed, total, throw-on-invalid APIs; ambiguity is
  rejected at the boundary, so display layers never have to guess.
- Exactness costs us: no decimal convenience parse on the balanced path;
  fractional coefficients round-trip as exact integers only when the chemistry
  permits (otherwise the equation is rejected, which is honest).
- Registry-driven governance: models/reference-cases/tests are cross-checked
  in CI (every registered model must have reference coverage).
- Metrology-grade and activity-corrected chemistry remain out of scope by
  explicit limitation notes; a Phase 05+ consumer must re-derive what it needs.

## Alternatives considered

- **Floating-point balancing with tolerance** — rejected: silent near-miss
  coefficients (e.g. 0.9999) are a scientific hazard in an educational product.
- **Bracket notation `(NH4)+`** — rejected: collides with grouping grammar;
  caret is already the ecosystem's conventional ASCII charge marker.
- **Accept digits-before-sign as unit/magnitude charges** — rejected: irreducibly
  ambiguous with polyatomic subscripts (`N3-`, `I3-`, `HCO3-`); silent misreads
  are unacceptable for a teaching tool.
- **Bundle constants/elements/cases into the web app** — rejected: violates
  ADR-002 separation and would duplicate science in two capitals (web/mobile).
