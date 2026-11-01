/**
 * Side-by-side visual comparison with the live reference site.
 * Usage: node tests/visual/compare.mjs [baseUrl] [pageFilter]   (default http://localhost:3200)
 * Writes screenshots, diff images and report.json to qa/visual (git-ignored).
 */
import { chromium } from '@playwright/test';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const REF = 'https://puppy.instabizweb.com';
const OURS = process.argv[2] ?? 'http://localhost:3200';
const only = process.argv[3];
const PAGES = ['/', '/puppies', '/puppies/maltipoo-max-male', '/puppies/bichon-bailey-boy', '/gone-home', '/happy-families', '/how-it-works', '/faq', '/contact'];
const WIDTHS = [1440, 768, 375];
const out = new URL('../../qa/visual/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

async function shot(browser, base, path, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: 'networkidle' });
  // The consent notice is a deliberate addition (decision D16); HIDE_CONSENT=1 removes it from our side so the rest can be diffed.
  if (base !== REF && process.env.HIDE_CONSENT) await page.addStyleTag({ content: '[data-consent]{display:none!important}' });
  await page.waitForTimeout(1500);
  // load lazy images and reveal-on-scroll content
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(80); }
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(800);
  const buf = await page.screenshot({ fullPage: true });
  await ctx.close();
  return PNG.sync.read(buf);
}

const crop = (png, w, h) => {
  const c = new PNG({ width: w, height: h, fill: true });
  c.data.fill(255);
  PNG.bitblt(png, c, 0, 0, Math.min(w, png.width), Math.min(h, png.height), 0, 0);
  return c;
};

const browser = await chromium.launch();
const rows = [];
for (const path of PAGES.filter((p) => !only || p === only)) {
  for (const width of WIDTHS) {
    const [a, b] = await Promise.all([shot(browser, REF, path, width), shot(browser, OURS, path, width)]);
    const w = Math.max(a.width, b.width);
    const h = Math.max(a.height, b.height);
    const A = crop(a, w, h), B = crop(b, w, h), D = new PNG({ width: w, height: h });
    const diff = pixelmatch(A.data, B.data, D.data, w, h, { threshold: 0.15 });
    const name = `${path === '/' ? 'home' : path.slice(1).replace(/\//g, '_')}-${width}`;
    writeFileSync(`${out}${name}.ref.png`, PNG.sync.write(a));
    writeFileSync(`${out}${name}.ours.png`, PNG.sync.write(b));
    writeFileSync(`${out}${name}.diff.png`, PNG.sync.write(D));
    rows.push({ path, width, refH: a.height, oursH: b.height, mismatchPct: +((diff / (w * h)) * 100).toFixed(2) });
    console.log(path.padEnd(32), String(width).padEnd(5), `h ${a.height}/${b.height}`.padEnd(14), `${rows.at(-1).mismatchPct}%`);
  }
}
writeFileSync(`${out}report.json`, JSON.stringify(rows, null, 2));
await browser.close();
