/**
 * Centrally managed registry of physical constants.
 *
 * Every entry records identifier, symbol, value, unit, provenance (source and
 * reference), a registry version and the applicable precision. Exact SI
 * defining constants are marked as exact; CODATA measured values carry their
 * CODATA 2018 relative standard uncertainty. Nothing in this file is invented:
 * values come from the SI Brochure (9th ed.) or CODATA 2018.
 *
 * Registry version: bump CONSTANTS_REGISTRY_VERSION whenever any entry
 * changes. Models record which registry version they were verified against.
 *
 * Constants are deliberately keyed by stable identifiers; call sites must not
 * embed bare numeric literals for these quantities.
 */

import { UnknownConstantError } from "./errors.js";

export const CONSTANTS_REGISTRY_VERSION = "1.0.0";

export type ConstantPrecision =
  | { readonly kind: "exact"; readonly note: string }
  | {
      readonly kind: "measured";
      /** Relative standard uncertainty (1σ) as reported by the source. */
      readonly relativeStandardUncertainty: number;
      readonly note: string;
    };

export interface ConstantSource {
  readonly name: string;
  readonly reference: string;
  readonly doi?: string;
  readonly url?: string;
}

export interface PhysicalConstant {
  readonly id: string;
  readonly symbol: string;
  readonly value: number;
  /** Display unit symbol; every constant also documents its dimension. */
  readonly unit: string;
  readonly dimension: string;
  readonly precision: ConstantPrecision;
  readonly source: ConstantSource;
  /** Conditions under which the value applies, if any. */
  readonly conditions: string;
}

const SI_BROCHURE: ConstantSource = {
  name: "SI Brochure, 9th edition",
  reference:
    "Bureau International des Poids et Mesures (BIPM), The International System of Units (SI Brochure), 9th ed., BIPM, 2019, §2.1",
  url: "https://www.bipm.org/en/publications/si-brochure",
};

const CODATA_2018: ConstantSource = {
  name: "CODATA 2018",
  reference:
    "Tiesinga, E., Mohr, P. J., Newell, D. B., Taylor, B. N., CODATA Recommended Values of the Fundamental Physical Constants: 2018, Reviews of Modern Physics 93, 025010 (2021)",
  doi: "10.1103/RevModPhys.93.025010",
  url: "https://physics.nist.gov/cuu/Constants/",
};

const CRC_104: ConstantSource = {
  name: "CRC Handbook of Chemistry and Physics, 104th ed.",
  reference:
    "Haynes, W. M. (ed.), CRC Handbook of Chemistry and Physics, 104th edition, CRC Press (2023): electrolyte/aqueous-solution tables",
};

const CONVENTIONAL: ConstantSource = {
  name: "Conventional definition",
  reference:
    "Exact conventional definition retained for compatibility with education practice (see docs/science/model-catalog.md); not a measured quantity",
};

const CONSTANT_LIST: readonly PhysicalConstant[] = Object.freeze([
  {
    id: "avogadro-constant",
    symbol: "N_A",
    value: 6.02214076e23,
    unit: "mol⁻¹",
    dimension: "amount of substance^-1",
    precision: { kind: "exact", note: "SI defining constant (2019 SI redefinition)" },
    source: SI_BROCHURE,
    conditions: "Exact by definition",
  },
  {
    id: "boltzmann-constant",
    symbol: "k",
    value: 1.380649e-23,
    unit: "J K⁻¹",
    dimension: "energy temperature^-1",
    precision: { kind: "exact", note: "SI defining constant (2019 SI redefinition)" },
    source: SI_BROCHURE,
    conditions: "Exact by definition",
  },
  {
    id: "planck-constant",
    symbol: "h",
    value: 6.62607015e-34,
    unit: "J s",
    dimension: "energy time",
    precision: { kind: "exact", note: "SI defining constant (2019 SI redefinition)" },
    source: SI_BROCHURE,
    conditions: "Exact by definition",
  },
  {
    id: "elementary-charge",
    symbol: "e",
    value: 1.602176634e-19,
    unit: "C",
    dimension: "electric current time",
    precision: { kind: "exact", note: "SI defining constant (2019 SI redefinition)" },
    source: SI_BROCHURE,
    conditions: "Exact by definition",
  },
  {
    id: "speed-of-light",
    symbol: "c",
    value: 299792458,
    unit: "m s⁻¹",
    dimension: "length time^-1",
    precision: { kind: "exact", note: "SI defining constant (2019 SI redefinition)" },
    source: SI_BROCHURE,
    conditions: "Exact by definition",
  },
  {
    id: "faraday-constant",
    symbol: "F",
    value: 9648.533212331001e1, // === N_A × e, shortest round-trip scientific notation
    unit: "C mol⁻¹",
    dimension: "electric current time amount-of-substance^-1",
    precision: {
      kind: "exact",
      note: "Derived exactly as N_A × e from two SI defining constants",
    },
    source: SI_BROCHURE,
    conditions: "Exact by definition",
  },
  {
    id: "molar-gas-constant",
    symbol: "R",
    value: 8.31446261815324,
    unit: "J mol⁻¹ K⁻¹",
    dimension: "energy amount-of-substance^-1 temperature^-1",
    precision: {
      kind: "exact",
      note: "Derived exactly as N_A × k from two SI defining constants",
    },
    source: SI_BROCHURE,
    conditions: "Exact by definition",
  },
  {
    id: "molar-mass-constant",
    symbol: "M_u",
    value: 1e-3,
    unit: "kg mol⁻¹",
    dimension: "mass amount-of-substance^-1",
    precision: { kind: "exact", note: "Exact by SI definition of the mole (2019)" },
    source: SI_BROCHURE,
    conditions: "Exact by definition",
  },
  {
    id: "atomic-mass-constant",
    symbol: "m_u",
    value: 1.6605390666e-27,
    unit: "kg",
    dimension: "mass",
    precision: {
      kind: "measured",
      relativeStandardUncertainty: 3.0e-10,
      note: "CODATA 2018 recommended value; 1/12 of the mass of an unbound neutral carbon-12 atom",
    },
    source: CODATA_2018,
    conditions: "Unbound atom at rest",
  },
  {
    id: "electron-volt",
    symbol: "eV",
    value: 1.602176634e-19,
    unit: "J",
    dimension: "energy",
    precision: { kind: "exact", note: "Exact: energy gained by a charge e through 1 V" },
    source: CONVENTIONAL,
    conditions: "Exact by definition",
  },
  {
    id: "standard-atmosphere",
    symbol: "atm",
    value: 101325,
    unit: "Pa",
    dimension: "pressure",
    precision: { kind: "exact", note: "Exact conventional definition" },
    source: CONVENTIONAL,
    conditions: "Exact by definition",
  },
  {
    id: "standard-gravity",
    symbol: "g_n",
    value: 9.80665,
    unit: "m s⁻²",
    dimension: "length time^-2",
    precision: {
      kind: "exact",
      note: "Exact conventional definition (3rd CGPM, 1901; retained in ISO 80000-3 / IUPAC)",
    },
    source: CONVENTIONAL,
    conditions: "Exact by definition; corresponds to 45° latitude at sea level approximately",
  },
  {
    id: "thermochemical-calorie",
    symbol: "cal_th",
    value: 4.184,
    unit: "J",
    dimension: "energy",
    precision: { kind: "exact", note: "Exact thermochemical convention" },
    source: CONVENTIONAL,
    conditions: "Exact by definition; the International Table calorie (4.1868 J) is NOT used here",
  },
  {
    id: "ion-product-of-water",
    symbol: "K_w",
    value: 1.0e-14,
    unit: "mol² dm⁻⁶",
    dimension: "amount-of-substance^2 length^-6",
    precision: {
      kind: "measured",
      relativeStandardUncertainty: 0.02,
      note: "Conventional value for dilute aqueous solutions near 25 °C; the true value is temperature dependent (pKw ≈ 13.995 at 25 °C). 1e-14 is used as the common education approximation — do not extrapolate to other temperatures or concentrations.",
    },
    source: CRC_104,
    conditions: "Dilute aqueous solutions, 25 °C (approximate)",
  },
  {
    id: "standard-pressure-pa",
    symbol: "p°",
    value: 1e5,
    unit: "Pa",
    dimension: "pressure",
    precision: {
      kind: "exact",
      note: "IUPAC standard state pressure since 1982 (100 kPa), replacing 1 atm",
    },
    source: CONVENTIONAL,
    conditions: "IUPAC standard state pressure",
  },
]);

const CONSTANT_BY_ID: ReadonlyMap<string, PhysicalConstant> = new Map(
  CONSTANT_LIST.map((entry) => [entry.id, entry]),
);

/** Returns the frozen list of registered constants. */
export function listConstants(): readonly PhysicalConstant[] {
  return CONSTANT_LIST;
}

/** Returns the registered constant or throws {@link UnknownConstantError}. */
export function getConstant(constantId: string): PhysicalConstant {
  const found = CONSTANT_BY_ID.get(constantId);
  if (!found) {
    throw new UnknownConstantError(constantId);
  }
  return found;
}

/** Convenience accessor for the numeric value of a registered constant. */
export function constantValue(constantId: string): number {
  return getConstant(constantId).value;
}

/** True when a constant identifier is registered. */
export function isKnownConstant(constantId: string): boolean {
  return CONSTANT_BY_ID.has(constantId);
}
