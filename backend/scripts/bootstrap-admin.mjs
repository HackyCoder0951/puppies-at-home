#!/usr/bin/env node
/**
 * Creates (or updates) a staff account: node scripts/bootstrap-admin.mjs <email> <full name> [super_admin|operator]
 * The password is read from ADMIN_PASSWORD (never a command-line argument, never stored). Needs SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY. Used once for the first super admin and for local test accounts.
 */
import { createClient } from '@supabase/supabase-js';

const [email, fullName, role = 'super_admin'] = process.argv.slice(2);
const password = process.env.ADMIN_PASSWORD;
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!email || !fullName || !password || !url || !key) {
  console.error('usage: ADMIN_PASSWORD=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/bootstrap-admin.mjs <email> "<full name>" [super_admin|operator]');
  process.exit(1);
}
if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');
if (!['super_admin', 'operator'].includes(role)) throw new Error('role must be super_admin or operator');

const db = createClient(url, key, { auth: { persistSession: false } });
const { data: list, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
if (listError) throw listError;
let user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (user) {
  const { error } = await db.auth.admin.updateUserById(user.id, { password, email_confirm: true });
  if (error) throw error;
} else {
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  user = data.user;
}
const { error } = await db.from('profiles').upsert({ user_id: user.id, full_name: fullName, role, disabled_at: null }, { onConflict: 'user_id' });
if (error) throw error;
console.log(`staff account ready: ${email} (${role})`);
