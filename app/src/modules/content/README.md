# content module

**Purpose.** Editorial and site content: family photos, FAQs, testimonial, site settings and static page copy.

**Layers.** `domain` (entities, rules), `application` (use cases, ports, DTOs, validation), `infrastructure` (adapters: mock now, Supabase later), `presentation` (UI for this module).

**Use cases (planned).**

- `ListFamilies`
- `ListFaqs`
- `SearchFaqs`
- `GetSettings`
- `GetTestimonial`

**Events emitted.** none yet

**Owner.** Project owner. **Phase.** Frontend track (`docs/07-planning/22-frontend-development-plan.md`).

Rules: other modules import only `index.ts`; no cycles; see `docs/02-architecture/21-modular-monolith-architecture.md`.
