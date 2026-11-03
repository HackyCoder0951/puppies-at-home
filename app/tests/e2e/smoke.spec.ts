import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const count = (page: import('@playwright/test').Page) => page.locator('[aria-live=polite]').first();

test('home renders with navigation and a single h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Premium teacup');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await expect(page.locator('.tp-door')).toHaveCount(16); // 15 puppies and the "Meet them all" door
});

test('filter chips narrow the list, update the URL and clear', async ({ page }) => {
  await page.goto('/puppies');
  await expect(count(page)).toHaveText('15 puppies looking for a home');
  await page.getByRole('button', { name: 'Shih Tzu', exact: true }).click();
  await expect(page).toHaveURL(/breed=shih-tzu/);
  await expect(count(page)).toHaveText('2 puppies match');
  await page.getByRole('button', { name: 'Everywhere' }).click();
  await page.getByRole('button', { name: 'Shih Tzu', exact: true }).click();
  await expect(count(page)).toHaveText('15 puppies looking for a home');
});

test('puppy detail shows facts and neighbours; unknown slug is a 404', async ({ page }) => {
  await page.goto('/puppies/maltipoo-max-male');
  await expect(page.getByRole('heading', { level: 1, name: 'Max' })).toBeVisible();
  await expect(page.getByText('Previous pup')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ask about Max on WhatsApp' })).toBeVisible();
  const res = await page.goto('/puppies/not-a-puppy');
  expect(res?.status()).toBe(404);
});

test('contact letter validates, then posts', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Post my letter' }).click();
  await expect(page.locator('.tp-letterform__alert')).toBeVisible();
  await page.getByLabel('Your name (required)').fill('Sam Test');
  await page.getByLabel(/Phone or WhatsApp/).fill('+971501234567');
  await page.waitForTimeout(2100);
  await page.getByRole('button', { name: 'Post my letter' }).click();
  await expect(page.getByText('Message received!')).toBeVisible({ timeout: 8000 });
});

test('FAQ search filters notes and accordion toggles', async ({ page }) => {
  await page.goto('/faq');
  await page.getByRole('searchbox').fill('deliver');
  await expect(page.locator('.tp-notes__count')).toHaveText('1 note on the board');
  const q = page.getByRole('button', { name: /Do you deliver/ });
  await q.click();
  await expect(q).toHaveAttribute('aria-expanded', 'true');
});

test('mobile menu opens as a dialog', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeVisible();
});

test('family photo wall opens the viewer', async ({ page }) => {
  await page.goto('/happy-families');
  await page.getByRole('button', { name: /Open photo 1 of 64/ }).click();
  await expect(page.getByRole('dialog', { name: 'Photo viewer' })).toBeVisible();
});

test('robots and sitemap exist', async ({ request }) => {
  expect((await request.get('/robots.txt')).ok()).toBeTruthy();
  const sm = await (await request.get('/sitemap.xml')).text();
  expect(sm).toContain('/puppies/maltipoo-max-male');
});

test('assistant (mock mode): opens on request, answers from the site facts, hands over for prices, closes with Escape', async ({ page }) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: /Ask Teddy/ });
  test.skip(!(await launcher.count()), 'assistant is switched off (ASSISTANT_ENABLED)');
  await expect(page.getByRole('dialog')).toHaveCount(0);   // never opens by itself
  await launcher.click();
  const panel = page.getByRole('dialog', { name: /Teddy/ });
  await expect(panel).toBeVisible();
  await expect(panel.getByText(/AI assistant/).first()).toBeVisible();
  await panel.getByLabel('Your message').fill('Do you have a girl Maltipoo?');
  await panel.getByRole('button', { name: 'Send' }).click();
  await expect(panel.getByText(/available/).first()).toBeVisible({ timeout: 15_000 });
  await expect(panel.locator('a.tp-ast-card').first()).toHaveAttribute('href', /^\/puppies\//);
  const rated = page.waitForResponse((r) => r.url().endsWith('/api/assistant/feedback') && r.request().method() === 'POST');
  await panel.getByRole('button', { name: 'Helpful' }).first().click();
  expect((await rated).status()).toBe(204);
  await panel.getByLabel('Your message').fill('How much is a Pomeranian?');
  await panel.getByRole('button', { name: 'Send' }).click();
  await expect(panel.getByText(/costs/).first()).toBeVisible({ timeout: 15_000 });
  await expect(panel.getByRole('link', { name: 'WhatsApp the team' }).last()).toHaveAttribute('href', /wa\.me/);
  const serious = (await new AxeBuilder({ page }).include('.tp-ast-panel').analyze()).violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();
});

test('assistant at phone width fits the screen above the contact bar', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  const launcher = page.getByRole('button', { name: /Ask Teddy/ });
  test.skip(!(await launcher.count()), 'assistant is switched off (ASSISTANT_ENABLED)');
  await launcher.click();
  await page.waitForTimeout(400);   // let the opening animation finish
  const box = await page.getByRole('dialog').boundingBox();
  expect(box && box.x >= 0 && box.x + box.width <= 320).toBe(true);
  const bar = await page.locator('[data-whatsapp-bar]').boundingBox();
  expect(box && bar && box.y + box.height <= bar.y + 1).toBe(true);
});

test('assistant keeps the chat across pages in this tab and can delete it', async ({ page }) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: /Ask Teddy/ });
  test.skip(!(await launcher.count()), 'assistant is switched off (ASSISTANT_ENABLED)');
  await launcher.click();
  await page.getByLabel('Your message').fill('Show me Pomeranian puppies');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByRole('dialog').getByText(/available/).first()).toBeVisible({ timeout: 15_000 });
  await page.goto('/faq');
  await page.getByRole('button', { name: /Ask Teddy/ }).click();
  await expect(page.getByRole('dialog').getByText('Show me Pomeranian puppies')).toBeVisible();
  const forgot = page.waitForResponse((r) => r.url().endsWith('/api/assistant/forget'));
  await page.getByRole('button', { name: 'Delete this chat' }).click();
  expect((await forgot).status()).toBe(204);
  await expect(page.getByRole('dialog').getByText('Show me Pomeranian puppies')).toHaveCount(0);
  await page.goto('/');
  await page.getByRole('button', { name: /Ask Teddy/ }).click();
  await expect(page.getByRole('dialog').getByText('Show me Pomeranian puppies')).toHaveCount(0);
});

test('assistant: the message list scrolls with the mouse wheel and the box can be made bigger and smaller', async ({ page }) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: /Ask Teddy/ });
  test.skip(!(await launcher.count()), 'assistant is switched off (ASSISTANT_ENABLED)');
  await launcher.click();
  const panel = page.getByRole('dialog', { name: /Teddy/ });
  for (const q of ['Show me Maltipoo puppies', 'Show me Pomeranian puppies']) {
    await panel.getByLabel('Your message').fill(q);
    await panel.getByRole('button', { name: 'Send' }).click();
    await expect(panel.locator('a.tp-ast-card').first()).toBeVisible({ timeout: 15_000 });
    await expect(panel.getByRole('button', { name: 'Send' })).toBeDisabled();   // cleared draft re-enables only after typing
  }
  const log = panel.getByRole('log');
  expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  const pageY = await page.evaluate(() => window.scrollY);
  await log.evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await log.hover();
  await page.mouse.wheel(0, -300);
  await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBeLessThan(await log.evaluate((el) => el.scrollHeight - el.clientHeight));
  expect(await page.evaluate(() => window.scrollY)).toBe(pageY);   // the page behind did not move
  const small = (await panel.boundingBox())!;
  await panel.getByRole('button', { name: 'Make chat bigger' }).click();
  await page.waitForTimeout(300);
  const big = (await panel.boundingBox())!;
  expect(big.width).toBeGreaterThan(small.width + 40);
  expect(big.height).toBeGreaterThan(small.height + 40);
  await panel.getByRole('button', { name: 'Make chat smaller' }).click();
  await page.waitForTimeout(300);
  expect((await panel.boundingBox())!.width).toBeLessThan(big.width);
});
