# 03. Non-Functional Requirements

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `04-system-architecture.md`, `06-security-architecture.md`, `09-query-optimization-guide.md`, `15-test-and-qa-plan.md` |

## 1. Performance (NFR-PERF)

| ID | Requirement | Target / measure |
|---|---|---|
| NFR-PERF-001 | Public pages render from cached server data; Postgres is hit only on cache miss or revalidation. | Cache hit ratio observable in logs; no per-request DB query for published content |
| NFR-PERF-002 | Largest Contentful Paint on mobile (4G, mid-range device) for `/` and `/puppies`. | ≤ 2.5 s after the loading curtain is excluded; curtain adds ≤ 1.2 s |
| NFR-PERF-003 | Cumulative Layout Shift. | ≤ 0.1 (images have dimensions or aspect ratios) |
| NFR-PERF-004 | Interaction to Next Paint on filters, menu, FAQ search. | ≤ 200 ms |
| NFR-PERF-005 | Images use responsive sizes, modern formats and lazy loading below the fold; hero images are prioritised. | No image over 250 KB transferred at mobile width |
| NFR-PERF-006 | JavaScript for admin is not shipped to public pages; public pages ship only the code they use. | Public route JS ≤ 200 KB gzip excluding images |
| NFR-PERF-007 | Animations use compositor properties (transform, opacity, clip-path); decorative layers are bounded in DOM size. | No long task over 100 ms during scroll in profiling |
| NFR-PERF-008 | Admin list queries respond fast at realistic volume. | p95 ≤ 300 ms server time at 50,000 rows per large table |
| NFR-PERF-009 | Dashboard loads from one aggregate call. | One query / RPC, ≤ 200 ms |

## 2. Security (NFR-SEC)

| ID | Requirement |
|---|---|
| NFR-SEC-001 | All traffic over HTTPS with HSTS; cookies `Secure`, `HttpOnly`, `SameSite=Lax`. |
| NFR-SEC-002 | Row-level security is enabled on every table; no table is readable or writable by `anon` except the explicit public views and the enquiry RPC. |
| NFR-SEC-003 | The Supabase service-role key exists only on the server, only in `server-only` modules, and never in client bundles or logs. |
| NFR-SEC-004 | All inputs validated with shared schemas; outputs escaped per channel (HTML, email, WhatsApp, PDF). |
| NFR-SEC-005 | Rate limiting on every public and authentication surface as listed in `08`. |
| NFR-SEC-006 | Webhooks verify signatures before any processing and are de-duplicated. |
| NFR-SEC-007 | Content Security Policy with nonces, `frame-ancestors 'none'` on admin, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. |
| NFR-SEC-008 | Secrets are rotated without code change; `.env.example` has names only; secret scanning in CI. |
| NFR-SEC-009 | File uploads: type allow-list by magic bytes, size limits, random storage names, private bucket for documents, signed URLs ≤ 5 minutes. |
| NFR-SEC-010 | Audit log is append-only and covers security events and data changes. |
| NFR-SEC-011 | Dependency vulnerability scan on every build; no known critical vulnerabilities at release. |
| NFR-SEC-012 | No card data ever touches the application; hosted checkout only. |

## 3. Privacy and compliance (NFR-PRIV)

| ID | Requirement |
|---|---|
| NFR-PRIV-001 | Personal data collected: name, phone, email, area, message, order and payment metadata. Purposes and retention are documented. |
| NFR-PRIV-002 | IP addresses are stored only as salted hashes. |
| NFR-PRIV-003 | WhatsApp messages are sent only to customers with a recorded opt-in; STOP replies opt out automatically. |
| NFR-PRIV-004 | Marketing-type emails carry an unsubscribe link; transactional messages are clearly separate. |
| NFR-PRIV-005 | Customer export and deletion or anonymisation on request, preserving required financial records. |
| NFR-PRIV-006 | Retention job anonymises enquiries and messages older than the configured period (default 24 months, to be confirmed). |
| NFR-PRIV-007 | A privacy notice and consent wording appear on forms (text to be supplied by the owner). |
| NFR-PRIV-008 | The data protection standard in `06` section 6 is the binding baseline: the strictest applicable obligation of GDPR, the UAE PDPL and India's DPDP Act applies everywhere; HIPAA is out of scope and human health data is never collected. |
| NFR-PRIV-009 | A lawful basis is documented for every processing activity (`06` section 6.5) and marketing and WhatsApp messages require separate, recorded, unticked opt-in. |
| NFR-PRIV-010 | Every consent stores text version, timestamp, channel and hashed IP, and withdrawal takes effect across modules immediately. |
| NFR-PRIV-011 | Data subject requests (access, rectification, erasure, restriction, portability, objection, withdrawal, grievance) are logged and completed within 30 days; every module implements `PersonalDataProvider` (describe, export, anonymise). |
| NFR-PRIV-012 | A record of processing activities, vendor and DPA register, DPIA register and breach register are kept current (`06` section 6.14). |
| NFR-PRIV-013 | Personal data breaches are triaged within 24 hours and notified to authorities and individuals within the legal timelines (design target 72 hours) (`06` section 6.10). |
| NFR-PRIV-014 | No vendor receives personal data before a DPA and a transfer mechanism are recorded; the data residency decision is documented (D17). |
| NFR-PRIV-015 | Photos of customers, and especially children, are published only with a documented release and are removed on withdrawal within 24 hours (`06` section 6.13). |
| NFR-PRIV-016 | The public site sets only strictly necessary storage by default; any analytics or advertising requires consent and a cookie notice. |
| NFR-PRIV-017 | Personal data is masked in staff lists and revealed only on demand with an audit entry; exports are super-admin only and audited. |
| NFR-PRIV-018 | No real personal data exists in the frontend (mock) track, in fixtures, logs, CI or demos (`06` section 6.15). |
| NFR-PRIV-019 | Retention periods are configuration, enforced by automated jobs, and reviewed yearly (`06` section 6.7). |
| NFR-PRIV-020 | The privacy notice, terms and consent text are available in English (Arabic recommended) and linked from every page footer and every form. |

## 4. Accessibility (NFR-A11Y)

| ID | Requirement |
|---|---|
| NFR-A11Y-001 | Target WCAG 2.2 AA on public pages and admin. |
| NFR-A11Y-002 | Semantic landmarks, one `h1` per page, skip link to `#main`. |
| NFR-A11Y-003 | Full keyboard operation including menu, filters, accordions, gallery and lightbox; visible focus (3px outline as in the reference). |
| NFR-A11Y-004 | `prefers-reduced-motion` removes the curtain, pinned scroll, scroll-driven and decorative loops; content stays complete. |
| NFR-A11Y-005 | Colour contrast ≥ 4.5:1 for body text; the reference's weak spots (faded steps, honey/milk text on mid-brown, small handwriting) are measured and fixed as labelled improvements. |
| NFR-A11Y-006 | Images have meaningful alt text; decorative illustrations are hidden from assistive technology. |
| NFR-A11Y-007 | Form fields have labels, error messages tied with `aria-describedby`, and live-region success messages. |
| NFR-A11Y-008 | Touch targets ≥ 44 px. |
| NFR-A11Y-009 | Admin tables and dialogs are screen-reader friendly (headers, labelled controls, focus trap, Esc). |

## 5. SEO (NFR-SEO)

| ID | Requirement |
|---|---|
| NFR-SEO-001 | Public pages: unique title and description, canonical URL, Open Graph and Twitter cards, `lang="en"`, heading hierarchy, descriptive link text. |
| NFR-SEO-002 | Public JSON-LD (`PetStore` with `PostalAddress`, `BreadcrumbList` on detail pages); sitemap with published routes only. |
| NFR-SEO-003 | **Admin has no SEO**: no title template, description, Open Graph, canonical, JSON-LD, analytics or sitemap entry; `noindex, nofollow, noarchive`; disallowed in `robots.txt`; excluded from the sitemap. |
| NFR-SEO-004 | Unpublished and gone-home policy for indexing is decided at review (reference indexes gone-home pages). |

## 6. Reliability and operations (NFR-REL, NFR-OBS)

| ID | Requirement |
|---|---|
| NFR-REL-001 | Payment recording, order transitions and outbox writes are single transactions. |
| NFR-REL-002 | Retried requests and duplicate webhooks never create duplicate payments, invoices or messages. |
| NFR-REL-003 | Message delivery retries with exponential backoff (max 5) and raises an alert on final failure. |
| NFR-REL-004 | If Redis is unavailable: public form limits fail closed; admin reads fail open with a log entry. |
| NFR-REL-005 | Database backups with point-in-time recovery enabled; restore procedure documented. |
| NFR-REL-006 | Graceful error pages and a consistent API error envelope; no stack traces to clients. |
| NFR-OBS-001 | Structured logs with request ID, user ID (not PII), route and duration. |
| NFR-OBS-002 | Error tracking and uptime check for the public site and the cron endpoint. |
| NFR-OBS-003 | Slow-query review using `pg_stat_statements` before release. |

## 7. Compatibility (NFR-COMP)

| ID | Requirement |
|---|---|
| NFR-COMP-001 | Chrome, Edge, Firefox and Safari (current and previous major) on desktop and mobile. |
| NFR-COMP-002 | CSS scroll-driven animations are progressive enhancement; unsupported browsers see final states and no loss of content. |
| NFR-COMP-003 | Viewport support at 320, 375, 390, 430, 768, 1024, 1280 and 1440+ px with zero horizontal overflow. |

## 8. Maintainability (NFR-MNT)

| ID | Requirement |
|---|---|
| NFR-MNT-001 | TypeScript strict mode; shared Zod schemas; generated database types. |
| NFR-MNT-002 | Content and presentation are separated; public components receive data as props. |
| NFR-MNT-003 | Schema changes only through numbered migrations; no manual dashboard edits. |
| NFR-MNT-004 | Adapter interfaces for payments and messaging so a provider can be added without touching callers. |
| NFR-MNT-005 | Lint, type-check, unit, SQL (RLS) and end-to-end tests run in CI. |
| NFR-MNT-006 | Every environment variable is documented in `14` and validated at boot. |
| NFR-MNT-007 | Decisions are recorded as short ADRs in `16`. |
| NFR-MNT-008 | The system is a modular monolith (`21`): each module has `domain`, `application`, `infrastructure`, `presentation` layers, and the domain layer has no framework or I/O imports. |
| NFR-MNT-009 | Modules interact only through public APIs (`index.ts`) or domain events; no deep imports; the module dependency graph has no cycles. |
| NFR-MNT-010 | `app/` pages and route handlers are thin (resolve a use case, render a section); no business logic in the routing shell. |
| NFR-MNT-011 | Every module ships `index.ts`, `module.config.ts` and a `README.md` stating purpose, use cases, events and owner. |
| NFR-MNT-012 | `shared/` contains no business concepts and never imports a module. |
| NFR-MNT-013 | All routes and links are defined in `navigation/` and built with typed helpers; no raw URL strings in components. |
| NFR-MNT-014 | Every port has a contract test suite that all of its adapters (mock, Supabase) must pass. |
| NFR-MNT-015 | Boundary rules are enforced automatically (lint and architecture tests) in CI; violations fail the build. |

## Open questions

1. Retention period (24 months assumed) and legal basis wording.
2. Performance target on slow devices given the heavy illustration layer: acceptable to disable decorative layers below a device capability threshold?
3. Should gone-home pages remain indexable (the reference allows it)?
