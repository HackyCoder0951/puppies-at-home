# reporting

Dashboard figures (`admin_dashboard_stats()`: one JSON document, no per-widget queries) and CSV exports
(`export_rows()`: capped at 10,000 rows and one year, one permission per kind). Exports are rate limited (RL-ADM-3),
audited (who, what, how many rows, which range) and neutralise spreadsheet formula injection (cells starting with `=`,
`+`, `-`, `@` or a tab are prefixed). Customers are not exportable here: personal data leaves only through the privacy
tooling, subject by subject.

Layers: `domain` (CSV rules, columns, types), `application` (use cases over `ReportingRepository`, rate limiter and audit
ports), `infrastructure/supabase`, `presentation` (messages).
