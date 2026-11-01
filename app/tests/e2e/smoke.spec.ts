import { expect, test } from '@playwright/test';

const count = (page: import('@playwright/test').Page) => page.locator('[aria-live=polite]').first();

test('home renders with navigation and a single h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Premium teacup');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
  await expect(page.locator('.tp-door')).toHaveCount(15);
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
