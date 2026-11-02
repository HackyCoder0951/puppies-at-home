/** Default export range: the last 30 days, as ISO dates (server clock). */
export function defaultExportRange(): { from: string; to: string } {
  const now = Date.now();
  return { from: new Date(now - 30 * 86_400_000).toISOString().slice(0, 10), to: new Date(now).toISOString().slice(0, 10) };
}
