# 02. Product Requirements

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `docs/05-research/` (files 02 to 05) (public site evidence), `07-rbac-and-rls-spec.md`, `15-test-and-qa-plan.md` |

Priorities: **P0** must have, **P1** should have, **P2** nice to have. "Source" says whether a requirement is **Observed** (seen on the reference), **Inferred**, or **New** (requested for the portal).

## 1. Personas

| Persona | Description | Main goals |
|---|---|---|
| **Visitor** | Prospective puppy buyer in the UAE or abroad, mostly on mobile | See real available puppies, trust the business, contact via WhatsApp or form |
| **Operator** | Staff member handling day-to-day business | Respond to enquiries, manage customers, orders, deliveries, payments, invoices, content and messages |
| **Super admin** | Owner / manager | Everything an operator can do, plus users and roles, refunds, voiding, settings, notification rules and the audit log |

## 1.1 Delivery order (owner decision, 2026-11-02)

**Frontend first.** All `FR-PUB-*` requirements are delivered first, running on **mock data** (`20-mock-data-spec.md`). The backend requirements (`FR-AUTH`, `FR-RBAC`, `FR-DASH`, `FR-CNT`, `FR-ENQ`, `FR-CUS`, `FR-ORD`, `FR-DEL`, `FR-PAY`, `FR-INV`, `FR-MSG`, `FR-NOT`, `FR-USR`, `FR-SET`, `FR-AUD`) are **deferred** to the backend track and unchanged in content and priority within that track. In the frontend track:

- `FR-PUB-022` (read from Supabase) is met by repositories with a mock implementation; the Supabase implementation is deferred.
- `FR-PUB-018` (forms create an enquiry) is met by a mock `EnquiryService` that validates and returns success; storing and notifying are deferred.
- `FR-PUB-024` (SEO) applies to the public site as before.

## 2. Public site requirements

IDs `FR-PUB-xxx`. Evidence for each is in `docs/05-research/03-screenshots-and-video-review.md` and `docs/05-research/04-ui-ux-animation-effects-color-layout.md`.

| ID | Requirement | Source | Priority |
|---|---|---|---|
| FR-PUB-001 | Provide routes `/`, `/puppies`, `/puppies/[slug]`, `/gone-home`, `/happy-families`, `/how-it-works`, `/faq`, `/contact` with content matching the reference. | Observed | P0 |
| FR-PUB-002 | Header with logo and 6 links (Home, Puppies, Happy families, How it works, FAQ, Visit & contact) and a WhatsApp button; inline at ≥1024px, "Menu" overlay below; WhatsApp pill in header at ≥640px. | Observed | P0 |
| FR-PUB-003 | Mobile menu is a full-screen overlay with a circular reveal, staggered links, active-link highlight, WhatsApp button and phone number, closable by button and Esc. | Observed | P0 |
| FR-PUB-004 | Fixed bottom bar with "WhatsApp us" and "Call" below 768px. | Observed | P0 |
| FR-PUB-005 | Footer with brand blurb, Explore links, contact details, social links (Instagram, TikTok, Facebook) opening in a new tab. | Observed | P0 |
| FR-PUB-006 | Home page of 8 themed scenes on a continuous morning-to-night gradient (hero, meet the pups, two ways, journey, passport, families, FAQ, CTA house). | Observed | P0 |
| FR-PUB-007 | "Meet the pups": below 1024px a grid of doors showing available puppies; at ≥1024px a pinned horizontal scroller with a walking mascot; reduced-motion falls back to the grid. | Observed | P1 |
| FR-PUB-008 | Journey section with step list and a phone mock whose chat content follows the active step (sticky at ≥1024px). | Observed | P1 |
| FR-PUB-009 | Puppies list with working multi-select filters (where: Everywhere / Imported / Korean Teacup; breed: Maltipoo, Pomeranian, Poodle, Cavapoo, Shih Tzu; sex: Boys / Girls), result count ("N puppies match"), "Clear filters", and URL-synced state (`?breed=`, `?origin=`). | Observed | P0 |
| FR-PUB-010 | Puppy cards show photo, name or breed, sex and age, "Available" tag and a video marker where applicable; link to the detail page. | Observed | P0 |
| FR-PUB-011 | Puppy detail page: breadcrumb, gallery with counter, prev/next and thumbnails (photos and video), info card (breed, sex, age, origin), WhatsApp and enquiry buttons, "what comes with" checklist, import steps, enquiry form, previous/next puppy cards, scroll-progress bar. | Observed | P0 |
| FR-PUB-012 | Gone-home variant of the detail page with "Ask about a puppy like this" and "Looking for a puppy like this?". | Observed | P1 |
| FR-PUB-013 | `/gone-home` ticket list of every puppy that has gone home, linking to detail pages. | Observed | P0 |
| FR-PUB-014 | `/happy-families` polaroid wall of all family photos with captions, testimonial note, count line, and a lightbox (counter, previous, next, close, keyboard). | Observed | P1 |
| FR-PUB-015 | `/how-it-works` with anchor pills, In Dubai / Imported toggle that switches illustration and steps, promise section, delivery and collection, "why choose us". | Observed | P0 |
| FR-PUB-016 | `/faq` corkboard of notes as accessible accordions, live search ("N notes on the board", empty state), "Ask your own question" WhatsApp button. | Observed | P0 |
| FR-PUB-017 | `/contact` with WhatsApp, call and email links, "Visit us" card with Maps link, and the letter form (name*, phone*, email, area, puppy select, message). | Observed | P0 |
| FR-PUB-018 | Both forms validate input, reject spam (honeypot), show a success state (letter-posted animation) and an error state, and create an enquiry in the backend. | Inferred | P0 |
| FR-PUB-019 | All WhatsApp links use `https://wa.me/<number>?text=<prefilled message>`; phone links use `tel:`. Numbers come from site settings. | Observed | P0 |
| FR-PUB-020 | Loading curtain with the running-puppy animation on first load and route changes; skipped for reduced motion. | Observed | P2 |
| FR-PUB-021 | Reveal-on-scroll animations, hover and press states, custom paw cursor (fine pointer only), mascot idle animations. | Observed | P1/P2 |
| FR-PUB-022 | Public data (puppies, media, families, FAQs, testimonial, settings) is read from Supabase through cached queries and refreshed when the admin publishes changes. | New | P0 |
| FR-PUB-023 | Unknown puppy slug returns a 404 page titled "Puppy not found". | Observed | P0 |
| FR-PUB-024 | Public pages include page titles, descriptions, canonical, Open Graph and Twitter tags, JSON-LD (`PetStore`, `BreadcrumbList`), a sitemap and robots file that excludes `/admin`. | Observed | P1 |

## 3. Admin: authentication and access

| ID | Requirement | Priority |
|---|---|---|
| FR-AUTH-001 | Portal is reachable only at `/admin/**`; no link to it anywhere on the public site. | P0 |
| FR-AUTH-002 | Unauthenticated requests to any `/admin/**` page redirect to `/admin/login`; `/api/admin/**` returns 401. | P0 |
| FR-AUTH-003 | Accounts are created by invitation only; public sign-up is disabled. | P0 |
| FR-AUTH-004 | Invited users verify their email and set a password through an emailed link before first sign-in. | P0 |
| FR-AUTH-005 | Sign-in with email and password; unverified or disabled accounts cannot sign in; error text does not reveal which field was wrong. | P0 |
| FR-AUTH-006 | Forgot-password sends a reset link (same response whether or not the email exists); reset enforces the password policy and revokes other sessions. | P0 |
| FR-AUTH-007 | Password policy: at least 12 characters, strength score ≥ 3, breached-password check. | P0 |
| FR-AUTH-008 | TOTP two-factor: enroll with QR code and recovery codes; mandatory for super admins, optional (configurable) for operators. | P1 |
| FR-AUTH-009 | Sensitive actions (refund, void, role change, user disable, delete) require a recent second-factor check when enrolled. | P1 |
| FR-AUTH-010 | Idle timeout (30 min) and absolute session limit (12 h); "sign out all devices". | P0 |
| FR-AUTH-011 | Repeated failed sign-ins lock the account temporarily and are rate limited. | P0 |
| FR-AUTH-012 | Every sign-in, failure, password reset, MFA change and role change is written to the audit log. | P0 |
| FR-AUTH-013 | Admin pages carry no SEO metadata and send `noindex, nofollow, noarchive` and `no-store` headers. | P0 |

## 4. Admin: role-based access

| ID | Requirement | Priority |
|---|---|---|
| FR-RBAC-001 | Two roles: `super_admin` and `operator`; permission matrix in `07`. | P0 |
| FR-RBAC-002 | Every table enforces access with row-level security; the UI hides actions the user cannot perform but is not the authority. | P0 |
| FR-RBAC-003 | Operators cannot manage users, roles, settings, notification rules, or read the audit log; cannot refund, void invoices or hard-delete records. | P0 |
| FR-RBAC-004 | Operators can edit templates only when granted the `templates.edit` flag. | P1 |

## 5. Admin: modules

### 5.1 Dashboard (FR-DASH)

| ID | Requirement | Priority |
|---|---|---|
| FR-DASH-001 | Show new enquiries, open orders, deliveries in transit, payments this month, overdue invoices and recent activity, loaded with one aggregate query. | P1 |

### 5.2 Content (FR-CNT)

| ID | Requirement | Priority |
|---|---|---|
| FR-CNT-001 | Create, edit, publish and unpublish puppies with breed, sex, age text, origin, status, story text, slug (auto-generated, unique) and sort order. | P0 |
| FR-CNT-002 | Upload multiple photos and videos per puppy to storage with type and size validation, reordering, alt text and a cover image. | P0 |
| FR-CNT-003 | Mark a puppy "gone home"; it moves to the gone-home lists and keeps its detail page. | P0 |
| FR-CNT-004 | Manage happy-family photos (upload, caption, order, publish) and the featured testimonial. | P0 |
| FR-CNT-005 | Manage FAQs (question, answer, order, publish). | P0 |
| FR-CNT-006 | Manage site settings: phone, WhatsApp number, email, address, Maps link, social links, hero copy, WhatsApp prefilled text. | P0 |
| FR-CNT-007 | Publishing or editing content refreshes the affected public pages without a redeploy. | P0 |
| FR-CNT-008 | Operators cannot hard-delete content; super admins can delete and restore (soft delete). | P1 |

### 5.3 Enquiries and customers (FR-ENQ, FR-CUS)

| ID | Requirement | Priority |
|---|---|---|
| FR-ENQ-001 | Enquiries from the public forms land in an inbox with status (new, contacted, qualified, converted, closed, spam), assignee, notes and the related puppy. | P1 |
| FR-ENQ-002 | Convert an enquiry to a customer and optionally to an order; link existing customers by phone or email. | P1 |
| FR-ENQ-003 | Search and filter by status, assignee, date and text; cursor pagination. | P1 |
| FR-ENQ-004 | Export filtered enquiries to CSV (rate limited, audited). | P2 |
| FR-CUS-001 | Create and edit customers (name, phone, email, area, language, notes, tags, notification preferences, WhatsApp opt-in). | P1 |
| FR-CUS-002 | Customer profile shows enquiries, orders, payments, invoices and messages. | P1 |
| FR-CUS-003 | Detect duplicates by normalised phone or email; super admin can merge customers. | P2 |
| FR-CUS-004 | Delete or anonymise a customer on request (super admin) while keeping financial records. | P2 |

### 5.4 Orders and deliveries (FR-ORD, FR-DEL)

| ID | Requirement | Priority |
|---|---|---|
| FR-ORD-001 | Create an order for a customer and a puppy (local or imported) with total, deposit, currency and notes; number format `TP-YYYY-NNNNNN`. | P1 |
| FR-ORD-002 | Orders follow a defined status flow with a timeline of events (who, when, reason). | P1 |
| FR-ORD-003 | Reserving a puppy via an order sets its status to reserved; completing delivery sets it to gone home (with confirmation). | P1 |
| FR-ORD-004 | Cancelling an order requires a reason; operators cannot delete orders. | P1 |
| FR-ORD-005 | Attach documents (health certificate, passport, contract) to private storage. | P2 |
| FR-DEL-001 | Each order can have deliveries with method (showroom pickup, Dubai delivery, international cargo), carrier, tracking number, address, ETA and status. | P1 |
| FR-DEL-002 | Delivery status changes create timestamped events and can trigger customer notifications. | P1 |

### 5.5 Payments and invoices (FR-PAY, FR-INV)

| ID | Requirement | Priority |
|---|---|---|
| FR-PAY-001 | Ledger of payments with gateway, method, amount, status, reference and linked order or invoice, with filters. | P1 |
| FR-PAY-002 | Record manual payments (cash, bank transfer, card machine) against orders or invoices. | P1 |
| FR-PAY-003 | Payment recording is idempotent on `(gateway, reference)` and updates order and invoice balances in one transaction. | P1 |
| FR-PAY-004 | Gateways are enabled by environment configuration; unconfigured gateways are not offered. Stripe and Razorpay supported; others pluggable. | P2 |
| FR-PAY-005 | Gateway webhooks are verified, de-duplicated and update payments automatically. | P2 |
| FR-PAY-006 | Operators can request a refund; super admins approve and execute refunds (full or partial). | P1 |
| FR-INV-001 | Create invoices from an order with line items, tax and due date; numbers `INV-YYYY-NNNNNN` from a sequence. | P1 |
| FR-INV-002 | Issue an invoice (locks content), generate a PDF stored privately, and send it by email. | P1 |
| FR-INV-003 | Invoice status flow: draft, issued, partially paid, paid, overdue, void; only super admins can void. | P1 |
| FR-INV-004 | Overdue invoices are detected daily and raise reminders. | P2 |

### 5.6 Messaging and notifications (FR-MSG, FR-NOT)

| ID | Requirement | Priority |
|---|---|---|
| FR-MSG-001 | Manage message templates per channel (email, WhatsApp) and locale with allow-listed variables, preview with sample data, versions and rollback. | P1 |
| FR-MSG-002 | Send a template manually to a customer by email or WhatsApp; fall back to a prefilled `wa.me` link if no WhatsApp provider is configured. | P1 |
| FR-MSG-003 | Message log with status (queued, sent, delivered, read, failed), provider reference, errors, retry and per-customer history; inbound WhatsApp replies are stored. | P1 |
| FR-NOT-001 | Business events (enquiry, order, delivery, payment, invoice) create outbox records in the same transaction as the change. | P1 |
| FR-NOT-002 | A worker delivers outbox records to customers and staff using notification rules, with retries, backoff and failure alerts. | P1 |
| FR-NOT-003 | Notifications respect customer channel preferences, WhatsApp opt-in, quiet hours and daily caps. | P1 |
| FR-NOT-004 | In-app notifications (bell and list) appear live for assigned staff and super admins. | P1 |
| FR-NOT-005 | Super admins edit notification rules (event, channel, template, recipient, enabled). | P1 |

### 5.7 Users, settings, audit (FR-USR, FR-SET, FR-AUD)

| ID | Requirement | Priority |
|---|---|---|
| FR-USR-001 | Super admins invite users, change roles, disable accounts, reset MFA and revoke sessions. | P0 |
| FR-USR-002 | The last active super admin cannot be disabled or demoted. | P0 |
| FR-SET-001 | Super admins configure gateways in use (display only; secrets stay in env), quiet hours, caps, retention and MFA policy. | P1 |
| FR-AUD-001 | Append-only audit log of data changes and security events with actor, entity, before/after diff, IP hash and user agent. | P0 |
| FR-AUD-002 | Super admins can search and filter the audit log; nobody can edit or delete entries. | P0 |

### 5.8 Privacy and data protection (FR-PRIV)

Owned by `crm` (consent, requests) and `identity` (incidents, audit); standard in `06` section 6.

| ID | Requirement | Priority |
|---|---|---|
| FR-PRIV-001 | Public pages `/privacy` and `/terms` and a footer link on every page; privacy notice content per `06` section 6.12 (text supplied by the owner and counsel). **Not on the reference site; proposed improvement pending D16.** | P0 (before production) |
| FR-PRIV-002 | Every form shows a short consent line with a link to the notice, an 18+ statement, and unticked optional boxes for marketing and WhatsApp updates. | P0 |
| FR-PRIV-003 | Consent records (text version, timestamp, channel, source, hashed IP, withdrawal) are stored and viewable per customer. | P1 |
| FR-PRIV-004 | Withdrawal of consent (reply STOP, unsubscribe link, email to the privacy contact) is recorded and stops the related messaging immediately. | P1 |
| FR-PRIV-005 | A public data-request form (`/privacy/request`) and the privacy email create a data subject request with a due date. | P1 |
| FR-PRIV-006 | Super admins manage requests in a queue (status, handler, due date, identity check) and can export a subject's data and anonymise or erase it across modules, with legal-retention exceptions recorded. | P1 |
| FR-PRIV-007 | Retention jobs anonymise or delete data on the schedule in `06` section 6.7 and report results. | P1 |
| FR-PRIV-008 | Staff lists mask phone and email; reveal on demand writes an audit entry. | P1 |
| FR-PRIV-009 | A breach register records incidents, assessment, notifications and decisions. | P1 |
| FR-PRIV-010 | Photos on the families wall require a recorded release; withdrawal unpublishes within 24 hours. | P1 |
| FR-PRIV-011 | A record of processing activities, vendor register and DPIA log are maintained (documents, linked from the admin privacy screen). | P2 |
| FR-PRIV-012 | The staff UI warns not to enter sensitive data in free-text fields. | P2 |

FR-CUS-004 (delete or anonymise a customer) is fulfilled through FR-PRIV-006.

## 6. Acceptance criteria (summary)

Full numbered acceptance list: `15-test-and-qa-plan.md` (AC-xxx). Each FR above maps to at least one AC; the mapping table lives there.

## Open questions

1. Are prices ever shown publicly? (The reference shows none; the data model has an optional price for internal use.)
2. Should customers receive a public order-tracking page? (Not in scope now; notifications carry tracking numbers.)
3. Should the enquiry form on detail pages and the contact letter create the same enquiry type with a `source` field? (Assumed yes.)
4. Do operators need per-user content permissions (for example, only Happy families)? (Assumed no; two roles only.)
