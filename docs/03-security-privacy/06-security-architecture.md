# 06. Security Architecture

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.2 (data protection standard added 2026-11-02) |
| **Date** | 2026-11-02 |
| **Related** | `07-rbac-and-rls-spec.md`, `08-api-and-rate-limiting.md`, `03` (NFR-SEC), `14` |

## 1. Security goals

1. The admin portal is invisible to the public and unreachable without a verified, authorised account.
2. A compromised browser, leaked anon key or guessed URL gives no access to private data.
3. Money and messaging actions are authorised, idempotent and auditable.
4. Personal data is minimised, protected and removable.

## 2. Admin isolation (no public exposure, no SEO)

| Control | Detail |
|---|---|
| Entry | Only `/admin/**`. No link, button, sitemap entry or text on the public site mentions it. |
| Separate layout | `(admin)` has its own root layout: no site chrome, no title template, description, Open Graph, Twitter, canonical, JSON-LD, analytics or fonts tracking. |
| Robots | Metadata `robots: noindex, nofollow, noarchive, nocache`; response header `X-Robots-Tag: noindex, nofollow, noarchive` for `/admin` and `/api/admin`; `robots.txt` disallows both. Robots is a hint, so authentication is the real control. |
| Auth gate | Middleware redirects unauthenticated page requests to `/admin/login` and returns 401 JSON for `/api/admin/**`. Unknown admin paths behave the same when unauthenticated (no path enumeration). |
| Caching | `Cache-Control: no-store` on every admin response. |
| Optional IP allow-list | `ADMIN_IP_ALLOWLIST` env; when set, others receive a generic 404 before login is shown. |
| Preview deployments | Whole site `noindex` and protected by Vercel password or SSO. |

## 3. Authentication

| Topic | Design |
|---|---|
| Account creation | Invite only. Public sign-up disabled in Supabase. A super admin invites by email; the invitee follows a one-time link, verifies the address and sets a password. The first super admin is created by a one-time bootstrap script using the service key. |
| Verification | Email confirmation required before first sign-in; unverified accounts cannot authenticate. |
| Password policy | At least 12 characters, strength score ≥ 3, rejected if found in a breach corpus (k-anonymity API or Supabase leaked-password protection). |
| Sign-in | Email and password; generic error text; response time kept uniform. |
| Lockout | Rate limit 5 attempts per 15 minutes per IP and email; account locked 15 minutes after 10 failures; failures audited. |
| Password reset | `/admin/forgot-password` always shows the same message; link expires in 30 minutes and is single use; reset revokes other sessions and sends a "your password changed" email. |
| MFA | TOTP via Supabase MFA with recovery codes; mandatory for super admins, configurable for operators (`MFA_REQUIRED_FOR_OPERATORS`). Step-up (`aal2` within 10 minutes) required for refunds, voids, role changes, user disable, deletes, exports. |
| Sessions | HTTP-only, Secure, SameSite=Lax cookies via `@supabase/ssr`; idle timeout 30 minutes (`SESSION_IDLE_MINUTES`), absolute 12 hours (`SESSION_ABSOLUTE_HOURS`); "sign out everywhere"; session list in profile. |
| Disabled users | `profiles.disabled_at` blocks access immediately: middleware and RLS both check it. |
| Last super admin | Cannot be demoted or disabled (database constraint plus UI check). |

## 4. Authorisation

Defence in depth, strongest layer first:

1. **Postgres RLS** on every table, using `app_private.has_permission()` (see `07`).
2. **Database functions** for state changes enforce transition and permission rules.
3. **Server actions and handlers** call `requirePermission()` before work and return structured errors.
4. **UI** hides unavailable actions (convenience only).

The service-role client is used only for: invitations, webhooks, outbox worker, cron jobs and bootstrap. It is never used for a normal admin request.

## 5. Threat model (STRIDE summary)

| Threat | Example | Mitigation |
|---|---|---|
| **S**poofing | Stolen password, phishing | Mandatory MFA for super admins, breach check, lockout, session limits, email alerts on password change and new sign-in |
| **S** | Forged payment or message webhook | Signature verification, event de-duplication, IP/secret checks, reject unsigned |
| **T**ampering | Operator edits another role's data via API | RLS per operation; trigger-enforced state machines; immutable issued invoices; append-only audit |
| **T** | Modified price or amount in a request | Amounts computed server-side from stored data; Zod validation; DB constraints |
| **R**epudiation | "I did not refund that" | Audit log with actor, diff, IP hash, request ID; step-up MFA for sensitive actions |
| **I**nformation disclosure | Leaking customers via public views | Public views whitelist columns; IP hashing; private bucket and short signed URLs; no PII in logs |
| **I** | Account enumeration | Generic responses on login and reset |
| **D**enial of service | Form flooding, login brute force | Redis rate limits, honeypot, timing check, optional Turnstile, payload size limits |
| **E**levation | Operator calls super-admin endpoint | Permission check in server action and RLS; role claim read from a verified JWT; `SECURITY DEFINER` functions use fixed `search_path` |
| Injection | SQL, HTML, template injection | Parameterised queries via supabase-js/RPC; escaped template variables; allow-listed variables; no dynamic SQL from input |
| CSRF | Cross-site form post to admin | SameSite=Lax, Next.js server action origin check, `Origin` verification in route handlers |
| SSRF / open redirect | Unvalidated URLs | No server fetch of user-supplied URLs; redirect targets allow-listed |
| Supply chain | Malicious package | Lockfile, audit in CI, minimal dependencies, Dependabot or equivalent |

## 6. Data protection standard

**Status of this section.** It is a technical and organisational design standard, written to satisfy the data-protection laws listed in 6.2 as far as system design can. **It is not legal advice.** Before the system processes real personal data in production, a qualified lawyer in the UAE (and in each market served) must review 6.2, 6.5, 6.8, 6.10 and 6.12, and the business must name a Data Protection Lead (decision D16 in `RESEARCH-SIGNOFF.md`). Items marked **verify** depend on regulations or guidance that may have changed or were still being finalised when this was written.

**Approach: one highest-common-denominator baseline.** The business sells worldwide, so customers may be in the UAE, the EU/UK, India, other GCC states and elsewhere. Instead of maintaining a different system per country, every control below is designed to meet the strictest obligation of the applicable laws (usually GDPR), plus the specific extras of the UAE PDPL and India's DPDP Act. One set of controls then works everywhere.

### 6.1 Roles

| Role | Who | Responsibility |
|---|---|---|
| **Controller** (GDPR) / **Controller** (PDPL) / **Data Fiduciary** (DPDP) | The business that operates the site (TeddyPups, or the deploying owner) | Decides purposes and means; accountable for compliance |
| **Processors** (GDPR) / **Data Processors** (DPDP) | Hosting, database, email, messaging and similar vendors (6.8) | Process only on documented instructions under a data processing agreement |
| **Independent controllers** | Payment gateways for card data (Stripe, Razorpay and others) | Control their own processing of cardholder data |
| **Data Protection Lead** (DPO where required) | Named person (decision D16) | Advises, monitors compliance, handles authorities and data subjects |
| **Grievance Officer** (DPDP) | The same or another named person | Receives and resolves complaints from data principals |
| **Representative** (GDPR Art. 27, UK) | Only if the business targets EU/UK residents without an establishment there (verify with counsel) | Local contact point for authorities and individuals |
| **Security Officer** | Super admin or named technical owner | Owns technical controls and incident response |

### 6.2 Regulatory applicability

| Law or standard | Trigger | Applies? | What the system does about it |
|---|---|---|---|
| **UAE PDPL**, Federal Decree-Law No. 45 of 2021 (and the UAE Data Office) | Processing personal data of individuals in the UAE, or by a UAE-established controller | **Yes (primary law).** The business is in Downtown Dubai, which is mainland Dubai, not a free zone | Lawful basis or consent, transparency, data subject rights, security, breach notification, cross-border conditions, records, DPIA where required. Executive regulations and Data Office guidance: **verify** current status |
| **DIFC Data Protection Law (No. 5 of 2020)** and **ADGM Data Protection Regulations 2021** | Establishment in, or processing within, the DIFC or ADGM free zones | **Not by default.** Only if operations or customers are processed within those zones | Controls are broadly compatible; confirm if the business ever operates there |
| **GDPR** (EU) 2016/679 | Offering goods or services to people in the EU/EEA, or monitoring them (Art. 3(2)) | **Yes whenever EU/EEA residents are targeted** (worldwide delivery, Europe-sourced breeders, EU customers) | Treated as the baseline for all controls (6.3 to 6.15) |
| **UK GDPR** and Data Protection Act 2018 | Same, for UK residents | Conditional, same controls | Same as GDPR; UK representative question in 6.1 |
| **India DPDP Act, 2023** (and its Rules, **verify** final text and commencement dates) | Processing digital personal data of people in India in connection with offering goods or services to them | **Conditional yes** if Indian customers are served (Razorpay is part of the plan) | Notice and consent in plain language, purpose limitation, rights (access, correction, erasure, grievance redress, nomination), breach intimation to the Data Protection Board and affected persons, children's data safeguards |
| **HIPAA** (US), 45 CFR Parts 160 and 164 | Covered entities (health plans, clearinghouses, healthcare providers) and their business associates handling **protected health information** of people | **Not applicable.** A pet business does not process human PHI, and veterinary or puppy health certificates are animal records, not PHI | The system **must not collect human health information** (rule 6.4). The HIPAA Security Rule's safeguard categories are used only as a benchmark (6.9) |
| **CCPA/CPRA** (California) | Businesses meeting its revenue or data-volume thresholds that serve California residents | **Not expected** (thresholds, **verify**) | Rights processes (6.6) already cover access, deletion and opt-out of sale; the system does not sell or share data |
| **Saudi PDPL** and other GCC laws (Bahrain, Qatar, Oman) | Customers resident in those states | **Conditional** per delivery market (**verify**) | Same baseline; cross-border rules reviewed per market |
| **PCI DSS v4.0** | Any handling of payment card data | **Scope minimised:** hosted checkout only, so SAQ A-type scope | No card data is received, stored or logged (6.9, `10` section 7) |
| **ePrivacy rules** (EU), UK PECR, UAE telecom and marketing rules (TDRA, **verify**) and the **WhatsApp Business Messaging Policy** | Electronic marketing, cookies, messaging | **Yes** where the channel is used | Opt-in for WhatsApp and marketing email, unsubscribe, quiet hours, no non-essential cookies (6.5, 6.12, `11` section 8) |
| **UAE health-data law** (Federal Law No. 2 of 2019, ICT in health fields) | Human health information | **Not applicable** | No human health data is collected |
| **ISO/IEC 27001, 27701 and 27018** | Voluntary frameworks | Benchmark only | Used to structure controls and evidence; no certification is claimed |

Where laws differ, the stricter design wins. When a law's specific obligation cannot yet be confirmed (for example executive regulations or notification deadlines), the design uses the stricter known timeline and the item is listed under **verify**.

### 6.3 Principles and how they are met

| Principle | Meaning | How the system meets it | Law reference (illustrative) |
|---|---|---|---|
| Lawfulness, fairness, transparency | A valid basis and clear information before collection | Basis per activity (6.5); privacy notice and consent text on every form (6.12) | GDPR Art. 5(1)(a), 6, 12 to 14; PDPL; DPDP notice and consent |
| Purpose limitation | Use data only for stated purposes | Each module owns its data and exposes only what other modules need (`21` section 7); messaging checks purpose and consent per channel | GDPR Art. 5(1)(b) |
| Data minimisation | Collect only what is needed | Optional fields stay optional; no special-category data; IPs stored only as salted hashes; mock phase uses no real data (6.15) | Art. 5(1)(c), 25 |
| Accuracy | Keep data correct | Customers editable by staff; rectification right (6.6); duplicate detection | Art. 5(1)(d), 16 |
| Storage limitation | Do not keep data longer than needed | Retention schedule and automated jobs (6.7) | Art. 5(1)(e) |
| Integrity and confidentiality | Protect against loss and unauthorised access | Section 6.9 (TLS, RLS, RBAC, MFA, audit, backups) | Art. 5(1)(f), 32; DPDP safeguards |
| Accountability | Be able to demonstrate compliance | Record of processing, DPIAs, consent log, DSR log, breach register, vendor register, audit log (6.14) | Art. 5(2), 24, 30 |
| Privacy by design and default | Build privacy in | Defaults: marketing off, WhatsApp opt-in required, pseudonymised identifiers, least privilege (6.11) | Art. 25 |
| Rights | Let people exercise control | Intake, verification, per-module export and erase (6.6) | Art. 12 to 22 |
| Controlled transfers | Protect data that leaves the country | Processor register, DPAs, transfer mechanism per vendor (6.8) | Art. 44 to 49; PDPL transfer rules; DPDP |
| Breach readiness | Detect, contain and notify | Incident runbook with notification timelines (6.10) | Art. 33, 34; PDPL; DPDP |

### 6.4 Personal data inventory and classification

**Classes:** **Public** (anyone may see), **Internal** (business use, low harm), **Confidential** (personal or commercially sensitive), **Restricted** (high harm if exposed; extra controls).

| Dataset | Examples | Subjects | Class | Purpose | Retention (to confirm) | Owner module |
|---|---|---|---|---|---|---|
| Enquiry data | Name, phone, email, area, message, puppy of interest | Prospects | Confidential | Respond to the enquiry | 24 months after last contact, then anonymise | `crm` |
| Customer profile | Contact data, language, notes, tags, channel preferences | Customers | Confidential | Run the relationship | While active + 24 months | `crm` |
| Consent and preference records | Consent text version, time, channel, hashed IP, withdrawals | Customers | Confidential | Prove consent | Relationship + 3 years | `crm` |
| Order and delivery data | Order number, delivery address, tracking, documents | Customers | Confidential | Contract performance | 7 years (tax and commercial records, **verify**) | `commerce` |
| Payment and invoice records | Amounts, method, gateway reference, invoice PDF (no card data) | Customers | Restricted | Contract, legal obligation | 7 years (**verify**) | `billing` |
| Messages | Rendered email or WhatsApp text, delivery status | Customers | Confidential | Transactional communication | 24 months | `messaging` |
| Staff account data | Name, work email, role, MFA status | Staff | Confidential | Access control | Active + 12 months | `identity` |
| Audit log | Actor id, action, entity, hashed IP, user agent | Staff, customers (as entities) | Restricted | Security and accountability | 7 years | `identity` |
| Security and technical logs | Request ids, hashed IPs, error traces (PII scrubbed) | Visitors | Internal | Operations and security | 30 to 90 days | `platform` |
| Family photos and testimonials | Photos of customers and their children, first names, captions | Customers and **children** | **Restricted** | Social proof on the public site | Until consent is withdrawn | `content` |
| Puppy data and photos | Names, breed, age, photos | None (animals; check backgrounds for people) | Public | Catalogue | While listed + archive | `catalog` |
| Site analytics | None collected by default | Visitors | n/a | n/a | n/a | n/a |

**Special-category and sensitive data: not collected.** The system must not collect or store human health, religion, ethnicity, political views, biometric or genetic data, government identifiers, or financial account numbers beyond what the payment gateway handles. Free-text fields (messages, notes) carry a warning not to enter such data; staff notes are reviewed in audits. **Photos are personal data** (and are not "biometric" only because no facial recognition or identification processing is performed; keep it that way).

### 6.5 Lawful basis and consent

| Activity | GDPR basis | PDPL and DPDP equivalent | Consent required? |
|---|---|---|---|
| Replying to an enquiry or contact letter | Steps at the request of the person before a contract (Art. 6(1)(b)); consent evidence also stored | Consent or pre-contractual necessity | Consent line on the form (informational, not a barrier) |
| Creating a customer record and order | Contract (6(1)(b)) | Contract performance / legitimate use | No |
| Invoices, payment records, tax | Legal obligation (6(1)(c)) | Legal obligation | No |
| Transactional messages (confirmation, receipt, delivery update) | Contract (6(1)(b)) | Contract / legitimate use | No for email; **WhatsApp requires recorded opt-in** (platform policy) |
| Marketing or promotional messages | Consent (6(1)(a)), plus ePrivacy opt-in | Consent | **Yes, separate and optional**, default off |
| Displaying family photos and testimonials | Consent (6(1)(a)), explicit and revocable; parental consent for children | Consent; verifiable parental consent for children | **Yes**, written release per photo |
| Staff accounts | Legitimate interests / employment | Employment / legitimate use | No |
| Security logs and audit | Legitimate interests (6(1)(f)), legal obligation | Legitimate use | No (disclosed in notice) |
| Website analytics or advertising cookies | Consent | Consent | Yes **if ever added**; none by default |

**Consent standard** (applies to every consent the system records):
1. Freely given, specific, informed and unambiguous; **unticked checkboxes**; one purpose per consent; no bundling with terms.
2. Plain language, English first and Arabic recommended for UAE audiences (DPDP requires English or listed Indian languages for Indian users).
3. Versioned text: each consent stores the exact text version (`CONSENT_TEXT_VERSION`), timestamp, channel, source page and salted-hash IP.
4. Withdrawal as easy as giving it (link in every marketing message, reply STOP on WhatsApp, setting in a future customer area, or email to the privacy contact); withdrawal is recorded and propagated at once to `messaging` and `content`.
5. Re-confirmation when the purpose or text changes materially.
6. **Children:** the site is not directed at children. Enquiries require the sender to be 18 or older (statement on the form). Photos of children are published only with a parent or guardian's explicit consent (verifiable), and are removed on request without delay.

### 6.6 Data subject rights

| Right | GDPR | UAE PDPL | India DPDP | How it is fulfilled |
|---|---|---|---|---|
| Information | Art. 13/14 | Yes | Notice | Privacy notice and layered consent text (6.12) |
| Access / copy | Art. 15 | Yes | Yes | Per-module `export` into one package (below) |
| Rectification | Art. 16 | Yes | Correction | Staff edit after verification |
| Erasure | Art. 17 | Yes | Erasure | Per-module `anonymise` or delete, subject to legal retention |
| Restriction | Art. 18 | Yes | n/a (withdraw consent) | `restricted` flag blocks processing and messaging |
| Portability | Art. 20 | Yes | n/a | Machine-readable JSON and CSV export |
| Objection / withdraw consent | Art. 21, 7(3) | Yes | Withdraw consent | Opt-out records; propagation to `messaging` |
| Not be subject to solely automated decisions | Art. 22 | Yes | n/a | **No automated decision-making** is performed |
| Grievance redress | Complaint to authority | Complaint to the Data Office | Grievance Officer, then Data Protection Board | Named contact and procedure |
| Nominate another person (death or incapacity) | n/a | n/a | Yes | Handled manually on request |

**Procedure (design):**
1. **Intake:** privacy email (`PRIVACY_CONTACT_EMAIL`) and a public request form (`POST /api/public/privacy-request`, rate limited). Acknowledge within 3 days.
2. **Verify identity** proportionately (reply from the known email or phone, plus a challenge); never ask for more data than needed.
3. **Log** in `dsr_requests` with type, received date, due date, status and handler.
4. **Execute across modules:** every module that stores personal data implements a `PersonalDataProvider` port in its application layer (`describe`, `export(subject)`, `anonymise(subject)`), and the composition root runs them all (`21` section 9). New modules cannot ship without it.
5. **Respond within 30 days** (the GDPR one-month limit; extendable by two months for complexity with notice). DPDP and PDPL deadlines follow their rules (**verify**); 30 days is used as the internal maximum.
6. **Exceptions are documented** (legal retention of invoices and payment records, legal claims) and explained to the person.
7. Exports are delivered through a signed, expiring link (private bucket) and are audited.

### 6.7 Retention and deletion

| Data | Rule | Trigger | Method |
|---|---|---|---|
| Enquiries and messages | 24 months after last interaction | Daily job (`anonymise_old_records`) | Anonymise name, phone, email, message; keep aggregate counts |
| Customer profiles without orders | 24 months after last interaction | Job | Anonymise |
| Customers with orders | Active + 24 months, financial records follow below | Job | Anonymise profile; keep order and invoice rows required by law |
| Order, invoice and payment records | 7 years (**verify** UAE and other local requirements) | Job | Archive, then delete or anonymise |
| Consent and DSR records | Relationship + 3 years | Job | Delete |
| Audit log | 7 years | Job | Delete oldest; no edits allowed |
| Login attempts | 30 days | Job | Delete |
| Technical logs | 30 to 90 days | Platform setting | Rolling deletion |
| Outbox processed rows | 30 days | Job | Delete |
| Family photos | Until consent is withdrawn | Withdrawal | Delete from storage and CDN; revalidate pages |
| Backups | Provider PITR window (for example 7 days) | Rolling | Deleted data disappears from backups at expiry; restore procedures re-apply deletions ("put beyond use") |

Retention values are configuration (`RETENTION_*` in `14`), reviewed yearly.

### 6.8 Processors, transfers and data residency

| Processor | Data processed | Role | Location | Safeguard |
|---|---|---|---|---|
| Vercel (hosting, edge) | Requests, rendered pages, logs | Processor | Global edge, **confirm** regions | DPA with Standard Contractual Clauses |
| Supabase (database, auth, storage, realtime) | All application data, staff identities | Processor | **Region chosen at project creation (decision D17); confirm available regions and data location** | DPA, encryption, region pinning |
| Upstash Redis (rate limits) | Hashed identifiers and counters only; **no plain personal data** | Processor | Choose a region close to the app | DPA |
| Resend (email) | Recipient email, message content | Processor | United States (**verify**) | DPA, SCCs |
| WhatsApp provider: Meta Cloud API or Twilio | Phone number, message content, delivery status | Processor (and Meta as separate controller for platform data, **verify**) | Global | DPA, provider terms; opt-in evidence |
| Stripe, Razorpay or other gateway | Cardholder and payment data | **Independent controller** for card data; processor for some order metadata | Per gateway | Gateway terms; hosted checkout only |
| Cloudflare (CDN, optional analytics) | IP addresses, requests | Processor | Global | DPA; analytics disabled unless approved (6.11) |
| Error tracking, if added | Error traces | Processor | Per vendor | **PII scrubbing mandatory**, DPA |

Rules:
1. **Register and DPA first:** no vendor is integrated before a DPA (or equivalent terms) is signed and it is added to the register (6.14).
2. **Transfer mechanism per vendor** is recorded: adequacy decision, Standard Contractual Clauses plus transfer impact assessment, contractual and consent safeguards under the PDPL (**verify** the Data Office's rules on cross-border transfers), and India's rule that transfers are allowed except to countries the Government restricts (**verify**).
3. **Minimise what leaves the primary region:** rate-limit keys are hashes; logs are scrubbed; email and WhatsApp carry only what the message needs.
4. **Data residency decision (D17):** choose the Supabase region with counsel (options and trade-offs to be confirmed; availability of a Middle East region must be checked).
5. **Sub-processors:** vendors' sub-processor lists are monitored; material changes are reviewed.

### 6.9 Security measures (technical and organisational)

Mapped to GDPR Art. 32. The HIPAA column is a **benchmark only**; HIPAA does not apply (6.2).

| Control area | Measure | Where | GDPR Art. 32 | HIPAA Security Rule benchmark |
|---|---|---|---|---|
| Encryption in transit | TLS everywhere, HSTS | Section 7 | Encryption | §164.312(e)(1) transmission security |
| Encryption at rest | Managed encryption; private bucket for documents | Section 8 | Encryption | §164.312(a)(2)(iv) |
| Access control | RBAC and RLS, least privilege, no shared accounts | `07` | Confidentiality | §164.312(a)(1) access control |
| Authentication | Invite-only, email verification, strong passwords, TOTP MFA, lockout, session limits | Section 3 | Confidentiality | §164.312(d) person authentication |
| Audit controls | Append-only audit log, export and privacy actions logged | Section 3, `05` | Accountability | §164.312(b) audit controls |
| Integrity | Immutable issued invoices, state-machine triggers, signed webhooks | `05`, `10` | Integrity | §164.312(c)(1) integrity |
| Availability and resilience | PITR backups, restore drills, rate limiting, retry and outbox | Section 10, `08`, `11` | Availability, resilience | Contingency plan (§164.308(a)(7)) |
| Pseudonymisation | Hashed IPs and rate-limit keys; anonymisation on retention | Section 6.7 | Pseudonymisation | n/a |
| Data minimisation in UI | Phone and email masked in lists, revealed on demand with an audit entry; exports super admin only | `12` | Confidentiality | Minimum necessary |
| Environment separation | No production personal data in local, preview or test; mock data only in the frontend track | `04` section 6, 6.15 | Confidentiality | Workstation and device controls (benchmark) |
| Secure development | Code review, dependency and secret scanning, architecture tests, security tests | `15`, `21` | Regular testing | Evaluation (§164.308(a)(8)) |
| Vendor management | DPAs, register, review before integration | 6.8, 6.14 | Processor assurance | Business associate agreements (benchmark) |
| Workforce | Role-based training, confidentiality commitments, offboarding revokes access same day | 6.14 | Organisational measures | §164.308(a)(5) training (benchmark) |
| Physical security | Provided by cloud vendors; staff devices follow a baseline (screen lock, disk encryption) | 6.14 | Organisational measures | §164.310 (benchmark) |
| Incident response | Runbook and register (6.10) | 6.10 | Breach readiness | §164.308(a)(6) |
| Payments | Hosted checkout only; no card data stored or logged | `10` | Minimisation | n/a (PCI DSS SAQ A-type scope) |

### 6.10 Breach and incident management

| Step | Target | Detail |
|---|---|---|
| Detect | Continuous | Alerts for failed logins, webhook signature failures, anomalous exports, outbox failures; staff report suspicions to the Security Officer |
| Triage and contain | ≤ 24 hours from awareness | Revoke sessions, rotate keys, disable gateway or messaging (`FEATURE_OUTBOX_ENABLED=false`), preserve evidence |
| Assess | ≤ 48 hours | Data involved, number of people, likelihood and severity of harm, whether data was encrypted or hashed |
| Notify authority | **≤ 72 hours** after awareness where there is a risk (GDPR Art. 33); the **UAE Data Office** under the PDPL and the **Data Protection Board** under DPDP on the timelines in their rules (**verify**; the design applies 72 hours) | Content: nature, categories and numbers, contact point, likely consequences, measures taken |
| Notify individuals | Without undue delay where there is a high risk (GDPR Art. 34; PDPL and DPDP require notice to affected people) | Plain language: what happened, what data, what to do, contact |
| Notify partners | As per contracts | Processors and controllers involved, gateway or provider if relevant |
| Record | Always, even if not notified | **Breach register** (`privacy_incidents`): facts, effects, actions, decision and reasons |
| Review | ≤ 30 days after closure | Root cause, fixes, tests added, documents updated |

Runbook owners, contact lists (authority portals, counsel, vendors) and message templates live in the operations runbook produced in the development phase.

### 6.11 Privacy by design, by default, and DPIA

- **Defaults:** all optional fields optional; marketing and WhatsApp consent unticked; no analytics or advertising cookies; only strictly necessary storage (the public site sets no tracking cookies; the reference site loads Cloudflare Web Analytics, so analytics is a decision, not an assumption, D16); IP hashed; messages stored only as long as needed.
- **Privacy review on every change** (added to the review checklist in `21` section 17.3): new field or purpose? new vendor? new transfer? new retention? If yes, update the data inventory (6.4), consent text, notice and, if risk is high, run a **DPIA**.
- **DPIA triggers:** large-scale processing of children's images; any profiling or scoring; adding a vendor in a new country; new category of data; systematic monitoring. A DPIA template (purpose, necessity, risks, measures, residual risk, sign-off) is kept with the register.
- **Anonymisation vs pseudonymisation:** retention jobs produce irreversible anonymisation; hashing with a secret salt is pseudonymisation and still personal data.

### 6.12 Transparency documents (public site)

| Document | Content | Status |
|---|---|---|
| **Privacy notice** | Controller identity and contact, purposes and bases (6.5), categories and sources, recipients and processors, transfers and safeguards, retention (6.7), rights and how to exercise them (6.6), complaint routes (UAE Data Office, relevant EU/UK authority, India Board), Data Protection Lead and Grievance Officer contacts, automated decisions (none), children, updates, language(s) | **To be written by the business with counsel**; the system provides the page |
| **Consent text at each form** | Short layered text with a link to the notice; unticked optional boxes for marketing and WhatsApp | Wording from the owner and counsel |
| **Cookie notice** | States that only strictly necessary storage is used; becomes a consent banner only if analytics or advertising is added | Needed if any non-essential storage is added |
| **Terms of use** | Age 18+, accuracy, acceptable use | Counsel |

**Observed gap in the reference site:** its footer has **no privacy policy, terms or cookie link** (reference-analysis, footer screenshots). A faithful clone would reproduce that gap. The clone proposes adding `/privacy` and `/terms` pages, a footer link and a consent line on the two forms as a **labelled improvement** that needs the owner's approval (D16). Without them the deployed site would likely not meet the transparency duties above.

### 6.13 Children and family photographs

The happy-families wall and the testimonial show customers and their children. In the frontend track these are placeholders and fictitious names (6.15). In production:
1. Publish a photo only with a **signed release** (digital or paper) from the person or, for a child, a parent or guardian; store the release reference and date.
2. Withdrawal removes the photo from storage, CDN and caches, and revalidates pages within 24 hours; log the action.
3. Do not publish full names, locations beyond a city, or children's names; use first names or initials as the reference does.
4. No facial recognition, tagging or reuse of photos for advertising beyond the consent given.

### 6.14 Governance and accountability

| Artefact or practice | Owner | Frequency |
|---|---|---|
| **Record of processing activities** (6.4 table expanded: purposes, categories, recipients, transfers, retention, security) | Data Protection Lead | Updated with every change; reviewed yearly |
| **Vendor and DPA register** (6.8) | Data Protection Lead | Before onboarding; yearly review |
| **Consent register** (`consent_records`) and **DSR log** (`dsr_requests`) | System, reviewed by DP Lead | Continuous; monthly review of open items |
| **Breach register** (`privacy_incidents`) | Security Officer | On every incident |
| **DPIA register** | DP Lead | On trigger |
| **Training** | DP Lead | At onboarding and yearly: personal data handling, phishing, DSR and breach reporting |
| **Access reviews** | Security Officer | Quarterly: who has which role; remove dormant accounts |
| **Policy review and legal review** | Owner with counsel | Yearly and on law changes |
| **Audit** | Independent or internal | Yearly: sample DSRs, retention jobs, consent evidence |

### 6.15 Rules for the frontend (mock-data) track

1. **No real personal data** in the repository, fixtures, logs, screenshots committed to git, or demos. Mock enquiries are validated and discarded (`20` section 5).
2. Fixtures use placeholders for photos (decision D13) and **fictitious names** in place of real testimonial and family captions that identify real customers (for example "Sarah M., Dubai"); the reference's puppy names are not personal data.
3. The owner's research captures (`docs/05-research/evidence/pages`, the video, `docs/05-research/evidence/captures`) include real customers' faces and a third-party site's content. Keep the repository **private** and **git-ignore** `docs/05-research/evidence/pages` and `docs/05-research/evidence/video-recording` before publishing anything (also recommended for size).
4. Forms show the consent line and privacy link (6.12), even though nothing is stored yet, so the behaviour is reviewed early.
5. No analytics, trackers, or third-party embeds are added without a decision.
6. Secret scanning and PII scanning (for example phone and email patterns) run in CI.

### 6.16 Requirements and traceability

| ID | Requirement | Where |
|---|---|---|
| NFR-PRIV-008 to NFR-PRIV-020 | Data protection requirements (`03` section 3) | `03` |
| FR-PRIV-001 to FR-PRIV-012 | Privacy notice, consent capture, DSR intake and queue, export, erasure, retention, masking, registers (`02` section 5.8) | `02` |
| Tables `consent_records`, `dsr_requests`, `privacy_incidents` | `05` section 3.7 | `05` |
| Permission keys `privacy.read`, `privacy.manage`, `privacy.export`, `privacy.erase` | `07` | `07` |
| `POST /api/public/privacy-request`, limiter RL-PUB-3 | `08` | `08` |
| Privacy admin screens | `12` section 4.15 | `12` |
| Environment variables `PRIVACY_CONTACT_EMAIL`, `CONSENT_TEXT_VERSION`, `DSR_SLA_DAYS`, `RETENTION_*` | `14` | `14` |
| Tests T-PRIV-01 to 10, acceptance AC-025 to AC-027 | `15` | `15` |
| Risks R-21 to R-25, ADR-016 | `16` | `16` |

## 7. Headers and browser hardening

| Header | Value (admin) | Value (public) |
|---|---|---|
| Content-Security-Policy | Nonce-based; `default-src 'self'`; `frame-ancestors 'none'`; connect only to Supabase and own origin | Same pattern, allowing Supabase Storage images and video, Cloudflare Turnstile if enabled |
| Strict-Transport-Security | `max-age=63072000; includeSubDomains; preload` | same |
| X-Content-Type-Options | `nosniff` | same |
| Referrer-Policy | `no-referrer` | `strict-origin-when-cross-origin` |
| Permissions-Policy | camera, microphone, geolocation, payment disabled | same |
| X-Frame-Options | `DENY` | `DENY` |
| Cache-Control | `no-store` | normal caching rules |

(The reference site also uses a strict CSP; its `form-action 'self'` is mirrored.)

## 8. File and media security

- Upload through short-lived signed upload URLs; server verifies size, MIME type and magic bytes after upload, then moves the object to its final name.
- Allowed: JPEG, PNG, WebP for images (max 10 MB), MP4/WebM for video (max 100 MB, to confirm), PDF for documents (max 15 MB).
- `site-media` is public and contains only published assets; unpublishing removes public visibility through the views and, for sensitive cases, the object.
- `private-docs` is private; access via signed URLs of ≤ 5 minutes issued only after a permission check; invoice PDFs and health certificates live here.
- Image variants generated by the platform; original EXIF location data stripped.

## 9. Payments and messaging security

- Gateway secrets and webhook secrets are env-only. Webhook handlers verify the signature over the raw body before parsing.
- Each webhook event ID is recorded in `webhook_events`; replays are acknowledged and ignored.
- Hosted checkout only, so the app never sees card numbers (PCI scope minimised).
- Message variables are escaped for the channel; templates cannot execute code; only allow-listed variables render.
- Provider webhooks verified (Resend signature, Meta `X-Hub-Signature-256` with app secret or Twilio signature).
- Automated sends obey opt-in, quiet hours and caps to avoid abuse and provider bans.

## 10. Monitoring and incident response

- Alerts for: spike in failed logins, 429 rate, webhook signature failures, outbox failure rate, payment mismatches.
- Audit log reviewed by super admins; export to cold storage periodically.
- Incident runbook (in `RUNBOOK`, produced in the development phase): revoke sessions, rotate keys, disable gateway, pause outbox (feature flag `FEATURE_OUTBOX_ENABLED=false`).
- **Personal data breaches** follow the timelines, notifications and register in section 6.10; every security incident is assessed for personal-data impact.

## 11. Security acceptance checks

Mapped to `15-test-and-qa-plan.md`: RLS tests per table and role, auth flows, header checks, robots and metadata checks on admin pages, rate-limit bursts, webhook replay and tamper tests, upload abuse tests, dependency audit, and the data-protection tests T-PRIV-01 to 10 (consent, rights, retention, masking, breach register).

## Open questions

1. Is an IP allow-list for the office network desired?
2. Is Cloudflare Turnstile acceptable on public forms (adds a third party)?
3. Who receives security alert emails?
4. Maximum video upload size and storage budget?
5. **Legal review (D16):** which lawyer or firm confirms the UAE PDPL position (including executive regulations and cross-border rules), GDPR and DPDP applicability, and retention periods?
6. Who is the **Data Protection Lead** and **Grievance Officer** (can be one person)? Is a DPO legally required (assessed with counsel)?
7. **Supabase region and data residency (D17):** which region, and is a Middle East region acceptable and available?
8. Which markets are actively targeted (EU, UK, India, other GCC)? This decides GDPR Art. 27 representation and DPDP duties.
9. Is the Arabic privacy notice required, and who translates it?
10. Will analytics be used? (If yes, a consent banner and cookie policy are required.)
11. Approve adding `/privacy` and `/terms` pages, a footer link and a consent line on forms, which the reference site lacks?
