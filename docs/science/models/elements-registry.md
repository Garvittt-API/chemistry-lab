# Model Report — elements-registry

| Field | Value |
|---|---|
| Model ID | `elements-registry` |
| Version | 1.0.0 |
| Owner | Virtual Chemistry Lab — Simulation Engineering |
| Implementation | `packages/simulation-core/src/elements.ts` |
| Registry entry | `packages/simulation-core/src/models.ts` |
| Verification status | Unit-tested + reference-verified; **awaiting qualified human scientific review** |
| Intended use | Education-grade standard atomic weights for formula parsing and molar mass calculations |
| Excluded use | Isotope-resolved mass spectrometry; metrology; nuclear data |

## Equations and sources

No governing equations. Table: CIAAW abridged standard atomic weights, 2021 revision (IUPAC Technical Report, Pure Appl. Chem., DOI 10.1515/pac-2019-0603; table republished at https://iupac.qmul.ac.uk/AtWt/AtWt21.html). Hf = 178.486 reflects the 2021 revision (supersedes 178.49).

## Inputs / outputs and units

`getElementBySymbol(symbol)` → `{ atomicNumber, symbol, name, standardAtomicWeight }` with weight in g/mol; `hasElement`, `listElements` also exported. Unknown symbols throw `UnknownElementError`.

## Conditions and assumptions

- Weights are abridged conventional values (4–5 significant figures) suitable for education, not for arbitrary-precision work.
- Interval-covered elements (e.g. Ar [35.95, 36.05] by CIAAW) carry the widely taught conventional values (Ar = 39.95) — disclosed here and in the registry notes.

## Valid ranges

Elements with a standard atomic weight in the 2021 CIAAW abridged table. Elements without one (Tc, Pm, Po, At, Rn, Fr, Ra, Ac, synthetics) are deliberately **absent** and rejected by the API — never silently approximated with 1.000 or an array midpoint.

## Numerical method and precision

Lookup only. Atomic numbers ≤ 118; weights as commonly reported to 4–5 s.f.

## Reference cases (all PASS, 2026-11-07, `pnpm test`)

REF-EL-001 (Fe = 55.845, absolute tolerance 0), REF-EL-002 (Hf = 178.486, absolute tolerance 0 — catches regressions to the pre-2021 value 178.49). See `docs/science/reference-cases.md`.

## Known limitations

- Conventional (non-interval) reporting; isotope variance ignored.
- Not suitable for isotope-resolved or metrology-grade mass calculations.
- Passing tests is not scientific validation; qualified review is pending.

## Reviewer status

Pending qualified human scientific review.
