# 12. Admin Portal UX Specification

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `02` (FR-*), `07-rbac-and-rls-spec.md`, `11-notifications-and-messaging.md` |

## 1. Design principles

- **Plain, fast, accessible.** The admin does not reuse the illustrated public theme; it uses the brand palette (cocoa, toffee, milk, honey) with a neutral, dense layout and system-quality components.
- **No SEO and no tracking** (see `06`): minimal `<head>`, `noindex`.
- Desktop first, usable down to tablet (768px); phones work for read and quick actions.
- Every list: search, filters, keyset pagination, empty state, loading skeleton, error state.
- Every destructive or financial action: confirmation dialog stating the effect, optional reason, step-up MFA when required, success toast and audit entry.
- Keyboard support, visible focus, labelled controls, announced toasts.

## 2. Shell and navigation

```
+--------------------------------------------------------------+
| TeddyPups Admin            [search ⌘K]   🔔 3   user ▾         |
+----------------+---------------------------------------------+
| Dashboard      |  Page title                 [primary action]  |
| Content ▾      |  Filters / search                             |
|  Puppies       |  +-----------------------------------------+  |
|  Gone home     |  | table or detail                         |  |
|  Happy families|  |                                         |  |
|  FAQs          |  +-----------------------------------------+  |
| Enquiries      |                                               |
| Customers      |                                               |
| Orders         |                                               |
| Deliveries     |                                               |
| Payments       |                                               |
| Invoices       |                                               |
| Messaging ▾    |                                               |
|  Templates     |                                               |
|  Rules (SA)    |                                               |
|  Message log   |                                               |
| Settings (SA)  |                                               |
| Users (SA)     |                                               |
| Audit (SA)     |                                               |
+----------------+---------------------------------------------+
```
`(SA)` = super admin only; items the user cannot access are not rendered. Global search (customers, orders, invoices, puppies by number or name) opens with `/` or `Ctrl+K`. User menu: profile, security (password, MFA, sessions), sign out.

## 3. Authentication screens

| Screen | Content and behaviour |
|---|---|
| `/admin/login` | Email, password, "Forgot password?"; generic error; rate-limit message with countdown; no link to the public site except the plain logo text; no marketing copy |
| `/admin/verify` | Landing from the invite email: confirm email, set password with strength meter and policy hints |
| `/admin/forgot-password` | Email field; always shows "If an account exists, a link has been sent" |
| `/admin/reset-password` | New password and confirmation; policy and breach feedback; success message and redirect to login |
| `/admin/mfa` | Enroll (QR, manual key, verify code, recovery codes shown once with download) or challenge (6-digit code, recovery code option) |
| Session expiry | Modal "Your session expired" with return-to path after sign-in |

## 4. Module screens

### 4.1 Dashboard (`dashboard.read`)

Cards: New enquiries (7 days), Open orders, Deliveries in transit, Payments this month, Outstanding balance, Overdue invoices. Lists: latest 10 enquiries, today's deliveries, failed messages, items needing action (refund requests, unapproved templates). One aggregate call.

### 4.2 Puppies and gone-home (`content.*`)

- **List**: columns cover, name, breed, sex, age, origin, status, published, updated; filters by status, origin, breed, published; search; drag to reorder (sort order); bulk publish and unpublish.
- **Editor** (tabs): Details (name, breed, sex, age text, origin, Korean teacup flag, story), Media (multi-upload with progress, photos and videos, alt text required, reorder, set cover, delete), Visibility (status, publish toggle, public URL preview, slug), Internal (optional price, notes, linked orders).
- **Actions**: Save, Publish, Unpublish, Mark gone home (confirmation; moves to gone-home list), Duplicate, Delete (super admin).
- **Gone-home list**: same table filtered; re-open as available requires reason.
- Validation: slug unique, at least one cover photo to publish, alt text for photos.

### 4.3 Happy families, testimonial, FAQs

- Families: grid with captions, upload many at once, drag order, publish toggle, delete (SA).
- Testimonial: choose or edit the featured quote.
- FAQs: sortable list, rich-text-free answer (plain paragraphs and links), publish toggle.

### 4.4 Settings (`settings.write`, SA)

Sections: Contact (phone, WhatsApp number, prefilled WhatsApp text, email, address, Maps link, social links), Home copy (hero text, CTA text), Operations (quiet hours, daily caps, MFA for operators, retention months, tax rate and defaults), Payments (active gateways and mode, read-only), Messaging (active providers, read-only status). Changes revalidate public pages.

### 4.5 Enquiries (`enquiries.*`)

- **Inbox**: table with status chips, source, puppy, customer, assignee, received time; filters (status, assignee, source, date), search, "assigned to me".
- **Detail**: message, contact details with click-to-call and WhatsApp buttons, related puppy card, internal notes thread, status stepper, assign, **Convert to customer**, **Create order**, **Reply with template** (email or WhatsApp), message history.
- Spam action marks `spam` and optionally blocks the number.

### 4.6 Customers (`customers.*`)

List with search (name, phone, email), tags, last activity. Profile: contact info, preferences and WhatsApp opt-in (with source), timeline (enquiries, orders, payments, invoices, messages), tabs for each, notes. Actions: edit, send message, create order, merge (SA), anonymise (SA).

### 4.7 Orders (`orders.*`)

- **List**: number, customer, puppy, type, status, total, paid, balance, delivery status, created; filters, search by number or customer.
- **Detail**: header with status and next-step button; panels: Customer, Puppy, Items, Payments (with **Record payment** and **Payment link**), Invoices (create, issue, send), Deliveries, Documents, Timeline (events), Messages. Totals shown in the order currency.
- **Create order wizard**: pick or create customer, pick puppy (available only), type, items and total, deposit, review.
- Cancel dialog requires a reason; shows refund consequences.

### 4.8 Deliveries (`deliveries.*`)

Board view (columns by status) and list view; card shows order, customer, method, carrier, tracking, ETA. Detail: edit method and address, add status event (status, note, location, time), **Notify customer** (applies template for the new status), print/export label data.

### 4.9 Payments (`payments.*`)

Ledger table with filters (date range, gateway, method, status), totals row, drill to order and invoice. **Record payment** drawer; **Request refund** (operator) and **Approve/Reject refund** (SA) queue. Test-mode banner when applicable. Export (SA).

### 4.10 Invoices (`invoices.*`)

List (number, customer, order, status, total, paid, due, issued). Editor for drafts (lines, tax, notes, due date); preview as PDF layout; **Issue** (locks, assigns number, generates PDF); **Send** (email with link/attachment); **Void** (SA, reason); overdue badge. Printable and downloadable PDF via signed link.

### 4.11 Templates, rules, message log

- **Templates**: list by key, channel, locale, version, status (and WhatsApp approval status). Editor with variable palette (insert tokens), live preview with sample data, test send, version history with rollback. Operators see read-only unless flagged.
- **Rules** (SA): table event, channel, template, recipient, delay, enabled toggle; add rule dialog; validation prevents enabling a WhatsApp rule with an unapproved template.
- **Message log**: filters (channel, status, template, customer, date), row detail (rendered body, provider id, error, attempts), **Retry** for failures, link to customer.

### 4.12 Notifications

Bell dropdown (latest 10, unread badge) and `/admin/notifications` list with filters (unread, type), mark all read, click to open the record.

### 4.13 Users (`users.manage`, SA)

List (name, email, role, MFA status, last active, status). Actions: Invite (email, name, role), Change role (step-up), Toggle template-edit flag, Disable and enable, Reset MFA, Revoke sessions. Guard rail: cannot disable or demote the last super admin.

### 4.14 Audit log (`audit.read`, SA)

Filters (actor, entity, action, date range); table of time, actor, action, entity, summary; detail drawer with before and after JSON diff, IP hash and user agent; export (rate limited). Read only.

### 4.15 Privacy (`privacy.*`, super admin)

Tabs: **Requests** (queue with type, due date, status, handler; detail with identity check, per-module export and anonymise results, exceptions, response draft), **Consents** (search by customer; text version, time, channel, withdrawals), **Releases** (photo releases and withdrawals), **Incidents** (breach register form with timeline and notification checkboxes), **Registers** (links to the record of processing, vendor and DPA register, DPIA log), **Retention** (job status and last run). Sensitive values are masked by default; every reveal or export is audited.

## 5. Common components

Data table (sticky header, column chooser, keyboard row navigation), filter bar with saved filters, status chips (color plus text), confirm dialog with reason field, step-up MFA dialog, toast region (`aria-live`), file uploader (progress, retry, validation), money input (minor-unit safe, currency aware), date range picker, empty and error states with retry, skeletons, breadcrumb and back link.

## 6. States and messages

| State | Behaviour |
|---|---|
| Empty list | Explanation and the primary action (for example "Add your first puppy") |
| Loading | Skeleton rows; no layout shift |
| Error | Plain message with request ID and **Retry**; never raw errors |
| Permission denied | Page shows "You don't have access" and a link back; menu item hidden |
| Rate limited | Inline notice with countdown |
| Offline or session expired | Banner and return-to-page after sign in |
| Conflict (stale edit) | "This record changed. Reload to see the latest" with diff when possible |

## 7. Accessibility

WCAG 2.2 AA: landmarks, headings, labelled inputs, focus management after dialogs and navigation, `aria-sort` on sortable columns, table captions, keyboard drag-and-drop alternative (move up and down buttons), contrast checked for status chips, reduced-motion respected, touch targets ≥ 44px on tablet.

## 8. Responsive behaviour

≥1280: sidebar fixed, tables full. 768 to 1279: collapsible sidebar, tables with horizontal scroll inside container only. <768: top bar with menu drawer, tables turn into stacked cards for key lists (enquiries, orders, deliveries), editors become single column.

## 9. Visual style (admin)

Neutral surfaces (white, warm gray), cocoa text, toffee accent for primary actions, green only for success and WhatsApp actions, red for destructive, amber for warnings; 14 to 15px base text; Figtree for UI (no display or handwriting fonts).

## Open questions

1. Is a mobile-first operator view needed (for staff on the shop floor) or is tablet sufficient?
2. Should operators see the audit log entries of their own actions?
3. Branding for the admin login (logo only, or plain text)?
4. Print layouts needed (order sheet, delivery label, invoice) beyond the invoice PDF?
