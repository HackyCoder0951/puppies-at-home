# storefront module

**Purpose.** Public experience composition (presentation only): header, footer, scenes and page compositions built from the other modules public APIs.

**Layers.** `domain` (entities, rules), `application` (use cases, ports, DTOs, validation), `infrastructure` (adapters: mock now, Supabase later), `presentation` (UI for this module).

**Use cases (planned).**

- none (presentation only)

**Events emitted.** none yet

**Owner.** Project owner. **Phase.** Frontend track (`docs/07-planning/22-frontend-development-plan.md`).

Rules: other modules import only `index.ts`; no cycles; see `docs/02-architecture/21-modular-monolith-architecture.md`.
