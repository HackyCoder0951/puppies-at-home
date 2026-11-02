export function formatMoney(minor: number, currency = 'AED'): string {
  const value = minor / 100;
  return `${currency} ${value.toLocaleString('en-GB', { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })}`;
}
