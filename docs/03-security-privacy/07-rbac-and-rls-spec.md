# 07. RBAC and RLS Specification

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `05-data-model.md`, `06-security-architecture.md`, `15-test-and-qa-plan.md` |

## 1. Roles

| Role | Intent |
|---|---|
| `super_admin` | Owner or manager. Full control including users, settings, refunds, voiding, notification rules and audit log. |
| `operator` | Day-to-day staff. Content, enquiries, customers, orders, deliveries, payments (recording), invoices (create, issue, send), messages. No user management, settings, refund execution, voiding or hard deletes. |

Anonymous visitors (`anon`) read published content views and submit enquiries through one RPC. Nothing else.

## 2. Permission keys

Permissions are rows in `role_permissions(role, permission)` so the matrix can change by migration without code changes. Naming: `<module>.<action>`.

| Module | Keys |
|---|---|
| Dashboard | `dashboard.read` |
| Content | `content.read`, `content.write`, `content.publish`, `content.delete` |
| Enquiries | `enquiries.read`, `enquiries.write`, `enquiries.assign`, `enquiries.export` |
| Customers | `customers.read`, `customers.write`, `customers.merge`, `customers.delete` |
| Orders | `orders.read`, `orders.write`, `orders.cancel`, `orders.delete` |
| Deliveries | `deliveries.read`, `deliveries.write` |
| Payments | `payments.read`, `payments.record`, `payments.refund.request`, `payments.refund.approve`, `payments.export` |
| Invoices | `invoices.read`, `invoices.write`, `invoices.issue`, `invoices.send`, `invoices.void` |
| Templates | `templates.read`, `templates.use`, `templates.edit` |
| Messages | `messages.read`, `messages.send` |
| Rules | `rules.manage` |
| Notifications | `notifications.own` (always true for any signed-in staff) |
| Settings | `settings.read`, `settings.write` |
| Users | `users.manage` |
| Audit | `audit.read` |
| Privacy | `privacy.read` (consent log, DSR queue, incident register), `privacy.manage` (handle requests, record incidents), `privacy.export` (export a subject's data), `privacy.erase` (anonymise or erase) |

Permission keys are declared by each module in its `module.config.ts` and assembled into `role_permissions` at composition and by migration (`21` section 8). A module's use cases check them through the `AccessPolicy` port implemented by `identity`.

## 3. Permission matrix

`✔` allowed, `—` denied, `flag` allowed only when the profile flag is set.

| Permission | super_admin | operator |
|---|---|---|
| dashboard.read | ✔ | ✔ |
| content.read / write / publish | ✔ | ✔ |
| content.delete | ✔ | — |
| enquiries.read / write / assign | ✔ | ✔ |
| enquiries.export | ✔ | — |
| customers.read / write | ✔ | ✔ |
| customers.merge / delete | ✔ | — |
| orders.read / write / cancel | ✔ | ✔ (cancel requires a reason) |
| orders.delete | ✔ | — |
| deliveries.read / write | ✔ | ✔ |
| payments.read / record | ✔ | ✔ |
| payments.refund.request | ✔ | ✔ |
| payments.refund.approve | ✔ | — |
| payments.export | ✔ | — |
| invoices.read / write / issue / send | ✔ | ✔ |
| invoices.void | ✔ | — |
| templates.read / use | ✔ | ✔ |
| templates.edit | ✔ | flag (`profiles.can_edit_templates`) |
| messages.read / send | ✔ | ✔ |
| rules.manage | ✔ | — |
| settings.read | ✔ | ✔ (public contact values only) |
| settings.write | ✔ | — |
| users.manage | ✔ | — |
| audit.read | ✔ | — |
| privacy.read / manage / export / erase | ✔ | — (operators can record a request received by phone through `privacy.intake`, which only creates a pending request) |

Sensitive actions additionally require **step-up MFA** (`aal2` within 10 minutes) when the user has MFA enrolled and is mandatory for super admins: `payments.refund.approve`, `invoices.void`, `users.manage`, `*.delete`, `customers.merge`, `*.export`, `settings.write`.

## 4. Role and claim design

- `profiles.role` is the source of truth. A Supabase **custom access token hook** copies `role`, `can_edit_templates` and `disabled` into the JWT as claims (`app_role`, `app_flags`) on each token issue.
- Helper functions in schema `app_private` (`SECURITY DEFINER`, `search_path = ''`, `STABLE`):
  - `current_role()` returns the role from the JWT claim (falls back to a profile lookup when the claim is missing).
  - `is_active_staff()` returns true when the user is authenticated, not disabled and has a profile.
  - `has_permission(p text)` returns true when `role_permissions` grants `p` to the current role, or when `p = 'templates.edit'` and the flag is set.
- Policies call helpers as `(select app_private.has_permission('orders.write'))` so Postgres evaluates them once per statement, not per row.
- A disabled user keeps a valid JWT for at most its remaining lifetime; `is_active_staff()` re-checks `profiles.disabled_at` so RLS denies at once, and middleware revokes the session.

## 5. RLS policy design

General rules:

- **RLS enabled and forced** on every table in `public`.
- Default deny; policies are written per operation (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) and per role through permissions.
- No policy for `anon` except the public views and the RPC grants listed below.
- `audit_log`: `SELECT` for `audit.read`; **no** `INSERT/UPDATE/DELETE` policies (writes only by triggers and service role).
- Soft deletes: normal `SELECT` policies add `deleted_at is null`; super admins can see deleted rows through a separate policy.
- Row ownership where relevant: `notifications` visible only where `user_id = auth.uid()`.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | own row; `users.manage` all | service role only (invites) | own display fields; `users.manage` role/flags | none (disable instead) |
| `role_permissions` | active staff | none | none (migrations only) | none |
| `login_attempts` | `audit.read` | service role | none | service role (retention) |
| `audit_log` | `audit.read` | triggers/service only | none | none |
| `idempotency_keys`, `webhook_events` | service role | service role | none | service role |
| `puppies`, `puppy_media` | `content.read` | `content.write` | `content.write` (publish fields need `content.publish`) | `content.delete` (soft) |
| `families`, `testimonials`, `faqs` | `content.read` | `content.write` | `content.write` / `content.publish` | `content.delete` |
| `site_settings` | public rows to anon via view; staff read via `settings.read` | `settings.write` | `settings.write` | none |
| `customers` | `customers.read` | `customers.write` | `customers.write` | `customers.delete` (soft) |
| `enquiries`, `enquiry_notes` | `enquiries.read` | via RPC for public; `enquiries.write` for staff | `enquiries.write`; assignment needs `enquiries.assign` | none |
| `orders`, `order_items`, `order_events`, `order_documents` | `orders.read` | via RPC `create_order` (`orders.write`) | via RPC transitions only | `orders.delete` (soft) |
| `deliveries`, `delivery_events` | `deliveries.read` | `deliveries.write` | `deliveries.write` | none |
| `payments` | `payments.read` | via RPC `record_payment` (`payments.record`) or webhook (service role) | none directly (RPC only) | none |
| `refunds` | `payments.read` | via RPC `request_refund` | via RPC `approve_refund` (`payments.refund.approve`) | none |
| `invoices`, `invoice_lines` | `invoices.read` | `invoices.write` | drafts only (`invoices.write`); issue via RPC (`invoices.issue`); void via RPC (`invoices.void`) | none |
| `tax_rates` | active staff | `settings.write` | `settings.write` | none |
| `message_templates` | `templates.read` | `templates.edit` | `templates.edit` | `templates.edit` (soft) |
| `notification_rules` | `rules.manage` | `rules.manage` | `rules.manage` | `rules.manage` |
| `outbox` | service role | triggers/RPCs only | service role | service role |
| `messages` | `messages.read` | via server code with `messages.send` (or service role for worker) | service role (status from webhooks) | none |
| `inbound_messages` | `messages.read` | service role (webhooks) | none | none |
| `notifications` | owner only | triggers/service role | owner (mark read) | owner |

**Writes through RPC** (preferred for anything stateful): the table has no direct `INSERT/UPDATE` policy for staff; the RPC is `SECURITY DEFINER`, checks `has_permission()` itself, and validates transitions.

## 6. Public (anon) access

| Object | Grant |
|---|---|
| `v_public_puppies`, `v_public_puppy_detail`, `v_public_gone_home`, `v_public_families`, `v_public_faqs`, `v_public_testimonial`, `v_public_settings` | `SELECT` for `anon` and `authenticated` |
| `create_enquiry(payload)` | `EXECUTE` for `anon` (validated, rate limited at the HTTP layer) |
| All base tables | no grants to `anon` |

Views are owned by a restricted role, expose whitelisted columns only, and filter `published_at is not null and deleted_at is null`.

## 7. Storage policies

| Bucket | Read | Write |
|---|---|---|
| `site-media` | public read of objects referenced by published rows (path convention `puppies/{id}/...`, `families/...`) | staff with `content.write` via signed upload URL |
| `private-docs` | none directly; signed URL issued by server after `orders.read` or `invoices.read` | server only (invoice PDF generation) and staff with `orders.write` for uploads |

## 8. Business rules tied to roles

| Rule | Enforcement |
|---|---|
| Operators cannot execute refunds; they request; a super admin approves | `request_refund` vs `approve_refund` permission checks |
| Operators cannot void invoices or delete financial records | No policy or RPC permission |
| Issued invoices are immutable | `BEFORE UPDATE` trigger blocks changes except status and paid amount via RPC |
| Cancelling an order after deposit requires a super admin decision on the refund | `transition_order` checks |
| The last active super admin cannot be disabled or demoted | Trigger on `profiles` |
| A user cannot change their own role or re-enable themselves | RLS `WITH CHECK` |
| Role changes require step-up MFA and are audited | Server action plus audit |

## 9. Test cases (RLS and permissions)

Run as SQL tests (pgTAP or equivalent) with fixtures for `anon`, `operator`, `operator_with_template_flag`, `super_admin`, `disabled_operator`.

| ID | Case | Expected |
|---|---|---|
| RLS-001 | `anon` selects each base table | permission denied |
| RLS-002 | `anon` selects public views | only published rows, no price or internal columns |
| RLS-003 | `anon` calls `create_enquiry` with valid and invalid payloads | success / validation error |
| RLS-004 | Operator reads `audit_log` | zero rows or denied |
| RLS-005 | Operator updates `profiles.role` | denied |
| RLS-006 | Operator calls `approve_refund` | denied; `request_refund` allowed |
| RLS-007 | Operator calls `issue_invoice`, `void_invoice` | issue allowed, void denied |
| RLS-008 | Operator hard-deletes a puppy, family, FAQ, customer | denied; soft delete denied too (needs `content.delete`) |
| RLS-009 | Operator without flag edits a template | denied; with flag allowed |
| RLS-010 | Disabled operator performs any select | denied immediately |
| RLS-011 | Operator reads another user's notifications | zero rows |
| RLS-012 | Direct `UPDATE payments` as operator or super admin | denied (RPC only) |
| RLS-013 | Duplicate `record_payment` with same gateway reference | single payment row, same result |
| RLS-014 | Invalid order transition (for example `new` to `delivered`) | error |
| RLS-015 | Super admin demotes the last super admin | error |
| RLS-016 | Updating an issued invoice's lines | error |
| RLS-017 | Storage: anon reads an unpublished media path | denied |
| RLS-018 | Storage: operator without `orders.read` requests a signed URL | denied |

## Open questions

1. Should operators see all enquiries and orders or only their own assigned ones? (Assumed all.)
2. Is a third role (for example `viewer` or `accountant`) needed later? The permission table makes it a data change.
3. Who approves refunds when only one super admin exists and is the requester? (Assumed allowed with an audit note.)
4. Should operators see site settings that contain secrets? (No secrets are stored in the database; only display config.)
