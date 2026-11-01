# crm module

**Purpose.** Customer relationships and customer privacy: enquiry submission now (mock), consent and data requests later.

**Layers.** `domain` (entities, rules), `application` (use cases, ports, DTOs, validation), `infrastructure` (adapters: mock now, Supabase later), `presentation` (UI for this module).

**Use cases (planned).**

- `SubmitEnquiry`

**Events emitted.** EnquirySubmitted

**Owner.** Project owner. **Phase.** Frontend track (`docs/07-planning/22-frontend-development-plan.md`).

Rules: other modules import only `index.ts`; no cycles; see `docs/02-architecture/21-modular-monolith-architecture.md`.
