# 08. API and Rate Limiting

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `06-security-architecture.md`, `07-rbac-and-rls-spec.md`, `10`, `11`, `14` |

## 1. Principles

1. Prefer **server actions and server components** for admin work; use route handlers only for public endpoints, webhooks, cron, exports and uploads.
2. Every handler: authenticate, authorise (`requirePermission`), rate limit, validate (Zod), execute (RPC or query under RLS), audit, respond with the standard envelope.
3. Money and messaging mutations accept an `Idempotency-Key` (header or action argument).
4. Never trust amounts, totals, statuses or roles from the client; compute from stored data.

## 2. Response conventions

Success: `200/201` with JSON `{ "data": ..., "meta": { "requestId": "..." } }` (lists add `meta.nextCursor`).

Error envelope:

```json
{ "error": { "code": "validation_failed", "message": "Phone number is not valid", "fields": { "phone": "invalid" }, "requestId": "..." } }
```

| HTTP | `code` examples |
|---|---|
| 400 | `validation_failed`, `bad_request` |
| 401 | `unauthenticated`, `session_expired` |
| 403 | `forbidden`, `mfa_required`, `account_disabled` |
| 404 | `not_found` (also used instead of 403 where existence must not leak) |
| 409 | `conflict`, `invalid_transition`, `duplicate` |
| 413 | `payload_too_large` |
| 415 | `unsupported_media_type` |
| 422 | `business_rule_violated` |
| 429 | `rate_limited` with `Retry-After` and `X-RateLimit-Limit/Remaining/Reset` |
| 500 | `internal_error` (generic message; details only in logs) |

Pagination: keyset `?limit=` (default 25, max 50) and `?cursor=` (opaque, encodes sort key and id). No offset pagination on large tables.

## 3. Route catalogue

### 3.1 Public

| Method and path | Purpose | Auth | Limits |
|---|---|---|---|
| `POST /api/public/enquiry` | Contact letter and per-puppy enquiry | none | RL-PUB-1, RL-PUB-2 |
| `POST /api/public/privacy-request` | Data subject request (access, erasure and so on) | none | RL-PUB-3 |
| `GET /sitemap.xml`, `/robots.txt` | SEO files (public routes only) | none | CDN cached |
| Pages `(site)` | Cached HTML | none | RL-PUB-3 | `POST /api/public/privacy-request` | 3 per day | IP + email | fail closed |
| RL-GEN |

### 3.2 Admin pages and auth (UI routes)

`/admin/login`, `/admin/forgot-password`, `/admin/reset-password`, `/admin/verify`, `/admin/mfa`, then the `(app)` modules in `04`. Auth operations are server actions calling Supabase Auth.

### 3.3 Admin server actions (by module)

| Module | Actions (permission) |
|---|---|
| Puppies and media | create, update, publish, unpublish, reorder media, set cover, mark gone home, delete (`content.*`) |
| Families, FAQs, testimonial, settings | create, update, reorder, publish, delete (`content.*`, `settings.write`) |
| Enquiries | update status, assign, add note, convert (`enquiries.*`), export (`enquiries.export`) |
| Customers | create, update, merge, anonymise (`customers.*`) |
| Orders | create, update, transition, cancel, add document (`orders.*`) |
| Deliveries | create, update, record event (`deliveries.write`) |
| Payments | record, request refund, approve refund, start checkout link (`payments.*`) |
| Invoices | create, edit draft, issue, send, mark overdue (system), void (`invoices.*`) |
| Templates | create version, activate, rollback, test send (`templates.*`) |
| Messages | send manual message, retry failed (`messages.send`) |
| Rules | create, update, enable, disable (`rules.manage`) |
| Users | invite, change role, disable, reset MFA, revoke sessions (`users.manage`) |
| Notifications | mark read, mark all read (own) |

### 3.4 Admin route handlers (`/api/admin/*`)

Only where actions do not fit; all require a session and permission.

| Route | Purpose | Permission |
|---|---|---|
| `POST /api/admin/uploads/sign` | Return signed upload URL after validating kind and size | `content.write` or `orders.write` |
| `POST /api/admin/uploads/finalize` | Verify object (magic bytes, size), rename, create media row | same |
| `GET /api/admin/exports/{enquiries|payments|customers}` | Streamed CSV | `*.export` |
| `GET /api/admin/invoices/{id}/pdf` | Signed URL redirect to the PDF | `invoices.read` |

### 3.5 Webhooks and internal

| Route | Source | Verification |
|---|---|---|
| `POST /api/webhooks/stripe` | Stripe | `Stripe-Signature` over raw body with `STRIPE_WEBHOOK_SECRET` |
| `POST /api/webhooks/razorpay` | Razorpay | `X-Razorpay-Signature` HMAC with `RAZORPAY_WEBHOOK_SECRET` |
| `POST /api/webhooks/[gateway]` | Other gateways | Adapter-defined `verifyWebhook()` |
| `POST /api/webhooks/messaging/resend` | Resend | Svix signature headers |
| `GET/POST /api/webhooks/messaging/whatsapp` | Meta Cloud API | `hub.verify_token` on GET; `X-Hub-Signature-256` with app secret on POST |
| `POST /api/webhooks/messaging/twilio` | Twilio | `X-Twilio-Signature` |
| `POST /api/internal/outbox` | Vercel Cron | `Authorization: Bearer CRON_SECRET` |
| `POST /api/internal/daily` | Vercel Cron | same |

Webhook behaviour: verify first (reject with 401/400, no body processing), de-duplicate on `webhook_events`, process in a transaction, return 200 quickly, push slow work to the outbox.

## 4. Rate limiting

Implementation: `@upstash/ratelimit` sliding window over Upstash Redis (REST). Named limiters in `platform/ratelimit/limiters.ts`; one `identify()` helper creates the key.

**Identity:** `HMAC(salt, client IP)` from the trusted `x-forwarded-for` hop on Vercel; plus `user:{uid}` for authenticated routes; plus an identifier such as the normalised email or phone where stated. Keys are prefixed per limiter.

| ID | Surface | Limit | Key | On Redis failure |
|---|---|---|---|---|
| RL-PUB-1 | `POST /api/public/enquiry` | 5 per 10 min | IP | fail closed |
| RL-PUB-2 | same | 3 per hour | phone or email | fail closed |
| RL-GEN | All public pages and assets via middleware | 100 per min | IP | fail open (log) |
| RL-AUTH-1 | `/admin/login` attempts | 5 per 15 min | IP + email | fail closed |
| RL-AUTH-2 | Account lock | 10 failures then 15 min lock | email hash (DB) | n/a (DB-backed) |
| RL-AUTH-3 | Forgot password and resend verification | 3 per hour per email; 10 per hour per IP | email, IP | fail closed |
| RL-AUTH-4 | MFA verification | 5 per 10 min | user | fail closed |
| RL-ADM-1 | Admin mutations (server actions) | 120 per min | user | fail open (log) |
| RL-ADM-2 | Admin reads | 600 per min | user | fail open (log) |
| RL-ADM-3 | Exports | 10 per hour | user | fail closed |
| RL-ADM-4 | Upload signing | 60 per hour | user | fail open (log) |
| RL-MSG-1 | Manual message send | 60 per hour | user | fail closed |
| RL-MSG-2 | Automated sends | 5 per day per customer; `AUTOMATED_MSG_DAILY_CAP` global per channel | customer, global | worker defers |
| RL-WH-1 | Webhooks (after signature check) | 600 per min | gateway/provider | fail open (log) |
| RL-CRON | Internal endpoints | 10 per min | secret | fail closed |

Behaviour: return `429` with `Retry-After`; the UI shows a friendly message and disables the control until the window ends. Limits that protect secrets (login, reset, MFA) are enforced both in middleware (cheap, first) and inside the action (second line).

## 5. Input validation

- One Zod schema per operation in each module's `application/validation/`; the same schema is used by the form (client hint) and the server (authority).
- Strings trimmed and length-bounded; phone normalised to E.164; email normalised to lower case; money as integer minor units with min/max; enums closed; JSON bodies limited to 100 KB (1 MB for uploads metadata).
- Public form extras: honeypot field `website` must be empty; minimum fill time 3 seconds (signed timestamp token); optional Turnstile token.

## 6. Idempotency and concurrency

| Operation | Mechanism |
|---|---|
| Payment recording and webhooks | Unique `(gateway, gateway_ref)`; `webhook_events` de-dupe |
| Invoice and order creation | `Idempotency-Key` stored in `idempotency_keys` with response hash |
| State transitions | Optimistic concurrency via `updated_at`/`version` check in the RPC; invalid transitions rejected |
| Outbox | `dedupe_key` unique per event and recipient; `SKIP LOCKED` claim |
| Double-click submits | Server returns the original result for the same key |

## 7. API versioning and documentation

Public API is internal to the app (no third-party consumers), so no URL versioning at launch. Webhook payload handling is tolerant to additive fields. An OpenAPI-style table of the above is maintained in this document and mirrored in code comments during development.

## Open questions

1. Is Cloudflare Turnstile allowed (affects RL-PUB and CSP)?
2. Should exports be allowed for operators with an approval, or super admin only (assumed super admin only)?
3. Do we need a public order-tracking endpoint later (would need its own limiter and tokenised links)?
