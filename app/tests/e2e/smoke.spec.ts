import { expect, test } from '@playwright/test';

test('home renders with navigation and a single h1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Premium teacup puppies');
  await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible();
});

test('filter chips narrow the list and clear', async ({ page }) => {
  await page.goto('/puppies');
  await expect(page.getByRole('status').first()).toContainText('15 puppies looking for a home');
  await page.getByRole('link', { name: 'Shih Tzu', exact: true }).click();
  await expect(page).toHaveURL(/breed=shih-tzu/);
  await expect(page.getByRole('status').first()).toContainText('2 puppies match');
  await page.getByRole('link', { name: 'Clear filters' }).click();
  await expect(page.getByRole('status').first()).toContainText('15 puppies');
});

test('puppy detail shows facts and neighbours; unknown slug is a 404', async ({ page }) => {
  await page.goto('/puppies/maltipoo-max-male');
  await expect(page.getByRole('heading', { level: 1, name: 'Max' })).toBeVisible();
  await expect(page.getByText('Previous puppy')).toBeVisible();
  const res = await page.goto('/puppies/not-a-puppy');
  expect(res?.status()).toBe(404);
});

test('contact form validates, then posts a letter', async ({ page }) => {
  await page.goto('/contact');
  await page.getByRole('button', { name: 'Post my letter' }).click();
  await expect(page.getByText('Please tell us your name.')).toBeVisible();
  await page.getByLabel('Your name').fill('Sam Test');
  await page.getByLabel(/Phone/).fill('+971501234567');
  await page.waitForTimeout(2100);
  await page.getByRole('button', { name: 'Post my letter' }).click();
  await expect(page.getByText('Your letter is posted')).toBeVisible();
});

test('FAQ search filters notes and accordion toggles', async ({ page }) => {
  await page.goto('/faq');
  await page.getByLabel('Sniff out a question').fill('deliver');
  await expect(page.getByRole('status')).toContainText('1 note');
  const q = page.getByRole('button', { name: 'Do you deliver?' });
  await q.click();
  await expect(q).toHaveAttribute('aria-expanded', 'true');
});

test('mobile menu opens as a dialog', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeVisible();
});

test('robots and sitemap exist', async ({ request }) => {
  expect((await request.get('/robots.txt')).ok()).toBeTruthy();
  const sm = await (await request.get('/sitemap.xml')).text();
  expect(sm).toContain('/puppies/maltipoo-max-male');
  expect(sm).not.toContain('/dev/gallery');
});
