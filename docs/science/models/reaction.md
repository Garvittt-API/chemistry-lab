# Model Report — reaction

| Field | Value |
|---|---|
| Model ID | `reaction` |
| Version | 1.0.0 |
| Owner | Virtual Chemistry Lab — Simulation Engineering |
| Implementation | `packages/simulation-core/src/reaction.ts` |
| Registry entry | `packages/simulation-core/src/models.ts` |
| Verification status | Unit-tested + reference-verified; **awaiting qualified human scientific review** |
| Intended use | Parse equation strings, analyze atom/charge balance, exactly balance an equation |
| Excluded use | Half-reaction inference; redox titration automation; mechanism prediction; equilibrium prediction |

## Equations and sources

- Species grammar (ONE canonical charge notation, no ambiguity, ever):
  - `<formula>` neutral, e.g. `H2O`
  - `<formula>^<mag><s>` / `<formula>^<s><mag>` caret forms, magnitude ≤ 2 digits: `SO4^2-`, `Fe^2+`, `Fe^+2`, `NH4^+`
  - `<formula><s>` a trailing sign alone = **unit charge** ONLY when no digits directly precede it: `Na+`, `Cl-`, `OH-`, `H+`, `H3O+`
  - `<formula><s><mag>` sign followed by ≤2 digits = charge magnitude: `Fe+3`, `SO4-2`, `Cr2O7-2`
  - Digits DIRECTLY before a trailing sign (`NH4+`, `NO3-`, `Fe3+`, `SO42-`, `MnO4-`) are **rejected as ambiguous** (they collide with formula subscripts such as `N3-`, `I3-`); write `NH4^+`, `NO3^-`, `Fe^3+`, `SO4^2-`.
  - Hydrate dots (`CuSO4·5H2O`) are formula separators, never charges.
- Balancing: solve `A·x = 0` over the stoichiometry matrix with rows = elements ∪ {charge row when any species is charged}; species columns are [reactants | −products]; solution via exact rational nullspace (`Fraction` arithmetic on bigint), reduced to positive lowest-terms integers.
- Input coefficients are **ignored**: the canonical lowest-terms balance is always returned. Malformed input throws `ReactionParseError`; no unique positive integer solution throws `BalanceNotUniqueError`. Successful balance is re-verified against atom and charge conservation before return.

Sources: atom/charge conservation (definition); exact linear algebra (no numerical tolerance on balancing itself). Charge-balance worked example cross-checked against NCERT Class XII, Electrochemistry (permanganate–iron(II) titration).

## Inputs / outputs and units

`parseSpecies`, `parseReaction`, `analyzeReaction`, `assertBalanced`, `balanceReaction`, `formatSpecies`, `formatReaction`. Coefficients are unitless counts. Charges are integers in elementary charge (e⁺/e⁻). Analysis reports per-element atom balance, net charge per side, and the charge-balance verdict; `balanceReaction` returns a new parsed reaction plus the renderable equation string.

## Conditions and assumptions

- Omitted coefficients are 1.
- Bracket nesting in formulas supported (same depth limit as molar-mass).
- Charge row active iff any species carries nonzero charge; otherwise balancing is atom-only.

## Valid ranges

Grammar-valid equations with ≥ 1 species per side; coefficient magnitude guard against absurd input (rejected above a fixed ceiling, see `MAX_COEFFICIENT`).

## Numerical method and precision

Exact rational arithmetic end-to-end for balancing (bigint fractions) — no floating point in the solver. Parsing is deterministic and total (every input either parses or throws a typed error).

## Reference cases (all PASS, 2026-11-07, `pnpm test`)

REF-RXN-001 (water 2,1,2), REF-RXN-002 (Fe/O₂ 4,3,2), REF-RXN-003 (permanganate–Fe²⁺ 1:5:8 → 1:5:4), REF-RXN-004 (charge-balance verdict +17 both sides), REF-RXN-005 (Al combustion 4,3,2). Absolute integer tolerances. See `docs/science/reference-cases.md`.

## Known limitations

- Balancing is rejected when the equation admits no unique positive integer solution (e.g. one-sided elements).
- Hydrates are syntactically allowed; balancing across hydrate boundaries is consistent but pedagogically unusual.
- No half-reaction inference, no mechanism prediction, no equilibrium or kinetic information.
- Passing tests is not scientific validation; qualified review is pending.

## Reviewer status

Pending qualified human scientific review.
