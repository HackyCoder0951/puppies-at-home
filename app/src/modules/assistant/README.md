# assistant module

**Purpose.** A public, read-only puppy assistant (documents `26` to `30`). It answers only from generated JSON knowledge files, hands over to WhatsApp or the contact form, and never changes anything. The Claude model underneath stays frozen; a learned policy layer (later phases) only chooses how retrieval and prompts are configured.

**Layers.** `domain` (plain types), `application` (ports, use cases, validation), `infrastructure` (mock provider and in-memory stores now; Anthropic adapter and Supabase stores later), `presentation` (chat widget).

**Use cases.** `startConversation`, `sendMessage` (streamed events). Later: feedback, hand-over, deletion.

**Status.** Mock mode only (phases A1 to A3). No live model, no API key (decision D24).

**Owner.** Project owner. **Phase.** AI track (`docs/07-planning/30-assistant-delivery-plan.md`).

Rules: other modules import only `index.ts`; no cycles; see `docs/02-architecture/21-modular-monolith-architecture.md`.
