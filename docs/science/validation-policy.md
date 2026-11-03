# Scientific Integrity and Validation Policy

## Non-negotiable rules
- Never invent a scientific reference, measured result or validation claim.
- Distinguish theory, simulation, user-entered values and physical measurements.
- State model assumptions, applicable conditions, limitations and uncertainty.
- Use explicit units and conventions.
- Validate calculations against independently checked reference cases.
- Require qualified human review before marking educational content scientifically reviewed.
- Do not imply that passing software tests proves scientific correctness.

## Validation workflow
1. Define the scientific question and intended learning outcome.
2. Identify authoritative references (textbooks, standards, peer-reviewed sources or official educational material).
3. Define equations, variables, units, conditions and assumptions.
4. Derive reference cases independently where practical.
5. Implement the model with deterministic tests.
6. Check relevant invariants: mass balance, charge balance, stoichiometry, dimensional consistency, conservation laws where applicable.
7. Test boundary cases, invalid inputs and numerical stability.
8. Compare outputs against references with justified tolerances.
9. Document known limitations and review status.
10. Obtain subject-matter review before release.

## Status vocabulary
- `draft`: incomplete, not reviewed.
- `in_review`: submitted for scientific review.
- `reviewed`: reviewed by a named/identified qualified reviewer; scope of review recorded.
- `validated_for_education`: reference cases and review completed for the stated educational purpose and conditions.
- `deprecated`: no longer recommended; reason and replacement provided.

Do not use “scientifically accurate” as an unqualified blanket claim.

## Model report
For every model record:
- Model name/version and owner.
- Intended use and excluded use.
- Equations and source references.
- Input/output definitions and units.
- Conditions and assumptions.
- Valid ranges.
- Numerical method and precision.
- Reference cases, tolerances and results.
- Known limitations and reviewer status.
