# 14. Environment and Configuration

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `04`, `06`, `08`, `10`, `11` |

## 1. Principles

- All secrets and provider selection live in environment variables; non-secret business settings live in `site_settings` (editable in the portal).
- `shared/config/env.ts` validates variables with Zod at boot (and at build for public ones) and **fails fast** with a readable list of missing or malformed values.
- Server-only variables are never prefixed `NEXT_PUBLIC_`; code that reads them is in modules marked `server-only`.
- Separate values per environment (Local, Preview, Production). Staging and production never share keys.
- `.env.example` contains names, comments and fake placeholders only.

Legend: **R** required, **C** conditional, **O** optional. **S** server-only, **P** public (browser).

## 2. Core application

| Variable | Req | Scope | Purpose | Example |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | R | P | Canonical URL, absolute links, Open Graph | `https://example.com` |
| `NODE_ENV` | R | S | Standard | `production` |
| `APP_ENV` | R | S | `local`, `preview`, `production` (drives banners and noindex for non-production) | `production` |
| `CRON_SECRET` | R | S | Bearer for `/api/internal/*` | long random |
| `IP_HASH_SALT` | R | S | HMAC salt for IP hashing and rate-limit keys | long random |
| `ADMIN_IP_ALLOWLIST` | O | S | Comma list of allowed admin IPs/CIDRs | `203.0.113.5` |
| `LOG_LEVEL` | O | S | `info` default | `info` |

## 3. Supabase

| Variable | Req | Scope | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | R | P | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | R | P | Anon key (safe in browser; RLS protects data) |
| `SUPABASE_SERVICE_ROLE_KEY` | R | S | Invitations, webhooks, outbox worker, bootstrap; never to the browser |
| `SUPABASE_DB_POOLER_URL` | O | S | Pooled connection for direct SQL tasks |
| `SUPABASE_JWT_SECRET` | O | S | Only if verifying JWTs outside the SDK |

## 4. Rate limiting (Upstash)

| Variable | Req | Scope | Purpose |
|---|---|---|---|
| `UPSTASH_REDIS_REST_URL` | R | S | Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | R | S | Token |
| `RATE_LIMIT_ENABLED` | O | S | `true` default; `false` only locally |
| `TURNSTILE_SITE_KEY` | O | P | Enables Cloudflare Turnstile on public forms |
| `TURNSTILE_SECRET_KEY` | C | S | Required if the site key is set |

## 5. Authentication and session

| Variable | Req | Scope | Purpose | Default |
|---|---|---|---|---|
| `SESSION_IDLE_MINUTES` | O | S | Idle timeout | 30 |
| `SESSION_ABSOLUTE_HOURS` | O | S | Absolute session lifetime | 12 |
| `MFA_REQUIRED_FOR_OPERATORS` | O | S | Force TOTP for operators | `false` |
| `LOGIN_LOCK_THRESHOLD` | O | S | Failures before lock | 10 |
| `LOGIN_LOCK_MINUTES` | O | S | Lock duration | 15 |
| `BOOTSTRAP_ADMIN_EMAIL` | C | S | Used only by the one-time bootstrap script | |
| `BOOTSTRAP_ADMIN_NAME` | C | S | Same | |

Supabase dashboard/CLI settings to set in config (not env): email confirmations on, sign-ups disabled, password min length 12 with leaked-password protection, JWT expiry, redirect URL allow-list, custom access token hook.

## 6. Payments

| Variable | Req | Scope | Purpose |
|---|---|---|---|
| `PAYMENT_GATEWAYS` | O | S | Enabled gateways, comma list (default `manual`) |
| `DEFAULT_GATEWAY` | O | S | Preselected gateway |
| `DEFAULT_CURRENCY` | O | S | ISO 4217, default `AED` |
| `STRIPE_SECRET_KEY` | C | S | Stripe API key (`sk_test_`/`sk_live_`) |
| `STRIPE_PUBLISHABLE_KEY` | C | P | Only if Stripe.js is used (not required for hosted checkout redirect) |
| `STRIPE_WEBHOOK_SECRET` | C | S | `whsec_…` |
| `RAZORPAY_KEY_ID` | C | S | Razorpay key id |
| `RAZORPAY_KEY_SECRET` | C | S | Razorpay secret |
| `RAZORPAY_WEBHOOK_SECRET` | C | S | Webhook secret |
| `PAYMENT_<GATEWAY>_*` | C | S | Pattern for additional adapters |
| `DEPOSIT_PERCENT_DEFAULT` | O | S | Default deposit percentage for new orders (to confirm) |

Conditional rule: if a gateway appears in `PAYMENT_GATEWAYS`, all its **C** variables must be present, otherwise it is skipped with a boot warning.

## 7. Messaging

| Variable | Req | Scope | Purpose |
|---|---|---|---|
| `EMAIL_PROVIDER` | O | S | `log` (default, nothing leaves the machine) or `resend` (needs `RESEND_API_KEY` and `EMAIL_FROM`). Implemented in B8 |
| `RESEND_API_KEY` | C | S | Resend key |
| `RESEND_WEBHOOK_SECRET` | C | S | Svix secret for delivery webhooks |
| `EMAIL_FROM` | C | S | Verified sender, for example `TeddyPups <hello@domain>` |
| `EMAIL_REPLY_TO` | O | S | Reply address |
| `STAFF_ALERT_EMAIL` | O | S | Address for critical alerts |
| `WHATSAPP_PROVIDER` | O | S | `cloud`, `twilio` or `none` (default `none`) |
| `WHATSAPP_PHONE_NUMBER_ID` | C | S | Meta Cloud API sender id |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | O | S | Meta WABA id (template management) |
| `WHATSAPP_ACCESS_TOKEN` | C | S | Meta system user token |
| `WHATSAPP_APP_SECRET` | C | S | Webhook signature verification |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | C | S | GET verification handshake |
| `TWILIO_ACCOUNT_SID` | C | S | Twilio |
| `TWILIO_AUTH_TOKEN` | C | S | Twilio |
| `TWILIO_WHATSAPP_FROM` | C | S | `whatsapp:+…` |
| `QUIET_HOURS_START` | O | S | `21:00` |
| `QUIET_HOURS_END` | O | S | `08:00` |
| `QUIET_HOURS_TZ` | O | S | `Asia/Dubai` |
| `AUTOMATED_MSG_DAILY_CAP` | O | S | Per customer per day, default 5 |
| `MESSAGE_GLOBAL_DAILY_CAP_EMAIL` | O | S | Global daily email cap |
| `MESSAGE_GLOBAL_DAILY_CAP_WHATSAPP` | O | S | Global daily WhatsApp cap |

## 8. Feature flags

| Variable | Default | Effect |
|---|---|---|
| `FEATURE_OUTBOX_ENABLED` | `true` | `false` pauses all automated sends (kill switch) |
| `FEATURE_STAFF_DIGEST` | `false` | `true` queues a daily digest (counts of new enquiries, orders to confirm, overdue invoices, refunds and delayed deliveries) as an in-app note and an email to every active staff member; runs from the daily job |
| `FEATURE_STAFF_DIGEST` | `false` | Daily staff digest email |
| `FEATURE_PUBLIC_CURTAIN` | `true` | Loading curtain on the public site |
| `FEATURE_ROAMING_MASCOT` | `true` | Fixed mascot overlay |
| `FEATURE_PAYMENT_LINKS` | `false` | Staff can create gateway payment links |
| `FEATURE_ADMIN_EXPORTS` | `true` | CSV export endpoints |

## 8b. AI assistant (planned, documents `26` to `30`)

All variables are read only through `shared/config` and default to a safe, disabled state. The full table with meanings, defaults and secrets is in `30` section 8. Summary: `ASSISTANT_ENABLED` (`false`), `FEATURE_ASSISTANT_WIDGET` (`false`), `ASSISTANT_MODE` (`mock`|`live`, `mock`), `ANTHROPIC_API_KEY` (secret, server only, required in `live`), `ASSISTANT_MODEL`, `ASSISTANT_JUDGE_MODEL`, `ASSISTANT_MAX_OUTPUT_TOKENS`, `ASSISTANT_MAX_TURNS`, `ASSISTANT_MAX_TOOL_CALLS`, `ASSISTANT_DAILY_VISITOR_CAP`, `ASSISTANT_DAILY_BUDGET`, `ASSISTANT_RETENTION_DAYS`, `ASSISTANT_TRAJECTORY_RETENTION_DAYS`, `ASSISTANT_PROMPT_VERSION`, `ASSISTANT_KNOWLEDGE_VERSION`, `ASSISTANT_POLICY_VERSION`, `ASSISTANT_POLICY_MODE` (`fixed`|`learning`), `ASSISTANT_EXPLORATION_SHARE`, `ASSISTANT_AUTO_PROMOTE` (`false`), `ASSISTANT_SESSION_SECRET` (secret). Add them to `.env.example` and to the per-environment matrix when phases A1 to A4 start; no key is created before the owner approves `30` and decision D24 is settled.

## 9. Retention and limits

| Variable | Default | Purpose |
|---|---|---|
| `RETENTION_ENQUIRY_MONTHS` | 24 | Anonymise enquiries and messages after this age |
| `RETENTION_OUTBOX_DAYS` | 30 | Prune processed outbox rows |
| `RETENTION_CONSENT_YEARS` | 3 | Keep consent and DSR records this long after the relationship ends |
| `RETENTION_AUDIT_YEARS` | 7 | Audit log retention |
| `RETENTION_LOGIN_ATTEMPTS_DAYS` | 30 | Login attempts |
| `RETENTION_ORDER_YEARS` | 7 | Order, invoice and payment records (**verify**) |
| `DSR_SLA_DAYS` | 30 | Internal maximum for data subject requests |
| `PRIVACY_CONTACT_EMAIL` | none | Public privacy contact; shown in the notice and used for requests |
| `CONSENT_TEXT_VERSION` | `v1` | Version recorded with every consent; bump when wording changes |
| `BREACH_ALERT_EMAIL` | none | Receives incident alerts for the register (falls back to `STAFF_ALERT_EMAIL`) |
| `UPLOAD_MAX_IMAGE_MB` | 10 | Image upload cap |
| `UPLOAD_MAX_VIDEO_MB` | 100 | Video upload cap |
| `UPLOAD_MAX_DOC_MB` | 15 | Document cap |

## 10. Per-environment matrix

| Concern | Local | Preview | Production |
|---|---|---|---|
| Supabase | Local CLI stack | Staging project | Production project (PITR on) |
| Email | Resend test key or logger | Resend test domain | Verified domain |
| WhatsApp | `none` or sandbox number | Sandbox | Live |
| Payments | `manual` + test keys | Test keys | Live keys |
| Indexing | `noindex` | `noindex` + password | Public pages indexable, admin never |
| Cron | Manual invocation | Vercel cron optional | Vercel cron |

## 11. `.env.example` (content to create in the development phase)

```
# --- Core ---
NEXT_PUBLIC_SITE_URL=
APP_ENV=local
CRON_SECRET=
IP_HASH_SALT=
# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# --- Upstash ---
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
# --- Auth policy ---
SESSION_IDLE_MINUTES=30
SESSION_ABSOLUTE_HOURS=12
MFA_REQUIRED_FOR_OPERATORS=false
# --- Payments ---
PAYMENT_GATEWAYS=manual
DEFAULT_GATEWAY=manual
DEFAULT_CURRENCY=AED
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
# --- Messaging ---
EMAIL_PROVIDER=resend
RESEND_API_KEY=
RESEND_WEBHOOK_SECRET=
EMAIL_FROM=
WHATSAPP_PROVIDER=none
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_APP_SECRET=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=
# --- Flags ---
FEATURE_OUTBOX_ENABLED=true
```

## 12. Secret handling and rotation

Secrets only in Vercel (and a password manager for the team); never in the repository, tickets or chat. Rotation order: create the new key, deploy with both accepted where supported (webhook secrets), switch, revoke the old. Service-role key rotation requires a redeploy of every environment. CI scans for committed secrets.

## Open questions

1. Which sender domain will be used for email and is DNS under our control?
2. Production Supabase region and plan size.
3. Who administers Vercel, Supabase, Upstash, Resend and the WhatsApp business account?
