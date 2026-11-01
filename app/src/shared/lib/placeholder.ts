/** Deterministic SVG placeholder as a data URL: tone colour, size and a short label (decision D13). */
export function placeholderSrc(opts: { width: number; height: number; color: string; label?: string }): string {
  const { width, height, color, label = '' } = opts;
  const esc = label.replace(/[<>&"]/g, '');
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
    `<rect width="100%" height="100%" fill="${color}"/>` +
    `<circle cx="${width / 2}" cy="${height * 0.45}" r="${Math.min(width, height) * 0.18}" fill="rgb(255 255 255 / .35)"/>` +
    `<text x="50%" y="${height * 0.82}" text-anchor="middle" font-family="sans-serif" font-size="${Math.max(12, Math.min(width, height) * 0.06)}" fill="rgb(42 23 14 / .6)">${esc}</text>` +
    `</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
