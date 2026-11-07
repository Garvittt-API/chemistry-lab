# Model Report — reaction-stoichiometry

| Field | Value |
|---|---|
| Model ID | `reaction-stoichiometry` |
| Version | 1.0.0 |
| Owner | Virtual Chemistry Lab — Simulation Engineering |
| Implementation | `packages/simulation-core/src/stoichiometry.ts` |
| Registry entry | `packages/simulation-core/src/models.ts` |
| Verification status | Unit-tested + reference-verified; **awaiting qualified human scientific review** |
| Intended use | Limiting reagent identification, reaction extent, theoretical yield from a balanced equation and feed amounts |
| Excluded use | Equilibrium extent; kinetics; yield prediction from mechanism |

## Equations and sources

- ξ_max = min_i (n_i / ν_i) over all reactants i (ν = stoichiometric coefficient)
- n_product = ξ × ν_product; m_product = n_product × M_product
- Limiting set: ALL reactants attaining ξ_max are reported (exact stoichiometric feeds are not silently attributed to one reagent)

Source: limiting-reagent method (NCERT Class XI, Some Basic Concepts of Chemistry); atom conservation on the balanced equation.

## Inputs / outputs and units

`analyzeStoichiometry(parsedReaction, feedMoles)` → limiting reagent(s), maximum extent ξ, expected product amounts (mol) and masses (g, via molar-mass of the product formula). Unbalanced or charge-unbalanced input is **rejected before any computation** (`ReactionNotBalancedError`).

## Conditions and assumptions

- Reaction must be atom- and charge-balanced (enforced).
- Quantitative conversion: the limiting reagent converts completely; consumed/remaining amounts are exact.
- Feeds are amounts of pure substances; no activity/purity corrections.

## Valid ranges

Finite positive feeds; balanced equations with ≥ 1 reactant and ≥ 1 product; product formulas resolvable through elements-registry.

## Numerical method and precision

Direct double arithmetic on parsed coefficients; products limited by the limiting step, never by rounding. Tests assert 1e-12 relative agreement for non-exact and absolute zero for exact integer cases.

## Reference cases (all PASS, 2026-11-07, `pnpm test`)

REF-STOICH-001 (H₂/O₂, H₂ limiting), REF-STOICH-002 (Haber, exact feed), REF-STOICH-003 (Zn/HCl, HCl limiting), REF-STOICH-004 (Fe/O₂, O₂ limiting, 0.667 mol), REF-STOICH-005 (limiting set complete; HCl remaining exactly 0). See `docs/science/reference-cases.md`.

## Known limitations

- No equilibrium extent, kinetics, or activity corrections.
- Ties (exact stoichiometric feeds) reported as multiple limiting reagents.
- Passing tests is not scientific validation; qualified review is pending.

## Reviewer status

Pending qualified human scientific review.
