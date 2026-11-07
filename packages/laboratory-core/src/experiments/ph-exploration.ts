/**
 * Acid-Base pH exploration experiment adapter.
 *
 * Wraps simulation-core's monoprotic acid/base pH models:
 *  - Strong acids / strong bases (exact quadratic including water autoionization)
 *  - Weak monoprotic acids / weak bases (exact quadratic; approximation diagnostic shown)
 *
 * Model HARD LIMITATIONS (propagated to the UI, not hidden):
 *  - Dilute aqueous solutions only (concentrations < ~1 mol/L ideally;
 *    results become progressively worse outside dilute regime because
 *    activities ≠ concentrations).
 *  - Monoprotic systems only; polyprotic acids, salts of weak acids/bases,
 *    buffers, and titration curves are out of scope here.
 *  - Constant K_w = 1.0e-14 (25 °C conventional).
 *  - "Strong" means fully dissociated; real strong electrolytes deviate at
 *    high concentration.
 */

import {
  ENGINE_NAME,
  ENGINE_VERSION,
  ionProductOfWaterConstant,
  strongAcidSolution,
  strongBaseSolution,
  weakAcidSolution,
  weakBaseSolution,
} from "@virtual-chemistry-lab/simulation-core";

import type { DataSource, MeasurementRecord, ProcedureStep } from "../procedure.js";

export const PH_EXPERIMENT_ID = "ph-and-indicators";
export const PH_ENGINE_ID = "ph-monoprotic-25c";

export type ElectrolyteKind = "strong_acid" | "strong_base" | "weak_acid" | "weak_base";

export interface Electrolyte {
  readonly id: string;
  readonly label: string;
  readonly formula: string;
  readonly kind: ElectrolyteKind;
  /** For strong electrolytes: number of equivalents (H+ or OH- per formula unit). */
  readonly equivalents?: number;
  /** For weak acids: Ka (mol/L). */
  readonly ka?: number;
  /** For weak bases: Kb (mol/L). */
  readonly kb?: number;
  /** pKa/pKb for display. */
  readonly pKaDisplay?: string;
  /** Short note for the UI (e.g. approximate school-lab context). */
  readonly note: string;
}

/**
 * A small educational preset list. These are representative textbook values
 * at 25 °C — the UI MUST present them as "approximate literature values".
 * The learner can also choose custom Ka/Kb.
 */
export const SUPPORTED_ELECTROLYTES: ReadonlyArray<Electrolyte> = [
  {
    id: "hcl-strong",
    label: "Hydrochloric acid (HCl)",
    formula: "HCl",
    kind: "strong_acid",
    equivalents: 1,
    note: "Strong monoprotic acid — assumed fully dissociated.",
  },
  {
    id: "naoh-strong",
    label: "Sodium hydroxide (NaOH)",
    formula: "NaOH",
    kind: "strong_base",
    equivalents: 1,
    note: "Strong monobasic base — assumed fully dissociated.",
  },
  {
    id: "acetic-weak",
    label: "Acetic acid (CH₃COOH)",
    formula: "CH3COOH",
    kind: "weak_acid",
    ka: 1.8e-5,
    pKaDisplay: "≈ 4.76",
    note: "Weak monoprotic acid, Ka ≈ 1.8 × 10⁻⁵ (25 °C, literature approximate).",
  },
  {
    id: "ammonia-weak",
    label: "Ammonia solution (NH₃·H₂O)",
    formula: "NH3",
    kind: "weak_base",
    kb: 1.8e-5,
    pKaDisplay: "pKb ≈ 4.76",
    note: "Weak monobasic base, Kb ≈ 1.8 × 10⁻⁵ (25 °C, literature approximate).",
  },
];

export interface PhExplorationInputs {
  readonly electrolyteId: string;
  /** Analytical concentration (mol/L). Must be > 0; strong electrolytes accept 0 (pure water). */
  readonly concentration: number;
  /** If electrolyteId === 'custom-weak-acid' or 'custom-weak-base', custom equilibrium constant. */
  readonly customKa?: number;
  readonly customKb?: number;
}

export interface PhExplorationResult {
  readonly electrolyte: Electrolyte;
  readonly ph: number;
  readonly poh: number;
  readonly hydrogenConcentration: number;
  readonly hydroxideConcentration: number;
  readonly degreeOfDissociation?: number;
  readonly approximationValidAt5Percent?: boolean;
}

/** Procedure definition for the pH experiment. */
export const PH_PROCEDURE: ReadonlyArray<ProcedureStep> = [
  {
    id: "step-1-glassware",
    instruction: "Place a 100 mL beaker on the workspace and add the pH meter beside it.",
    explanation:
      "The beaker holds the solution; the pH meter electrode is immersed to take a reading.",
    requiredEquipment: ["beaker-100", "ph-meter"],
    requiredAction: "place_equipment",
  },
  {
    id: "step-2-select-electrolyte",
    instruction: "Choose an acid or base from the list (or note the hard limitations).",
    explanation:
      "This model covers monoprotic acids/bases only at 25 °C; polyprotic systems, buffers and titrations are out of scope.",
    requiredEquipment: ["beaker-100", "ph-meter"],
    requiredAction: "enter_value",
    expectedInputs: [{ id: "electrolyte", label: "Acid or base", unit: "" }],
  },
  {
    id: "step-3-concentration",
    instruction: "Set the analytical concentration (0.0001 – 1.0 mol/L recommended).",
    explanation:
      "Outside ~10⁻² mol/L, activity-coefficient effects grow; the model uses concentrations, not activities, and results lose accuracy.",
    requiredEquipment: ["beaker-100", "ph-meter"],
    requiredAction: "enter_value",
    expectedInputs: [{ id: "concentration", label: "Analytical concentration", unit: "mol/L" }],
    producesMeasurements: ["ph-reading"],
  },
  {
    id: "step-4-run",
    instruction: "Run the pH calculation and read the meter.",
    explanation:
      "The simulation engine computes [H⁺] and [OH⁻] exactly (quadratic for weak electrolytes; water autoionization included for strong).",
    requiredEquipment: ["beaker-100", "ph-meter"],
    requiredAction: "run_calculation",
    producesMeasurements: [
      "ph-reading",
      "hydrogen-concentration",
      "hydroxide-concentration",
      "poh-reading",
    ],
  },
  {
    id: "step-5-record",
    instruction: "Record your observation (for example: 'meter reads pH 2.78, solution acidic').",
    requiredEquipment: ["beaker-100", "ph-meter"],
    requiredAction: "record_observation",
  },
];

export function phProvenanceLabel(): string {
  return `${PH_ENGINE_ID} @ ${ENGINE_NAME} ${ENGINE_VERSION}`;
}

function resolveElectrolyte(id: string, customKa?: number, customKb?: number): Electrolyte {
  const preset = SUPPORTED_ELECTROLYTES.find((e) => e.id === id);
  if (preset) return preset;
  if (id === "custom-weak-acid") {
    if (customKa === undefined || customKa <= 0) {
      throw new Error("Custom weak acid requires a positive Ka");
    }
    return {
      id,
      label: `Custom weak acid (Ka = ${customKa.toExponential(2)})`,
      formula: "HA",
      kind: "weak_acid",
      ka: customKa,
      note: "User-specified Ka; no literature source implied.",
    };
  }
  if (id === "custom-weak-base") {
    if (customKb === undefined || customKb <= 0) {
      throw new Error("Custom weak base requires a positive Kb");
    }
    return {
      id,
      label: `Custom weak base (Kb = ${customKb.toExponential(2)})`,
      formula: "B",
      kind: "weak_base",
      kb: customKb,
      note: "User-specified Kb; no literature source implied.",
    };
  }
  throw new Error(`Unknown electrolyte id "${id}"`);
}

/** Run the pH model; returns typed result + measurement records. */
export function calculatePh(inputs: PhExplorationInputs): {
  readonly result: PhExplorationResult;
  readonly measurements: ReadonlyArray<MeasurementRecord>;
  readonly limitations: ReadonlyArray<string>;
} {
  const electrolyte = resolveElectrolyte(inputs.electrolyteId, inputs.customKa, inputs.customKb);

  let ph = 7;
  let poh = 7;
  let hConcentration = 1e-7;
  let ohConcentration = 1e-7;
  let degreeOfDissociation: number | undefined;
  let approxValid: boolean | undefined;

  switch (electrolyte.kind) {
    case "strong_acid": {
      const r = strongAcidSolution(inputs.concentration, electrolyte.equivalents ?? 1);
      ph = r.ph;
      poh = r.poh;
      hConcentration = r.hydrogenConcentration;
      ohConcentration = r.hydroxideConcentration;
      break;
    }
    case "strong_base": {
      const r = strongBaseSolution(inputs.concentration, electrolyte.equivalents ?? 1);
      ph = r.ph;
      poh = r.poh;
      hConcentration = r.hydrogenConcentration;
      ohConcentration = r.hydroxideConcentration;
      break;
    }
    case "weak_acid": {
      if (!electrolyte.ka) throw new Error("Weak acid requires Ka");
      const r = weakAcidSolution(inputs.concentration, electrolyte.ka);
      ph = r.ph;
      poh = 14 - ph;
      hConcentration = r.hydrogenConcentration;
      ohConcentration = 1e-14 / hConcentration;
      degreeOfDissociation = r.degreeOfDissociation;
      approxValid = r.approximationValidAt5Percent;
      break;
    }
    case "weak_base": {
      if (!electrolyte.kb) throw new Error("Weak base requires Kb");
      const r = weakBaseSolution(inputs.concentration, electrolyte.kb);
      ph = r.ph;
      poh = r.poh;
      ohConcentration = r.hydroxideConcentration;
      hConcentration = ionProductOfWaterConstant() / ohConcentration;
      degreeOfDissociation = r.degreeOfDissociation;
      approxValid = r.approximationValidAt5Percent;
      break;
    }
  }

  const result: PhExplorationResult = {
    electrolyte,
    ph,
    poh,
    hydrogenConcentration: hConcentration,
    hydroxideConcentration: ohConcentration,
    degreeOfDissociation,
    approximationValidAt5Percent: approxValid,
  };

  const make = (
    measurementId: string,
    label: string,
    value: number,
    unit: string,
    stepIndex = 3,
  ): MeasurementRecord => ({
    id: `${PH_EXPERIMENT_ID}-${measurementId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    stepIndex,
    measurementId,
    label,
    value,
    unit,
    source: "model_calculated" as DataSource,
    modelId: PH_ENGINE_ID,
    engineVersion: ENGINE_VERSION,
  });

  const measurements: MeasurementRecord[] = [
    make("ph-reading", "pH reading", ph, "pH", 3),
    make("poh-reading", "pOH", poh, "pOH", 3),
    make("hydrogen-concentration", "[H⁺]", hConcentration, "mol/L", 3),
    make("hydroxide-concentration", "[OH⁻]", ohConcentration, "mol/L", 3),
  ];

  const limitations: string[] = [
    "Monoprotic, single-equilibrium system at 25 °C; polyprotic acids/bases, buffers and titrations are out of scope.",
    "Concentrations (not activities) — results are most reliable at ionic strengths below ~10⁻² mol/L.",
    "K_w = 1.0 × 10⁻¹⁴ (conventional 25 °C value); K_w is temperature-dependent.",
    '"Strong" means fully dissociated; strong-electrolyte deviations at high concentration are not modelled.',
  ];

  return { result, measurements, limitations };
}
