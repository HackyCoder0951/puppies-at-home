# identity

Staff authentication for the admin portal: email and password sign-in with rate limits and attempt recording, sign-out,
password reset, and the current staff member (profile role, disabled flag). Supabase Auth is the identity provider;
`profiles` holds the role. Failed and successful sign-ins are audited through `record_audit_event`.

- `domain`: staff types, password policy.
- `application`: use cases over ports (`AuthGateway`, `StaffDirectory`, `AttemptLog`, `AuditSink`, `RateLimiter`).
- `infrastructure/supabase`: adapters over the session and service clients.
- `presentation`: input schemas and user-facing messages for the admin forms (no UI components here; pages live in `app/`).
