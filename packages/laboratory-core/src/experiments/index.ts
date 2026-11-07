/**
 * Experiment adapters.
 *
 * Each adapter is a pure function (or set of functions) that maps lab UI
 * inputs to simulation-core calls and returns typed measurement records.
 * Adapters are framework-free; they do not touch React, state, or rendering.
 */

export type { DilutionInputs, DilutionResult } from "./dilution.js";
export {
  DILUTION_EXPERIMENT_ID,
  DILUTION_ENGINE_ID,
  DILUTION_PROCEDURE,
  DILUTION_STOCK_PRESETS,
  calculateDilution,
  dilutionModelLabel,
} from "./dilution.js";

export type { PhExplorationInputs, PhExplorationResult, Electrolyte } from "./ph-exploration.js";
export {
  PH_EXPERIMENT_ID,
  PH_ENGINE_ID,
  PH_PROCEDURE,
  SUPPORTED_ELECTROLYTES,
  calculatePh,
  phProvenanceLabel,
} from "./ph-exploration.js";
