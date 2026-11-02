# privacy

Staff tooling for the data protection standard (docs/03-security-privacy/06 section 6): a request (DSR) register with a
due date, subject **export** (one JSON document of everything held about a customer), **erasure by anonymisation** (the
profile, enquiries, notes, messages, delivery addresses and order free text are removed, copies inside audit snapshots
too; orders, invoices and payments stay because the law requires them, and the request records that exception),
**processing restriction** (the messaging worker then sends nothing), **consent withdrawal**, and the breach register
with its 72-hour clock. Every sensitive action is audited and permissioned in the database (`privacy.export`,
`privacy.erase`, `privacy.manage`; operators only have `privacy.intake`).

The daily retention job (`anonymise_old_records`) and audit retention (`prune_audit_log`) run with the service role from cron (B13).

Layers: `domain` (types, deadlines), `application` (use cases over `PrivacyRepository`), `infrastructure/supabase`, `presentation`.
