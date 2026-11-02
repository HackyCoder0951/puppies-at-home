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

/** Sets the admin colour mode cookie explicitly (one cookie, path /), replacing any earlier one. */
async function setTheme(page: Page, colour: 'light' | 'dark') {
  await page.context().clearCookies({ name: 'adm-theme' });
  await page.context().addCookies([{ name: 'adm-theme', value: colour, domain: 'localhost', path: '/' }]);
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

const records: { customer?: string; enquiry?: string; order?: string; puppy?: string; invoice?: string } = {};

test.afterAll(async () => {
  if (records.invoice) { await admin.from('invoice_lines').delete().eq('invoice_id', records.invoice); await admin.from('invoices').delete().eq('id', records.invoice); }
  if (records.order) await admin.from('orders').delete().eq('id', records.order);
  if (records.enquiry) await admin.from('enquiries').delete().eq('id', records.enquiry);
  if (records.customer) await admin.from('customers').delete().eq('id', records.customer);
  if (records.puppy) await admin.from('puppies').delete().eq('id', records.puppy);
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

test('shortcuts, toasts, saved views, record pages and phone width', async ({ page }) => {
  test.setTimeout(240_000);   // 32 accessibility scans
  const email = await makeStaff('ux', 'super_admin');
  await signIn(page, email);
  await page.keyboard.press('g');
  await page.keyboard.press('o');
  await expect(page).toHaveURL(/\/admin\/orders/);
  await page.keyboard.press('?');
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible();
  await page.keyboard.press('Escape');
  // a saved view round trip on the enquiries table
  await page.goto('/admin/enquiries?view=table&status=new');
  page.once('dialog', (d) => d.accept('Fresh ones'));
  await page.getByRole('button', { name: 'Save this view' }).click();
  await page.goto('/admin/enquiries?view=table');
  await expect(page.getByRole('link', { name: 'Fresh ones' })).toBeVisible();
  // a toast after a successful change
  await page.goto('/admin/users', { waitUntil: 'networkidle' });
  await page.getByLabel('Full name').fill('A');                       // too short: the server refuses it
  await page.getByLabel('Work email').fill(`short-name-${stamp}@dev.test`);
  await page.getByRole('button', { name: 'Send invitation' }).click();
  await expect(page.locator('form', { has: page.getByRole('button', { name: 'Send invitation' }) }).locator('p[role="alert"]')).toContainText('Check this field');
  const serious = async () => (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id);
  for (const colour of ['light', 'dark']) {
    await setTheme(page, colour as 'light' | 'dark');
    for (const path of ['/admin', '/admin/enquiries', '/admin/enquiries?view=table', '/admin/customers', '/admin/orders', '/admin/orders?view=table', '/admin/deliveries', '/admin/invoices', '/admin/payments', '/admin/puppies', '/admin/puppies?view=table', '/admin/messages', '/admin/audit', '/admin/privacy', '/admin/settings', '/admin/users']) {
      await page.goto(path);
      expect(await serious(), `${colour} ${path}`).toEqual([]);
    }
  }
  await page.setViewportSize({ width: 375, height: 800 });
  for (const path of ['/admin', '/admin/orders', '/admin/enquiries?view=table', '/admin/puppies']) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `no sideways page scroll at 375px on ${path}`).toBeLessThanOrEqual(0);
  }
});

test('records, boards, bulk actions, drawers, column chooser and landing page', async ({ page }) => {
  test.setTimeout(240_000);
  const email = await makeStaff('rec', 'super_admin');
  records.customer = (await admin.from('customers').insert({ full_name: `Record Customer ${stamp}`, phone_e164: '+971500000321', email: `rec-${stamp}@dev.test` }).select('id').single()).data?.id;
  records.puppy = (await admin.from('puppies').insert({ slug: `e2e-pup-${stamp}`, breed: 'Maltipoo', sex: 'male', age_text: '3 months', origin: 'local', price_minor: 450000 }).select('id').single()).data?.id;
  records.enquiry = (await admin.from('enquiries').insert({ customer_id: records.customer, source: 'manual', name: `Record Customer ${stamp}`, phone: '+971500000321', message: 'Is the puppy still here?' }).select('id').single()).data?.id;
  records.order = (await admin.from('orders').insert({ number: `TP-E2E-${stamp}`, customer_id: records.customer, type: 'local', total_minor: 450000, tax_minor: 22500 }).select('id').single()).data?.id;
  await admin.from('order_items').insert({ order_id: records.order, description: 'Maltipoo puppy', quantity: 1, unit_minor: 450000 });
  records.invoice = (await admin.from('invoices').insert({ order_id: records.order, customer_id: records.customer, subtotal_minor: 450000, tax_minor: 22500, total_minor: 472500 }).select('id').single()).data?.id;
  await admin.from('invoice_lines').insert({ invoice_id: records.invoice, description: 'Maltipoo puppy', quantity: 1, unit_minor: 450000, tax_rate_bps: 500, tax_minor: 22500 });
  await signIn(page, email);
  const serious = async () => (await new AxeBuilder({ page }).analyze()).violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id);

  // record screens: light and dark
  const paths = [`/admin/enquiries/${records.enquiry}`, `/admin/customers/${records.customer}`, ...['orders', 'payments', 'messages', 'privacy'].map((t) => `/admin/customers/${records.customer}?tab=${t}`), `/admin/orders/${records.order}`, `/admin/invoices/${records.invoice}`, `/admin/puppies/${records.puppy}`, `/admin/privacy/customers/${records.customer}`, '/admin/gallery'];
  for (const colour of ['light', 'dark']) {
    await setTheme(page, colour as 'light' | 'dark');
    for (const path of paths) { await page.goto(path); expect(await serious(), `${colour} ${path}`).toEqual([]); }
  }
  await setTheme(page, 'light');

  // sparklines on the overview
  await page.goto('/admin');
  await expect(page.locator('svg.adm-spark').first()).toBeVisible();

  // orders board: quick view drawer, then drag the card to the next stage
  await page.goto('/admin/orders', { waitUntil: 'networkidle' });
  const card = page.locator('[data-card]', { hasText: `TP-E2E-${stamp}` });
  await card.getByRole('button', { name: 'Quick view' }).click();
  await expect(page.getByRole('dialog', { name: new RegExp(`TP-E2E-${stamp}`) })).toBeVisible();
  await page.keyboard.press('Escape');
  await card.dragTo(page.locator('[data-column="confirmed"]'));
  await expect(page.locator('[data-column="confirmed"] [data-card]', { hasText: `TP-E2E-${stamp}` })).toBeVisible();
  await card.getByRole('button', { name: 'Quick view' }).first().waitFor();

  // enquiries board and table, bulk update
  await page.goto('/admin/enquiries?view=table', { waitUntil: 'networkidle' });
  await page.getByRole('checkbox', { name: `Select the enquiry from Record Customer ${stamp}` }).check();
  await page.getByLabel('Set status').selectOption('contacted');
  await page.getByRole('button', { name: 'Apply to ticked' }).click();
  await expect(page.getByText('1 enquiries updated.')).toBeVisible();

  // column chooser remembers a hidden column
  await page.goto('/admin/enquiries?view=table', { waitUntil: 'networkidle' });
  await page.getByText('Columns', { exact: true }).click();
  await page.getByLabel('Source', { exact: true }).uncheck();
  await expect(page.locator('#enquiries-table th[data-col="source"]')).toBeHidden();
  await page.reload();
  await expect(page.locator('#enquiries-table th[data-col="source"]')).toBeHidden();

  // landing page choice is used after the next sign-in
  await page.goto('/admin/security', { waitUntil: 'networkidle' });
  await page.getByLabel('After signing in, open').selectOption('/admin/orders');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/You will land there/)).toBeVisible();
  await page.context().clearCookies({ name: /^sb-/ });
  await signIn(page, email);
  await expect(page).toHaveURL(/\/admin\/orders/);
});

test('visual baselines: sign-in screen and the design gallery in both colour modes', async ({ page }) => {
  for (const colour of ['light', 'dark']) {
    await setTheme(page, colour as 'light' | 'dark');
    await openLogin(page);
    await expect(page).toHaveScreenshot(`login-${colour}.png`, { maxDiffPixelRatio: 0.02, animations: 'disabled' });
  }
  const email = await makeStaff('shot', 'super_admin');
  await signIn(page, email);
  for (const colour of ['light', 'dark']) {
    await setTheme(page, colour as 'light' | 'dark');
    await page.goto('/admin/gallery', { waitUntil: 'networkidle' });
    await expect(page.locator('main[data-gallery]')).toHaveScreenshot(`gallery-${colour}.png`, { maxDiffPixelRatio: 0.02, animations: 'disabled' });
  }
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
