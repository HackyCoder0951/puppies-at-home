# 01. Executive Summary

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Owner** | Project owner (assignment submitter) |
| **Related** | `00-README-and-review-guide.md`, `02-product-requirements.md`, `04-system-architecture.md`, `docs/05-research/` |

## 1. What is being built

Two products in one repository and one deployment:

1. **Public website**: a faithful clone of https://puppy.instabizweb.com/ (TeddyPups U.A.E., a Dubai teacup-puppy business). It is an illustrated, scroll-driven site with 8 routes: Home, Puppies, Puppy detail, Gone home, Happy families, How it works, FAQ and Visit & contact. The research behind it is in `docs/05-research/` (files 02 to 05).
2. **Private admin portal** at `/admin`: a real Supabase-backed back office that makes the public site dynamic and runs the business: content, enquiries, customers, orders, delivery tracking, payments, invoices, message templates and automated notifications (email, WhatsApp, in-app).

The portal is **not discoverable**: no link from the public site, no SEO tags, `noindex`, and entry only by typing `/admin`.

## 2. Why

- **Assignment** (Insta Biz Web): clone the reference site's design, layout, responsiveness, functionality, UX and content structure; deliver a live site, a GitHub repository and a Loom walkthrough that explains the process, tools, AI prompts and decisions.
- **Product value**: the clone alone is a static showcase. Making it dynamic and adding an operations portal turns it into a defensible full-stack project that can be explained in a technical interview.

## 3. Scope split

| Area | In scope | Priority |
|---|---|---|
| Public clone (all routes, responsive, interactions) | Yes | P0 |
| Public content served from Supabase | Yes | P0 |
| Admin auth (invite-only, verification, reset, TOTP), RBAC (2 roles), audit log | Yes | P0 for portal |
| Content management (puppies, gone-home, families, FAQs, settings) | Yes | P0 for portal |
| Enquiries inbox, customers | Yes | P1 |
| Orders, deliveries, payments ledger, invoices | Yes | P1 |
| Notifications (outbox, Resend, WhatsApp provider, in-app) | Yes | P1 |
| Payment gateways beyond manual (Stripe, Razorpay, others via env) | Yes | P2 |
| Signature animation polish (door scroller, curtain, mascot rig, paw cursor) | Yes | P1/P2 |

Out of scope for this phase: any code or infrastructure. This phase produces documents only (see `00`).

### 3.1 Delivery order (owner decision, 2026-11-02)

**Frontend UI/UX first, on mock data taken from the reference; backend and admin portal later.** The scope table above stays as the full target; only the order changes. See `17-implementation-roadmap.md` section 0 and `20-mock-data-spec.md`.

## 4. Target stack (to be confirmed at review)

Next.js App Router + TypeScript + Tailwind v4 (same family as the reference), Supabase (Postgres, Auth, Storage, RLS), Upstash Redis for rate limiting, Resend for email, WhatsApp Cloud API or Twilio for WhatsApp, Stripe/Razorpay/manual payment gateways behind one adapter interface, Vercel hosting. Full rationale in `04-system-architecture.md` and `16-risk-register-and-decisions.md`.

## 5. Key design principles

0. **Modular monolith with an enterprise layered structure** (`21`): business modules with domain, application (business logic), infrastructure and presentation layers; shared functions, navigation and composition root; strict module boundaries enforced by tooling.
1. **Reproduce the reference first**, improve second. Improvements are labelled separately.
2. **Database is the security authority.** Row-level security and DB functions enforce roles; the UI only mirrors them.
3. **Everything configurable lives in env or settings**, not code (gateways, providers, limits, contact details).
4. **Idempotent and transactional money and messaging**: payments and notifications use unique keys and a transactional outbox so retries never double-charge or double-send.
5. **No SEO or public surface for admin**: isolated layout, headers and robots rules.
6. **Optimise queries by design**: indexes, keyset pagination, cached public reads, no N+1.

## 6. Timeline and effort (honest view)

The assignment limit is **48 hours**. The full scope is far larger than that. The recommended approach is vertical slices, with the clone first because it alone satisfies the assignment:

1. Public clone from seed data (P0).
2. Portal foundation: auth, RBAC, audit, rate limiting (P0 for portal).
3. Content management with the public site reading Supabase.
4. Enquiries and customers, then orders, deliveries, payments and invoices.
5. Notifications, then gateway adapters, then motion polish.

Estimates and cut lines are in `17-implementation-roadmap.md`. Each slice is independently demonstrable in the Loom video.

## 7. Top risks (full register in `16`)

| Risk | Impact | Mitigation |
|---|---|---|
| Scope far exceeds 48 hours | Incomplete portal, rushed quality | Clone first, then slices; cut gateway adapters and motion polish first |
| Reference artwork and photos are the owner's property | Cannot reuse assets | Replacement assets; owner permission as an open decision |
| Heavy scroll animation hurts performance and accessibility | Poor Lighthouse, motion complaints | Reduced-motion fallbacks, non-pinned grid below 1024px, performance budget |
| Payments and messaging are error-prone | Double-charge, duplicate messages, data leaks | Idempotency keys, outbox, signature-verified webhooks, RLS tests |
| WhatsApp business templates need Meta approval | Delayed automated WhatsApp | Provider adapter, email first, wa.me manual fallback |
| UAE gateway availability (Razorpay is India-focused) | Gateway cannot be used | Env-selected gateways; `manual` always available; verify before relying |

## 8. Decisions needed from the reviewer

Listed in `00-README-and-review-guide.md` section 5 and in `RESEARCH-SIGNOFF.md`. The main ones: loading curtain and roaming mascot, gateway scope, WhatsApp provider, asset reuse, whether the portal is part of the 48-hour assignment, data retention, and operator permission flags.

## Open questions

1. Is the admin portal part of the graded 48-hour deliverable, or a follow-on? (Affects the cut line.)
2. Will the owner of the reference site allow asset reuse?
3. Which live gateway, if any, must work on day one?
