# 09. Query Optimisation Guide

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `05-data-model.md`, `07-rbac-and-rls-spec.md`, `03` (NFR-PERF) |

## 1. Rules for every query

1. **Name the columns.** No `select *` in application code; each list and detail has a typed projection.
2. **One round trip per view.** A page issues one query (or one RPC) per data need, using embedded selects or views to avoid N+1.
3. **Paginate with keyset cursors** on any table that can exceed a few thousand rows; cap `limit` at 50 server-side.
4. **Filter on indexed columns** and order by an indexed key combination.
5. **Push aggregates to the database** (RPC, view, or materialised view); never count by fetching rows.
6. **Cache public reads** with tags; admin reads are uncached but cheap by design.
7. **Keep RLS cheap**: helper calls wrapped in `(select ...)`, JWT claims instead of joins.
8. **Measure, do not guess**: every hot query gets an `EXPLAIN (ANALYZE, BUFFERS)` check (section 8).

## 2. Access patterns and indexes

| # | Access pattern | Query shape | Index |
|---|---|---|---|
| 1 | Public puppy list (published, not gone home) | `v_public_puppies order by sort_order, published_at desc` | `puppies (sort_order, published_at desc) where published_at is not null and deleted_at is null and status <> 'gone_home'` |
| 2 | Public puppy by slug | `where slug = $1` | unique `puppies (slug)` |
| 3 | Media for a puppy | `where puppy_id = $1 order by sort_order` | `puppy_media (puppy_id, sort_order)`; partial unique `(puppy_id) where is_cover` |
| 4 | Public gone-home list | `status = 'gone_home' order by gone_home_at desc` | `puppies (gone_home_at desc) where status = 'gone_home' and published_at is not null` |
| 5 | Previous/next puppy on detail | neighbour by `sort_order` | covered by index 1 (seek with `<`/`>` and `limit 1`) |
| 6 | FAQs, families, testimonial, settings | small tables ordered by `sort_order` | `(sort_order) where published_at is not null` |
| 7 | Admin enquiries inbox | `status`, `assigned_to`, created desc, keyset | `enquiries (status, created_at desc, id desc)`; `enquiries (assigned_to, created_at desc) where status not in ('closed','spam')` |
| 8 | Customer search | `ilike`/trigram on name, phone, email | GIN `gin_trgm_ops` on `full_name`, `phone_e164`, `email` |
| 9 | Customer detail history | by `customer_id` across enquiries, orders, messages | `enquiries (customer_id, created_at desc)`, `orders (customer_id, created_at desc)`, `messages (customer_id, created_at desc)` |
| 10 | Orders list | `status`, created desc | `orders (status, created_at desc, id desc)` |
| 11 | Order detail | by id with items, events, deliveries, payments, invoices | FK indexes on each child `(order_id)`; single RPC `get_order_bundle(order_id)` returning JSON |
| 12 | Deliveries board | by status and ETA | `deliveries (status, eta)` |
| 13 | Payments ledger | gateway, status, date | `payments (status, paid_at desc, id desc)`, `payments (order_id)`, unique `(gateway, gateway_ref)` |
| 14 | Invoices list and overdue job | by status and due date | `invoices (status, due_at)`, `invoices (customer_id)` |
| 15 | Outbox worker | pending and due | `outbox (status, next_attempt_at) where status in ('pending','processing')`; unique `dedupe_key` |
| 16 | Message log | by customer, by status | `messages (customer_id, created_at desc)`, `messages (status, created_at desc) where status = 'failed'` |
| 17 | Notification bell | unread for me | `notifications (user_id, created_at desc) where read_at is null` |
| 18 | Audit search | by entity, by actor, by time | `audit_log (entity, entity_id, created_at desc)`, `audit_log (actor_id, created_at desc)`; BRIN on `created_at` |
| 19 | Dashboard | counts and sums | RPC `admin_dashboard_stats()` using the indexes above; optional materialised view refreshed every 5 minutes |

Index hygiene: no index without a documented access pattern; review unused indexes with `pg_stat_user_indexes` before release; foreign keys always indexed on the child side.

## 3. Avoiding N+1

| Page | Strategy |
|---|---|
| Public puppies | One query on the view with `cover` joined; media count precomputed or lateral-joined |
| Puppy detail | One query: puppy + media array (`select ..., puppy_media(...)` or view with `jsonb_agg`) |
| Orders list | Join customer name and puppy name in the same select; no per-row fetch |
| Order detail | `get_order_bundle` RPC builds one JSON document with `jsonb_agg` subqueries |
| Customer detail | Three small queries in parallel (enquiries, orders, messages), each limited to 20 with a "load more" cursor |
| Notifications | Query by `user_id` partial index; Realtime subscription for inserts only |

## 4. Pagination

Keyset format: order by `(created_at desc, id desc)`; cursor encodes the last row's pair; the next query uses a row comparison `(created_at, id) < ($1, $2)`. Total counts are not computed on large lists; show "more" and an approximate count from `pg_class.reltuples` or an RPC with a cap (`count ... limit 10001`).

## 5. Caching

| Layer | Use |
|---|---|
| Next data cache with tags | Public readers; revalidated by admin mutations (`04` section 5) |
| HTTP/CDN | Public pages and media; `s-maxage` with `stale-while-revalidate` |
| Redis (Upstash) | Rate-limit counters only; not a data cache (keeps invalidation simple) |
| Database | Materialised view for dashboard counts if p95 exceeds target |

Revalidation is targeted: updating one puppy invalidates `puppies`, `puppy:{slug}` and neighbours only if sort order changed.

## 6. RLS performance

- Wrap helper calls in a scalar subquery: `using ((select app_private.has_permission('orders.read')))`.
- Prefer JWT claims for role and flags to avoid a table lookup per statement; fall back to a cached lookup.
- Put the permission test first in policy expressions, then row filters.
- Avoid policies that join other RLS-protected tables; use `SECURITY DEFINER` helpers or denormalised keys.
- Index every column used in a policy predicate (`user_id`, `assigned_to`, `deleted_at` partial).

## 7. Writes

- Batch inserts for media and outbox rows; single transaction per business action (RPC).
- Avoid wide updates on hot rows: `orders.paid_minor` is updated only inside `record_payment`.
- Triggers kept small (audit, `updated_at`, transition checks); no network calls inside triggers.
- Large exports stream with a cursor and `COPY`-style batching; limited by RL-ADM-3.
- Connection use: server code over HTTP (PostgREST) for CRUD; pooled transaction-mode URL only for functions that need direct SQL; short transactions; statement timeout set (for example 8 s for admin, 3 s for public).

## 8. Verification and monitoring

| Check | Pass criterion |
|---|---|
| `EXPLAIN (ANALYZE, BUFFERS)` for each pattern in section 2 at 50k rows per large table | Uses the expected index, no sequential scan on large tables, execution time < 50 ms for list pages |
| Query count per page in dev (Supabase logs) | Public pages 0 on cache hit; admin list pages 1 to 3 |
| `pg_stat_statements` top 20 by total time | No unexpected heavy queries before release |
| Seed script at scale (50k customers/enquiries/messages) | Dashboard and lists meet NFR-PERF-008/009 |
| Vacuum and bloat | Autovacuum defaults acceptable; `outbox` and `notifications` pruned by daily job |

## 9. Anti-patterns to reject in review

`select *`; `offset` pagination on large tables; per-row queries in loops; `count(*)` for dashboards on big tables; `ilike '%x%'` without trigram index; client-side filtering of large lists; policies that call functions per row without subselect; using the service role for convenience.

## Open questions

1. Expected data volume (enquiries per month, messages per month) to size the load test.
2. Is the Supabase plan's connection limit sufficient for peak admin use plus cron workers?
