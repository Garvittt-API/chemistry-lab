/**
 * Equipment type catalog and constraints for the 2D laboratory.
 *
 * Equipment definitions are DATA only. They describe what an item is, how
 * much it can hold, how it is labelled, and which operations it supports.
 * Scientific calculations live in simulation-core; this module never computes
 * chemistry — it only provides the parameters that the rendering layer needs
 * to draw the item and the procedure engine needs to validate actions.
 *
 * Capacity and precision values here are typical school-laboratory
 * specifications, not fabricated instrument behaviour. Where a manufacturer
 * would specify Class A tolerance for volumetric glassware we record a
 * conservative educational-use tolerance only when the model meaningfully
 * depends on it.
 */

/** Equipment family categorisation — controls rendering and interaction affordances. */
export type EquipmentCategory =
  | "beaker"
  | "test_tube"
  | "conical_flask"
  | "volumetric_flask"
  | "measuring_cylinder"
  | "watch_glass"
  | "funnel"
  | "pipette"
  | "burette"
  | "dropper"
  | "spatula"
  | "glass_rod"
  | "wash_bottle"
  | "balance"
  | "thermometer"
  | "ph_meter"
  | "timer"
  | "bunsen_burner"
  | "heating_plate"
  | "stand_clamp"
  | "container";

/** Operations a piece of equipment can participate in. */
export type EquipmentOperation =
  | "hold_liquid"
  | "hold_solid"
  | "measure_volume"
  | "measure_mass"
  | "measure_temperature"
  | "measure_ph"
  | "deliver_liquid" // burette/pipette: can deliver a measured volume out
  | "transfer_liquid_drop" // dropper
  | "transfer_solid" // spatula
  | "stir"
  | "heat"
  | "support";

/** A concrete equipment specification (e.g. "100 mL glass beaker"). */
export interface EquipmentDefinition {
  /** Stable identifier. */
  readonly id: string;
  /** Human-readable label, e.g. "100 mL beaker". */
  readonly label: string;
  /** Accessibility label — used for aria-label and screen readers. */
  readonly accessibilityLabel: string;
  readonly category: EquipmentCategory;
  /** Which operations the item supports. */
  readonly supportedOperations: ReadonlyArray<EquipmentOperation>;
  /**
   * Nominal capacity in mL. For instruments that do not hold liquid
   * (balances, thermometers, etc.) this is undefined.
   */
  readonly capacityMl?: number;
  /**
   * Smallest marked graduation in mL (volumetric glassware). Undefined for
   * items without graduations.
   */
  readonly graduationMl?: number;
  /**
   * Display tolerance for volumetric readings — used to decide how many
   * decimal places to show. This is a nominal educational-use tolerance; it
   * is NOT a calibrated instrument specification.
   */
  readonly toleranceMl?: number;
  /** Height for 2D layout (SVG units). */
  readonly visualHeight: number;
  /** Width for 2D layout (SVG units). */
  readonly visualWidth: number;
}

/** Catalog of every equipment type the 2D lab knows about. */
export const EQUIPMENT_CATALOG: ReadonlyMap<string, EquipmentDefinition> = new Map<
  string,
  EquipmentDefinition
>([
  // Glassware -----------------------------------------------------------
  [
    "beaker-100",
    {
      id: "beaker-100",
      label: "100 mL beaker",
      accessibilityLabel: "100 milliliter glass beaker",
      category: "beaker",
      supportedOperations: ["hold_liquid", "hold_solid", "stir"],
      capacityMl: 100,
      graduationMl: 10,
      visualHeight: 110,
      visualWidth: 70,
    },
  ],
  [
    "beaker-250",
    {
      id: "beaker-250",
      label: "250 mL beaker",
      accessibilityLabel: "250 milliliter glass beaker",
      category: "beaker",
      supportedOperations: ["hold_liquid", "hold_solid", "stir"],
      capacityMl: 250,
      graduationMl: 25,
      visualHeight: 130,
      visualWidth: 85,
    },
  ],
  [
    "test-tube",
    {
      id: "test-tube",
      label: "Test tube",
      accessibilityLabel: "Glass test tube",
      category: "test_tube",
      supportedOperations: ["hold_liquid"],
      capacityMl: 25,
      graduationMl: 1,
      visualHeight: 140,
      visualWidth: 24,
    },
  ],
  [
    "conical-flask-250",
    {
      id: "conical-flask-250",
      label: "250 mL conical flask",
      accessibilityLabel: "250 milliliter conical flask (Erlenmeyer)",
      category: "conical_flask",
      supportedOperations: ["hold_liquid", "stir"],
      capacityMl: 250,
      graduationMl: 25,
      visualHeight: 140,
      visualWidth: 90,
    },
  ],
  [
    "volumetric-flask-100",
    {
      id: "volumetric-flask-100",
      label: "100 mL volumetric flask",
      accessibilityLabel: "100 milliliter Class B volumetric flask",
      category: "volumetric_flask",
      supportedOperations: ["hold_liquid", "measure_volume"],
      capacityMl: 100,
      toleranceMl: 0.16,
      visualHeight: 170,
      visualWidth: 80,
    },
  ],
  [
    "measuring-cylinder-10",
    {
      id: "measuring-cylinder-10",
      label: "10 mL measuring cylinder",
      accessibilityLabel: "10 milliliter measuring cylinder",
      category: "measuring_cylinder",
      supportedOperations: ["hold_liquid", "measure_volume"],
      capacityMl: 10,
      graduationMl: 0.2,
      toleranceMl: 0.1,
      visualHeight: 150,
      visualWidth: 24,
    },
  ],
  [
    "measuring-cylinder-100",
    {
      id: "measuring-cylinder-100",
      label: "100 mL measuring cylinder",
      accessibilityLabel: "100 milliliter measuring cylinder",
      category: "measuring_cylinder",
      supportedOperations: ["hold_liquid", "measure_volume"],
      capacityMl: 100,
      graduationMl: 1,
      toleranceMl: 0.5,
      visualHeight: 190,
      visualWidth: 38,
    },
  ],
  [
    "pipette-10",
    {
      id: "pipette-10",
      label: "10 mL pipette",
      accessibilityLabel: "10 milliliter volumetric pipette",
      category: "pipette",
      supportedOperations: ["deliver_liquid", "measure_volume"],
      capacityMl: 10,
      toleranceMl: 0.02,
      visualHeight: 220,
      visualWidth: 20,
    },
  ],
  [
    "burette-50",
    {
      id: "burette-50",
      label: "50 mL burette",
      accessibilityLabel: "50 milliliter burette with stopcock",
      category: "burette",
      supportedOperations: ["deliver_liquid", "measure_volume"],
      capacityMl: 50,
      graduationMl: 0.1,
      toleranceMl: 0.05,
      visualHeight: 280,
      visualWidth: 22,
    },
  ],
  [
    "dropper",
    {
      id: "dropper",
      label: "Dropper (Pasteur pipette)",
      accessibilityLabel: "Glass dropper for drop-wise transfer",
      category: "dropper",
      supportedOperations: ["transfer_liquid_drop"],
      visualHeight: 110,
      visualWidth: 18,
    },
  ],
  [
    "funnel",
    {
      id: "funnel",
      label: "Filter funnel",
      accessibilityLabel: "Glass filter funnel",
      category: "funnel",
      supportedOperations: ["support"],
      visualHeight: 90,
      visualWidth: 60,
    },
  ],
  [
    "watch-glass",
    {
      id: "watch-glass",
      label: "Watch glass",
      accessibilityLabel: "Glass watch glass",
      category: "watch_glass",
      supportedOperations: ["hold_solid"],
      visualHeight: 12,
      visualWidth: 70,
    },
  ],
  // Instruments --------------------------------------------------------
  [
    "ph-meter",
    {
      id: "ph-meter",
      label: "pH meter",
      accessibilityLabel: "Bench pH meter with electrode",
      category: "ph_meter",
      supportedOperations: ["measure_ph"],
      visualHeight: 90,
      visualWidth: 90,
    },
  ],
  [
    "digital-balance",
    {
      id: "digital-balance",
      label: "Digital balance",
      accessibilityLabel: "Two-decimal-place digital balance",
      category: "balance",
      supportedOperations: ["measure_mass"],
      visualHeight: 60,
      visualWidth: 110,
    },
  ],
  [
    "thermometer",
    {
      id: "thermometer",
      label: "Thermometer",
      accessibilityLabel: "0–110 °C laboratory thermometer",
      category: "thermometer",
      supportedOperations: ["measure_temperature"],
      visualHeight: 200,
      visualWidth: 12,
    },
  ],
  // Tools --------------------------------------------------------------
  [
    "glass-rod",
    {
      id: "glass-rod",
      label: "Glass rod",
      accessibilityLabel: "Glass stirring rod",
      category: "glass_rod",
      supportedOperations: ["stir"],
      visualHeight: 180,
      visualWidth: 6,
    },
  ],
  [
    "spatula",
    {
      id: "spatula",
      label: "Spatula",
      accessibilityLabel: "Stainless steel spatula",
      category: "spatula",
      supportedOperations: ["transfer_solid"],
      visualHeight: 160,
      visualWidth: 10,
    },
  ],
  [
    "wash-bottle",
    {
      id: "wash-bottle",
      label: "Wash bottle (distilled water)",
      accessibilityLabel: "Wash bottle with distilled water",
      category: "wash_bottle",
      supportedOperations: ["deliver_liquid"],
      capacityMl: 500,
      visualHeight: 140,
      visualWidth: 60,
    },
  ],
]);

/** Look up an equipment definition by id; throws if unknown. */
export function getEquipment(id: string): EquipmentDefinition {
  const def = EQUIPMENT_CATALOG.get(id);
  if (!def) {
    throw new Error(`Unknown equipment id "${id}"`);
  }
  return def;
}

/** Returns true if `item` supports every operation in `ops`. */
export function supportsAllOperations(
  item: EquipmentDefinition,
  ops: ReadonlyArray<EquipmentOperation>,
): boolean {
  return ops.every((op) => item.supportedOperations.includes(op));
}

/**
 * How many decimal places to display for a volume reading on the given
 * glassware. This is a display convention, NOT a real calibration
 * uncertainty budget.
 */
export function volumeDisplayDecimals(item: EquipmentDefinition): number {
  if (item.toleranceMl !== undefined) {
    // Show one decimal beyond the nominal tolerance.
    if (item.toleranceMl >= 1) return 0;
    if (item.toleranceMl >= 0.1) return 1;
    return 2;
  }
  if (item.graduationMl !== undefined) {
    if (item.graduationMl >= 1) return 0;
    if (item.graduationMl >= 0.1) return 1;
    return 2;
  }
  return 0;
}

/** Returns true when the equipment is volumetric glassware (shows graduation marks). */
export function hasGraduations(item: EquipmentDefinition): boolean {
  return item.graduationMl !== undefined;
}
