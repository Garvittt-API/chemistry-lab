/**
 * Scientific reference-case registry.
 *
 * Every case records: model identifier, model version, inputs (with units),
 * expected output (with unit), reference source, numerical tolerance and a
 * tolerance kind. `evaluate()` recomputes the output through the public
 * model API, so the registry doubles as an executable traceability table —
 * docs/science/reference-cases.md is generated from exactly these entries,
 * and reference-cases.test.ts asserts they all pass.
 *
 * Tolerances:
 * - "relative" compares |actual − expected| ≤ tol × max(|actual|, |expected|)
 * - "absolute" compares |actual − expected| ≤ tol (for pH/pOH and exact integers)
 *
 * Reference policy (docs/science/content-reference-policy.md): sources are
 * textbooks, official curricula, standards documents or self-derived
 * closed-form solutions that any reader can reproduce with a calculator.
 * No value was invented to make a test pass. Where a value is a conventional
 * constant (e.g. K_w = 1.0e-14) the case asserts the model implements the
 * documented convention, which is a different claim from physical validation.
 */

import { convert } from "./units.js";
import { constantValue } from "./constants.js";
import { getElementBySymbol } from "./elements.js";
import { molarMass } from "./molar-mass.js";
import {
  massFromMoles,
  molesFromMass,
  molarConcentration,
  dilutionFinalConcentration,
  percentYield,
  molarityFromMassConcentration,
} from "./amount.js";
import { limitingReagent, theoreticalYield } from "./stoichiometry.js";
import { balanceReaction, analyzeReaction } from "./reaction.js";
import {
  hydrogenConcentrationFromPh,
  phFromHydrogenConcentration,
  strongAcidSolution,
  strongBaseSolution,
  weakAcidSolution,
  weakBaseSolution,
  phFromPoh,
  neutralPh,
} from "./acid-base.js";

export type ReferenceToleranceKind = "relative" | "absolute";

export interface ReferenceCase {
  readonly id: string;
  readonly modelId: string;
  readonly modelVersion: string;
  readonly description: string;
  readonly inputs: Readonly<Record<string, string | number>>;
  readonly inputUnits: Readonly<Record<string, string>>;
  readonly expected: number;
  readonly expectedUnit: string;
  readonly source: string;
  readonly tolerance: number;
  readonly toleranceKind: ReferenceToleranceKind;
  readonly evaluate: () => number;
}

const ABS_PH = 1e-6;
const REL_MASS = 1e-6; // atomic weights carry 4–5 significant figures
const EXACT = 1e-9;

export const REFERENCE_CASES: readonly ReferenceCase[] = [
  // ---------------------------------------------------------------- units
  {
    id: "REF-UNIT-001",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "1 standard atmosphere = 101325 Pa (exact conventional definition)",
    inputs: { value: 1 },
    inputUnits: { value: "atm" },
    expected: 101325,
    expectedUnit: "Pa",
    source:
      "SI Brochure, 9th ed. (BIPM, 2019), conventional definition of the standard atmosphere; ISO 80000-4",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => convert(1, "atm", "Pa"),
  },
  {
    id: "REF-UNIT-002",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "760 Torr = 1 standard atmosphere exactly (101325/760 Pa per Torr)",
    inputs: { value: 760 },
    inputUnits: { value: "torr" },
    expected: 101325,
    expectedUnit: "Pa",
    source: "Conventional torr definition (1 Torr = 101325/760 Pa exactly); ISO 80000-4",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => convert(760, "torr", "Pa"),
  },
  {
    id: "REF-UNIT-003",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "1 L = 1000 mL = 1000 cm³ (definition of the litre)",
    inputs: { value: 1 },
    inputUnits: { value: "L" },
    expected: 1000,
    expectedUnit: "mL",
    source: "SI Brochure, 9th ed. (BIPM, 2019), §4 table 8 (special names for 1e-3 m³)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => convert(1, "L", "mL"),
  },
  {
    id: "REF-UNIT-004",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "°C ↔ K: 298.15 K = 25 °C",
    inputs: { value: 298.15 },
    inputUnits: { value: "K" },
    expected: 25,
    expectedUnit: "°C",
    source: "ITS-90 / SI definition (T/K = t/°C + 273.15)",
    tolerance: 1e-9,
    toleranceKind: "absolute",
    evaluate: () => convert(298.15, "K", "degC"),
  },
  {
    id: "REF-UNIT-005",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "°C ↔ °F: −40 °C = −40 °F (the unique equal point)",
    inputs: { value: -40 },
    inputUnits: { value: "°C" },
    expected: -40,
    expectedUnit: "°F",
    source: "Affine temperature conversion definition (t/°F = 1.8·t/°C + 32)",
    tolerance: 1e-9,
    toleranceKind: "absolute",
    evaluate: () => convert(-40, "degC", "degF"),
  },
  {
    id: "REF-UNIT-006",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "°F ↔ K: 212 °F = 373.15 K (boiling point of water, 1 atm)",
    inputs: { value: 212 },
    inputUnits: { value: "°F" },
    expected: 373.15,
    expectedUnit: "K",
    source:
      "Affine temperature conversion definition; boiling point of water is 100 °C at 101325 Pa",
    tolerance: 1e-9,
    toleranceKind: "absolute",
    evaluate: () => convert(212, "degF", "K"),
  },
  {
    id: "REF-UNIT-007",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "Thermochemical calorie: 1 cal = 4.184 J exactly",
    inputs: { value: 1 },
    inputUnits: { value: "cal (thermochemical)" },
    expected: 4.184,
    expectedUnit: "J",
    source:
      "Thermochemical calorie definition (4.184 J exactly); IUPAC/ISO; consistent with CODATA conventions",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => convert(1, "cal", "J"),
  },
  {
    id: "REF-UNIT-008",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "1 mol/L = 1000 mol/m³",
    inputs: { value: 1 },
    inputUnits: { value: "mol/L" },
    expected: 1000,
    expectedUnit: "mol/m³",
    source: "Definition of the litre (1 L = 1e-3 m³, SI Brochure 9th ed.)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => convert(1, "mol_per_l", "mol_per_m3"),
  },
  {
    id: "REF-UNIT-009",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "Mass concentration identity: 58.44 g/L = 58.44 kg/m³",
    inputs: { value: 58.44 },
    inputUnits: { value: "g/L" },
    expected: 58.44,
    expectedUnit: "kg/m³",
    source: "Unit definition (1 g/L = 1e-3 kg / 1e-3 m³ = 1 kg/m³)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => convert(58.44, "g_per_l", "kg_per_m3"),
  },
  {
    id: "REF-UNIT-010",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "1 g/mol = 1e-3 kg/mol (molar mass)",
    inputs: { value: 1 },
    inputUnits: { value: "g/mol" },
    expected: 1e-3,
    expectedUnit: "kg/mol",
    source: "SI prefix definitions (kilo = 1e3)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => convert(1, "g_per_mol", "kg_per_mol"),
  },
  {
    id: "REF-UNIT-011",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "1 atm = 1.01325 bar",
    inputs: { value: 1 },
    inputUnits: { value: "atm" },
    expected: 1.01325,
    expectedUnit: "bar",
    source: "Definitions: 1 atm = 101325 Pa; 1 bar = 1e5 Pa (exact)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => convert(1, "atm", "bar"),
  },
  {
    id: "REF-UNIT-012",
    modelId: "unit-system",
    modelVersion: "1.0.0",
    description: "1 day = 86400 s",
    inputs: { value: 1 },
    inputUnits: { value: "d" },
    expected: 86400,
    expectedUnit: "s",
    source: "Unit definition (1 d = 24 h = 86400 s)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => convert(1, "day", "s"),
  },

  // ------------------------------------------------------------ constants
  {
    id: "REF-CON-001",
    modelId: "constants-registry",
    modelVersion: "1.0.0",
    description: "Molar gas constant R = 8.31446261815324 J·mol⁻¹·K⁻¹ (exact from SI definition)",
    inputs: {},
    inputUnits: {},
    expected: 8.31446261815324,
    expectedUnit: "J/(mol·K)",
    source: "SI Brochure, 9th ed. (BIPM, 2019): R = N_A × k, both SI defining constants",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => constantValue("molar-gas-constant"),
  },
  {
    id: "REF-CON-002",
    modelId: "constants-registry",
    modelVersion: "1.0.0",
    description: "Faraday constant F = N_A × e = 96485.3321 C/mol",
    inputs: {},
    inputUnits: {},
    expected: 96485.33212331,
    expectedUnit: "C/mol",
    source:
      "SI Brochure, 9th ed. (BIPM, 2019): F = N_A × e; CODATA 2018 value 96485.3322 C/mol (4 s.f.)",
    tolerance: 1e-9,
    toleranceKind: "relative",
    evaluate: () => constantValue("faraday-constant"),
  },
  {
    id: "REF-CON-003",
    modelId: "constants-registry",
    modelVersion: "1.0.0",
    description: "Avogadro constant N_A = 6.02214076e23 mol⁻¹ (exact)",
    inputs: {},
    inputUnits: {},
    expected: 6.02214076e23,
    expectedUnit: "mol⁻¹",
    source: "SI Brochure, 9th ed. (BIPM, 2019), §2.1 SI defining constants",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => constantValue("avogadro-constant"),
  },
  {
    id: "REF-CON-004",
    modelId: "constants-registry",
    modelVersion: "1.0.0",
    description: "Conventional ion product of water K_w = 1.0e-14 mol² dm⁻⁶ (25 °C)",
    inputs: {},
    inputUnits: {},
    expected: 1.0e-14,
    expectedUnit: "mol² dm⁻⁶",
    source:
      "Conventional 25 °C value for dilute aqueous solutions (CRC Handbook 104th ed.); pK_w = 14.00",
    tolerance: 0,
    toleranceKind: "absolute",
    evaluate: () => constantValue("ion-product-of-water"),
  },

  // ------------------------------------------------------------ elements
  {
    id: "REF-EL-001",
    modelId: "elements-registry",
    modelVersion: "1.0.0",
    description: "Iron standard atomic weight = 55.845 g·mol⁻¹ (CIAAW 2021)",
    inputs: {},
    inputUnits: {},
    expected: 55.845,
    expectedUnit: "g/mol",
    source:
      "IUPAC Technical Report, Standard atomic weights of the elements 2021, Pure Appl. Chem. (DOI 10.1515/pac-2019-0603); table republished at https://iupac.qmul.ac.uk/AtWt/AtWt21.html",
    tolerance: 0,
    toleranceKind: "absolute",
    evaluate: () => getElementBySymbol("Fe").standardAtomicWeight,
  },
  {
    id: "REF-EL-002",
    modelId: "elements-registry",
    modelVersion: "1.0.0",
    description:
      "Hafnium standard atomic weight = 178.486 g·mol⁻¹ (2021 revision; supersedes 178.49)",
    inputs: {},
    inputUnits: {},
    expected: 178.486,
    expectedUnit: "g/mol",
    source:
      "IUPAC Technical Report, Standard atomic weights of the elements 2021, Pure Appl. Chem. (DOI 10.1515/pac-2019-0603): Hf revised from 178.49 to 178.486 ± 0.006",
    tolerance: 0,
    toleranceKind: "absolute",
    evaluate: () => getElementBySymbol("Hf").standardAtomicWeight,
  },

  // ----------------------------------------------------------- molar mass
  {
    id: "REF-MM-001",
    modelId: "molar-mass",
    modelVersion: "1.0.0",
    description: "Water H₂O = 18.015 g/mol",
    inputs: { formula: "H2O" },
    inputUnits: { formula: "—" },
    expected: 18.015,
    expectedUnit: "g/mol",
    source:
      "CIAAW Standard Atomic Weights 2021 (H 1.008, O 15.999), value independently reproducible",
    tolerance: REL_MASS,
    toleranceKind: "relative",
    evaluate: () => molarMass("H2O"),
  },
  {
    id: "REF-MM-002",
    modelId: "molar-mass",
    modelVersion: "1.0.0",
    description: "Sodium chloride NaCl = 58.44 g/mol",
    inputs: { formula: "NaCl" },
    inputUnits: { formula: "—" },
    expected: 58.44,
    expectedUnit: "g/mol",
    source: "CIAAW Standard Atomic Weights 2021 (Na 22.990, Cl 35.45)",
    tolerance: REL_MASS,
    toleranceKind: "relative",
    evaluate: () => molarMass("NaCl"),
  },
  {
    id: "REF-MM-003",
    modelId: "molar-mass",
    modelVersion: "1.0.0",
    description: "Sulfuric acid H₂SO₄ = 98.072 g/mol",
    inputs: { formula: "H2SO4" },
    inputUnits: { formula: "—" },
    expected: 98.072,
    expectedUnit: "g/mol",
    source:
      "CIAAW Standard Atomic Weights 2021 (H 1.008, S 32.06, O 15.999); NCERT quotes ≈ 98 g/mol",
    tolerance: REL_MASS,
    toleranceKind: "relative",
    evaluate: () => molarMass("H2SO4"),
  },
  {
    id: "REF-MM-004",
    modelId: "molar-mass",
    modelVersion: "1.0.0",
    description: "Glucose C₆H₁₂O₆ = 180.156 g/mol",
    inputs: { formula: "C6H12O6" },
    inputUnits: { formula: "—" },
    expected: 180.156,
    expectedUnit: "g/mol",
    source: "CIAAW Standard Atomic Weights 2021 (C 12.011, H 1.008, O 15.999)",
    tolerance: REL_MASS,
    toleranceKind: "relative",
    evaluate: () => molarMass("C6H12O6"),
  },
  {
    id: "REF-MM-005",
    modelId: "molar-mass",
    modelVersion: "1.0.0",
    description: "Calcium hydroxide Ca(OH)₂ = 74.092 g/mol",
    inputs: { formula: "Ca(OH)2" },
    inputUnits: { formula: "—" },
    expected: 74.092,
    expectedUnit: "g/mol",
    source: "CIAAW Standard Atomic Weights 2021 (Ca 40.078, O 15.999, H 1.008)",
    tolerance: REL_MASS,
    toleranceKind: "relative",
    evaluate: () => molarMass("Ca(OH)2"),
  },
  {
    id: "REF-MM-006",
    modelId: "molar-mass",
    modelVersion: "1.0.0",
    description: "Potassium ferrocyanide K₄[Fe(CN)₆] = 368.345 g/mol (nested brackets)",
    inputs: { formula: "K4[Fe(CN)6]" },
    inputUnits: { formula: "—" },
    expected: 368.345,
    expectedUnit: "g/mol",
    source: "CIAAW Standard Atomic Weights 2021 (K 39.098, Fe 55.845, C 12.011, N 14.007)",
    tolerance: REL_MASS,
    toleranceKind: "relative",
    evaluate: () => molarMass("K4[Fe(CN)6]"),
  },
  {
    id: "REF-MM-007",
    modelId: "molar-mass",
    modelVersion: "1.0.0",
    description: "Copper(II) sulfate pentahydrate CuSO₄·5H₂O = 249.677 g/mol (hydrate)",
    inputs: { formula: "CuSO4·5H2O" },
    inputUnits: { formula: "—" },
    expected: 249.677,
    expectedUnit: "g/mol",
    source: "CIAAW Standard Atomic Weights 2021; conventional tabulated value ≈ 249.7 g/mol",
    tolerance: REL_MASS,
    toleranceKind: "relative",
    evaluate: () => molarMass("CuSO4·5H2O"),
  },
  {
    id: "REF-MM-008",
    modelId: "molar-mass",
    modelVersion: "1.0.0",
    description: "Sodium sulfate decahydrate (Glauber's salt) Na₂SO₄·10H₂O = 322.186 g/mol",
    inputs: { formula: "Na2SO4·10H2O" },
    inputUnits: { formula: "—" },
    expected: 322.186,
    expectedUnit: "g/mol",
    source: "CIAAW Standard Atomic Weights 2021; conventional tabulated value ≈ 322.2 g/mol",
    tolerance: REL_MASS,
    toleranceKind: "relative",
    evaluate: () => molarMass("Na2SO4·10H2O"),
  },

  // ------------------------------------------------- chemical quantities
  {
    id: "REF-QTY-001",
    modelId: "chemical-quantity",
    modelVersion: "1.0.0",
    description: "0.5 mol H₂O weighs 9.0075 g",
    inputs: { amountMoles: 0.5, molarMass: "18.015" },
    inputUnits: { amountMoles: "mol", molarMass: "g/mol" },
    expected: 9.0075,
    expectedUnit: "g",
    source: "Definition m = n × M; applied to CIAAW-2021 molar mass of water",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => massFromMoles(0.5, 18.015),
  },
  {
    id: "REF-QTY-002",
    modelId: "chemical-quantity",
    modelVersion: "1.0.0",
    description: "5.000 g of NaCl = 0.08556 mol",
    inputs: { massGrams: 5.0, molarMass: "58.44" },
    inputUnits: { massGrams: "g", molarMass: "g/mol" },
    expected: 0.085558,
    expectedUnit: "mol",
    source: "Definition n = m / M; applied to CIAAW-2021 molar mass of NaCl",
    tolerance: 1e-5,
    toleranceKind: "relative",
    evaluate: () => molesFromMass(5, 58.44),
  },
  {
    id: "REF-QTY-003",
    modelId: "chemical-quantity",
    modelVersion: "1.0.0",
    description: "0.270 mol solute in 2.50 L → 0.108 mol/L",
    inputs: { amountMoles: 0.27, volumeLitres: 2.5 },
    inputUnits: { amountMoles: "mol", volumeLitres: "L" },
    expected: 0.108,
    expectedUnit: "mol/L",
    source:
      "Definition c = n / V; consistent with volumetric-analysis practice (NCERT Class XI, Some Basic Concepts of Chemistry)",
    tolerance: 1e-12,
    toleranceKind: "relative",
    evaluate: () => molarConcentration(0.27, 2.5),
  },
  {
    id: "REF-QTY-004",
    modelId: "chemical-quantity",
    modelVersion: "1.0.0",
    description: "Dilution: 2.0 mol/L stock, 100 mL → 500 mL final gives 0.400 mol/L",
    inputs: { stockConcentration: 2.0, stockVolumeLitres: 0.1, finalVolumeLitres: 0.5 },
    inputUnits: { stockConcentration: "mol/L", stockVolumeLitres: "L", finalVolumeLitres: "L" },
    expected: 0.4,
    expectedUnit: "mol/L",
    source: "Dilution law C₁V₁ = C₂V₂ (conservation of amount of solute); NCERT Class XI",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => dilutionFinalConcentration(2.0, 0.1, 0.5),
  },
  {
    id: "REF-QTY-005",
    modelId: "chemical-quantity",
    modelVersion: "1.0.0",
    description: "58.44 g/L NaCl solution = 1.000 mol/L",
    inputs: { massConcentrationGPerL: 58.44, molarMass: "58.44" },
    inputUnits: { massConcentrationGPerL: "g/L", molarMass: "g/mol" },
    expected: 1.0,
    expectedUnit: "mol/L",
    source: "Definition c = γ / M with γ in g/L and M in g/mol",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => molarityFromMassConcentration(58.44, 58.44),
  },
  {
    id: "REF-QTY-006",
    modelId: "chemical-quantity",
    modelVersion: "1.0.0",
    description: "Percent yield: 9.60 g actual against 10.00 g theoretical = 96.0 %",
    inputs: { actualYield: 9.6, theoreticalYield: 10.0 },
    inputUnits: { actualYield: "g", theoreticalYield: "g" },
    expected: 96.0,
    expectedUnit: "%",
    source: "Definition %yield = actual/theoretical × 100 (NCERT Class XI)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () => percentYield(9.6, 10.0),
  },

  // -------------------------------------------------------- stoichiometry
  {
    id: "REF-STOICH-001",
    modelId: "reaction-stoichiometry",
    modelVersion: "1.0.0",
    description: "2 H₂ + O₂ → 2 H₂O: 2.00 mol H₂ + 1.50 mol O₂ → 2.00 mol H₂O (H₂ limiting)",
    inputs: { equation: "2 H2 + O2 -> 2 H2O", H2_mol: 2.0, O2_mol: 1.5 },
    inputUnits: { H2_mol: "mol", O2_mol: "mol" },
    expected: 2.0,
    expectedUnit: "mol H₂O",
    source:
      "Atom conservation on the balanced equation (limiting-reagent method, NCERT Class XI, Some Basic Concepts of Chemistry)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () =>
      theoreticalYield(
        "2 H2 + O2 -> 2 H2O",
        [
          { formula: "H2", amountMoles: 2.0 },
          { formula: "O2", amountMoles: 1.5 },
        ],
        "H2O",
      ).amountMoles,
  },
  {
    id: "REF-STOICH-002",
    modelId: "reaction-stoichiometry",
    modelVersion: "1.0.0",
    description: "N₂ + 3 H₂ → 2 NH₃: exact stoichiometric feed yields 2.00 mol NH₃",
    inputs: { equation: "N2 + 3 H2 -> 2 NH3", N2_mol: 1.0, H2_mol: 3.0 },
    inputUnits: { N2_mol: "mol", H2_mol: "mol" },
    expected: 2.0,
    expectedUnit: "mol NH₃",
    source: "Atom conservation; Haber process stoichiometry (NCERT Class XI/XII)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () =>
      theoreticalYield(
        "N2 + 3 H2 -> 2 NH3",
        [
          { formula: "N2", amountMoles: 1.0 },
          { formula: "H2", amountMoles: 3.0 },
        ],
        "NH3",
      ).amountMoles,
  },
  {
    id: "REF-STOICH-003",
    modelId: "reaction-stoichiometry",
    modelVersion: "1.0.0",
    description:
      "Zn + 2 HCl → ZnCl₂ + H₂: 1.00 mol Zn + 1.00 mol HCl → 0.500 mol H₂ (HCl limiting)",
    inputs: { equation: "Zn + 2 HCl -> ZnCl2 + H2", Zn_mol: 1.0, HCl_mol: 1.0 },
    inputUnits: { Zn_mol: "mol", HCl_mol: "mol" },
    expected: 0.5,
    expectedUnit: "mol H₂",
    source: "Limiting-reagent method (NCERT Class XI, Some Basic Concepts of Chemistry)",
    tolerance: EXACT,
    toleranceKind: "relative",
    evaluate: () =>
      theoreticalYield(
        "Zn + 2 HCl -> ZnCl2 + H2",
        [
          { formula: "Zn", amountMoles: 1.0 },
          { formula: "HCl", amountMoles: 1.0 },
        ],
        "H2",
      ).amountMoles,
  },
  {
    id: "REF-STOICH-004",
    modelId: "reaction-stoichiometry",
    modelVersion: "1.0.0",
    description: "4 Fe + 3 O₂ → 2 Fe₂O₃: 2.00 mol Fe + 1.00 mol O₂ → 0.667 mol Fe₂O₃ (O₂ limiting)",
    inputs: { equation: "4 Fe + 3 O2 -> 2 Fe2O3", Fe_mol: 2.0, O2_mol: 1.0 },
    inputUnits: { Fe_mol: "mol", O2_mol: "mol" },
    expected: 2 / 3,
    expectedUnit: "mol Fe₂O₃",
    source: "Limiting-reagent method; rusting stoichiometry",
    tolerance: 1e-12,
    toleranceKind: "relative",
    evaluate: () =>
      theoreticalYield(
        "4 Fe + 3 O2 -> 2 Fe2O3",
        [
          { formula: "Fe", amountMoles: 2.0 },
          { formula: "O2", amountMoles: 1.0 },
        ],
        "Fe2O3",
      ).amountMoles,
  },
  {
    id: "REF-STOICH-005",
    modelId: "reaction-stoichiometry",
    modelVersion: "1.0.0",
    description: "Limiting set is complete for Zn + 2 HCl: reagents report remaining HCl = 0",
    inputs: { equation: "Zn + 2 HCl -> ZnCl2 + H2", Zn_mol: 1.0, HCl_mol: 1.0 },
    inputUnits: { Zn_mol: "mol", HCl_mol: "mol" },
    expected: 0,
    expectedUnit: "mol HCl remaining",
    source: "Limiting-reagent accounting (definition)",
    tolerance: 0,
    toleranceKind: "absolute",
    evaluate: () => {
      const result = limitingReagent("Zn + 2 HCl -> ZnCl2 + H2", [
        { formula: "Zn", amountMoles: 1.0 },
        { formula: "HCl", amountMoles: 1.0 },
      ]);
      return result.reagents.find((r) => r.formula === "HCl")!.remainingMoles;
    },
  },

  // ------------------------------------------------------------ reaction
  {
    id: "REF-RXN-001",
    modelId: "reaction",
    modelVersion: "1.0.0",
    description: "Balance H₂ + O₂ → H₂O: coefficient of O₂ is 1 (2,1,2 solution)",
    inputs: { equation: "H2 + O2 -> H2O" },
    inputUnits: {},
    expected: 1,
    expectedUnit: "(stoichiometric coefficient)",
    source: "Atom conservation; exact rational nullspace of the stoichiometry matrix",
    tolerance: 0,
    toleranceKind: "absolute",
    evaluate: () => {
      const balanced = balanceReaction("H2 + O2 -> H2O");
      return balanced.reactants.find((s) => s.formula === "O2")!.coefficient;
    },
  },
  {
    id: "REF-RXN-002",
    modelId: "reaction",
    modelVersion: "1.0.0",
    description: "Balance Fe + O₂ → Fe₂O₃: coefficient of Fe₂O₃ is 2 (4,3,2 solution)",
    inputs: { equation: "Fe + O2 -> Fe2O3" },
    inputUnits: {},
    expected: 2,
    expectedUnit: "(stoichiometric coefficient)",
    source: "Atom conservation",
    tolerance: 0,
    toleranceKind: "absolute",
    evaluate: () => {
      const balanced = balanceReaction("Fe + O2 -> Fe2O3");
      return balanced.products.find((s) => s.formula === "Fe2O3")!.coefficient;
    },
  },
  {
    id: "REF-RXN-003",
    modelId: "reaction",
    modelVersion: "1.0.0",
    description:
      "Permanganate–iron(II) titration: MnO₄⁻ + Fe²⁺ + H⁺ → Mn²⁺ + Fe³⁺ + H₂O balances to 1:5:8 → 1:5:4",
    inputs: { equation: "MnO4^- + Fe^+2 + H+ -> Mn^+2 + Fe^+3 + H2O" },
    inputUnits: {},
    expected: 4,
    expectedUnit: "(stoichiometric coefficient of H₂O)",
    source:
      "Half-reaction method; charge balance requires −1 + 10 + 8 = +2 + 15 = 17 elementary charges per side (NCERT Class XII, Electrochemistry)",
    tolerance: 0,
    toleranceKind: "absolute",
    evaluate: () => {
      const balanced = balanceReaction("MnO4^- + Fe^+2 + H+ -> Mn^+2 + Fe^+3 + H2O");
      return balanced.products.find((s) => s.formula === "H2O")!.coefficient;
    },
  },
  {
    id: "REF-RXN-004",
    modelId: "reaction",
    modelVersion: "1.0.0",
    description:
      "Charge balance check passes for the balanced permanganate equation (both sides = +17)",
    inputs: { equation: "1 MnO4^- + 5 Fe^+2 + 8 H+ -> 1 Mn^+2 + 5 Fe^+3 + 4 H2O" },
    inputUnits: {},
    expected: 17,
    expectedUnit: "elementary charges (per side)",
    source: "Charge conservation; NCERT Class XII, Electrochemistry",
    tolerance: 0,
    toleranceKind: "absolute",
    evaluate: () =>
      analyzeReaction(balanceReaction("MnO4^- + Fe^+2 + H+ -> Mn^+2 + Fe^+3 + H2O")).reactantCharge,
  },
  {
    id: "REF-RXN-005",
    modelId: "reaction",
    modelVersion: "1.0.0",
    description: "Aluminium combustion: Al + O₂ → Al₂O₃ balances to 4,3,2",
    inputs: { equation: "Al + O2 -> Al2O3" },
    inputUnits: {},
    expected: 2,
    expectedUnit: "(stoichiometric coefficient of Al₂O₃)",
    source: "Atom conservation",
    tolerance: 0,
    toleranceKind: "absolute",
    evaluate: () => {
      const balanced = balanceReaction("Al + O2 -> Al2O3");
      return balanced.products.find((s) => s.formula === "Al2O3")!.coefficient;
    },
  },

  // ----------------------------------------------------------- acid/base
  {
    id: "REF-AB-001",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description: "Strong acid: pH of 0.010 mol/L HCl = 2.00",
    inputs: { analyticalConcentration: 0.01 },
    inputUnits: { analyticalConcentration: "mol/L" },
    expected: 2.0,
    expectedUnit: "pH",
    source:
      "Strong monoprotic acid fully dissociated; NCERT Class XI, Equilibrium (ionic equilibrium)",
    tolerance: ABS_PH,
    toleranceKind: "absolute",
    evaluate: () => strongAcidSolution(0.01).ph,
  },
  {
    id: "REF-AB-002",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description:
      "Very dilute strong acid: pH of 1.0e-8 mol/L HCl ≈ 6.978 (water autoionization matters)",
    inputs: { analyticalConcentration: 1e-8 },
    inputUnits: { analyticalConcentration: "mol/L" },
    expected: 6.9783,
    expectedUnit: "pH",
    source:
      "Exact solution of [H⁺]² − c·[H⁺] − K_w = 0 (self-derived); standard textbook treatment of dilute strong acids (e.g. Brown & LeMay, Chemistry: The Central Science, 14th ed., Chapter 16). Value independently reproducible.",
    tolerance: 1e-3,
    toleranceKind: "absolute",
    evaluate: () => strongAcidSolution(1e-8).ph,
  },
  {
    id: "REF-AB-003",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description: "Pure water (c = 0): pH = 7.000 at K_w = 1e-14",
    inputs: { analyticalConcentration: 0 },
    inputUnits: { analyticalConcentration: "mol/L" },
    expected: 7.0,
    expectedUnit: "pH",
    source: "K_w = 1.0e-14 → pK_w = 14.00; neutrality where [H⁺] = [OH⁻] = √K_w",
    tolerance: ABS_PH,
    toleranceKind: "absolute",
    evaluate: () => strongAcidSolution(0).ph,
  },
  {
    id: "REF-AB-004",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description: "Strong base: pH of 0.010 mol/L NaOH = 12.00",
    inputs: { analyticalConcentration: 0.01 },
    inputUnits: { analyticalConcentration: "mol/L" },
    expected: 12.0,
    expectedUnit: "pH",
    source:
      "Strong base fully dissociated; pOH = 2.00; pH = pK_w − pOH (NCERT Class XI, Equilibrium)",
    tolerance: ABS_PH,
    toleranceKind: "absolute",
    evaluate: () => strongBaseSolution(0.01).ph,
  },
  {
    id: "REF-AB-005",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description: "Diprotic strong base: pH of 0.020 mol/L Ca(OH)₂ (fully dissociated) ≈ 12.60",
    inputs: { analyticalConcentration: 0.02, equivalents: 2 },
    inputUnits: { analyticalConcentration: "mol/L", equivalents: "mol OH⁻ per mol" },
    expected: 12.602,
    expectedUnit: "pH",
    source:
      "Full dissociation assumption for Ca(OH)₂ in dilute solution (introductory chemistry convention, NCERT Class XI)",
    tolerance: 1e-3,
    toleranceKind: "absolute",
    evaluate: () => strongBaseSolution(0.02, 2).ph,
  },
  {
    id: "REF-AB-006",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description: "Weak acid: pH of 0.100 mol/L acetic acid, K_a = 1.8e-5 → 2.875 (exact quadratic)",
    inputs: { analyticalConcentration: 0.1, ka: 1.8e-5 },
    inputUnits: { analyticalConcentration: "mol/L", ka: "mol/L" },
    expected: 2.8753,
    expectedUnit: "pH",
    source:
      "K_a(CH₃COOH) = 1.8×10⁻⁵ (NCERT Class XI, Equilibrium); exact solution of x² + K_a·x − K_a·C = 0",
    tolerance: 1e-3,
    toleranceKind: "absolute",
    evaluate: () => weakAcidSolution(0.1, 1.8e-5).ph,
  },
  {
    id: "REF-AB-007",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description: "Weak base: pH of 0.100 mol/L NH₃, K_b = 1.8e-5 → 11.12 (exact quadratic)",
    inputs: { analyticalConcentration: 0.1, kb: 1.8e-5 },
    inputUnits: { analyticalConcentration: "mol/L", kb: "mol/L" },
    expected: 11.125,
    expectedUnit: "pH",
    source:
      "K_b(NH₃/NH₄OH) = 1.8×10⁻⁵ (NCERT Class XI, Equilibrium); exact solution of x² + K_b·x − K_b·C = 0; pH = pK_w − pOH",
    tolerance: 1e-3,
    toleranceKind: "absolute",
    evaluate: () => weakBaseSolution(0.1, 1.8e-5).ph,
  },
  {
    id: "REF-AB-008",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description: "pH + pOH = 14.00 at 25 °C (K_w = 1e-14): pH(pOH = 2) = 12.00",
    inputs: { poh: 2 },
    inputUnits: { poh: "pOH" },
    expected: 12.0,
    expectedUnit: "pH",
    source: "Definition pK_w = pH + pOH with the conventional 25 °C K_w",
    tolerance: ABS_PH,
    toleranceKind: "absolute",
    evaluate: () => phFromPoh(2),
  },
  {
    id: "REF-AB-009",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description: "Neutral pH under the K_w = 1e-14 convention: 7.000",
    inputs: {},
    inputUnits: {},
    expected: 7.0,
    expectedUnit: "pH",
    source: "[H⁺] = [OH⁻] = √K_w at neutrality",
    tolerance: ABS_PH,
    toleranceKind: "absolute",
    evaluate: () => neutralPh(),
  },
  {
    id: "REF-AB-010",
    modelId: "acid-base",
    modelVersion: "1.0.0",
    description: "Round trip: pH 3.00 → [H⁺] = 1.0e-3 mol/L → pH 3.00",
    inputs: { ph: 3 },
    inputUnits: { ph: "pH" },
    expected: 3.0,
    expectedUnit: "pH",
    source: "Definition pH = −log₁₀[H⁺]",
    tolerance: 1e-12,
    toleranceKind: "absolute",
    evaluate: () => phFromHydrogenConcentration(hydrogenConcentrationFromPh(3)),
  },
];

/** Executes a reference case and returns the model output. */
export function evaluateReferenceCase(referenceCase: ReferenceCase): number {
  return referenceCase.evaluate();
}
