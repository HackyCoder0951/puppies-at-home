# catalog module

**Purpose.** Puppies and their media: available and gone-home puppies, breeds, origin, filters, neighbours.

**Layers.** `domain` (entities, rules), `application` (use cases, ports, DTOs, validation), `infrastructure` (adapters: mock now, Supabase later), `presentation` (UI for this module).

**Use cases (planned).**

- `ListAvailablePuppies`
- `ListGoneHomePuppies`
- `GetPuppyDetail`
- `FilterPuppies`
- `GetNeighbours`

**Events emitted.** none yet

**Owner.** Project owner. **Phase.** Frontend track (`docs/07-planning/22-frontend-development-plan.md`).

Rules: other modules import only `index.ts`; no cycles; see `docs/02-architecture/21-modular-monolith-architecture.md`.
