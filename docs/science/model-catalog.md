# Scientific Model Catalog

One entry per implemented scientific model. "Implemented" means code, tests **and**
documentation exist. Verification status vocabulary (see
`docs/science/validation-policy.md`): `implemented` → `unit-tested` →
`reference-verified` → `independently reviewed` → `production-approved`.

**Every model below is at most `reference-verified`. No model has been
independently reviewed by a qualified human scientific reviewer, and no model is
approved for production claims. Simulation contracts in experiment records remain
`planned`; nothing in this catalog promotes an experiment to `simulation-available`.**

| Model ID | Topic | Version | Verification | Validated conditions | Code location | Model report |
|---|---|---|---|---|---|---|
| unit-system | Units & dimensional analysis | 1.0.0 | unit-tested, reference-verified | Registered units; SI/ITS-90/conventional definitions | `packages/simulation-core/src/units.ts` | [models/unit-system.md](models/unit-system.md) |
| constants-registry | Physical constants | 1.0.0 | unit-tested, reference-verified | SI Brochure 9th ed.; CODATA 2018; conventional 25 °C K_w | `packages/simulation-core/src/constants.ts` | [models/constants-registry.md](models/constants-registry.md) |
| elements-registry | Element data (abridged) | 1.0.0 | unit-tested, reference-verified | CIAAW standard atomic weights, 2021 revision | `packages/simulation-core/src/elements.ts` | [models/elements-registry.md](models/elements-registry.md) |
| molar-mass | Formula parsing & molar mass | 1.0.0 | unit-tested, reference-verified | CIAAW-2021 masses; hydrates; nested brackets | `packages/simulation-core/src/molar-mass.ts` | [models/molar-mass.md](models/molar-mass.md) |
| chemical-quantity | Moles / mass / concentration / dilution / yield | 1.0.0 | unit-tested, reference-verified | Ideal, dilute, SI-coherent g/mol/L | `packages/simulation-core/src/amount.ts` | [models/chemical-quantity.md](models/chemical-quantity.md) |
| reaction | Species/reaction parsing, balancing, charge analysis | 1.0.0 | unit-tested, reference-verified | Exact rational arithmetic; atom + charge conservation | `packages/simulation-core/src/reaction.ts` | [models/reaction.md](models/reaction.md) |
| reaction-stoichiometry | Limiting reagent, extent, theoretical yield | 1.0.0 | unit-tested, reference-verified | Atom/charge-balanced input enforced | `packages/simulation-core/src/stoichiometry.ts` | [models/reaction-stoichiometry.md](models/reaction-stoichiometry.md) |
| acid-base | pH/pOH strong & weak monoprotic (25 °C) | 1.0.0 | unit-tested, reference-verified | Dilute aqueous, 25 °C, activity = concentration | `packages/simulation-core/src/acid-base.ts` | [models/acid-base.md](models/acid-base.md) |

Reference cases: `docs/science/reference-cases.md` (52 cases, all PASS — 2026-11-07).
Model index is machine-checked: `models.ts` registers exactly the models listed here,
and `reference-cases.test.ts` enforces that **every** registered model has reference
coverage.
