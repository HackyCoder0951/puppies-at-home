/** Prints section offsets of the reference and our build for one page: node tests/visual/rects.mjs /path [width] */
import { chromium } from '@playwright/test';
const path = process.argv[2] ?? '/';
const width = Number(process.argv[3] ?? 1440);
const browser = await chromium.launch();
async function rects(base) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => [...document.querySelectorAll('main section, main header, footer, main > div > div')].map((e) => ({ k: (e.tagName + '.' + String(e.className).split(' ').filter((c) => c.startsWith('tp-')).join('.')).slice(0, 40), y: Math.round(e.getBoundingClientRect().top + scrollY), h: Math.round(e.getBoundingClientRect().height) })));
  await ctx.close();
  return r;
}
const a = await rects('https://puppy.instabizweb.com');
const b = await rects('http://localhost:3200');
const n = Math.max(a.length, b.length);
for (let i = 0; i < n; i++) console.log(String(a[i]?.k ?? '').padEnd(42), String(a[i]?.y ?? '').padStart(6), String(a[i]?.h ?? '').padStart(6), ' | ', String(b[i]?.k ?? '').padEnd(42), String(b[i]?.y ?? '').padStart(6), String(b[i]?.h ?? '').padStart(6), (a[i] && b[i] && a[i].h !== b[i].h) ? ` <-- ${b[i].h - a[i].h}` : '');
await browser.close();
