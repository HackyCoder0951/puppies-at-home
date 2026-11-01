# 15. Test and QA Plan

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `02` (FR), `03` (NFR), `07` (RLS cases), `08`, `10`, `11` |

## 1. Test layers

| Layer | Tooling | Scope |
|---|---|---|
| Unit | Vitest | Zod schemas, money math, template rendering and escaping, rate-limit key building, permission helpers, state-machine tables, filter logic |
| Database | SQL tests (pgTAP or equivalent) against local Supabase | RLS (cases RLS-001 to RLS-018), RPC behaviour, triggers, idempotency, state machines, sequences, retention jobs |
| Integration | Vitest with local Supabase and mocked providers | Server actions and route handlers, webhook verification and replay, outbox worker, cache revalidation |
| End to end | Playwright (Chromium, Firefox, WebKit; mobile emulation) | Public journeys and admin workflows |
| Visual | Playwright screenshots vs reference captures | Layout and design fidelity per breakpoint |
| Accessibility | axe-core in Playwright, manual keyboard and screen-reader pass | Public and admin |
| Performance | Lighthouse CI, `EXPLAIN` checks, k6 or autocannon bursts | Core Web Vitals, query plans, rate limits |
| Security | Manual checklist, dependency audit, header scan, upload and webhook abuse tests | `06` |
| Architecture | `tests/architecture` plus lint boundary rules: layer and module import matrix, no cycles, thin pages, public APIs only | `21` section 6.1 and 16 |

CI runs lint, type-check, unit, database and integration tests on every push; end-to-end and Lighthouse on pull requests against a preview deployment.

## 2. Functional test matrix

Status column is filled during development (`Not run`, `Pass`, `Fail`).

### 2.1 Public site

| ID | Covers | Test | Expected | Status |
|---|---|---|---|---|
| T-PUB-01 | FR-PUB-001 | Visit every route | 200, correct title and h1 | Not run |
| T-PUB-02 | FR-PUB-002/003 | Resize across 1023/1024; open menu; Esc | Inline nav at ≥1024; overlay opens with circle reveal, closes with Esc | Not run |
| T-PUB-03 | FR-PUB-004 | 375px bottom bar | WhatsApp and Call visible, links correct | Not run |
| T-PUB-04 | FR-PUB-009 | Toggle filters, reload with query | Count text, URL, chip state correct; clear works | Not run |
| T-PUB-05 | FR-PUB-011 | Detail page gallery | Counter, arrows, thumbnails, video plays, keyboard works | Not run |
| T-PUB-06 | FR-PUB-014 | Open lightbox, navigate, Esc | Counter correct, focus trapped and restored | Not run |
| T-PUB-07 | FR-PUB-015 | How it works toggle | Content and illustration swap, anchors scroll | Not run |
| T-PUB-08 | FR-PUB-016 | FAQ search and accordion | Notes filter, count updates, aria-expanded toggles, empty state | Not run |
| T-PUB-09 | FR-PUB-017/018 | Submit contact letter valid, invalid, honeypot filled, rate limited | 201 and success state; field errors; silent reject; 429 message | Not run |
| T-PUB-10 | FR-PUB-019 | Check every WhatsApp and tel link | Number from settings, text prefilled | Not run |
| T-PUB-11 | FR-PUB-022 | Publish a puppy in admin | Appears on `/puppies` after revalidation without redeploy | Not run |
| T-PUB-12 | FR-PUB-023 | Visit unknown slug | 404 "Puppy not found" | Not run |
| T-PUB-13 | FR-PUB-024 | Check metadata, sitemap, robots | Tags present; sitemap lists published routes; robots disallows `/admin` | Not run |
| T-PUB-14 | NFR-A11Y-004 | Emulate reduced motion | No curtain, pinned scroller replaced by grid, content complete | Not run |

### 2.2 Authentication and isolation

| ID | Covers | Test | Expected | Status |
|---|---|---|---|---|
| T-AUTH-01 | FR-AUTH-001/013 | Grep public HTML and sitemap for `/admin`; fetch `/admin/login` | No links; admin HTML has no SEO tags; headers include `X-Robots-Tag` and `no-store` | Not run |
| T-AUTH-02 | FR-AUTH-002 | Unauthenticated page and API calls | Redirect to login; API 401 | Not run |
| T-AUTH-03 | FR-AUTH-003/004 | Attempt public sign-up; invite flow end to end | Sign-up rejected; invite, verify, set password, login works | Not run |
| T-AUTH-04 | FR-AUTH-005/011 | Wrong passwords repeatedly | Generic errors; 429 then lock; audit entries | Not run |
| T-AUTH-05 | FR-AUTH-006/007 | Forgot and reset; weak and breached passwords | Same response for unknown email; policy enforced; old sessions revoked | Not run |
| T-AUTH-06 | FR-AUTH-008/009 | Enroll TOTP; perform refund approve | Challenge required for sensitive action | Not run |
| T-AUTH-07 | FR-AUTH-010 | Idle 30 minutes (time travel) and absolute 12 hours | Session ends, return path preserved | Not run |
| T-AUTH-08 | FR-USR-002 | Demote or disable the last super admin | Blocked | Not run |

### 2.3 Roles and permissions

| ID | Covers | Test | Expected | Status |
|---|---|---|---|---|
| T-RBAC-01 | FR-RBAC-001..004 | UI as operator: menu, buttons | No SA items; actions hidden | Not run |
| T-RBAC-02 | FR-RBAC-002 | Operator calls SA server action directly | `forbidden`, audited | Not run |
| T-RBAC-03 | RLS-001..018 | Database suite | All pass | Not run |

### 2.4 Content, enquiries, customers

| ID | Covers | Test | Expected | Status |
|---|---|---|---|---|
| T-CNT-01 | FR-CNT-001/002 | Create puppy, upload photos and video, set cover | Validation, previews, ordering persisted | Not run |
| T-CNT-02 | FR-CNT-002 | Upload disallowed type or oversize | Rejected with message; nothing stored | Not run |
| T-CNT-03 | FR-CNT-003 | Mark gone home | Moves to gone-home lists; detail page variant | Not run |
| T-CNT-04 | FR-CNT-004..006 | Edit family, FAQ, settings | Public pages update | Not run |
| T-ENQ-01 | FR-ENQ-001..003 | Public enquiry then inbox flow | Appears, assign, note, status, convert | Not run |
| T-CUS-01 | FR-CUS-001..003 | Create, search, duplicate detect, merge (SA) | Correct; history preserved | Not run |

### 2.5 Orders, deliveries, payments, invoices

| ID | Covers | Test | Expected | Status |
|---|---|---|---|---|
| T-ORD-01 | FR-ORD-001..004 | Create order, valid and invalid transitions, cancel without reason | Numbers allocated; invalid blocked; reason required | Not run |
| T-DEL-01 | FR-DEL-001/002 | Add delivery events | Timeline, status, notification queued | Not run |
| T-PAY-01 | FR-PAY-002/003 | Record manual payment twice with same key | One row; balances correct | Not run |
| T-PAY-02 | FR-PAY-004/005 | Gateway enable and disable by env; webhook valid, invalid signature, replay | Registry matches env; invalid rejected; replay ignored | Not run |
| T-PAY-03 | FR-PAY-006 | Operator requests; SA approves partial then full refund | Balances and statuses correct; operator cannot approve | Not run |
| T-INV-01 | FR-INV-001..003 | Create, issue, edit issued (blocked), send, pay, void (operator denied) | Immutable after issue; PDF generated; statuses move | Not run |
| T-INV-02 | FR-INV-004 | Overdue job | Status and reminder queued once | Not run |

### 2.6 Messaging and notifications

| ID | Covers | Test | Expected | Status |
|---|---|---|---|---|
| T-MSG-01 | FR-MSG-001 | Edit template, preview, unknown variable, rollback | Validation and versioning work | Not run |
| T-MSG-02 | FR-MSG-002/003 | Manual email and WhatsApp send; no provider fallback | Logged; wa.me link when unconfigured | Not run |
| T-NOT-01 | FR-NOT-001 | Transaction rollback after event | No outbox row | Not run |
| T-NOT-02 | FR-NOT-002 | Two workers concurrently; provider failure | No duplicates; backoff then failed alert | Not run |
| T-NOT-03 | FR-NOT-003 | Opted-out customer, quiet hours, cap exceeded | Skipped or deferred with reason | Not run |
| T-NOT-04 | FR-NOT-004 | Assign enquiry, observe bell on assignee only | Live update; other users see nothing | Not run |
| T-NOT-05 | FR-NOT-005 | Disable a rule | No message for that event | Not run |
| T-NOT-06 | webhooks | Provider status and inbound STOP | Status moves forward; opt-out recorded | Not run |

### 2.7 Audit

| ID | Covers | Test | Expected | Status |
|---|---|---|---|---|
| T-AUD-01 | FR-AUD-001/002 | Perform audited actions; attempt edit/delete of entries | Entries with diffs; no modification possible | Not run |

### 2.8 Architecture (modular monolith)

| ID | Covers | Test | Expected | Status |
|---|---|---|---|---|
| T-ARCH-01 | NFR-MNT-008 | Scan `modules/*/domain` for imports of React, Next, Zod, Supabase, env, `infrastructure`, `presentation` | None found | Not run |
| T-ARCH-02 | NFR-MNT-008 | Scan `presentation` for imports of `infrastructure` | None found | Not run |
| T-ARCH-03 | NFR-MNT-009 | Dependency graph of modules | Acyclic; no deep imports across modules | Not run |
| T-ARCH-04 | NFR-MNT-010 | `app/**/page.tsx` and route handlers | Each under the line limit; no business logic imports from `infrastructure` | Not run |
| T-ARCH-05 | NFR-MNT-011 | Every module has `index.ts`, `module.config.ts`, `README.md` | Present | Not run |
| T-ARCH-06 | NFR-MNT-012 | `shared/` imports | Never imports `modules/` | Not run |
| T-ARCH-07 | NFR-MNT-013 | Raw string hrefs outside `navigation` | None found; links use `paths.*` | Not run |
| T-ARCH-08 | NFR-MNT-014 | Mock and Supabase adapters run the same contract suite | Both pass (Supabase when it exists) | Not run |

### 2.9 Data protection

| ID | Covers | Test | Expected | Status |
|---|---|---|---|---|
| T-PRIV-01 | FR-PRIV-002, NFR-PRIV-020 | Open every form | Consent line, 18+ statement, privacy link; optional boxes unticked | Not run |
| T-PRIV-02 | FR-PRIV-001 | Footer on every page | Privacy and terms links present; pages load | Not run |
| T-PRIV-03 | FR-PRIV-003/004 | Give, then withdraw marketing consent | Record created with text version; withdrawal stops sends at once | Not run |
| T-PRIV-04 | FR-PRIV-005/006 | Submit a data request, verify, export, anonymise | Due date set; export includes every module; anonymised rows unreadable; exceptions recorded | Not run |
| T-PRIV-05 | NFR-PRIV-011 | Add a module without `PersonalDataProvider` | Architecture test fails | Not run |
| T-PRIV-06 | FR-PRIV-007, NFR-PRIV-019 | Run retention job on aged fixtures | Enquiries and customers anonymised; financial records kept; counts reported | Not run |
| T-PRIV-07 | FR-PRIV-008, NFR-PRIV-017 | Staff lists and reveal | Masked by default; reveal writes audit entry; operator cannot export | Not run |
| T-PRIV-08 | FR-PRIV-009, NFR-PRIV-013 | Record an incident | Register entry with times; overdue notification warning at 72 hours | Not run |
| T-PRIV-09 | NFR-PRIV-018 | Scan repository, fixtures and logs for phone, email and ID patterns | No real personal data | Not run |
| T-PRIV-10 | NFR-PRIV-016 | Load the public site with a clean profile | No non-essential cookies or third-party trackers | Not run |

## 3. Responsive test matrix

| Width | Expected |
|---|---|
| 320 | No horizontal overflow; buttons stack; menu works; text readable |
| 375, 390, 430 | Bottom bar, 2-column puppy grid, stacked scenes, no overlap of roaming mascot with primary controls |
| 768 | WhatsApp pill and Menu in header, no bottom bar, 3-column door grid, single-column scenes, 3-column polaroid wall |
| 1024 | Inline nav, pinned scroller, two-column scenes, sticky phone |
| 1280, 1440 | Full layout, hero arches visible, max widths applied |
| 1920+ | Content centred, no stretched illustrations |

Each width is checked for all 8 routes plus the admin shell (admin from 768 up).

## 4. Visual fidelity checks

For each page and breakpoint compare **reference vs clone** screenshots (reference captures in `docs/05-research/evidence/pages`):

| Aspect | Method | Tolerance |
|---|---|---|
| Spacing and section heights | Measure key blocks against reference values in `docs/05-research/05-responsive-analysis.md` | ±8px at desktop, ±12px on mobile |
| Typography | Computed font family, size, weight, tracking | Exact tokens; size ±1px |
| Colours | Sample background and text colours | Exact token hex for brand colours |
| Images and arch masks | Visual | Shape, ratio and cropping equal |
| Cards and tickets | Dimensions | ±6px |
| Navigation and footer | Visual and structural | Same items and order |
| Motion | Side-by-side recording of door scroller, curtain, menu, form animation | Same duration and easing within 10% |

Differences caused by replacement assets are recorded and accepted separately.

## 5. Security and abuse tests

| ID | Test |
|---|---|
| T-SEC-01 | Security headers present (CSP, HSTS, nosniff, referrer, permissions, frame) on public and admin |
| T-SEC-02 | Service-role key absent from client bundles and responses (search build output) |
| T-SEC-03 | Burst tests for each limiter in `08` produce 429 with `Retry-After`; counters reset |
| T-SEC-04 | Redis outage simulation: public forms fail closed; admin reads fail open with log |
| T-SEC-05 | Upload abuse: wrong magic bytes, oversize, path traversal names, SVG with script |
| T-SEC-06 | Webhook tampering: altered body, missing signature, old timestamp, replay |
| T-SEC-07 | XSS in puppy story, customer name, message and template variables rendered safely in admin, email and PDF |
| T-SEC-08 | IDOR: request another record id via action and API as each role |
| T-SEC-09 | CSRF: cross-origin form post to a server action and a route handler |
| T-SEC-10 | `npm audit` and secret scan clean at release |

## 6. Performance tests

| ID | Test | Target |
|---|---|---|
| T-PERF-01 | Lighthouse mobile on `/`, `/puppies`, a detail page | Performance ≥ 80 (decorative layers considered), LCP ≤ 2.5 s excluding curtain, CLS ≤ 0.1 |
| T-PERF-02 | `EXPLAIN ANALYZE` on patterns in `09` at 50k rows | Index use; list < 50 ms |
| T-PERF-03 | Load: 50 concurrent admin users on lists and dashboard | p95 < 300 ms, no connection exhaustion |
| T-PERF-04 | Outbox throughput with 1,000 queued events | Drains within 5 minutes without duplicates |

## 7. Acceptance checklist (AC)

| ID | Criterion | Linked |
|---|---|---|
| AC-001 | Public home visually and structurally matches the reference at 375, 768, 1024, 1440 | FR-PUB-006 |
| AC-002 | All 8 public routes exist with matching content structure | FR-PUB-001 |
| AC-003 | Desktop and mobile navigation match reference behaviour | FR-PUB-002/003 |
| AC-004 | Every visible CTA works (WhatsApp, tel, mailto, Maps, social, internal links) | FR-PUB-019 |
| AC-005 | Puppy cards, filters, counts and URL sync work | FR-PUB-009/010 |
| AC-006 | Puppy detail works including gallery, video, form, prev/next | FR-PUB-011 |
| AC-007 | FAQ accordion and search work | FR-PUB-016 |
| AC-008 | Lightbox and How-it-works toggle work | FR-PUB-014/015 |
| AC-009 | Forms validate, reject spam, create enquiries, show success | FR-PUB-018 |
| AC-010 | No horizontal overflow from 320 to 1920 | NFR-COMP-003 |
| AC-011 | Reduced-motion users get complete content without heavy animation | NFR-A11Y-004 |
| AC-012 | Admin is unreachable without sign-in and has no SEO tags or public links | FR-AUTH-001/002/013 |
| AC-013 | Invite, verify, login, reset, TOTP flows work | FR-AUTH-003..009 |
| AC-014 | Roles behave exactly as the matrix; RLS tests pass | FR-RBAC-* |
| AC-015 | Content edits publish to the public site without redeploy | FR-CNT-007 |
| AC-016 | Enquiry to customer to order to invoice to payment to delivery flow works end to end | FR-ENQ/ORD/INV/PAY/DEL |
| AC-017 | Duplicate payments and webhooks never double count | FR-PAY-003/005 |
| AC-018 | Notifications fire for the defined events and respect consent, quiet hours, caps | FR-NOT-* |
| AC-019 | Rate limits behave as documented | NFR-SEC-005 |
| AC-020 | Audit log records sensitive actions and is append-only | FR-AUD-* |
| AC-021 | Build succeeds; production deployment loads; refresh on every route works | deployment |
| AC-022 | No critical console errors on any page | quality |
| AC-023 | Lighthouse and axe results meet NFR targets | NFR-PERF, NFR-A11Y |
| AC-024 | `.env.example` complete; app fails fast on missing config | NFR-MNT-006 |
| AC-025 | A privacy notice, terms and consent lines are present and linked on every page and form | FR-PRIV-001/002 |
| AC-026 | Consent, withdrawal and data requests work end to end within the 30-day SLA | FR-PRIV-003..006 |
| AC-027 | No real personal data in the frontend track; retention jobs and masking work in the backend track | NFR-PRIV-018/019 |

## 8. Deployment testing

Production URL over HTTPS; direct load and refresh on each route including dynamic slugs; asset and media loading; cron endpoint auth; webhook endpoints reachable from providers; robots and sitemap; mobile and desktop browsers; console error check; admin login from a clean browser; rollback rehearsal.

## Open questions

1. Is a staging Supabase project available for end-to-end runs?
2. Which real devices or browsers must be physically tested (iOS Safari, Android Chrome)?
3. Acceptable Lighthouse score given the illustration-heavy design?
