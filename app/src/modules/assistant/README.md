# assistant module

**Purpose.** A public, read-only puppy assistant (documents `26` to `30`). It answers only from generated JSON knowledge files, hands over to WhatsApp or the contact form, and never changes anything. The Claude model underneath stays frozen; a learned policy layer (later phases) only chooses how retrieval and prompts are configured.

**Layers.** `domain` (plain types), `application` (ports, use cases, validation), `infrastructure` (mock provider and in-memory stores now; Anthropic adapter and Supabase stores later), `presentation` (chat widget).

**Use cases.** `startConversation`, `sendMessage` (streamed events). Later: feedback, hand-over, deletion.

**Status.** Phases A1 to A3 built, mock mode only: scripted model, generated knowledge files (`npm run knowledge`, output in `infrastructure/knowledge/v1`), five read-only tools, guard (redaction, injection and price short-circuits, sentence-by-sentence output check), SSE route `/api/assistant/chat`, widget behind `ASSISTANT_ENABLED`. No live model, no API key, no persistence (decision D24). Live mode (`ASSISTANT_MODE=live`) uses NVIDIA's hosted models through `infrastructure/nvidia` (plain fetch, key in `NVIDIA_API_KEY`, check with `npm run assistant:smoke`); daily request caps per visitor and site; text-free turn and feedback records (`assistant_events`). Not yet: signed session token, evaluation set (A6), policy learning (A7), privacy tooling (A8).

**Owner.** Project owner. **Phase.** AI track (`docs/07-planning/30-assistant-delivery-plan.md`).

Rules: other modules import only `index.ts`; no cycles; see `docs/02-architecture/21-modular-monolith-architecture.md`.
