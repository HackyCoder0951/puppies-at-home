# 16. Risk Register and Decision Log

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `01`, `17`, all architecture docs |

## 1. Risk register

Scale: Probability (L/M/H), Impact (L/M/H).

| ID | Risk | Prob. | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R-01 | Scope (clone + full operations portal) far exceeds 48 hours | H | H | Clone first; portal in demonstrable slices; cut line in `17`; confirm whether portal is in the graded scope | Owner |
| R-02 | Reference photos and artwork cannot be reused | H | M | Placeholder assets and own illustrations; ask owner for permission; asset list in research 04 section E3 | Owner |
| R-03 | Heavy animation (pinned scroll, curtain, decorative layers) hurts performance and accessibility | M | H | Progressive enhancement, reduced-motion fallbacks, performance budget, feature flags to disable curtain and mascot | Dev |
| R-04 | Cross-browser gaps for `animation-timeline: view()` | M | M | `@supports` guard; static end states; test Safari and Firefox | Dev |
| R-05 | RLS misconfiguration leaks data or blocks users | M | H | Default deny, per-operation policies, SQL test suite (RLS-001..018), review before release | Dev |
| R-06 | Service-role key leaks to client or logs | L | H | `server-only` modules, bundle scan, secret scanning, rotation runbook | Dev |
| R-07 | Duplicate payments or messages from retries and webhooks | M | H | Unique keys, idempotency table, outbox with `SKIP LOCKED`, replay tests | Dev |
| R-08 | Payment gateway unavailable for a UAE merchant (especially Razorpay) | M | M | Env-selected adapters; manual gateway always present; verify onboarding before building adapters | Owner |
| R-09 | WhatsApp template approval delays or business verification blocks automation | H | M | Email first; wa.me fallback; adapters ready; apply for approval early | Owner |
| R-10 | Provider quotas or bans (WhatsApp, Resend) from bursts | M | M | Caps, quiet hours, rate limits, kill switch | Dev |
| R-11 | Admin account takeover | M | H | Invite only, MFA for super admins, lockout, breach check, session limits, alerts | Dev |
| R-12 | Redis outage disables protection or blocks forms | L | M | Documented fail-closed/open behaviour; DB lockout as second layer | Dev |
| R-13 | Slow queries as data grows | M | M | Index plan, keyset pagination, load tests with 50k rows | Dev |
| R-14 | Caching bug shows stale or unpublished content | M | M | Tagged revalidation tests; views limit data to published rows | Dev |
| R-15 | Personal-data handling non-compliant (consent, retention) | M | M | Opt-in tracking, retention job, export/anonymise tools, privacy text from owner | Owner |
| R-16 | AI-generated code quality or hidden security flaws | M | H | Human review, tests, security checklist, prompt log, no secrets in prompts | Dev |
| R-17 | Deployment issues (env, cron, webhooks) near the deadline | M | M | Early preview deploys, deployment checklist, rollback plan | Dev |
| R-18 | Time lost on illustration and motion perfection | H | M | P0/P1/P2 discipline; fidelity targets per phase; stop-loss times in `17` | Dev |
| R-19 | Requirement drift from continuous additions | M | M | Documents approved before development; change log; scope table in `01` | Owner |
| R-20 | Currency, VAT and invoice rules wrong for the UAE | M | M | Confirm with owner or accountant; configurable tax rates; invoice template review | Owner |

| R-21 | Processing personal data without a confirmed legal position (UAE PDPL executive rules, GDPR and DPDP applicability) | M | H | Legal review before production (D16); strictest-baseline design (`06` 6.2); mock data only until then | Owner |
| R-22 | Family photos, including children, published without valid consent | M | H | Release per photo, withdrawal within 24 hours, placeholders in the frontend track (`06` 6.13) | Owner |
| R-23 | Cross-border transfers to vendors without a mechanism | M | M | DPA and transfer record before onboarding; region decision D17 (`06` 6.8) | Dev |
| R-24 | Missed breach-notification deadlines | L | H | Runbook, register, 72-hour design target (`06` 6.10) | Security Officer |
| R-25 | Laws and regulations change (DPDP rules, PDPL executive regulations, GDPR guidance) | H | M | Items marked verify; yearly legal review; configuration for retention and SLA | Owner |

## 2. Decision log (ADR style)

Each entry: context, decision, alternatives, consequences. Status Proposed until review.

### ADR-001. Next.js App Router for site and admin

- **Context:** the reference is built with Next.js; the project needs SSR, caching with tags, server actions and route handlers.
- **Decision:** one Next.js app with two route groups.
- **Alternatives:** Vite SPA plus separate API (more moving parts); two apps (duplicate setup).
- **Consequences:** shared types and auth helpers; must keep admin code out of public bundles.

### ADR-002. Supabase as backend; RLS is the authorisation authority

- **Context:** requirement for a real backend with auth, storage and roles.
- **Decision:** Postgres with RLS and RPC functions enforce permissions; app checks are secondary.
- **Alternatives:** custom API with an ORM (more code, easier to bypass rules); Firebase (different model).
- **Consequences:** SQL test suite required; policy design effort up front; service-role usage restricted.

### ADR-003. Two roles with a permission table

- **Context:** requested `super_admin` and `operator`.
- **Decision:** two roles, permissions stored in `role_permissions`, plus one profile flag for template editing.
- **Alternatives:** hard-coded role checks; full custom permission matrix per user.
- **Consequences:** future roles are data changes; per-user exceptions are not supported.

### ADR-004. Invite-only accounts with email verification, password reset, TOTP

- **Decision:** disable public sign-up; invitation links; TOTP mandatory for super admins.
- **Alternatives:** magic link only (no password reset needed but not requested); SSO (extra setup).
- **Consequences:** bootstrap script for the first admin; email deliverability must work.

### ADR-005. Upstash Redis sliding-window rate limiting

- **Context:** serverless runtime needs shared counters.
- **Decision:** `@upstash/ratelimit`; named limiters; fail-closed for public forms and secrets.
- **Alternatives:** in-memory (not shared); Postgres counters (slower, extra load).
- **Consequences:** another service and secret; fallback behaviour documented.

### ADR-006. Money as integer minor units; payments and invoices only through RPCs

- **Decision:** no floats; all payment state changes inside `record_payment` and related RPCs with unique references.
- **Consequences:** direct updates blocked; consistent totals; easier reconciliation.

### ADR-007. Payment gateway adapter registry from environment

- **Context:** Stripe, Razorpay and others requested, selected by configuration.
- **Decision:** adapter interface plus registry; `manual` always available; webhooks as source of truth.
- **Alternatives:** single gateway SDK in code (inflexible).
- **Consequences:** each gateway needs an adapter and tests; unconfigured gateways hidden.

### ADR-008. Transactional outbox for notifications

- **Decision:** write events in the same transaction as changes; a cron-triggered worker delivers with retries.
- **Alternatives:** send inside request handlers (loses messages on failure); external queue (extra infrastructure).
- **Consequences:** up to a minute of delay (plus immediate best-effort trigger); idempotent sends; pruning job.

### ADR-009. Email via Resend; WhatsApp via cloud provider adapter (Cloud API or Twilio)

- **Decision:** adapters; WhatsApp optional by env; `wa.me` manual fallback.
- **Consequences:** template approval process for WhatsApp; opt-in tracking required.

### ADR-010. Public site reads published views with tagged caching

- **Decision:** anon client against whitelisted views; `unstable_cache`/tags; admin actions call `revalidateTag`.
- **Consequences:** publish-to-live delay of seconds; no per-request DB load from visitors.

### ADR-011. Reproduce the reference first; improvements are separate and labelled

- **Decision:** fidelity is the acceptance basis; accessibility and performance improvements are optional flags noted in the specs.
- **Consequences:** some reference weaknesses (long curtain, contrast) are initially kept behind flags.

### ADR-012. Admin has no SEO and no public link

- **Decision:** isolated layout, `noindex`, no analytics, robots disallow, optional IP allow-list.
- **Consequences:** discovery only by typing `/admin`; password managers and bookmarks used by staff.

### ADR-013. Documentation first, with a review gate

- **Decision:** requirements and architecture are written and approved before any code.
- **Consequences:** this document set; development locked until explicit approval.

### ADR-014. Frontend first on mock data; backend later

- **Context:** the owner wants the UI/UX delivered first (2026-11-02), with the backend added later and data mocked from the reference.
- **Decision:** repository ports in each module's application layer (`modules/<m>/application/ports`, see ADR-015) with a mock implementation from the reference's data now and a Supabase implementation later; no backend code in the frontend track; the portal phases are deferred, not removed (`17` section 0).
- **Alternatives:** build the schema and portal first (slower to show the graded clone); hard-code content in components (makes the later backend a rewrite).
- **Consequences:** faster path to the graded deliverable; types double as the future view contracts; media rights need a decision (`20` section 7); forms are not persisted until the backend exists.

### ADR-015. Modular monolith with a layered enterprise structure

- **Context:** the owner requires a modular monolithic architecture with a proper enterprise project structure (domain, business logic, functions, navigation and so on), 2026-11-02.
- **Decision:** one deployable app organised into business modules (`catalog`, `content`, `crm`, `storefront` now; `commerce`, `billing`, `messaging`, `identity`, `backoffice` later), each with `domain`, `application`, `infrastructure`, `presentation`; shared kernel, pure functions, design system and config in `shared`; a typed `navigation` registry; cross-cutting `platform` services; a `composition` root; a thin Next.js `app/` shell. Boundaries enforced by lint and architecture tests (`21`).
- **Alternatives:** flat `lib/components` layout (simple, but couples everything and makes the backend phase a rewrite); microservices (operationally heavy and unnecessary).
- **Consequences:** more files and mapping code per feature; clear ownership; ports and adapters make mock and Supabase interchangeable; modules can be extracted later; F0 and F3 estimates rise by one hour each.

### ADR-016. Data protection: strictest-baseline standard

- **Context:** the business serves customers worldwide from the UAE; the owner asked for the data protection standard to follow international and UAE law (GDPR, HIPAA, DPDP, PDPL and similar), 2026-11-02.
- **Decision:** adopt one baseline that meets the strictest applicable obligation (GDPR) plus UAE PDPL and India DPDP specifics; treat HIPAA as not applicable (no human health data) and use it only as a security benchmark; implement through per-module `PersonalDataProvider`, consent and request records, retention jobs, masking, a breach register and a documented vendor and transfer register (`06` section 6).
- **Alternatives:** per-country variants (costly, error-prone); minimal compliance (risky for a worldwide seller).
- **Consequences:** extra tables and screens (FR-PRIV, section 5.8 of `02`), about 2 hours more in the frontend track, a legal review before production, privacy and terms pages that the reference site lacks.

## 3. Change log

| Date | Change | By |
|---|---|---|
| 2026-11-02 | Initial draft of all documents | AI assistant (for owner review) |
| 2026-11-02 01:22 | Frontend-first sequencing and mock data: ADR-014, `17` section 0, `20-mock-data-spec.md` | AI assistant, on owner instruction |
| 2026-11-02 01:37 | Data protection standard: ADR-016, `06` section 6 rewritten, FR-PRIV, NFR-PRIV-008 to 020, tables, tests, risks R-21 to R-25 | AI assistant, on owner instruction |
| 2026-11-02 01:29 | Modular monolith architecture: ADR-015, `21-modular-monolith-architecture.md`, paths updated in `04`, `08`, `10`, `13`, `14`, `17`, `20` | AI assistant, on owner instruction |

## Open questions

1. Who is the accountable owner for each risk marked "Owner"?
2. Is any ADR already decided differently by the client or the interviewer?
