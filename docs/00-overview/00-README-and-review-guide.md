# 00. README and Review Guide

| | |
|---|---|
| **Status** | Draft; reviewed by the owner on 2026-11-02; approval to start development **not yet given** |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Gate** | **No development until the owner confirms these documents.** |

## 1. What this folder is

The complete requirements, architecture and planning documents for two deliverables:

1. A clone of https://puppy.instabizweb.com/ (TeddyPups U.A.E.).
2. A private, Supabase-backed admin portal at `/admin` (content, enquiries, customers, orders, deliveries, payments, invoices, message templates and automated notifications).

Evidence for the public site lives in [`05-research/`](../05-research/) (analysis, screenshots, video review, responsive measurements, raw captures). The rest of this `docs/` tree turns it into a buildable specification. The folder map is in [`../README.md`](../README.md).

## 2. Document index

Documents keep their numbers (other documents refer to them as "`06`", "`21`" and so on). The folder is the topic.

| # | Document | Folder | Read it to learn |
|---|---|---|---|
| 00 | [README and review guide](00-README-and-review-guide.md) | `00-overview` | This guide, glossary, decisions list |
| 01 | [Executive summary](01-executive-summary.md) | `00-overview` | Goals, scope, stack, risks, timeline in one page |
| — | [Research sign-off](RESEARCH-SIGNOFF.md) | `00-overview` | Confirmed / inferred / unknown, final scope, decisions D1 to D17, approval boxes |
| 02 | [Product requirements](../01-requirements/02-product-requirements.md) | `01-requirements` | Personas and FR-xxx functional requirements with priorities |
| 03 | [Non-functional requirements](../01-requirements/03-non-functional-requirements.md) | `01-requirements` | NFR-xxx: performance, security, privacy, accessibility, SEO, reliability, maintainability |
| 04 | [System architecture](../02-architecture/04-system-architecture.md) | `02-architecture` | Containers, flows (Mermaid), caching, environments |
| 21 | [Modular monolith architecture](../02-architecture/21-modular-monolith-architecture.md) | `02-architecture` | Modules, layers, dependency rules, navigation, composition, conventions, governance |
| 05 | [Data model](../02-architecture/05-data-model.md) | `02-architecture` | Tables, relations, state machines, RPCs, views, retention, ownership by module |
| 08 | [API and rate limiting](../02-architecture/08-api-and-rate-limiting.md) | `02-architecture` | Routes, actions, webhooks, error envelope, rate-limit table |
| 09 | [Query optimisation guide](../02-architecture/09-query-optimization-guide.md) | `02-architecture` | Access patterns, indexes, pagination, caching, verification |
| 10 | [Payments architecture](../02-architecture/10-payments-architecture.md) | `02-architecture` | Gateway adapters from env, flows, refunds, invariants |
| 11 | [Notifications and messaging](../02-architecture/11-notifications-and-messaging.md) | `02-architecture` | Events, rules, outbox worker, providers, templates, consent |
| 14 | [Environment and configuration](../02-architecture/14-env-and-configuration.md) | `02-architecture` | Every environment variable, flags, `.env.example` |
| 20 | [Mock data specification](../02-architecture/20-mock-data-spec.md) | `02-architecture` | Frontend-first data: shapes, inventory, repository boundary, media decision |
| 23 | [Mock data catalogue](../02-architecture/23-mock-data-catalogue.md) | `02-architecture` | The complete dataset: 15 + 27 puppies, 132 media, 64 family photos, 9 FAQs, templates, quirks and gaps |
| 22 | [Frontend development plan](../07-planning/22-frontend-development-plan.md) | `07-planning` | Task-level phases F0 to F9, hours, milestones, schedules, quality gates, definition of ready |
| 06 | [Security architecture and data protection](../03-security-privacy/06-security-architecture.md) | `03-security-privacy` | Admin isolation, auth, threat model, data protection standard (PDPL, GDPR, DPDP, HIPAA benchmark) |
| 07 | [RBAC and RLS specification](../03-security-privacy/07-rbac-and-rls-spec.md) | `03-security-privacy` | Roles, permission keys, matrix, RLS policy design, tests |
| 12 | [Admin portal UX specification](../04-design-ux/12-admin-portal-ux-spec.md) | `04-design-ux` | Screens and flows per module, states, accessibility |
| 13 | [Public site specification](../04-design-ux/13-public-site-spec.md) | `04-design-ux` | Consolidated clone specification and data integration |
| — | [Visual reference analysis](../04-design-ux/reference-analysis/screenshot-inventory.md) (7 files) | `04-design-ux/reference-analysis` | Screenshot-based analysis: inventory, design, desktop, mobile, interactions, components, visual QA |
| — | [Research analysis](../05-research/02-design-pattern-analysis.md) (files 02 to 05) | `05-research` | Design patterns, screenshot and video review, UI/UX animation, colour and layout, responsive measurements |
| — | [Evidence](../05-research/evidence/) | `05-research/evidence` | Raw captures, owner screenshots, screen recording (large; keep private) |
| 15 | [Test and QA plan](../06-quality/15-test-and-qa-plan.md) | `06-quality` | Test layers, matrices, acceptance checklist AC-001..027 |
| 16 | [Risk register and decisions](../07-planning/16-risk-register-and-decisions.md) | `07-planning` | Risks and ADR log |
| 17 | [Implementation roadmap](../07-planning/17-implementation-roadmap.md) | `07-planning` | Frontend track, backend track, estimates, schedules (locked) |
| 18 | [AI usage and prompt log](../08-process/18-ai-usage-and-prompt-log.md) | `08-process` | AI rules, prompt log template and prompts so far |
| 19 | [Development progress log](../08-process/19-development-progress-log.md) | `08-process` | Living timeline with timestamps |
| — | [Prompts](../08-process/prompts/) | `08-process/prompts` | The owner's master prompts that drive the research and the screenshot analysis |

### Related folders

All documentation now lives under `docs/`; there are no separate `research/` or `reference-analysis/` folders any more (their contents moved to `05-research/` and `04-design-ux/reference-analysis/`).

## 3. Suggested review order (about 90 minutes)

1. `01` executive summary, then `RESEARCH-SIGNOFF.md` sections 5, 8, 9.
2. `02` requirements: confirm scope and priorities.
3. `07` roles and permissions: confirm the matrix.
4. `05` data model and `10` / `11`: confirm payments and notifications behaviour.
5. `06` and `08`: confirm security and rate limits.
6. `12` and `13`: confirm UX and public clone details.
7. `17`: confirm the schedule and cut lines.
8. Skim `03`, `04`, `09`, `14`, `15`, `16`, `18`.

## 4. Status table

| Doc | Status | Reviewer comments |
|---|---|---|
| 01 to 21 and sign-off | Draft; owner has reviewed (2026-11-02); not yet approved for development | |

Statuses: **Draft** (written, not reviewed), **In review**, **Approved**, **Changes requested**.

## 5. Decisions needed (consolidated)

The full table with options and recommendations is in `RESEARCH-SIGNOFF.md` section 9. In short:

1. Is the portal inside the 48-hour deliverable?
2. Keep, shorten or drop the loading curtain and the roaming mascot?
3. Which payment gateways in v1 (manual only, Stripe, Razorpay)?
4. WhatsApp provider (Cloud API, Twilio) and when to apply for approval?
5. May original photos and artwork be reused?
6. Data retention, languages, VAT, Turnstile, IP allow-list.

Per-document **Open questions** lists are at the end of each file; answer them in the conversation or directly in the files.

## 6. How to give feedback

Reply with either "approved" (optionally with decision picks D1 to D12) or a list of changes by document number and section. Changes are applied to the documents, versions bumped (0.1 → 0.2), and the change log in `16` updated. Development begins only after you explicitly say to proceed.

## 7. Conventions used in the documents

- Requirement IDs: `FR-<AREA>-nnn`, `NFR-<AREA>-nnn`, acceptance `AC-nnn`, tests `T-…`, RLS cases `RLS-nnn`, rate limits `RL-…`, risks `R-nn`, decisions `ADR-nnn`.
- Priorities: P0 must, P1 should, P2 nice to have.
- Evidence tags in research files: CONFIRMED, observed, inferred, unknown.
- Diagrams use Mermaid and render on GitHub and in most Markdown viewers.
- Every document has a header (status, version, date, related) and ends with open questions.

## 8. Glossary

| Term | Meaning |
|---|---|
| RLS | Row-level security in Postgres; rules deciding which rows a user can read or write |
| RPC | A database function called through the API for a transactional action |
| Outbox | A table of events written in the same transaction as a change, processed later to send messages |
| Adapter | A small module implementing a standard interface for a provider (payments, email, WhatsApp) |
| Super admin / operator | The two staff roles |
| Step-up MFA | Asking for a fresh second-factor code before a sensitive action |
| Idempotency | Repeating the same request has the same effect as doing it once |
| Keyset pagination | Paging by "after this row" instead of page numbers, fast on large tables |
| Curtain | The loading transition with the running puppy on the reference site |
| Scene | One themed section of the home page |
| Gone home | A puppy that has found a family; moved to the gone-home list |
| `wa.me` link | A WhatsApp deep link with a prefilled message |

## 9. What is not here

No source code, no database migrations, no Supabase project, no installed packages. Those begin only after approval (`17`).

## Open questions

1. Who else reviews these documents (interviewer, client)?
2. Preferred feedback channel and turnaround?
