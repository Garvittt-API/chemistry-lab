# Model Report — acid-base

| Field | Value |
|---|---|
| Model ID | `acid-base` |
| Version | 1.0.0 |
| Owner | Virtual Chemistry Lab — Simulation Engineering |
| Implementation | `packages/simulation-core/src/acid-base.ts` |
| Registry entry | `packages/simulation-core/src/models.ts` |
| Verification status | Unit-tested + reference-verified; **awaiting qualified human scientific review** |
| Intended use | pH/pOH of strong and weak monoprotic acid/base solutions at 25 °C in dilute aqueous solution — education grade |
| Excluded use | Ionic strengths ≳ 1e-2 mol/L; polyprotic systems; buffers; titration curves; non-aqueous media; physiological buffered physiology |

## Equations and sources

- pH = −log₁₀[H⁺]; pOH = −log₁₀[OH⁻]; pH + pOH = pK_w = 14.00 (K_w = 1.0e-14, 25 °C conventional)
- Strong acid (full dissociation + water autoionization, exact): [H⁺] = (c + √(c² + 4K_w)) / 2
- Strong base: symmetric with c_OH and K_w; pH = pK_w − pOH
- Weak acid (exact quadratic root, numerically stable): x = 2·K_a·C / (K_a + √(K_a² + 4·K_a·C)), x = [H⁺]
- Weak base: symmetric (K_b); pH = pK_w − pOH
- Ca(OH)₂-class diprotic strong bases: full dissociation c_OH = 2c (introductory convention)

Sources: K_a(CH₃COOH) = 1.8e-5 and K_b(NH₃) = 1.8e-5 (NCERT Class XI, Equilibrium); strong-acid/autoionization treatment (Brown & LeMay, Chemistry: The Central Science, 14th ed. ch. 16); definitions per NCERT Class XI, Ionic Equilibrium.

## Inputs / outputs and units

`strongAcidPh(c)`, `strongBasePh(c)`, `weakAcidPh(C, Ka)`, `weakBasePh(C, Kb)`, `phToHydronium`, `hydroniumToPh`. Concentrations in mol/L; pH dimensionless. Physical impossibilities (negative concentration, non-finite, zero K_a/K_b) throw `InvalidConcentrationError` with coded reasons.

## Conditions and assumptions

- 25 °C, dilute aqueous solutions; concentrations used **as activities** (activity coefficients = 1).
- Monoprotic single equilibria; strong electrolytes fully dissociated.
- pK_w = 14.00 conventional constant (not the measured 13.997).

## Valid ranges

0 ≤ c finite; c may be 0 (pure water). K_a, K_b > 0 finite doubles. Weak-equilibrium results assume K_a ≳ 1e-12 (water autoionization neglected relative to K_a·C — disclosed, and the strong-acid path is exact in that limit anyway).

## Numerical method and precision

Strong path: closed-form stable quadratic. Weak path: numerically stable root (avoids catastrophic cancellation x ≈ 0 for tiny K_a·C). Tests assert |approx − exact| ≤ 1e-2 pH for K_a·C where the textbook √ neglect is valid, exact equality of the strong-acid path, and clean throwing on invalid input. Reference cases verified to ≤ 1e-3 pH.

## Reference cases (all PASS, 2026-11-07, `pnpm test`)

REF-AB-001 (0.01 M HCl → 2.00), REF-AB-002 (1e-8 M HCl → ≈6.978, water autoionization), REF-AB-003 (pure water → 7.00), REF-AB-004 (0.01 M NaOH → 12.00), REF-AB-005 (0.02 M Ca(OH)₂ → ≈12.602), REF-AB-006 (0.1 M acetic → ≈2.875 exact quadratic), REF-AB-007 (0.1 M NH₃ → ≈11.125), REF-AB-008 (pH+pOH=14.00), REF-AB-009 (neutral pH 7.00), REF-AB-010 (pH round trip 3.00 → 1e-3 → 3.00). See `docs/science/reference-cases.md`.

## Known limitations

- NOT valid at ionic strengths ≳ 1e-2 mol/L (no Debye–Hückel in this version).
- No polyprotic acids (H₂SO₄, H₃PO₄), no buffers/Henderson–Hasselbalch, no titration curves, no temperature dependence of K_w/K_a.
- Exactness is of the *concentration model*, not of physical reality at high ionic strength — activities would be required.
- Passing tests is not scientific validation; qualified review is pending.

## Reviewer status

Pending qualified human scientific review.
