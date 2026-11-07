# Model Report — unit-system

| Field | Value |
|---|---|
| Model ID | `unit-system` |
| Version | 1.0.0 |
| Owner | Virtual Chemistry Lab — Simulation Engineering |
| Implementation | `packages/simulation-core/src/units.ts` |
| Registry entry | `packages/simulation-core/src/models.ts` |
| Verification status | Unit-tested + reference-verified; **awaiting qualified human scientific review** |
| Intended use | Dimension-checked conversion among registered lab-relevant units; rendering of dimensional results; temperature conversion via absolute scale |
| Excluded use | Metrology; unit algebra (products of arbitrary units); prefixes not registered in the unit table |

## Equations and sources

- Conversion law (affine): `value_to = (value_from × factor_from + offset_from − offset_to) / factor_to`, routed through the absolute kelvin scale for temperature.
- Definitions: 1 L = 1e-3 m³ (SI Brochure 9th ed., §4 table 8); 1 atm = 101325 Pa (conventional, exact); 1 bar = 1e5 Pa (exact); 1 mmHg = 133.322387415 Pa; 1 Torr = 101325/760 Pa; thermochemical calorie 1 cal = 4.184 J exactly; 1 d = 86400 s; °F = 1.8·°C + 32; T/K = t/°C + 273.15 (ITS-90).

## Inputs / outputs and units

Functions take a numeric value plus registered unit identifiers (e.g. `"kPa"`, `"g/mol"`, `"C"`, `"°C"`), and return a numeric value in the target unit. `formatDimension` renders a dimension-vector label (e.g. `"L^-3 N"` for pressure). Invalid unit identifiers and cross-dimension conversions throw `DimensionMismatchError` / `UnknownUnitError` — values are never silently mangled.

## Conditions and assumptions

- Temperature conversions route through kelvin; offsets handled by the affine law (no Fahrenheit shortcuts).
- The thermochemical calorie is used throughout (not the IT calorie, 4.1868 J).
- Dimension vectors use SI base dimensions with signed exponents; mismatch detection is by equality of the full vector.

## Valid ranges

All finite doubles. Precision is limited to IEEE-754 double arithmetic; conversions between `L`/`mL`/`cm³` may differ from exact decimals by ~1 ulp, so exact-equality assertions on such paths are avoided by design (tests use `toBeCloseTo`).

## Numerical method and precision

Direct arithmetic, no iteration. Registry lookup is constant time. Tests assert ulp-level agreement where definitions are exact.

## Reference cases (all PASS, 2026-11-07, `pnpm test`)

REF-UNIT-001 … REF-UNIT-012 — atm/Pa, Torr/Pa, L/mL/cm³, °C/K, °C/°F, °F/K, cal/J, mol/L ↔ mol/m³, g/L ↔ kg/m³, g/mol ↔ kg/mol, atm/bar, day/s. See `docs/science/reference-cases.md` for expected values, tolerances and sources.

## Known limitations

- Dimensionless prefixes (ppm, ppb, % w/w) are NOT modelled — they are not interconvertible without an explicit basis.
- No arbitrary unit algebra (only registered units convert).
- Luminous intensity has no lab-relevant derived units.
- Passing tests is not scientific validation; qualified review is pending.

## Reviewer status

Pending qualified human scientific review. Not approved for unsupervised production-claims.
