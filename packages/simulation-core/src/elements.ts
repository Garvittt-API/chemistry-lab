/**
 * Element registry: standard atomic weights of the elements (2021 revision).
 *
 * Values are the CIAAW/IUPAC abridged conventional atomic weights (mass
 * number–like values used in general education), sourced from the IUPAC
 * Technical Report "Standard atomic weights of the elements 2021"
 * (DOI 10.1515/pac-2019-0603, table republished at
 * https://iupac.qmul.ac.uk/AtWt/AtWt21.html). Elements without a standard
 * atomic weight (Tc, Pm, Po, At, Rn, Fr, Ra, Ac and synthesized elements)
 * are deliberately absent: requesting one raises UnknownElementError instead
 * of returning an invented mass.
 *
 * Note on the 2021 interval elements (H, Li, B, C, N, O, Mg, Si, S, Cl,
 * Ar, Tl, Pb): the conventional values used here fall inside the published
 * intervals; Ar uses 39.95 (interval [39.792, 39.963]) and Hf uses 178.486
 * (the 2021 revision, not the older 178.49).
 *
 * Every value carries unit g·mol⁻¹ — numerically identical to the relative
 * atomic mass A_r(E).
 */

import { UnknownElementError } from "./errors.js";

export const ELEMENTS_REGISTRY_VERSION = "2021.1";

export interface ElementDefinition {
  readonly atomicNumber: number;
  readonly symbol: string;
  readonly name: string;
  /** Standard (abridged conventional) atomic weight in g·mol⁻¹. */
  readonly standardAtomicWeight: number;
  /** True when the value is an interval-covered conventional value. */
  readonly isConventionalIntervalValue: boolean;
}

function el(
  atomicNumber: number,
  symbol: string,
  name: string,
  standardAtomicWeight: number,
  isConventionalIntervalValue = false,
): ElementDefinition {
  return Object.freeze({
    atomicNumber,
    symbol,
    name,
    standardAtomicWeight,
    isConventionalIntervalValue,
  });
}

const ELEMENT_LIST: readonly ElementDefinition[] = Object.freeze([
  el(1, "H", "hydrogen", 1.008, true),
  el(2, "He", "helium", 4.0026),
  el(3, "Li", "lithium", 6.94, true),
  el(4, "Be", "beryllium", 9.0122),
  el(5, "B", "boron", 10.81, true),
  el(6, "C", "carbon", 12.011, true),
  el(7, "N", "nitrogen", 14.007, true),
  el(8, "O", "oxygen", 15.999, true),
  el(9, "F", "fluorine", 18.998),
  el(10, "Ne", "neon", 20.18),
  el(11, "Na", "sodium", 22.99),
  el(12, "Mg", "magnesium", 24.305, true),
  el(13, "Al", "aluminium", 26.982),
  el(14, "Si", "silicon", 28.085, true),
  el(15, "P", "phosphorus", 30.974),
  el(16, "S", "sulfur", 32.06, true),
  el(17, "Cl", "chlorine", 35.45, true),
  el(18, "Ar", "argon", 39.95, true),
  el(19, "K", "potassium", 39.098),
  el(20, "Ca", "calcium", 40.078),
  el(21, "Sc", "scandium", 44.956),
  el(22, "Ti", "titanium", 47.867),
  el(23, "V", "vanadium", 50.942),
  el(24, "Cr", "chromium", 51.996),
  el(25, "Mn", "manganese", 54.938),
  el(26, "Fe", "iron", 55.845),
  el(27, "Co", "cobalt", 58.933),
  el(28, "Ni", "nickel", 58.693),
  el(29, "Cu", "copper", 63.546),
  el(30, "Zn", "zinc", 65.38),
  el(31, "Ga", "gallium", 69.723),
  el(32, "Ge", "germanium", 72.63),
  el(33, "As", "arsenic", 74.922),
  el(34, "Se", "selenium", 78.971),
  el(35, "Br", "bromine", 79.904, true),
  el(36, "Kr", "krypton", 83.798),
  el(37, "Rb", "rubidium", 85.468),
  el(38, "Sr", "strontium", 87.62),
  el(39, "Y", "yttrium", 88.906),
  el(40, "Zr", "zirconium", 91.224),
  el(41, "Nb", "niobium", 92.907),
  el(42, "Mo", "molybdenum", 95.95),
  el(44, "Ru", "ruthenium", 101.07),
  el(45, "Rh", "rhodium", 102.906),
  el(46, "Pd", "palladium", 106.42),
  el(47, "Ag", "silver", 107.8682),
  el(48, "Cd", "cadmium", 112.414),
  el(49, "In", "indium", 114.818),
  el(50, "Sn", "tin", 118.71),
  el(51, "Sb", "antimony", 121.76),
  el(52, "Te", "tellurium", 127.6),
  el(53, "I", "iodine", 126.904),
  el(54, "Xe", "xenon", 131.293),
  el(55, "Cs", "caesium", 132.905),
  el(56, "Ba", "barium", 137.327),
  el(57, "La", "lanthanum", 138.905),
  el(58, "Ce", "cerium", 140.116),
  el(59, "Pr", "praseodymium", 140.908),
  el(60, "Nd", "neodymium", 144.242),
  el(62, "Sm", "samarium", 150.36),
  el(63, "Eu", "europium", 151.964),
  el(64, "Gd", "gadolinium", 157.25),
  el(65, "Tb", "terbium", 158.925),
  el(66, "Dy", "dysprosium", 162.5),
  el(67, "Ho", "holmium", 164.93),
  el(68, "Er", "erbium", 167.259),
  el(69, "Tm", "thulium", 168.934),
  el(70, "Yb", "ytterbium", 173.045),
  el(71, "Lu", "lutetium", 174.967),
  el(72, "Hf", "hafnium", 178.486),
  el(73, "Ta", "tantalum", 180.948),
  el(74, "W", "tungsten", 183.84),
  el(75, "Re", "rhenium", 186.207),
  el(76, "Os", "osmium", 190.23),
  el(77, "Ir", "iridium", 192.217),
  el(78, "Pt", "platinum", 195.084),
  el(79, "Au", "gold", 196.967),
  el(80, "Hg", "mercury", 200.592),
  el(81, "Tl", "thallium", 204.38, true),
  el(82, "Pb", "lead", 207.2, true),
  el(83, "Bi", "bismuth", 208.98),
  el(90, "Th", "thorium", 232.038),
  el(91, "Pa", "protactinium", 231.036),
  el(92, "U", "uranium", 238.029),
]);

const ELEMENT_BY_SYMBOL: ReadonlyMap<string, ElementDefinition> = new Map(
  ELEMENT_LIST.map((entry) => [entry.symbol, entry]),
);

/** Returns the frozen list of elements with a standard atomic weight. */
export function listElements(): readonly ElementDefinition[] {
  return ELEMENT_LIST;
}

/**
 * Returns the element for a case-sensitive symbol (e.g. "Na"), or throws
 * {@link UnknownElementError} for unregistered/unweighted symbols.
 * Callers are responsible for normalizing formula tokens ("na" is rejected,
 * not silently fixed).
 */
export function getElementBySymbol(symbol: string): ElementDefinition {
  const found = ELEMENT_BY_SYMBOL.get(symbol);
  if (!found) {
    throw new UnknownElementError(symbol);
  }
  return found;
}

/** True when a symbol has a usable standard atomic weight in the registry. */
export function isKnownElement(symbol: string): boolean {
  return ELEMENT_BY_SYMBOL.has(symbol);
}
