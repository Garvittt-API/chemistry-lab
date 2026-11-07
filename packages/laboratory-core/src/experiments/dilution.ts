/**
 * Solution dilution experiment adapter.
 *
 * Maps learner inputs to simulation-core's dilution model:
 *
 *   c_final = c_stock × V_stock / V_final
 *
 * Model provenance: `dilution-final-concentration` in simulation-core,
 * which validates that V_final ≥ V_stock (dilution cannot concentrate) and
 * that all inputs are strictly positive.
 *
 * This adapter also computes the stock volume required to hit a target
 * concentration, which uses the same conservation law.
 *
 * The model works in L and mol/L internally; the UI layer passes mL and
 * we convert to L at the boundary.
 */

import {
  ENGINE_NAME,
  ENGINE_VERSION,
  dilutionFinalConcentration,
  dilutionRequiredStockVolume,
} from "@virtual-chemistry-lab/simulation-core";

import type { DataSource, MeasurementRecord, ProcedureStep } from "../procedure.js";

export const DILUTION_EXPERIMENT_ID = "solution-dilution";
export const DILUTION_ENGINE_ID = "dilution-c1v1c2v2";

/** Inputs collected from the learner during the experiment. */
export interface DilutionInputs {
  /** Stock solution concentration in mol/L. */
  stockConcentration: number;
  /** Volume of stock solution taken, in mL. */
  stockVolumeMl: number;
  /** Final total volume after dilution, in mL. */
  finalVolumeMl: number;
}

/** Output of the dilution calculation. */
export interface DilutionResult {
  /** Final concentration, mol/L. */
  finalConcentration: number;
  /** Amount of solute in the stock aliquot, mol (= c1*V1). */
  soluteAmountMol: number;
  /** Dilution factor (V1/V2), unitless. */
  dilutionFactor: number;
}

/**
 * Common stock solutions presented as presets in the UI. Concentrations are
 * educational-demonstration values; the learner can override them.
 */
export const DILUTION_STOCK_PRESETS: ReadonlyArray<{
  id: string;
  label: string;
  concentrationMolL: number;
  description: string;
}> = [
  {
    id: "cuso4-0.5",
    label: "Copper(II) sulfate 0.50 mol/L",
    concentrationMolL: 0.5,
    description: "Blue CuSO₄ stock solution (illustrative colour only, not a spectroscopic model).",
  },
  {
    id: "nacl-1.0",
    label: "Sodium chloride 1.00 mol/L",
    concentrationMolL: 1.0,
    description: "Colourless NaCl solution (visual level only — no colour model).",
  },
  {
    id: "custom",
    label: "Custom concentration…",
    concentrationMolL: 0.1,
    description: "Enter your own stock concentration.",
  },
];

export function dilutionModelLabel(): string {
  return `${DILUTION_ENGINE_ID} @ ${ENGINE_NAME} ${ENGINE_VERSION}`;
}

/** Procedure definition for the dilution experiment. */
export const DILUTION_PROCEDURE: ReadonlyArray<ProcedureStep> = [
  {
    id: "step-1-select-glassware",
    instruction:
      "Select a 10 mL measuring cylinder for the stock aliquot and a 100 mL measuring cylinder (or volumetric flask) to contain the final dilution.",
    explanation:
      "Dilution requires two volume measurements: the stock volume V₁ and the final made-up volume V₂. Accurate glassware is essential.",
    requiredEquipment: ["measuring-cylinder-10", "measuring-cylinder-100"],
    requiredAction: "place_equipment",
  },
  {
    id: "step-2-stock",
    instruction: "Choose or enter the stock solution concentration (c₁).",
    explanation: "Stock concentration is the concentration of the solution you start from.",
    requiredEquipment: ["measuring-cylinder-10", "measuring-cylinder-100"],
    requiredAction: "enter_value",
    expectedInputs: [{ id: "stock-concentration", label: "Stock concentration c₁", unit: "mol/L" }],
  },
  {
    id: "step-3-volumes",
    instruction: "Enter the volume of stock (V₁) and the final volume (V₂).",
    explanation:
      "V₁ is the volume of stock you pipette/measure out; V₂ is the final volume you make up to with solvent.",
    requiredEquipment: ["measuring-cylinder-10", "measuring-cylinder-100"],
    requiredAction: "enter_value",
    expectedInputs: [
      { id: "stock-volume", label: "Stock volume V₁", unit: "mL" },
      { id: "final-volume", label: "Final volume V₂", unit: "mL" },
    ],
    producesMeasurements: ["final-concentration"],
  },
  {
    id: "step-4-calculate",
    instruction: "Run the dilution calculation and observe the final concentration.",
    explanation:
      "The simulation engine applies c₁V₁ = c₂V₂ exactly. Colour lightening is an illustrative visual cue, not a spectroscopic prediction.",
    requiredEquipment: ["measuring-cylinder-10", "measuring-cylinder-100"],
    requiredAction: "run_calculation",
    producesMeasurements: ["final-concentration", "dilution-factor", "solute-amount"],
  },
  {
    id: "step-5-record",
    instruction: "Record your observation (for example: 'colour visibly paler after dilution').",
    requiredEquipment: ["measuring-cylinder-10", "measuring-cylinder-100"],
    requiredAction: "record_observation",
  },
];

const ML_PER_L = 1000;

/** Run the dilution model with validation at the simulation-core boundary. */
export function calculateDilution(inputs: DilutionInputs): {
  readonly result: DilutionResult;
  readonly measurements: ReadonlyArray<MeasurementRecord>;
} {
  const { stockConcentration, stockVolumeMl, finalVolumeMl } = inputs;

  // Convert mL → L because simulation-core works in SI-coherent units.
  const stockVolumeL = stockVolumeMl / ML_PER_L;
  const finalVolumeL = finalVolumeMl / ML_PER_L;

  // simulation-core validates positivity and V_final >= V_stock and throws DomainError otherwise.
  const finalConcentration = dilutionFinalConcentration(
    stockConcentration,
    stockVolumeL,
    finalVolumeL,
  );
  const soluteAmountMol = stockConcentration * stockVolumeL; // n = cV
  const dilutionFactor = stockVolumeL / finalVolumeL;

  const result: DilutionResult = {
    finalConcentration,
    soluteAmountMol,
    dilutionFactor,
  };

  const makeMeasurement = (
    id: string,
    label: string,
    value: number,
    unit: string,
    stepIndex = 3,
  ): MeasurementRecord => ({
    id: `${DILUTION_EXPERIMENT_ID}-${id}-${Date.now()}`,
    stepIndex,
    measurementId: id,
    label,
    value,
    unit,
    source: "model_calculated" as DataSource,
    modelId: DILUTION_ENGINE_ID,
    engineVersion: ENGINE_VERSION,
  });

  const measurements: MeasurementRecord[] = [
    makeMeasurement(
      "final-concentration",
      "Final concentration c₂",
      finalConcentration,
      "mol/L",
      3,
    ),
    makeMeasurement("solute-amount", "Amount of solute n = c₁V₁", soluteAmountMol, "mol", 3),
    makeMeasurement("dilution-factor", "Dilution factor V₁/V₂", dilutionFactor, "(ratio)", 3),
  ];

  return { result, measurements };
}

/** Convenience: compute the required stock volume for a target concentration. */
export function requiredStockForTarget(
  stockConcentration: number,
  finalVolumeMl: number,
  targetConcentration: number,
): number {
  return (
    dilutionRequiredStockVolume(targetConcentration, finalVolumeMl / ML_PER_L, stockConcentration) *
    ML_PER_L
  );
}
