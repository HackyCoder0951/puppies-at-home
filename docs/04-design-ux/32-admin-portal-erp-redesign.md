# 32. Admin portal redesign: modern ERP look in the TeddyPups theme

| | |
|---|---|
| **Status** | Approved by the owner 2026-11-03; first slice built (UI-0, UI-1, parts of UI-2, UI-3 and the Orders screen); the rest follows the phase list |
| **Date** | 2026-11-03 |
| **Replaces** | Sections 2, 5 and 9 of `12-admin-portal-ux-spec.md` once approved (the screens and permissions in `12` stay) |
| **Scope** | Presentation only: layout, components, tokens, states. Server actions, permissions, data and security are not touched |

## 1. Re-analysis of what exists today

Read from `app/src/app/(admin)/admin/` (2026-11-03).

| Area | Today | Problem |
|---|---|---|
| Layout | One centred column, `max-w-5xl`, a wrapping row of 17 text links as navigation | Looks like a settings page, not an operations tool; no grouping, no sense of place; breaks at 17 items; unused width on desktop |
| Colour | Green accent `#2f5d50`, grey-beige surfaces | Unrelated to the brand; the admin feels like a different product |
| Type | System font stack | No identity; numbers do not align in tables |
| Components | `adm-card`, `adm-input`, `adm-btn`, `adm-link` (39 lines of CSS) | No table, tabs, drawer, badge, empty state, command palette, toasts, skeletons; each list is hand-built |
| Navigation aids | None | No breadcrumbs, no global search, no environment indicator, no keyboard shortcuts |
| Dashboard | A short list of figures | No trends, no "what needs me now", no pipeline view |
| Theme | Follows the OS light/dark setting only | No explicit toggle; dark palette is generic |
| Shared CSS | The public site's stylesheet (curtain, paw cursor, mascot) is loaded on admin pages through the root layout | Playful public styles leak into a work tool |

## 2. Design direction

**"Back office of the same shop."** The portal shares the brand's colours, rounded geometry and type pairing with the public site, but drops its illustration, handwriting and motion theatre. It is calm, dense and fast: the visual language of a modern ERP (Linear, Stripe Dashboard and Odoo are the reference points for structure, not for style), warmed by the cocoa, toffee and honey palette.

Principles:
1. **Operations first.** Every screen answers "what needs me now?" before "what exists?".
2. **Dense but breathable.** 14 px base text, 40 px rows (comfortable) or 32 px (compact, user setting), generous gutters between cards.
3. **One pattern per job.** Lists are tables with the same toolbar; records open in the same split view or drawer; money is always right-aligned, tabular and in the same format.
4. **Keyboard and search native.** `Ctrl/Cmd+K` command palette, `/` to search, `g` then a letter to jump (`g o` orders), `?` for shortcuts.
5. **Safe by design.** Destructive and financial actions look different (confirm dialog with effect, reason, step-up MFA when required), exactly as in `12`.
6. **Brand continuity, no mascot noise.** The logo, the paw glyph and the empty-state drawing are the only illustrations.

## 3. Visual system

### 3.1 Colour tokens (light and dark)

Brand colours are the public site's own values.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#f7f3ec` (warm paper) | `#17100b` | App background |
| `--surface` | `#ffffff` | `#211710` | Cards, tables, drawers |
| `--surface-2` | `#fbf8f2` | `#2a1d14` | Table header, hover rows, inputs |
| `--sidebar` | `#2a170e` (cocoa) | `#120c08` | Navigation rail, always dark |
| `--sidebar-ink` | `#f6e8d4` | `#f1e2cc` | Rail text |
| `--ink` | `#2a170e` | `#f6ece0` | Primary text |
| `--ink-soft` | `#6f5848` | `#c2ab96` | Secondary text |
| `--line` | `#e6dccd` | `#3a2a1d` | Borders, dividers |
| `--accent` | `#a24a1a` (toffee-deep) | `#e08a4f` | Primary buttons, active nav, links |
| `--accent-2` | `#f2be6b` (honey) | `#f2be6b` | Highlights, selected rows, KPI emphasis |
| `--success` | `#1f7a4d` | `#4cc38a` | Paid, delivered, sent (same green as the WhatsApp button) |
| `--warning` | `#b7791f` | `#f2be6b` | Pending, overdue soon |
| `--danger` | `#b3261e` | `#ff8d84` | Failed, refunds, destructive |
| `--info` | `#2b6ea8` | `#7db7ee` | Informational chips |

Rules: status is always colour plus text plus icon; text contrast at least 4.5:1 (checked per token pair in the test plan); the rail stays cocoa in both modes so the product reads as TeddyPups at a glance.

### 3.2 Type
- **Figtree** (already self-hosted) for all UI; 14 px body, 13 px table cells, 12 px captions; `font-variant-numeric: tabular-nums` on every number, money and date column.
- **Fraunces** (already self-hosted) only for page titles (24 px) and KPI figures (32 px), which carries the brand into the tool.
- No handwriting font.

### 3.3 Shape, elevation, motion
Radius 10 px cards and inputs, 999 px chips, 6 px table elements. One soft shadow level for popovers and drawers; cards use a 1 px border instead of a shadow. Motion: 120 to 180 ms fades and slides, no bounces; fully disabled for reduced motion.

### 3.4 Iconography
One 20 px line-icon set (Lucide) with consistent 1.75 stroke; the paw glyph is the logo mark only.

## 4. Layout

```
+---------+-------------------------------------------------------------+
| LOGO    | Breadcrumb  Orders / TP-1042        [ Ctrl+K  Search ]  🔔 3  [Prod] ◐  AB ▾ |
|         +-------------------------------------------------------------+
| Search  | Page title                         [secondary] [Primary action] |
|         | Tabs:  Overview | Items | Payments | Delivery | Activity     |
| WORK    | +----------------------------------------+ +-------------+  |
|  Overview| | main content (table / form / board)   | | side panel  |  |
|  Inbox 3 | |                                        | | summary,    |  |
|  Enquiries| |                                        | | next steps  |  |
|  Customers| +----------------------------------------+ +-------------+  |
|  Orders |                                                              |
|  Deliveries                                                            |
| MONEY   |                                                              |
|  Invoices                                                               |
|  Payments                                                               |
| CATALOGUE                                                               |
|  Puppies  FAQs  Media                                                   |
| COMMS   |                                                              |
|  Messages Templates Rules                                               |
| SYSTEM  |                                                              |
|  Staff  Privacy  Settings  Audit                                        |
| ‹ collapse                                                              |
+---------+-------------------------------------------------------------+
```

- **Left rail (240 px, collapses to 64 px icons).** Grouped sections (Work, Money, Catalogue, Comms, System) with group headings, icons, unread/overdue count badges and a "recently visited" shortcut row. Items the user cannot access are not rendered (as in `12`). Below 1024 px it becomes an overlay drawer; below 768 px a bottom tab bar for the four most-used areas plus "More".
- **Top bar.** Breadcrumbs, command palette trigger, notification bell with a popover list, **environment badge** (Local, Preview, Production; production is a quiet tag, others are loud so nobody tests on live data), colour-mode toggle (light, dark, system), user menu (profile, security, sessions, sign out).
- **Page header.** Title, one-line description or record status, secondary actions in an overflow menu, a single primary action.
- **Content.** Full width up to 1600 px; two-column record layout (main 2/3, side panel 1/3 with summary, owner, due date, linked records, next best action); tabs for record sections; sticky action bar appears at the bottom when a form has unsaved changes.
- **Responsive.** 1280+ full layout; 768 to 1279 rail collapsed, side panel moves below main; under 768 tables become cards for enquiries, orders and deliveries, editors single column.

## 5. Component library (new, built once, used everywhere)

| Component | Behaviour |
|---|---|
| App shell | Rail, top bar, breadcrumb slot, toast region, command palette host |
| Data table | Sticky header, column chooser, density toggle, sort with `aria-sort`, multi-select with a bulk-action bar, row hover actions, keyboard navigation, saved views, keyset pagination, skeleton and empty states, CSV export (existing endpoint) |
| Filter bar | Search, chips for status/owner/date range, "save view", clear all; filters live in the URL |
| Status badge | Colour + icon + text; one mapping table for every status in the system |
| KPI card | Figure, trend arrow with comparison period, 7/30-day sparkline, click through to the filtered list |
| Board (kanban) | Enquiries by status and orders by stage; drag between columns with a keyboard alternative; card shows customer, puppy, age of item, owner |
| Timeline | Chronological activity (messages, payments, status changes, notes) on customers, orders and enquiries; filter by type |
| Drawer and modal | Right drawer for quick view/edit (from a table row), modal for confirmations, both focus-trapped |
| Form kit | Labelled fields with inline validation, money input, date range, phone input, file uploader with progress, unsaved-changes guard |
| Command palette | Search records (customers, orders, invoices, puppies) and run actions ("New order", "Record payment", "Go to Payments") |
| Toasts and banners | `aria-live`; success, error with request ID and retry; banners for outbox backlog, failed webhooks, session expiry |
| Empty states | Short explanation, one action, small brand drawing |
| Skeletons | Match the final layout so nothing jumps |

## 6. Screen-by-screen redesign

| Screen | New layout |
|---|---|
| **Overview** | "Needs attention" strip (new enquiries, overdue invoices, failed payments, deliveries today, messages waiting); KPI row (new enquiries, conversion, orders in progress, revenue this month, outstanding balance) with sparklines; pipeline funnel (enquiry to delivered); recent activity feed; today's deliveries list; payments and invoices mini-charts |
| **Enquiries** | Toggle between Table and Board; row opens a split view: conversation and details left, customer card, linked puppy, quick reply templates (email and wa.me), convert-to-order button right; assign owner, snooze, mark spam |
| **Customers** | Table with segments (all, repeat, outstanding balance, consent withdrawn); record page: profile header, tabs Overview, Orders, Payments, Messages, Privacy; lifetime value and balance chips |
| **Orders** | Table plus stage board (reserved, deposit paid, in transit, delivered, closed); record page with a stage stepper, items table, money summary card (total, paid, balance, next action), delivery card with timeline, invoices and payments tabs |
| **Deliveries** | Today and next 7 days calendar strip plus list; map-free status cards (route, courier, ETA) |
| **Invoices and payments** | Tables with aging chips (current, due soon, overdue), totals footer, invoice preview side by side with actions, payment link status and copy button, reconciliation view for webhook mismatches |
| **Catalogue** | Puppies as a grid or table toggle with real photos (the media is already in storage), status filter, inline publish switch, drag order with up/down buttons; FAQs as a sortable list with live preview |
| **Messages and templates** | Message log as a table with delivery status and channel icons; template editor with variable chips, live preview and test send; rules as a readable "when this happens, send that" list |
| **Staff, Privacy, Settings, Audit** | Same table and drawer patterns; Privacy gets a request tracker with SLA countdown; Audit gets a filterable timeline with actor, action and before/after diff |
| **Login and security screens** | Split screen: brand panel (cocoa, logo, one line of text) and a clean form; strength meter, MFA steps, recovery codes as already specified in `12` |

## 7. Architecture notes (no behaviour change)

1. Give the admin its own root layout (`app/(admin)/layout.tsx` with its own `<html>`/`<body>`, tokens and fonts) so the public stylesheet, curtain, paw cursor and mascot overlay are not loaded on `/admin`. The public site keeps its layout.
2. Put the shell and components in `app/src/shared/ui/admin/` (or a new `backoffice` presentation package) following the existing import rules; screens in `(admin)` stay thin and keep calling the same server actions.
3. Design tokens as CSS variables in one `admin-tokens.css`; Tailwind utilities map to them; dark mode toggled by a `data-theme` attribute persisted in a cookie (no flash).
4. No new data fetching is required except small read-only queries for the dashboard (trend series, pipeline counts); each is one indexed query behind the existing permissions.
5. Everything stays `noindex`, no analytics, no external scripts, no third-party fonts or icons loaded from a CDN.

## 8. Accessibility and quality gates

WCAG 2.2 AA: focus rings in `--accent`, keyboard path through rail, tables, drawers and the palette, 44 px targets on tablet, contrast verified for every token pair in both modes, reduced motion respected, announced toasts, `aria-sort`, captions, drag-and-drop alternatives. Gates per phase: lint, typecheck, unit and component tests, existing admin Playwright journeys still green, axe on each new screen, screenshot check in light and dark at 1440, 1024 and 768.

## 9. Delivery plan

| Phase | Work | Hours |
|---|---|---|
| UI-0 | Admin root layout, tokens, fonts, dark mode, remove public CSS from admin | 2 |
| UI-1 | App shell: rail, top bar, breadcrumbs, environment badge, notifications popover, mobile bar | 4 |
| UI-2 | Core components: data table, filter bar, badges, drawer, modal, form kit, toasts, skeletons, empty states | 8 |
| UI-3 | Overview dashboard (KPI cards, attention strip, funnel, activity, sparklines, new read queries) | 5 |
| UI-4 | Enquiries (table, board, split view) and Customers (record page, timeline) | 6 |
| UI-5 | Orders, Deliveries, Invoices, Payments (stage stepper, money cards, aging chips) | 7 |
| UI-6 | Catalogue, Messages and templates, Staff, Privacy, Settings, Audit | 6 |
| UI-7 | Command palette, shortcuts, saved views, login and security screens | 4 |
| UI-8 | Accessibility pass, dark mode pass, responsive pass, tests, docs | 4 |
| **Total** | | **46** |

A minimum slice (UI-0 to UI-3 and the Orders screen, about 22 h) already changes how the product feels; the rest can follow.

## 10. Risks

| Risk | Mitigation |
|---|---|
| Rewriting screens breaks server actions or permissions | Presentation-only rule; existing admin e2e tests run every phase; no action signatures change |
| Visual drift from the public theme | Tokens come from the public values; a gallery page (non-indexed, development only) compares both |
| Dashboard queries slow the first page | Pre-aggregated counts through one RPC, cached for 60 seconds, indexed columns only |
| Scope grows | Fixed phase list; new ideas go to a backlog section in this document |

## Owner answers (2026-11-03)

1. Dark mode: match the frontend theme. Built with brand tokens in light and dark plus a system option (toggle in the top bar, stored in a cookie).
2. Row density: no user choice (one comfortable density).
3. Boards first, tables second (Orders opens on the board; the table is one click away).
4. Lead numbers on the overview (owner left the choice to me): new enquiries, orders in progress, received this month, and outstanding on invoices.

## Built in the first slice (2026-11-03)

Own root layouts for the admin and the public site (the public stylesheet no longer loads on `/admin`, checked on the production build) with a global 404; brand tokens and Figtree and Fraunces; app shell (grouped rail with count badges, breadcrumbs, `Ctrl+K` palette, notification bell, environment badge, colour-mode toggle); components (badge, page header, KPI card, data table, board); overview (needs-attention strip, KPI row, pipeline, catalogue figures, export); Orders as a stage board with a table view and a stage stepper on the record page; split sign-in screen. **Not built yet:** sparklines and trend series, saved views, column chooser and bulk actions, drawer, toasts, enquiry board and split view, customer record tabs, aging chips, catalogue grid, the remaining phases of section 9.

## Open questions (answered above; kept for the record)

1. Is a dark mode needed on day one or can it follow UI-8?
2. Should staff be able to choose density (comfortable or compact) and a default landing page?
3. Do you want the board views (enquiries, orders) in the first slice, or tables first?
4. Which two or three numbers should lead the overview for the shop owner?
