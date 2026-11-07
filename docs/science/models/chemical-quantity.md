# Model Report — chemical-quantity

| Field | Value |
|---|---|
| Model ID | `chemical-quantity` |
| Version | 1.0.0 |
| Owner | Virtual Chemistry Lab — Simulation Engineering |
| Implementation | `packages/simulation-core/src/amount.ts` |
| Registry entry | `packages/simulation-core/src/models.ts` |
| Verification status | Unit-tested + reference-verified; **awaiting qualified human scientific review** |
| Intended use | Moles/mass/concentration/dilution/yield arithmetic for education workflows |
| Excluded use | Density-resolved concentration units beyond registered conversions; activity corrections |

## Equations and sources

- n = m / M; c = n / V; γ = m_solute / V (mass concentration)
- Dilution law C₁V₁ = C₂V₂ (conservation of solute amount)
- % yield = actual / theoretical × 100
- Compositions: solution from solute+solvent masses; mass-percent conversions

Sources: definitions only (SI/CIAAW-2021 basis); teaching convention per NCERT Class XI, Some Basic Concepts of Chemistry.

## Inputs / outputs and units

Functions take explicit, SI-coherent units documented per function: grams (m), moles (n), litres (V), mol/L (c), g/L (γ), g/mol (M). Percent yield is unitless (%). All outputs finite; invalid inputs (negative mass, zero divisor, NaN) throw `InvalidQuantityError`.

## Conditions and assumptions

- Ideal solutions; volumes additive only as **final** volumes.
- g/L ↔ molarity via molar mass only (no density table).
- % yield above 100 % is reported verbatim — it signals impure product or experimental error; never clamped.

## Valid ranges

Finite positive doubles; mass/volume/amount ≥ 0; nonzero molar mass. Percentages unbounded above by design (see assumptions).

## Numerical method and precision

Direct arithmetic; round-trip consistency asserted in tests (e.g. n → m → n returns the input within 1 ulp).

## Reference cases (all PASS, 2026-11-07, `pnpm test`)

REF-QTY-001 (m = nM), REF-QTY-002 (n = m/M), REF-QTY-003 (c = n/V), REF-QTY-004 (dilution), REF-QTY-005 (γ/M → molarity), REF-QTY-006 (% yield 96 %). See `docs/science/reference-cases.md`.

## Known limitations

- No temperature-dependent density handling.
- No activity-coefficient corrections (see acid-base report).
- Mass-of-solvent vs solution conventions must be supplied explicitly by callers; the API distinguishes them.
- Passing tests is not scientific validation; qualified review is pending.

## Reviewer status

Pending qualified human scientific review.
