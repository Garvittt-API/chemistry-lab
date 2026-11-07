/**
 * Input sanitization, safe HTML/CSV escaping and filename validation utilities
 * for Phase 07 notebook entries, imports and report exports.
 */

/** Maximum size (1 MiB) accepted when importing a JSON notebook session. */
export const MAX_IMPORT_JSON_BYTES = 1_048_576;

const WINDOWS_RESERVED_BASENAMES = new Set([
  "con",
  "prn",
  "aux",
  "nul",
  "com1",
  "com2",
  "com3",
  "com4",
  "com5",
  "com6",
  "com7",
  "com8",
  "com9",
  "lpt1",
  "lpt2",
  "lpt3",
  "lpt4",
  "lpt5",
  "lpt6",
  "lpt7",
  "lpt8",
  "lpt9",
]);

function stripControlChars(input: string): string {
  const normalized = input.replace(/\r\n?/g, "\n");
  let out = "";
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    if (code === 0x09 || code === 0x0a || (code >= 0x20 && code !== 0x7f)) {
      out += normalized[i]!;
    }
  }
  return out;
}

/**
 * Strip NUL and non-printing ASCII control characters (preserving `\n` and `\t`),
 * normalize CRLF line endings, trim whitespace and enforce a character bound.
 */
export function sanitizeUserText(input: string, maxLength = 4000): string {
  const cleaned = stripControlChars(input).trim();
  if (cleaned.length <= maxLength) {
    return cleaned;
  }
  return cleaned.slice(0, maxLength).trimEnd();
}

/**
 * Escape arbitrary text for safe interpolation into HTML element bodies and
 * double/single-quoted attribute values.
 */
export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const PLAIN_SIGNED_NUMBER_RE = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

/**
 * Format a single CSV cell according to RFC 4180 while neutralizing spreadsheet
 * formula injection (`=`, `+`, `-`, `@`, leading tab/CR) on non-numeric strings.
 */
export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  let text = stripControlChars(value);
  const trimmedLeading = text.trimStart();
  const firstTrigger = trimmedLeading[0];
  if (
    (firstTrigger === "=" ||
      firstTrigger === "+" ||
      firstTrigger === "-" ||
      firstTrigger === "@" ||
      text.startsWith("\t")) &&
    !PLAIN_SIGNED_NUMBER_RE.test(text.trim())
  ) {
    text = `'${text}`;
  }

  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export type SupportedExportExtension = "pdf" | "html" | "csv" | "json";

/**
 * Produce a traversal-safe, OS-portable download filename with an explicit extension.
 */
export function sanitizeExportFilename(
  rawBaseName: string,
  extension: SupportedExportExtension,
): string {
  const withoutControls = rawBaseName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[/\\]+/g, "-")
    .replace(/\.\.+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-._]+|[-._]+$/g, "")
    .toLowerCase();

  let base = withoutControls.slice(0, 72).replace(/[-._]+$/g, "");
  if (base.length === 0 || WINDOWS_RESERVED_BASENAMES.has(base)) {
    base = "practical-report";
  }
  // Strip duplicate extension if caller passed one
  const extSuffix = `.${extension}`;
  if (base.endsWith(extSuffix)) {
    base = base.slice(0, -extSuffix.length) || "practical-report";
  }
  if (WINDOWS_RESERVED_BASENAMES.has(base)) {
    base = `vcl-${base}`;
  }
  return `${base}.${extension}`;
}
