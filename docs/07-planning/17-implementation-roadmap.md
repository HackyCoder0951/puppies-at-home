# 17. Implementation Roadmap

| | |
|---|---|
| **Status** | Draft, **LOCKED pending approval** (no development starts until the documents are approved) |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `01`, `02`, `16`, `15` |

## 0. Revised sequencing: frontend first (owner decision, 2026-11-02 about 01:15 IST)

**Decision:** build the frontend UI/UX first; deliver the backend later; all data is mocked from the reference site (`20-mock-data-spec.md`). The portal and Supabase work in sections 2 to 6 below are **deferred, not cancelled**; phases keep their numbers and move after the frontend track. This also resolves sign-off decision D1 (portal is a follow-on to the clone).

Development is still **locked until the owner explicitly says to start** (the review gate in `00`).

### 0.1 Frontend track (runs on mock data)

> **Detailed execution plan:** `docs/07-planning/22-frontend-development-plan.md` (task-level breakdown, hours per task, milestones, schedules, quality gates). The table below is the summary and its totals are identical (73 hours, 55 for P0 only). The complete dataset is in `docs/02-architecture/23-mock-data-catalogue.md`.

| Phase | Name | Key tasks | Depends on | Est. (h) | Priority | DoD |
|---|---|---|---|---|---|---|
| F0 | Setup and architecture skeleton | Repo, Next.js + TypeScript + Tailwind v4, fonts, lint, formatting, test runner, `shared/config/env.ts`, **module skeleton and path aliases, boundary lint rules, architecture tests (`21`)**, CI, preview deploy | Approval | 4 | P0 | Builds; boundary lint and architecture tests pass; preview URL live |
| F1 | Design system | Tokens (`docs/04-design-ux/reference-analysis/visual-design-analysis.md`), buttons, chips, tags, cards, polaroid, ticket, note, stamp, tape, dividers, focus and reduced-motion base; component gallery page | F0 | 5 | P0 | Gallery matches reference tokens |
| F2 | Layout | Header (transparent and solid), nav, mobile menu, bottom bar, footer, scene wrapper with gradients, skip link, 404 | F1 | 4 | P0 | Shell matches at 1920, 1024, 768, 375 |
| F3 | Modules on mock data | `catalog`, `content`, `crm` (submit slice): domain, application ports and use cases, DTOs, validation, mock infrastructure and fixtures from the reference (`20`), extraction script, composition root with `DATA_SOURCE=mock`, `navigation` registry and link builders; unit and contract tests | F0 | 5 | P0 | Fixtures validate; use cases tested; routes typed |
| F4 | Pages (static composition) | Home scenes (non-pinned first), Puppies with filters and URL state, detail (gallery, info, checklist, steps, form, prev/next, gone variant), Gone home, Happy families with lightbox, How it works with toggle, FAQ with search, Contact, plus `/privacy` and `/terms` pages (pending D16) | F2, F3 | 17 | P0 | AC-001 to AC-009 |
| F5 | Forms | Shared schema, validation, consent line, 18+ statement and unticked optional boxes, mock submit, success and error states with the posting animation | F4 | 4 | P0 | AC-009 |
| F6 | Responsive and visual QA | Capture protocol, side-by-side checks, fixes (`docs/04-design-ux/reference-analysis/visual-qa-checklist.md`); mobile marked provisional until owner mobile captures exist | F4 | 8 | P0 | Visual QA table passes for priorities 1 to 6 |
| F7 | Signature motion | Pinned door scroller with grid fallback, journey phone states, stamps, sunset, house door, reveal-on-scroll, ticket and polaroid reveals | F4 | 10 | P1 | Interaction checks I-04 to I-09 |
| F8 | Polish | Curtain (≈0.8 s), mascot rig, paw cursor, roaming mascot, ambient loops | F7 | 8 | P2 | Behind feature flags |
| F9 | Accessibility, performance, deploy, docs, Loom | axe and Lighthouse pass, deploy, README, prompt log, Loom script | F6 | 8 | P0 | Submission pack complete |

Frontend-only effort: about **73 hours** with all motion, about **55 hours** for P0 only (F0 to F6 and F9). The clone-only path from the original plan (about 40 hours) did not include the mock layer, forms, and visual QA as separate items.

### 0.2 Backend track (deferred)

After the frontend is accepted, run the original phases in this order (numbers unchanged below): **4** backend foundation, **5** switch the public site to Supabase repositories (`DATA_SOURCE=supabase`), **6** admin foundation, **7** content management, **8** enquiries and customers, **9** orders and deliveries, **10** payments and invoices, **11** notifications, **12** gateways, **13** dashboard and exports, then **13b** privacy tooling (consent records, request queue, export and erase across modules, retention jobs, incident register, about 8 hours; `06` section 6), then **17** quality and security. Phases 1 to 3 of the original plan are replaced by F0 to F6; 14 and 15 by F7 and F8; 16, 18 and 19 by F6 and F9.

### 0.3 Rules for the frontend track

- Follow the modular monolith rules in `21`: layers inside each module, public APIs between modules, thin `app/` pages, all links through `navigation`.
- No component imports Supabase or any backend code; data comes only from use cases and ports (`04` section 9).
- Do not build `/admin` pages, authentication, payments or notifications in this track.
- Keep forms posting through the `EnquiryService` interface so the real endpoint can replace the mock.
- Mobile layouts follow `docs/04-design-ux/reference-analysis/mobile-analysis.md` and are marked provisional until owner mobile screenshots exist.
- Media follows the decision on `20-mock-data-spec.md` section 7 (default: placeholders).


### 0.4 AI assistant track (planned)

A separate track adds a public AI puppy assistant (RL-based RAG agent over a frozen Claude model, retrieval from generated JSON only, no internet). It is planned in `docs/04-design-ux/26`, `docs/02-architecture/27`, `docs/03-security-privacy/28`, `docs/06-quality/29` and `docs/07-planning/30` (phases A0 to A9, about 67 hours, minimum viable slice A1 to A4 about 30 hours). The MVP needs none of the backend phases; persistence, rate limiting at scale and reviewer screens depend on backend phases 4, 5 and 6.

## 1. How to read this

Estimates are in focused working hours for one developer working with AI assistance. They are planning aids, not promises. Every phase ends with a **Definition of Done (DoD)** that maps to acceptance criteria (`15` section 7). Priorities follow the P0/P1/P2 scheme.

## 2. Phases

| Phase | Name | Key tasks | Depends on | Est. (h) | Priority | DoD |
|---|---|---|---|---|---|---|
| 0 | Setup | Repo, Next.js + TS + Tailwind v4, lint and format, `shared/config/env.ts`, Supabase project and local stack, migrations scaffold, CI, preview deploy | Approval | 3 | P0 | App builds; preview URL live; env validation works |
| 1 | Design system | Tokens, fonts, buttons, chips, cards, polaroid, ticket, note, stamp, tape, scallop and wave dividers, focus and reduced-motion base | 0 | 5 | P0 | Component gallery page matches research tokens |
| 2 | Public layout | Header, menu overlay, bottom bar, footer, scene wrapper with gradients, skip link, 404 | 1 | 4 | P0 | AC-003, AC-010 on shell |
| 3 | Public pages (static data) | Home scenes (non-pinned versions), Puppies with filters, detail, Gone home, Happy families (+ lightbox), How it works (+ toggle), FAQ (+ search), Contact (letter form UI), seed content | 2 | 14 | P0 | AC-001, 002, 004..008 |
| 4 | Backend foundation | Schema migrations for identity, content, CRM; RLS and helper functions; seed; generated types; public views; storage buckets | 0 | 6 | P0 portal | RLS tests RLS-001..005, 017 pass |
| 5 | Public site on Supabase | Cached readers, tags, revalidation hook, `create_enquiry` RPC and `/api/public/enquiry` with rate limits and honeypot | 3, 4 | 5 | P0 | AC-009, AC-015 (read side), T-PUB-09 |
| 6 | Admin foundation | Admin layout (noindex), login, verify, forgot and reset, MFA, session timeout, middleware gate, rate limits, audit log, users module, bootstrap script | 4 | 10 | P0 portal | AC-012, AC-013, AC-019 (auth), AC-020 |
| 7 | Content management | Puppies and media (uploads), gone-home, families, FAQs, testimonial, settings, revalidation | 6 | 10 | P0 portal | AC-015, T-CNT-* |
| 8 | Enquiries and customers | Inbox, detail, notes, assign, convert; customers list and profile, duplicate detection | 6 | 7 | P1 | T-ENQ-01, T-CUS-01 |
| 9 | Orders and deliveries | Orders, items, state machine RPCs, timeline, deliveries with events, documents | 8 | 9 | P1 | T-ORD-01, T-DEL-01 |
| 10 | Payments (manual) and invoices | Ledger, `record_payment`, refunds (request, approve), invoices, issue, PDF, send | 9 | 10 | P1 | AC-016, AC-017 (manual), T-PAY-01/03, T-INV-* |
| 11 | Notifications | Templates and editor, rules, outbox and worker, Resend adapter, WhatsApp adapter, provider webhooks, in-app bell with Realtime, message log | 10 | 12 | P1 | AC-018, T-MSG-*, T-NOT-* |
| 12 | Gateways | Stripe and Razorpay adapters, registry, webhooks, payment links, reconciliation job | 10 | 8 | P2 | T-PAY-02, AC-017 (gateway) |
| 13 | Dashboard and exports | Aggregate RPC, dashboard, CSV exports, daily jobs (overdue, retention) | 10, 11 | 4 | P1 | NFR-PERF-009 |
| 14 | Motion: signature | Pinned door scroller with fallback, journey phone states, passport stamps, sunset and house door, polaroid and ticket reveals | 3 | 10 | P1 | T-PUB-14, motion checks |
| 15 | Motion: polish | Loading curtain, mascot rig loops, paw cursor, paw-print layer, roaming mascot, ambient loops | 14 | 8 | P2 | Visual comparison |
| 16 | Responsive and visual QA | Breakpoint pass, visual diff vs reference, fix list | 3, 14 | 6 | P0 | AC-001, AC-010 |
| 17 | Quality and security | Accessibility pass, Lighthouse, RLS and security suite, load and `EXPLAIN` checks, dependency audit | 7..13 | 8 | P0/P1 | AC-014, AC-019, AC-022..024 |
| 18 | Deployment | Production Supabase, env, domain, cron, webhooks, smoke tests, rollback rehearsal | 17 | 3 | P0 | AC-021 |
| 19 | Documentation and Loom | README, runbook, architecture summary, prompt log, Loom script and recording | all | 5 | P0 | Submission pack complete |

Total estimated effort: about **147 hours** for everything (phases 0 to 19). Phases 0 to 3, 16, 18 and 19 together are the clone-only path at about **40 hours**.

## 3. 48-hour schedules

The assignment gives 48 elapsed hours, not 48 working hours. Assume at most **30 productive hours** after sleep, breaks and reviews.

### 3.1 Ideal schedule (everything in scope)

About 147 focused hours (section 2). That is roughly 5 to 6 full working days for one developer with AI assistance, so it does **not fit inside 48 elapsed hours**. It needs either a deadline extension, more people, or the extended plan in 3.4.

### 3.2 Minimum viable schedule (inside 48 hours): the clone first

| Block | Hours | Work |
|---|---|---|
| 0 to 3 | 3 | Phase 0 |
| 3 to 8 | 5 | Phase 1 |
| 8 to 12 | 4 | Phase 2 |
| 12 to 26 | 14 | Phase 3 (all pages, interactions, static data) |
| 26 to 30 | 4 | Phase 16 (responsive and visual QA, partial) |
| 30 to 33 | 3 | Phase 18 (deploy) |
| 33 to 38 | 5 | Phase 19 (docs, prompt log, Loom) |
| 38 to 48 | 10 | **Buffer** (fixes, review, motion Phase 14 subset) |

Result: complete public clone, deployed, documented. Portal presented as documented architecture with a small Phase 4 and Phase 6 spike if time allows.

### 3.3 Emergency schedule (if behind at hour 30)

Cut, in this order: Phase 15 polish, Phase 14 pinned scroller (keep grid), curtain, mascot overlay, hero arches, journey phone animation; keep static versions. Preserve P0: all routes, responsiveness, navigation, CTAs, filters, FAQ, forms (even with a simple form endpoint), deployment and the Loom.

### 3.4 Extended plan for the portal (after the clone is delivered)

| Week/Block | Phases |
|---|---|
| Block A (2 days) | 4, 5, 6 |
| Block B (2 days) | 7, 8 |
| Block C (3 days) | 9, 10 |
| Block D (2 days) | 11, 13 |
| Block E (2 days) | 12, 14, 15 |
| Block F (1 day) | 17, 18, 19 update |

## 4. Stop-loss rules

- Any phase exceeding 150% of its estimate triggers a scope cut for that phase.
- Motion work never starts before the static page is correct and responsive.
- No gateway work before the manual ledger and invoices pass their tests.
- No notification automation before the outbox atomicity and idempotency tests pass.

## 5. Dependencies on the owner

Decisions in `00` section 5, asset permission, Supabase/Vercel/Upstash/Resend accounts, sender domain, WhatsApp business setup, gateway onboarding, VAT and invoice rules, privacy wording.

## 6. Release checklist (summary)

Migrations applied; seeds loaded; env set and validated; cron configured; webhooks registered and tested; first super admin bootstrapped and MFA enrolled; rate limiting active; robots and sitemap verified; admin noindex verified; backups on; smoke tests green; rollback ready.

## Open questions

1. Is the admin portal part of the 48-hour deliverable? (Changes which schedule applies.)
2. Is more than one developer or additional time available for the portal?
3. Who tests on physical devices?
