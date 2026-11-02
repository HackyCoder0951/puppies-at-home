import AxeBuilder from '@axe-core/playwright';
import { createHmac } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { expect, test, type Page } from '@playwright/test';

/**
 * Admin journeys against the local Supabase stack (opt-in: E2E_ADMIN=1 plus SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and
 * the app started with DATA_SOURCE=supabase; E2E_BASE_URL points at it). Uses its own throwaway staff accounts.
 */
const enabled = process.env.E2E_ADMIN === '1' && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY;
test.skip(!enabled, 'set E2E_ADMIN=1 with the local stack running');
test.describe.configure({ mode: 'serial' });

const stamp = Date.now();
const password = `e2e-${stamp}-password`;
const admin = createClient(process.env.SUPABASE_URL ?? 'http://x', process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'x', { auth: { persistSession: false } });
const created: string[] = [];

async function makeStaff(label: string, role: 'super_admin' | 'operator') {
  const email = `${label}-${stamp}@dev.test`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  created.push(data.user.id);
  await admin.from('profiles').insert({ user_id: data.user.id, full_name: `E2E ${label}`, role });
  return email;
}

function totp(secret: string, at = Date.now()): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const ch of secret.replace(/=+$/, '').toUpperCase()) bits += alphabet.indexOf(ch).toString(2).padStart(5, '0');
  const key = Buffer.from(bits.match(/.{8}/g)?.map((b) => parseInt(b, 2)) ?? []);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(at / 30_000)));
  const h = createHmac('sha1', key).update(counter).digest();
  const o = (h[h.length - 1] ?? 0) & 15;
  const n = (((h[o] ?? 0) & 127) << 24) | ((h[o + 1] ?? 0) << 16) | ((h[o + 2] ?? 0) << 8) | (h[o + 3] ?? 0);
  return String(n % 1_000_000).padStart(6, '0');
}

/** Opens the sign-in page and waits until React has attached to the form (a click before that submits nothing). */
async function openLogin(page: Page) {
  await page.goto('/admin/login', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => Object.keys(document.querySelector('form') ?? {}).some((k) => k.startsWith('__reactProps')));
}

async function signIn(page: Page, email: string) {
  await openLogin(page);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL((url) => !url.pathname.endsWith('/login'));
}

test.afterAll(async () => {
  for (const id of created) {
    await admin.from('profiles').delete().eq('user_id', id);
    await admin.auth.admin.deleteUser(id);
  }
  await admin.from('profiles').delete().like('full_name', `E2E invite ${stamp}%`);
});

test('the admin is hidden from visitors and search engines', async ({ page, request }) => {
  const res = await request.get('/admin', { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()['x-robots-tag']).toContain('noindex');
  expect(res.headers()['cache-control']).toBe('no-store');
  await page.goto('/admin/orders');
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Forders/);
  expect((await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
});

test('a wrong password shows a generic message; a super admin reaches an accessible dashboard', async ({ page }) => {
  const email = await makeStaff('sa', 'super_admin');
  await openLogin(page);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('wrong-password-xyz');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.locator('p[role="alert"]')).toContainText('The email or password is not correct');
  await signIn(page, email);
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
  for (const path of ['/admin', '/admin/puppies', '/admin/enquiries', '/admin/orders', '/admin/invoices', '/admin/payments', '/admin/messages', '/admin/templates', '/admin/rules', '/admin/privacy', '/admin/users', '/admin/settings']) {
    await page.goto(path);
    await expect(page.getByRole('navigation', { name: 'Admin' })).toBeVisible();
    const serious = (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${path}: ${v.id}`)).toEqual([]);
  }
});

test('the new shell: grouped rail, environment badge, command palette, orders board and dark mode stay accessible', async ({ page }) => {
  const email = await makeStaff('shell', 'super_admin');
  await signIn(page, email);
  await expect(page.getByRole('navigation', { name: 'Admin' }).getByText('Work')).toBeVisible();
  await expect(page.locator('.adm-env')).toHaveText(/Local|Preview|Production/);
  await page.keyboard.press('Control+k');
  await page.getByLabel('Search sections and actions').fill('orders');
  await page.getByRole('option', { name: /^Orders\b/ }).first().click();
  await expect(page).toHaveURL(/\/admin\/orders/);
  await expect(page.getByRole('group', { name: 'Orders by stage' })).toBeVisible();
  const serious = async () => (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id);
  expect(await serious()).toEqual([]);
  await page.getByRole('button', { name: /Colour mode/ }).click();   // light
  await page.getByRole('button', { name: /Colour mode/ }).click();   // dark
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  for (const path of ['/admin', '/admin/orders', '/admin/orders?view=table', '/admin/enquiries', '/admin/invoices']) {
    await page.goto(path);
    expect(await serious(), `dark ${path}`).toEqual([]);
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('two-step sign-in: enrol an authenticator, then a code is required at the next sign-in', async ({ page }) => {
  const email = await makeStaff('mfa', 'operator');
  await signIn(page, email);
  await page.goto('/admin/security?setup=1');
  const secret = (await page.locator('code').innerText()).trim();
  await page.getByLabel('Enter the code the app shows').fill(totp(secret));
  await page.getByRole('button', { name: 'Confirm and turn on' }).click();
  await expect(page.getByText('An authenticator app is protecting this account.')).toBeVisible();
  await page.context().clearCookies();
  await signIn(page, email);
  await expect(page).toHaveURL(/\/admin\/verify/);
  await page.getByLabel('Code from your authenticator app').fill('000000');
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.locator('p[role="alert"]')).toContainText('not correct');
  await page.getByLabel('Code from your authenticator app').fill(totp(secret, Date.now() + 30_000));
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
});

test('operators cannot open staff management; a super admin can invite and the email is sent', async ({ page }) => {
  const op = await makeStaff('op', 'operator');
  await signIn(page, op);
  await page.goto('/admin/users');
  await expect(page.getByText('Only a super admin can manage staff.')).toBeVisible();
  await page.context().clearCookies();
  const sa = await makeStaff('sa2', 'super_admin');
  await signIn(page, sa);
  await page.goto('/admin/users');
  const invitee = `invite-${stamp}@dev.test`;
  await page.getByLabel('Full name').fill(`E2E invite ${stamp}`);
  await page.getByLabel('Work email').fill(invitee);
  await page.getByRole('button', { name: 'Send invitation' }).click();
  await expect(page.getByText('Invitation sent.')).toBeVisible();
  // The local mail server (Mailpit) lists what would have been sent.
  const mail = await (await fetch(`${process.env.MAIL_URL ?? 'http://127.0.0.1:55324'}/api/v1/search?query=${encodeURIComponent(`to:${invitee}`)}`)).json();
  expect(mail.messages_count ?? mail.total ?? 0).toBeGreaterThan(0);
  const invited = (await admin.auth.admin.listUsers()).data.users.find((u) => u.email === invitee);
  if (invited) created.push(invited.id);
});
