# 31. Backend Deployment and Operations Runbook

| | |
|---|---|
| **Status** | Written 2026-11-02 after phase B12; **not yet exercised against a cloud project** |
| **Related** | `14` (environment), `25` (backend plan), `06` (security and privacy), `10` (payments), `11` (notifications) |

This is the checklist for taking the backend from the local stack to a Supabase staging project and Vercel. Nothing here has been run in the cloud yet; every step marked **verify** must be confirmed on first use.

## 1. What the owner must provide

| Item | Used for |
|---|---|
| Supabase project (staging first) and region decision (D17, with counsel) | database, auth, storage |
| Vercel project and domain | hosting, cron |
| Upstash Redis database | rate limits in staging and production (required in production) |
| Resend account, verified sending domain (SPF, DKIM), sender address | customer and staff email |
| Stripe account (test keys first; UAE account type and AED support to confirm) | online payments |
| First super admin email | bootstrap |
| Business name, VAT number, address; VAT rate confirmation | invoices |
| Reviewed privacy notice and terms, Data Protection Lead | launch |

## 2. Supabase project

1. Create the project; copy the URL, anon key and service-role key (the service-role key is a secret: Vercel server environment only).
2. Link and push: `supabase link --project-ref <ref>` then `supabase db push` from `backend/` (applies `backend/supabase/migrations`). Run the pgTAP suite against a local reset first (`npm run db:reset && npm run db:test`).
3. **Auth settings (dashboard, matching `backend/supabase/config.toml`):** public sign-up **off**; email provider on; minimum password length 12; TOTP multi-factor on; site URL and redirect URL allow-list set to the production domain (`/admin/auth/callback`); email templates and SMTP sender set (custom SMTP through Resend recommended; the built-in sender is rate limited). **Invitation and password-reset email templates must use the token-hash links** from `backend/supabase/templates/invite.html` and `recovery.html` (`{{ .SiteURL }}/admin/auth/callback?token_hash={{ .TokenHash }}&type=invite|recovery&next=/admin/reset-password`): paste both into Authentication, Email templates, otherwise the default links open a page that cannot sign the person in. **verify** MFA availability on the chosen plan.
4. Storage buckets `site-media` (public), `media-drafts` and `private-docs` come from the migrations; confirm their policies in the dashboard.
5. Seed content once: from `backend/`, `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-from-fixtures.mjs` (demo content from the frontend fixtures; replace with real content through the admin before launch).
6. First super admin: `ADMIN_PASSWORD='<long random>' SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/bootstrap-admin.mjs owner@example.com "Owner Name" super_admin`, then sign in, turn on the authenticator app (`/admin/security`) and invite the rest of the staff from `/admin/users`.
7. Backups: enable point-in-time recovery on the paid plan; the retention window defines how long deleted personal data survives (`06` section 6.7). Practise one restore into a scratch project before launch.

## 3. Vercel and environment

Set these in the Vercel project (see `app/.env.example` for the full list and defaults). **Production values that must be set:** `APP_ENV=production`, `NEXT_PUBLIC_SITE_URL`, `DATA_SOURCE=supabase`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` (24+ characters), `IP_HASH_SALT` (16+ characters), `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. The app refuses to start without the production ones.

Optional until needed: `FEATURE_STAFF_DIGEST=true` (daily digest to every active staff member by in-app note and email; the email needs `EMAIL_PROVIDER=resend`); `EMAIL_PROVIDER=resend` with `RESEND_API_KEY` and `EMAIL_FROM`; `PAYMENT_GATEWAYS=manual,stripe` with `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`; `MFA_REQUIRED_FOR_OPERATORS=true`; quiet hours and caps.

## 4. Scheduled jobs

`app/vercel.json` declares two cron jobs, both authenticated with `Authorization: Bearer $CRON_SECRET` (Vercel adds it when `CRON_SECRET` is set):

| Path | Schedule | Does |
|---|---|---|
| `/api/internal/outbox` | 02:00 UTC daily (Hobby plan limit) | safety-net sweep that sends anything queued and retries failures |
| `/api/internal/daily` | 01:30 UTC daily | marks overdue invoices, retention (old leads, old message text, old login attempts), prunes finished outbox rows and audit rows older than seven years |

Vercel's Hobby plan only allows cron jobs that run once a day (a deployment with `* * * * *` fails with "Hobby accounts are limited to daily cron jobs"), so the file ships with daily schedules. Notifications need a faster trigger: call `/api/internal/outbox` every minute from another scheduler with the same bearer header (Supabase `pg_cron` with `pg_net` is free: `select cron.schedule('outbox', '* * * * *', $$ select net.http_get('https://<domain>/api/internal/outbox', headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>')) $$);`, or an external cron service), or upgrade to Vercel Pro and change the schedule back to `* * * * *`. Until one of these is in place, customer emails and staff notifications are delayed up to a day. Check the message log and the dashboard warning ("messages waiting") after the first day. **verify** the schedule on the chosen plan.

## 5. Stripe

1. Test mode first: set `STRIPE_SECRET_KEY` (`sk_test_...`) and add a webhook endpoint `https://<domain>/api/webhooks/stripe` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `checkout.session.expired` and `charge.refunded` (refunds made in the Stripe dashboard are recorded in the ledger from this event); copy its signing secret to `STRIPE_WEBHOOK_SECRET`.
2. In the admin, create a test order, issue its invoice, create the payment link, pay with a Stripe test card, and confirm: the payment becomes received once, the invoice becomes paid, a receipt is queued, a replayed event changes nothing. Then request and approve a small refund. **None of this has been run against Stripe yet.**
3. Only after the owner confirms the account type, AED support and fees, switch to live keys.

## 5b. WhatsApp Cloud API (optional)

Without it, staff use prefilled wa.me links and every WhatsApp rule is skipped with the reason "channel unavailable". To automate:

1. In Meta Business, create a WhatsApp Business app and a system-user token with `whatsapp_business_messaging`; note the phone number id.
2. Set `WHATSAPP_PROVIDER=cloud`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_APP_SECRET` (app secret, used to verify signatures) and `WHATSAPP_VERIFY_TOKEN` (any long random string). The app refuses to start with `cloud` and any of them missing.
3. Webhook: callback URL `https://<domain>/api/webhooks/whatsapp`, the same verify token, subscribe to the `messages` field. Receipts (sent, delivered, read, failed) update the message log forward only; STOP withdraws consent at once, START restores it for someone who had opted in, and any other reply becomes an in-app notification for all active staff.
4. Message templates: Meta only allows approved templates outside the 24-hour reply window. Create a template for each WhatsApp template key (for example `enquiry_received_wa`, `delivery_dispatched_wa`) with **the same name**, language English, and numbered placeholders in the order the variables first appear in the body (the first variable is {{1}}). Then enable the rules in `/admin/rules`. **None of this has been run against Meta yet.**

## 5c. AI assistant (optional, off by default)

Follow `docs/06-quality/35-assistant-release-review.md` section 3. Summary: push migrations through `20261102102300`; set `NVIDIA_API_KEY` (server only) and, when ready, `ASSISTANT_ENABLED=true` and `ASSISTANT_MODE=live`; run `npm run assistant:smoke` and `npm run assistant:eval -- --live` from `app/` with the key in the shell first. The daily job prunes chat text after 30 days and figures after 12 months; the cron in section 4 must be running. The privacy notice changes in `docs/03-security-privacy/34-assistant-privacy-pack.md` need counsel's approval before real visitors use the chat.

## 6. Launch checklist

- [ ] Staging project passes `db:test` locally and the Playwright admin journeys against staging (`E2E_ADMIN=1`).
- [ ] Sign-up closed (`POST /auth/v1/signup` with the anon key returns "signups not allowed").
- [ ] `/admin` redirects visitors to the login page, is `noindex`, and is absent from `sitemap.xml` and `robots` allow rules.
- [ ] Super admin has an authenticator app; operators required if the owner decides so.
- [ ] Content-Security-Policy present on public pages and a nonce on `/admin` (`curl -I`); the public policy is built when the app is built, so `NEXT_PUBLIC_SUPABASE_URL` must be set at build time (it is on Vercel).
- [ ] Email sends from the verified domain (message log shows `resend`, not `log`).
- [ ] Privacy notice, terms and consent text approved by counsel; `CONSENT_TEXT_VERSION` updated.
- [ ] Real content replaces demo content; family photos have written releases (`release_ref`).
- [ ] Restore from a backup rehearsed; retention window recorded in the vendor register.
- [ ] Vendor register and data processing agreements recorded for Supabase, Vercel, Upstash, Resend and Stripe (`06` section 6.8).

## 7. Operating notes

- **Rollback:** migrations are forward-only. To roll back an application release, redeploy the previous Vercel build (migrations are written to be backward compatible with the previous release for one version); to undo a data change, restore from point-in-time recovery into a new project and copy the rows back.
- **Stuck notifications:** the dashboard shows pending and failed outbox counts; failed events alert super admins and can be inspected in the message log.
- **Data subject request:** log it under `/admin/privacy`, verify identity, use the customer's privacy tools to export or anonymise, record exceptions, answer within 30 days.
- **Breach:** record it in the breach register at once; the 72-hour clock runs from awareness.
- **Known open items:** Content-Security-Policy with nonces, load and Lighthouse measurements against the staging data size, WhatsApp automation, provider webhooks for delivery status, customer-facing payment status page, public privacy-request form, Razorpay.
