/** Spreadsheet formula injection: a cell that starts with one of these is read as a formula by Excel and Sheets. */
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  let text = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (typeof value === 'string' && FORMULA_START.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return `﻿${[headers.map(csvCell).join(','), ...rows.map((r) => r.map(csvCell).join(','))].join('\r\n')}\r\n`;
}

/** Minor units (fils) as a plain decimal for spreadsheets: 450050 -> 4500.50. */
export const minorToDecimal = (minor: unknown): string => (typeof minor === 'number' || typeof minor === 'string' ? (Number(minor) / 100).toFixed(2) : '');

/** "AED 1,234.50" style display for dashboard figures. */
export const formatMinor = (minor: number, currency = 'AED'): string =>
  `${currency} ${(minor / 100).toLocaleString('en-GB', { minimumFractionDigits: minor % 100 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
