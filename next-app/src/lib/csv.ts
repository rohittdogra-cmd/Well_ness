/**
 * RFC 4180 CSV, small enough to read in one sitting.
 *
 * The booking export previously joined fields with `,` and formatted dates
 * with `toLocaleString()`. That emits "11/03/2026, 09:00:00", so the comma in
 * the date landed inside a field and shifted every column after it.
 */

/** Quotes a field only when it needs it, doubling any embedded quotes. */
export function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Neutralises spreadsheet formula injection.
 *
 * A cell starting with = + - @ or a control character is executed as a formula
 * when the file is opened. Prefixing a single quote makes it text, which is
 * how Excel/LibreOffice/Sheets all expect it escaped.
 */
export function csvSafe(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

export function csvRow(cells: readonly unknown[]): string {
  return cells.map((cell) => csvCell(csvSafe(cell))).join(",");
}

export function csvDocument(rows: readonly (readonly unknown[])[]): string {
  // A leading BOM makes Excel read the file as UTF-8 rather than the local
  // codepage, which mangles the accented names in the data.
  return `﻿${rows.map(csvRow).join("\r\n")}\r\n`;
}

/** Triggers a download in the browser. Returns the object URL for tests. */
export function downloadCsv(filename: string, contents: string): string {
  const url = URL.createObjectURL(
    new Blob([contents], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return url;
}
