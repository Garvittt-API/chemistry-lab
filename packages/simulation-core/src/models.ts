/**
 * Scientific model registry.
 *
 * Governance: models are listed here with explicit versions and honest
 * verification status. Distinction maintained by policy
 * (docs/science/validation-policy.md):
 *
 *   implemented                    code exists in this package
 *   unit-tested                    deterministic unit tests pass (CI)
 *   reference-verified             outputs match independently sourced
 *                                  reference cases within stated tolerances
 *   independently reviewed         a qualified, named human reviewer signed off
 *   production-approved            release decision with sign-off recorded
 *
 * NOTHING in this registry claims "independently reviewed" or
 * "production-approved": every model is at best reference-verified and
 * awaits qualified human review (see SCIENTIFIC_VALIDATION_LOG.md).
 */

import { SimulationError } from "./errors.js";

export type ModelVerificationStatus =
  | "not_started"
  | "in_progress"
  | "pass"
  | "fail"
  | "not_applicable";

export interface ModelVerification {
  readonly unitTests: ModelVerificationStatus;
  readonly referenceCases: ModelVerificationStatus;
  readonly independentScientificReview: "pending_human_review" | "complete";
  readonly productionApproval: "pending_human_review" | "approved";
}

export interface ModelRegistryEntry {
  /** Stable model identifier used in reports, tests and validation logs. */
  readonly id: string;
  /** Semantic version of the model implementation (contract-visible). */
  readonly version: string;
  readonly title: string;
  /** Repo-relative path of the implementation module. */
  readonly implementationPath: string;
  /** Repo-relative path of the model report. */
  readonly reportPath: string;
  readonly equations: readonly string[];
  readonly assumptions: readonly string[];
  readonly limitations: readonly string[];
  readonly verification: ModelVerification;
}

const VERIFICATION_AWAITING_REVIEW: ModelVerification = Object.freeze({
  unitTests: "pass",
  referenceCases: "pass",
  independentScientificReview: "pending_human_review",
  productionApproval: "pending_human_review",
});

const MODEL_LIST: readonly ModelRegistryEntry[] = Object.freeze([
  {
    id: "unit-system",
    version: "1.0.0",
    title: "Dimension-vector unit system with affine temperature support",
    implementationPath: "packages/simulation-core/src/units.ts",
    reportPath: "docs/science/models/unit-system.md",
    equations: [
      "base = value × factor + offset",
      "value_to = (value_from × factor_from + offset_from − offset_to) / factor_to",
    ],
    assumptions: [
      "Temperature conversions route through the absolute kelvin scale.",
      "The thermochemical calorie (4.184 J exactly) is the calorie used throughout.",
      "1 atm = 101325 Pa and 1 bar = 100000 Pa exactly; 1 mmHg = 133.322387415 Pa; 1 Torr = 101325/760 Pa.",
    ],
    limitations: [
      "Dimensionless prefixes (ppm, ppb, % w/w) are not modelled — such values are not interoperable without an explicit basis.",
      "Unit algebra (products/quotients of arbitrary units) is not exposed; only registered units convert.",
      "Luminous intensity has no lab-relevant derived units in this version.",
    ],
    verification: VERIFICATION_AWAITING_REVIEW,
  },
  {
    id: "constants-registry",
    version: "1.0.0",
    title: "Physical constants registry (SI Brochure 9th ed.; CODATA 2018; CRC 104th ed.)",
    implementationPath: "packages/simulation-core/src/constants.ts",
    reportPath: "docs/science/models/constants-registry.md",
    equations: [],
    assumptions: [
      "K_w for water is the conventional 25 °C value 1.0e-14 with pK_w = 14.00.",
      "R is exact by the 2019 SI redefinition (N_A × k).",
      "F is exact by the 2019 SI redefinition (N_A × e).",
    ],
    limitations: [
      "K_w is temperature dependent; results away from 25 °C are outside the stated validity.",
      "Registry is not a general CODATA bundle — only constants needed by implemented models.",
    ],
    verification: VERIFICATION_AWAITING_REVIEW,
  },
  {
    id: "elements-registry",
    version: "1.0.0",
    title: "Element registry (CIAAW standard atomic weights, 2021 revision, abridged)",
    implementationPath: "packages/simulation-core/src/elements.ts",
    reportPath: "docs/science/models/elements-registry.md",
    equations: [],
    assumptions: [
      "Abridged conventional atomic weights serve education-grade calculations (4–5 significant figures).",
      "Interval-covered elements use widely taught conventional values (e.g. Ar = 39.95).",
    ],
    limitations: [
      "Elements without a standard atomic weight (Tc, Pm, Po, At, Rn, Fr, Ra, Ac and synthetics) are deliberately absent.",
      "Not suitable for isotope-resolved or metrology-grade mass calculations.",
    ],
    verification: VERIFICATION_AWAITING_REVIEW,
  },
  {
    id: "molar-mass",
    version: "1.0.0",
    title: "Chemical formula parsing and molar mass (g/mol)",
    implementationPath: "packages/simulation-core/src/molar-mass.ts",
    reportPath: "docs/science/models/molar-mass.md",
    equations: ["M = Σ_i count_i × A_r(i)"],
    assumptions: [
      "Hydrate dots ('.', '·') separate formula units with an integer multiplier.",
      "Bracket nesting ( ), [ ], { } is supported to depth 16.",
    ],
    limitations: [
      "Ionic molar mass equals the neutral atom sum (electron masses below reportable precision).",
      "No fractional coefficients in formulas; no polymeric repeating-unit notation.",
      "Structural isomers and connectivity are not represented (formula only).",
    ],
    verification: VERIFICATION_AWAITING_REVIEW,
  },
  {
    id: "chemical-quantity",
    version: "1.0.0",
    title: "Moles, mass, concentration, dilution and yield arithmetic",
    implementationPath: "packages/simulation-core/src/amount.ts",
    reportPath: "docs/science/models/chemical-quantity.md",
    equations: [
      "n = m / M",
      "c = n / V",
      "γ = m_solute / V (mass concentration)",
      "C₁V₁ = C₂V₂",
      "% yield = actual / theoretical × 100",
    ],
    assumptions: [
      "Ideal solutions; volumes are additive only when the user states them as final volumes.",
      "All quantities use coherent SI-derived units (g, mol, L, g/L) documented per function.",
    ],
    limitations: [
      "No temperature conversion of solution densities; g/L↔molarity uses molar mass only.",
      "Percent yield above 100 % is reported, never clamped (it signals impure product or error).",
    ],
    verification: VERIFICATION_AWAITING_REVIEW,
  },
  {
    id: "reaction",
    version: "1.0.0",
    title: "Species/reaction parsing, atom & charge balance analysis, exact balancing",
    implementationPath: "packages/simulation-core/src/reaction.ts",
    reportPath: "docs/science/models/reaction.md",
    equations: [
      "A·x = 0 over the stoichiometry matrix [reactants | −products]",
      "rows = elements ∪ {charge}; solution via exact rational nullspace",
    ],
    assumptions: [
      "Coefficients omitted from the input are 1.",
      "Charge-balanced balancing includes the charge row whenever any species is charged.",
    ],
    limitations: [
      "Balancing is rejected (BalanceNotUniqueError) when the equation admits no unique positive integer solution.",
      "Hydrates in reactions are allowed syntactically; balancing across hydrate boundaries is mathematically consistent but pedagogically unusual.",
      "No redox half-reaction inference — only global equation balancing.",
    ],
    verification: VERIFICATION_AWAITING_REVIEW,
  },
  {
    id: "reaction-stoichiometry",
    version: "1.0.0",
    title: "Limiting reagent, reaction extent, theoretical yield",
    implementationPath: "packages/simulation-core/src/stoichiometry.ts",
    reportPath: "docs/science/models/reaction-stoichiometry.md",
    equations: [
      "ξ_max = min_i(n_i / ν_i)",
      "n_product = ξ × ν_product",
      "m_product = n_product × M_product",
    ],
    assumptions: [
      "Reactions must be atom- and charge-balanced; unbalanced input is rejected before any computation.",
      "Quantitative conversion at the limiting extent (100 % conversion of the limiting reagent).",
    ],
    limitations: [
      "No equilibrium extent, no kinetics, no activity corrections.",
      "Ties (exact stoichiometric feeds) are reported as multiple limiting reagents.",
    ],
    verification: VERIFICATION_AWAITING_REVIEW,
  },
  {
    id: "acid-base",
    version: "1.0.0",
    title: "pH/pOH, strong and weak monoprotic acid/base solutions (25 °C, concentration model)",
    implementationPath: "packages/simulation-core/src/acid-base.ts",
    reportPath: "docs/science/models/acid-base.md",
    equations: [
      "pH = −log₁₀[H⁺]",
      "pK_w = pH + pOH, K_w = 1.0e-14 (25 °C, conventional)",
      "strong acid: [H⁺] = (c + √(c² + 4K_w)) / 2",
      "weak acid: x = 2·K_a·C / (K_a + √(K_a² + 4·K_a·C))  (stable root of x² + K_a x − K_a·C = 0)",
    ],
    assumptions: [
      "Dilute (ideally infinitely dilute) aqueous solutions at 25 °C.",
      "Concentrations used as activities (activity coefficients = 1).",
      "Monoprotic single-equilibrium systems only.",
      "Strong electrolytes are fully dissociated.",
    ],
    limitations: [
      "NOT valid for ionic strengths ≳ 1e-2 mol/L (activity coefficients deviate; use Debye–Hückel-class models — not implemented).",
      "Weak-acid/base results neglect water autoionization relative to K_a/K_b (excellent for K_a ≳ 1e-12).",
      "pK_w = 14.00 is a conventional constant; K_w is temperature dependent.",
      "Polyprotic acids, buffers, titration curves and non-aqueous media are out of scope in this version.",
      "Exactness is of the concentration model, not of physical reality at high ionic strength.",
    ],
    verification: VERIFICATION_AWAITING_REVIEW,
  },
]);

const MODEL_BY_ID: ReadonlyMap<string, ModelRegistryEntry> = new Map(
  MODEL_LIST.map((entry) => [entry.id, entry]),
);

/** Returns the frozen list of registered models. */
export function listModels(): readonly ModelRegistryEntry[] {
  return MODEL_LIST;
}

/** Returns the registered model or throws SimulationError with code UNKNOWN_MODEL. */
export function getModel(modelId: string): ModelRegistryEntry {
  const found = MODEL_BY_ID.get(modelId);
  if (!found) {
    throw new SimulationError("UNKNOWN_MODEL", `Unknown model identifier: "${modelId}"`);
  }
  return found;
}
