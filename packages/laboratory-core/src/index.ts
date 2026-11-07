/**
 * @virtual-chemistry-lab/laboratory-core
 *
 * Framework-free laboratory subsystem shared across the UI platforms.
 *
 * Responsibilities:
 *  - Equipment catalog (id, capacities, graduation, supported operations, display dimensions).
 *  - Procedure execution state (pure step-transition functions, no UI).
 *  - Observation session model (measurements + notes, tagged by data source).
 *  - Experiment adapters for the Phase 05 interactive experiments
 *    (solution dilution, acid-base pH), which delegate scientific
 *    computation to `@virtual-chemistry-lab/simulation-core`.
 *
 * This package never imports React/DOM/Canvas and never defines scientific
 * truth — it always delegates to simulation-core and tags every
 * measurement's data source.
 */

export const LAB_CORE_VERSION = "0.1.0";

// Equipment catalog
export {
  EQUIPMENT_CATALOG,
  getEquipment,
  hasGraduations,
  supportsAllOperations,
  volumeDisplayDecimals,
} from "./equipment.js";
export type { EquipmentCategory, EquipmentDefinition, EquipmentOperation } from "./equipment.js";

// Procedure engine
export {
  addObservation,
  completeStepWithMeasurements,
  createInitialState,
  getCurrentStep,
  isCompleted,
  resetProcedure,
  startProcedure,
} from "./procedure.js";
export type {
  DataSource,
  ExperimentRunStatus,
  MeasurementRecord,
  ObservationNote,
  ProcedureState,
  ProcedureStep,
  StepStatus,
} from "./procedure.js";

// Sessions / observations
export {
  appendInputs,
  appendMeasurements,
  appendObservations,
  completeSession,
  countBySource,
  createSession,
  resetSession,
} from "./observations.js";
export type { ExperimentSession } from "./observations.js";

// Formatting
export {
  formatConcentration,
  formatDecimal,
  formatMeasurement,
  formatPh,
  formatSignificantFigures,
  formatVolumeMl,
} from "./format.js";

// Experiment adapters
export {
  DILUTION_ENGINE_ID,
  DILUTION_EXPERIMENT_ID,
  DILUTION_PROCEDURE,
  DILUTION_STOCK_PRESETS,
  calculateDilution,
  dilutionModelLabel,
  requiredStockForTarget,
} from "./experiments/dilution.js";
export type { DilutionInputs, DilutionResult } from "./experiments/dilution.js";

export {
  PH_ENGINE_ID,
  PH_EXPERIMENT_ID,
  PH_PROCEDURE,
  SUPPORTED_ELECTROLYTES,
  calculatePh,
  phProvenanceLabel,
} from "./experiments/ph-exploration.js";
export type {
  Electrolyte,
  ElectrolyteKind,
  PhExplorationInputs,
  PhExplorationResult,
} from "./experiments/ph-exploration.js";
