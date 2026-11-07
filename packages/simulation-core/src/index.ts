/**
 * @virtual-chemistry-lab/simulation-core
 *
 * Foundational scientific simulation engine for Virtual Chemistry Lab.
 * Framework-free (no React, DOM or renderers), dependency-free, deterministic
 * and independently testable. See docs/science/model-catalog.md and
 * docs/science/models/ for model reports and verification status.
 *
 * Nothing here is scientifically "approved": every model awaits qualified
 * human review (SCIENTIFIC_VALIDATION_LOG.md).
 */

export const ENGINE_VERSION = "0.1.0";
export const ENGINE_NAME = "@virtual-chemistry-lab/simulation-core";

export * from "./errors.js";
export {
  DEFAULT_ABSOLUTE_TOLERANCE,
  DEFAULT_RELATIVE_TOLERANCE,
  approxEqual,
  assertFiniteAtLeast,
  assertFiniteGreaterThan,
  assertFiniteInRange,
  assertFiniteNumber,
  roundToSignificantFigures,
} from "./numerics.js";
export {
  areCompatible,
  assertDimension,
  convert,
  dimensionOf,
  dimensionsEqual,
  formatDimension,
  getUnit,
  isKnownUnit,
  listUnits,
} from "./units.js";
export type { DimensionVector, UnitDefinition } from "./units.js";
export {
  CONSTANTS_REGISTRY_VERSION,
  constantValue,
  getConstant,
  isKnownConstant,
  listConstants,
} from "./constants.js";
export type { ConstantPrecision, ConstantSource, PhysicalConstant } from "./constants.js";
export {
  ELEMENTS_REGISTRY_VERSION,
  getElementBySymbol,
  isKnownElement,
  listElements,
} from "./elements.js";
export type { ElementDefinition } from "./elements.js";
export { molarMass, molarMassBreakdown, parseFormula } from "./molar-mass.js";
export type { FormulaComposition, MolarMassBreakdownEntry, MolarMassResult } from "./molar-mass.js";
export {
  amountFromConcentrationVolume,
  atomEconomy,
  dilutionFinalConcentration,
  dilutionFinalVolume,
  dilutionRequiredStockVolume,
  massBalanceHolds,
  massConcentrationFromMolarity,
  massFromMoles,
  massFromMolesOfFormula,
  massPercent,
  molarConcentration,
  molarityFromMassConcentration,
  molesFromMass,
  molesFromMassOfFormula,
  percentYield,
} from "./amount.js";
export {
  analyzeReaction,
  assertBalanced,
  balanceReaction,
  formatReaction,
  formatSpecies,
  parseReaction,
  parseSpecies,
  requireBalancedReaction,
  validateReaction,
} from "./reaction.js";
export type {
  ChemicalSpecies,
  ParsedReaction,
  ReactionAnalysis,
  ReactionSpecies,
} from "./reaction.js";
export {
  limitingReagent,
  reactantConsumed,
  requireBalancedEquation,
  theoreticalYield,
} from "./stoichiometry.js";
export type { ExtentResult, LimitingReagentResult, ReagentAmount } from "./stoichiometry.js";
export {
  hydrogenConcentrationFromPh,
  ionProductOfWaterConstant,
  neutralPh,
  phFromHydrogenConcentration,
  phFromHydroxideConcentration,
  phFromPoh,
  pohFromHydroxideConcentration,
  pohFromPh,
  strongAcidSolution,
  strongBaseSolution,
  weakAcidSolution,
  weakBaseSolution,
} from "./acid-base.js";
export type {
  StrongBaseResult,
  StrongElectrolyteResult,
  WeakAcidResult,
  WeakBaseResult,
} from "./acid-base.js";
export { listModels, getModel } from "./models.js";
export type { ModelRegistryEntry, ModelVerification, ModelVerificationStatus } from "./models.js";
export { REFERENCE_CASES, evaluateReferenceCase } from "./reference-cases.js";
export type { ReferenceCase, ReferenceToleranceKind } from "./reference-cases.js";
