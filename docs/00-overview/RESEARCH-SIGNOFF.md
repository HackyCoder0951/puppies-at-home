# RESEARCH SIGN-OFF

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Purpose** | One page to confirm what is known, what is assumed, what must be decided, and to approve moving from documentation to development |

## 1. What we know with confidence

Evidence from code, live measurement, or the owner's screenshots and recording (details in `docs/05-research/`).

- The reference is a Next.js (Turbopack) site with Tailwind v4, three self-hosted fonts (Fraunces, Figtree, Shantell Sans), Lenis smooth scroll, behind Cloudflare, with a strict CSP.
- Routes: `/`, `/puppies`, `/puppies/[slug]` (15 available and 27 gone-home slugs), `/gone-home`, `/happy-families`, `/how-it-works`, `/faq`, `/contact`; `sitemap.xml` and `robots.txt` exist.
- Brand palette, door colours, typography scale, spacing tokens, breakpoints, easing curves and the 46 keyframes (research 04).
- The home page is 8 themed scenes on one morning-to-night gradient; the puppies page has working multi-select filters synced to the URL; the happy-families page has a lightbox; the FAQ has live search and accordions; how-it-works has an In Dubai / Imported toggle; contact is a letter-style form; detail pages have a gallery, form and scroll-progress ribbon.
- Responsive switch points: inline nav at 1024px, bottom bar below 768px, passport book 2 columns at 900px, two-column scenes and pinned door scroller at 1024px; no horizontal overflow at 375, 768, 1024 (research 05).
- Contact details on the reference: WhatsApp and phone +971 54 167 6733, Downtown Dubai address, Instagram, TikTok and Facebook links.

## 2. What is inferred

- Public forms post to the site's own backend (CSP `form-action 'self'`); the behaviour after submit is unobserved.
- Filter combination logic (OR within a row, AND across rows) and the Korean Teacup / Imported semantics.
- Local-puppy variant of the "way home" steps on detail pages.
- Hero arch photos appear only at wide viewports (cut-off between 1024 and 1440 not measured).
- Happy-families column count on mobile.
- WhatsApp and gateway provider constraints (template approval, UAE availability) are based on general knowledge and must be verified with the providers.
- Data volumes, VAT and invoice rules, deposit policy and retention periods are assumptions.

## 3. What remains unknown

- Whether the owner permits reuse of the reference's photos, videos and artwork (assumed **no**).
- Whether the admin portal is inside the graded 48-hour scope.
- Real form-submit responses and error states on the reference (not submitted, to avoid sending data to the live business).
- Tablet layouts of every inner page other than 768px; exact counts at 1024+ for the puppy grid and gone-home tickets.
- Contrast ratios on dark scenes (not measured).
- Business inputs: gateway accounts, sender domain, WhatsApp business number, privacy wording, tax rate.

## 4. What must be verified during implementation

- Each FR and AC in `02` and `15` against the reference (visual diff) and against the database tests.
- Browser support for scroll-driven animations; fallbacks when unsupported.
- Rate-limit behaviour and Redis failure modes; webhook signature handling for each provider.
- RLS tests RLS-001 to RLS-018 and the extra cases added during development.
- Performance targets (`03`) with the illustration-heavy design; query plans at 50k rows.
- Gateway and WhatsApp onboarding status before building those adapters.

## 5. Proposed final scope (for approval)

| Area | Priority | Notes |
|---|---|---|
| Public clone, all 8 routes, responsive, interactions | P0 | Replacement assets unless permission is given |
| Public content from Supabase, tagged caching, revalidation | P0 | |
| Admin: isolation, invite-only auth, verification, reset, TOTP, sessions, rate limiting, audit, users | P0 (portal) | |
| RBAC with two roles enforced by RLS | P0 (portal) | `07` |
| Content management (puppies, media, gone-home, families, FAQs, settings) | P0 (portal) | |
| Enquiries, customers | P1 | |
| Orders, deliveries, payments ledger (manual), invoices with PDF | P1 | |
| Notifications: templates, rules, outbox, Resend, WhatsApp provider, in-app | P1 | WhatsApp automation depends on provider approval |
| Dashboard, exports, daily jobs | P1 | |
| Gateway adapters (Stripe, Razorpay, others) | P2 | Env-selected |
| Motion: signature (door scroller, journey phone, stamps, sunset, house door) | P1 | |
| Motion: polish (curtain, mascot rig, cursor, trails, roaming mascot) | P2 | Behind feature flags |

Explicitly not included: customer-facing accounts or order tracking pages, marketing campaigns, native apps, multi-currency orders, credit notes, Arabic localisation (unless requested).

## 6. Recommended technology stack

Next.js (App Router) + TypeScript + Tailwind v4 + Zod, structured as a **modular monolith** with layered modules (`21`); Supabase (Postgres, Auth, Storage, Realtime, RLS); Upstash Redis rate limiting; Resend; WhatsApp Cloud API or Twilio; Stripe and Razorpay (and others) behind adapters with a built-in manual gateway; Vercel with Cron; Vitest, Playwright, SQL tests; Lenis and CSS scroll-driven animations for the public site.

## 7. Estimated implementation time

About **147 working hours** for everything in `17`; about **40 hours** for the clone-only path (phases 0 to 3, 16, 18, 19). The 48-hour limit allows the clone with buffer; the portal needs additional days (see `17` section 3.4).

## 8. Highest-risk areas

1. Scope versus the 48-hour limit (R-01).
2. Asset rights (R-02).
3. RLS correctness and service-role handling (R-05, R-06).
4. Money and messaging idempotency (R-07).
5. WhatsApp approval and gateway availability (R-08, R-09).
6. Animation performance and accessibility (R-03, R-04).

## 9. Decisions needed from the reviewer

| # | Decision | Options | Recommended |
|---|---|---|---|
| D1 | Is the admin portal part of the 48-hour deliverable? | In scope / follow-on | **Resolved 2026-11-02 by the owner:** frontend UI/UX first on mock data; backend and portal delivered later (`17` section 0) |
| D2 | Loading curtain | Keep as in reference / shorten / drop | Keep behind a flag, shorten on repeat navigation |
| D3 | Roaming mascot overlay | Keep / drop | Keep behind a flag, disable on mobile if it blocks content |
| D4 | Gateways in v1 | Manual only / + Stripe / + Stripe and Razorpay | Manual first; Stripe next if the UAE account is available; Razorpay only if eligible |
| D5 | WhatsApp provider | Meta Cloud API / Twilio / none (wa.me only) | Start with email plus wa.me fallback; add Cloud API when approved |
| D6 | Asset policy | Replace all / use owner-approved | Replace unless written permission exists |
| D7 | Retention period | 12 / 24 / 36 months | 24 months |
| D8 | Operator flags | Template edit flag and refund request on / off | Both on, as documented |
| D9 | Languages | English only / English + Arabic | English only for v1 |
| D10 | Tax | VAT 5% added / included / none | Confirm with the owner or accountant |
| D11 | Turnstile on public forms | Yes / no | Yes if acceptable, otherwise honeypot plus rate limit |
| D12 | IP allow-list for admin | On / off | Off by default; option available |
| D13 | Media in the mock data (photos, videos) | A placeholders / B hotlink the reference / C local copies of the reference's media | **Resolved 2026-11-02 by the owner: A, placeholders** (same sizes, alt text, focal points and blur colours; `20` section 7) |
| D15 | Architecture style and structure | Flat `lib/components` / modular monolith / microservices | **Resolved 2026-11-02 by the owner: modular monolith with an enterprise layered structure** (`21`, ADR-015). Confirm the open questions in `21` (meaning of "functions", lint tooling, presentation-only modules) |
| D16 | Data protection and legal review | Proceed with the strictest-baseline standard in `06` section 6 and obtain legal review before production / skip review | **Adopt the standard now; legal review by UAE counsel before any real personal data is processed.** Also decide: Data Protection Lead and Grievance Officer, `/privacy` and `/terms` pages and a consent line on forms (not on the reference site), Arabic notice, analytics yes or no |
| D17 | Data residency (database and storage region) | Region options to be confirmed (including any Middle East region) | Decide with counsel; record in the vendor register |
| D14 | Mobile reference captures | Owner supplies 375×812 (and 390, 430, 768×1024) at 100% zoom / proceed with provisional mobile | Supply captures before the mobile pass (`docs/04-design-ux/reference-analysis/mobile-analysis.md` section 4) |

## 10. Approval

| Item | Approved | Date | Comments |
|---|---|---|---|
| Requirements (`02`, `03`) | ☐ | | |
| Architecture and data model (`04`, `05`) | ☐ | | |
| Security, RBAC, RLS (`06`, `07`) | ☐ | | |
| API, rate limits, queries (`08`, `09`) | ☐ | | |
| Payments and notifications (`10`, `11`) | ☐ | | |
| Admin UX and public spec (`12`, `13`) | ☐ | | |
| Environment and config (`14`) | ☐ | | |
| Test plan, risks, roadmap (`15`, `16`, `17`) | ☐ | | |
| Decisions D1 to D12 recorded above | ☐ | | |
| **Proceed to development (Phase 0)** | ☐ | | |

Reviewer name: ____________________  Signature or confirmation message: ____________________

## Reviewer notes

(write comments here or reply in the conversation)

- 2026-11-02 ~01:48 IST: the owner reported having reviewed all documents and asked for them to be reorganised under `docs/`. No change requests and no approval were stated, so the approval boxes above remain unticked.
