# 25. Backend Development Plan (Supabase backend and `/admin` portal)

| | |
|---|---|
| **Status** | Approved by the owner 2026-11-02; **in progress** (started 2026-11-02, phase B0) |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `04`, `05`, `06`, `07`, `08`, `09`, `10`, `11`, `12`, `14`, `17` section 0.2, `21`, `22` (style reference) |
| **Owner decisions** | Full portal (about 110 h); database developed on local Supabase (Docker) plus a cloud staging project; payments = manual ledger then **Stripe only first** (Razorpay later through the same adapter interface); tax = **VAT 5% added, configurable**; email via Resend plus `wa.me` links; Upstash Redis rate limiting; Vercel hosting; roles `super_admin` and `operator`; email and password with verification, reset and optional TOTP; the AI assistant (`26` to `30`) is built **last** |

## 1. Goal and rules

Turn the frontend (mock data) into a real system: Supabase as system of record with RLS as the authorisation layer, the public site reading published views, a private `/admin` portal (no SEO, no public link), orders, deliveries, payments, invoices, notifications, privacy tooling. Rules from `21`: modules with four layers, public APIs between modules, thin `app/`, config only through `shared/config`. After each phase: one test-and-fix pass (no fix loops), incremental Conventional Commits with **no co-author or tool attribution lines**, a local annotated tag `backend/mN-*`, and progress and prompt log entries.

## 1b. Repository layout (owner decision 2026-11-02: backend in its own root folder)

```
repo/
  package.json            npm workspaces: app, backend (one install, one lockfile)
  app/                    Next.js app: pages, components, UI modules (catalog, content, crm, storefront), composition root, thin route files
  backend/                everything server side that is not UI
    supabase/             config.toml, migrations, seed, pgTAP tests (local stack on ports 55320 to 55329)
    src/config/           environment schema (the single reader of process.env)
    src/kernel/           Result, errors, ports (framework free); re-exported by app/src/shared/kernel
    src/platform/         Supabase clients, rate limiting, logging
    src/modules/<m>/      backend modules (identity, commerce, billing, messaging): domain, application, infrastructure
    src/adapters/<m>/     Supabase adapters for the app's ports (catalog, content, crm), structurally typed, no import from app/
  docs/
```

Rules: the backend never imports `app/` (architecture test `backend-independence`); the app imports the backend through the aliases `@backend/*` and `@platform/*`; adapters implement the app's ports structurally and are wired only in `app/src/composition`; backend modules follow the same layer rules as app modules; Supabase and Upstash SDKs are imported only under `backend/src/platform` or an `infrastructure/supabase` folder. `npm run verify` at the repository root runs lint, typecheck, tests and the build for both workspaces. Admin pages (presentation) stay in `app/` and call backend use cases.

## 2. What the frontend track changed (adjustments to earlier documents)

1. Verbatim reference markup (gone-home tickets, family wall, home lineup, home families and FAQ preview, per-puppy sketch art) must become data-driven in B2, with a deterministic art generator for puppies without extracted art.
2. Site CSS and fonts move from the root layout into `(site)/layout.tsx` so the admin does not load them; the admin gets its own Tailwind v4 stylesheet (B3).
3. Fixtures point at files in `app/public/media`; seeding uploads them to the `site-media` bucket and stores `storage_path` (B2).
4. Domain shapes that adapters must return are fixed by the frontend (`Puppy`, `Media`, `FamilyPhoto`, `Faq`, `Testimonial`, `SiteSettings`, `HowItWorksCopy`) and the filter semantics (AND between groups, breed and sex single choice, pair matches both sexes).
5. Next 16: the admin gate file may be named `proxy.ts` rather than `middleware.ts`; verify against the installed version before writing it.
6. Local Supabase uses ports 55320 to 55329 (the default 543xx range is taken by other stacks on the development machine); `supabase/config.toml` records this.

## 3. Phases

| Phase | Name | h | Depends on | Tag | Done when |
|---|---|---|---|---|---|
| B0 | Backend setup | 4 | none | `backend/m0-setup` | `supabase start` and `db reset` work; env schema covers new keys; platform clients exist; architecture rules cover the SDK boundary |
| B1 | Schema and RLS foundation | 6 | B0 | `backend/m1-schema` | pgTAP RLS tests RLS-001..005, 017 pass |
| B2 | Public site on Supabase (done 2026-11-02) | 11 | B1 | `backend/m2-public` | `DATA_SOURCE=supabase` renders the same pages as mock (visual comparison within tolerance); an enquiry lands in the database |
| B3 | Admin foundation (core done 2026-11-02; TOTP, invites, timeout deferred to B12) | 12 | B1 | `backend/m3-admin` | AC-012, AC-013, AC-019 (auth), AC-020; unauthenticated `/admin/*` exposes nothing |
| B4 | Content management (core done 2026-11-02; families, reorder, sketch art deferred) | 10 | B3 | `backend/m4-content` | AC-015, T-CNT-*; changes appear on the public site within seconds |
| B5 | Enquiries and customers | 7 | B3 | `backend/m5-crm` | T-ENQ-01, T-CUS-01 |
| B6 | Orders and deliveries | 9 | B5 | `backend/m6-commerce` | T-ORD-01, T-DEL-01; invalid transitions rejected in the database |
| B7 | Payments (manual) and invoices | 10 | B6 | `backend/m7-billing` | AC-016, AC-017 (manual), T-PAY-01/03, T-INV-* |
| B8 | Notifications | 12 | B7 | `backend/m8-messaging` | AC-018, T-MSG-*, T-NOT-* |
| B9 | Stripe | 5 | B7 | `backend/m9-stripe` | T-PAY-02, AC-017 (gateway) in Stripe test mode |
| B10 | Dashboard and exports | 4 | B7, B8 | `backend/m10-dashboard` | NFR-PERF-009 |
| B11 | Privacy tooling | 8 | B5, B8 | `backend/m11-privacy` | `06` section 6 tests; export and erase verified on a seeded subject |
| B12 | Quality and security | 8 | B4 to B11 | `backend/m12-quality` | AC-014, AC-019, AC-022..024 |
| B13 | Deployment and docs | 5 | B12 | `backend/m13-release` | AC-021; submission pack |
| | **Total** | **111** | | | about 103 h of tasks plus contingency in B-phases |

Stop-loss rules (`17` section 4): a phase over 150% of its estimate triggers a scope cut inside that phase; no Stripe work before the ledger tests pass; no notification automation before outbox atomicity and idempotency tests pass.

## 4. Phase B0 tasks (4 h)

| Task | Work | h |
|---|---|---|
| B0-01 | `supabase init`, local stack on ports 55320 to 55329, unused services off, npm scripts (`db:start`, `db:stop`, `db:reset`, `db:test`, `db:types`) | 1.0 |
| B0-02 | Extend `shared/config/env.ts` (Supabase, Upstash, cron, session keys) with validation rules for `DATA_SOURCE=supabase`; update `.env.example` and `14` | 1.0 |
| B0-03 | `platform/` clients: Supabase server, browser, service-role (server only), Upstash limiter helper, logger and request id | 1.0 |
| B0-04 | Architecture rules: SDKs only in `platform` and `infrastructure/supabase`; service-role client forbidden outside cron, webhook and bootstrap files; tests and lint | 0.5 |
| B0-05 | Documentation (this plan, vendor register region note D17), progress and prompt log entries, tag | 0.5 |

## 5. Dependencies on the owner (needed before the phase that uses them)

| Needed | By | Notes |
|---|---|---|
| Docker (available) | B0 | Local stack runs |
| Supabase staging project and region decision (D17) | B2 deploy, B13 | Choose with counsel; record in the vendor register |
| Upstash Redis database | B2 (limits in live use) | Local development uses the in-memory limiter |
| Resend account and sending domain (SPF, DKIM) | B8 | Sender address and reply-to |
| Stripe test keys, later UAE live account | B9 | Test mode only until confirmed |
| Vercel project and domain | B13 | Cron and environment |
| First super admin email | B3 | Used by the bootstrap script |
| VAT number, invoice wording, business address | B7 | Printed on invoices |
| Privacy and terms text, legal review (D16), Data Protection Lead | B11, B13 | Placeholders until supplied |

## 6. Risks

| Risk | Mitigation |
|---|---|
| Verbatim reference markup resists templating (B2) | Template one card per page from the first element, as done for the doors and FAQ notes; keep generated art for known slugs and a generator for new ones; visual comparison as the gate |
| RLS mistakes expose data | pgTAP suite per role and table before any adapter work; anon reads views only |
| Outbox double sends | Unique `dedupe_key`, `SKIP LOCKED`, idempotent provider calls, tests before enabling rules |
| Scope (about 110 h) | Phases ship independently; B9 to B11 can slip without blocking B2 to B8 |
| Next 16 API differences (proxy, caching) | Read the installed version's behaviour and verify with a small spike before B2 and B3 |
| Port clashes with other local stacks | Dedicated 553xx ports (section 2) |

## Open questions

1. Supabase region (D17) and who creates the staging project and when.
2. Whether Razorpay is needed for any launch market (default: later).
3. Whether the owner wants the admin in English only (assumed, D9).
