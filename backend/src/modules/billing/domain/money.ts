/** AED text ("4,500.50") to fils; undefined when it is not a valid positive-or-zero amount. */
export function toMinor(text: string): number | undefined {
  const clean = text.replace(/[,\s]/g, '');
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(clean)) return undefined;
  return Math.round(Number(clean) * 100);
}

export function formatMoney(minor: number, currency = 'AED'): string {
  const value = minor / 100;
  return `${currency} ${value.toLocaleString('en-GB', { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })}`;
}

/** 500 -> "5%", 750 -> "7.5%". */
export const formatRate = (bps: number): string => `${Number((bps / 100).toFixed(2))}%`;
