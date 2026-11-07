/**
 * Formatting helpers for measurement display.
 *
 * The lab UI uses these to present numbers consistently with the precision
 * implied by the instrument/model. Formatting NEVER changes the value; it
 * only controls string representation.
 */

/**
 * Format a floating value to `significantDigits` significant figures.
 *
 * Returns "" for null/undefined/NaN so the UI can render "—".
 */
export function formatSignificantFigures(
  value: number | null | undefined,
  significantDigits: number,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  if (significantDigits < 1) throw new Error("significantDigits must be >= 1");
  if (value === 0)
    return "0" + (significantDigits > 1 ? "." + "0".repeat(significantDigits - 1) : "");
  const magnitude = Math.floor(Math.log10(Math.abs(value)));
  const decimalPlaces = Math.max(0, significantDigits - 1 - magnitude);
  return value.toFixed(decimalPlaces);
}

/** Format to fixed decimal places; returns "" for invalid input. */
export function formatDecimal(value: number | null | undefined, decimalPlaces: number): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "";
  return value.toFixed(decimalPlaces);
}

/** Format a concentration (mol/L) with reasonable default precision. */
export function formatConcentration(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value >= 10) return formatSignificantFigures(value, 3);
  if (value >= 1) return formatSignificantFigures(value, 3);
  if (value >= 0.01) return formatSignificantFigures(value, 3);
  return formatSignificantFigures(value, 2);
}

/** Format pH (two decimal places by convention for educational meters). */
export function formatPh(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return formatDecimal(value, 2);
}

/** Format volume in mL with specified decimal places. */
export function formatVolumeMl(volumeMl: number | null, decimals = 1): string {
  if (volumeMl === null || !Number.isFinite(volumeMl)) return "—";
  return formatDecimal(volumeMl, decimals);
}

/** Format a unit/value pair: "1.23 mol/L". */
export function formatMeasurement(
  value: number | null,
  unit: string,
  formatter: (v: number | null) => string,
): string {
  const formatted = formatter(value);
  if (formatted === "—" || formatted === "") return `— ${unit}`;
  return `${formatted} ${unit}`;
}
