# Model Report — molar-mass

| Field | Value |
|---|---|
| Model ID | `molar-mass` |
| Version | 1.0.0 |
| Owner | Virtual Chemistry Lab — Simulation Engineering |
| Implementation | `packages/simulation-core/src/molar-mass.ts` |
| Registry entry | `packages/simulation-core/src/models.ts` |
| Verification status | Unit-tested + reference-verified; **awaiting qualified human scientific review** |
| Intended use | Parse chemical formulas (nested brackets, hydrates) and compute molar mass from CIAAW-2021 weights |
| Excluded use | Structural isomers/connectivity; polymeric repeating units; empirical-formula inference |

## Equations and sources

`M = Σ_i count_i × A_r(i)` where A_r is the abridged 2021 CIAAW standard atomic weight (see elements-registry). Hydrate dot separators (`.`, `·`, `⋅`) carry an integer multiplier (`CuSO4·5H2O`). Bracket nesting `( ) [ ] { }` is supported to depth 16.

## Inputs / outputs and units

`parseSpecies(formula)` → charge-neutral composition tree; `molarMass(formula)` → grams per mole (also accepts pre-parsed species). Rejects: unknown elements, mismatched brackets, absurd subscripts, empty formulas — always with `MolarMassError`/`FormulaParseError`, never `NaN`.

## Conditions and assumptions

- Ionic molar mass uses electron-count-free arithmetic (electron masses below reportable precision at education grade).
- Hydrate multipliers must be integers ≥ 1.
- Formula grammar is case-sensitive and unambiguous (`Co` ≠ `CO`).

## Valid ranges

Any grammar-valid formula whose elements exist in the elements-registry (see elements-registry exclusions). Bracket depth ≤ 16; total parsed mass must be finite and > 0.

## Numerical method and precision

Single pass left-to-right parse; double accumulation. Results carry ~1e-9 relative agreement with hand-computed CIAAW-2021 sums.

## Reference cases (all PASS, 2026-11-07, `pnpm test`)

REF-MM-001 (H₂O 18.015), REF-MM-002 (NaCl 58.44), REF-MM-003 (H₂SO₄ 98.072), REF-MM-004 (C₆H₁₂O₆ 180.156), REF-MM-005 (Ca(OH)₂ 74.092), REF-MM-006 (K₄[Fe(CN)₆] 368.345, nested brackets), REF-MM-007 (CuSO₄·5H₂O 249.677, hydrate), REF-MM-008 (Na₂SO₄·10H₂O 322.186, hydrate). Tolerance 1e-6 relative. See `docs/science/reference-cases.md`.

## Known limitations

- No fractional coefficients; no polymer notation.
- Connectivity/isomerism not represented.
- Hydrate notation is compositional, not a structural assertion.
- Passing tests is not scientific validation; qualified review is pending.

## Reviewer status

Pending qualified human scientific review.
