# Model Report — constants-registry

| Field | Value |
|---|---|
| Model ID | `constants-registry` |
| Version | 1.0.0 |
| Owner | Virtual Chemistry Lab — Simulation Engineering |
| Implementation | `packages/simulation-core/src/constants.ts` |
| Registry entry | `packages/simulation-core/src/models.ts` |
| Verification status | Unit-tested + reference-verified; **awaiting qualified human scientific review** |
| Intended use | Single source of physical constants used by implemented models; traceable source attribution; explicit exact-vs-measured precision metadata |
| Excluded use | General CODATA bundle; isotope-resolved data; metrology-grade constants |

## Equations and sources

No governing equations. Registry semantics: every constant carries `id`, `symbol`, `value`, `unit`, `dimension`, a `precision` descriptor (`exact` / `conventional` / `measured` with a human note) and a `source`. R and F are derived exactly from the SI defining constants (R = N_A·k; F = N_A·e).

Primary sources: SI Brochure 9th ed. (BIPM, 2019) — exact defining constants; CODATA 2018 — measured values; conventional 25 °C K_w = 1.0e-14 (pK_w = 14.00); CRC Handbook of Chemistry and Physics, 104th ed.

## Inputs / outputs and units

`constantValue(id)` / `getConstant(id)` return the typed registry entry; values are SI-coherent (J, C, mol⁻¹, K⁻¹, …). Unknown IDs throw `UnknownConstantError`.

## Conditions and assumptions

- K_w = 1.0e-14 is the **conventional 25 °C** value; it is temperature dependent and not exact.
- R and F are exact by the 2019 SI redefinition.
- Values are stored at full documented precision; rounding happens at presentation boundaries only.

## Valid ranges

Constants are point values or conventional constants; not ranged. Consumers must honor the stated conditions.

## Numerical method and precision

Lookup only. IEEE-754 doubles; F is stored as the shortest round-trip double equal to N_A×e (`9648.533212331001e1` ≡ `96485.33212331001`).

## Reference cases (all PASS, 2026-11-07, `pnpm test`)

REF-CON-001 (R), REF-CON-002 (F), REF-CON-003 (N_A), REF-CON-004 (K_w). See `docs/science/reference-cases.md`.

## Known limitations

- K_w validity is 25 °C, dilute aqueous, pK_w = 14.00 by convention.
- Registry intentionally minimal; absence is by design, not omission.
- Passing tests is not scientific validation; qualified review is pending.

## Reviewer status

Pending qualified human scientific review. Not approved for metrology claims.
