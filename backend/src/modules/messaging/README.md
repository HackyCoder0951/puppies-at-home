# messaging

Customer and staff notifications. Business events (enquiry, order, delivery, invoice, payment, refund) are written to the
`outbox` table by database triggers in the same transaction as the change, so a rollback sends nothing and a crash after
commit loses nothing. A worker (`/api/internal/outbox`, called by cron with `CRON_SECRET`) claims due rows with
`FOR UPDATE SKIP LOCKED`, finds the enabled rules for each event, resolves recipients, applies consent, preference, quiet
hours and daily-cap checks, renders the active template and sends through a provider adapter. Every attempt is logged in
`messages`; failures retry with backoff (1, 5, 15, 60 minutes) and the fifth failure alerts super admins.

- Providers: email through Resend (`EMAIL_PROVIDER=resend`) or a log-only sender for local use; WhatsApp has no provider,
  so WhatsApp rules are skipped with a visible status and staff use prefilled `wa.me` links.
- Templates are versioned with an allow-list of variables and one active version; rules are edited by super admins.
- Staff in-app notifications are rows readable only by their owner.

Layers: `domain` (rendering, quiet hours, helpers), `application` (worker use case over ports), `infrastructure`
(Supabase stores using a service client handed in by the cron route, email senders), `presentation` (labels).
