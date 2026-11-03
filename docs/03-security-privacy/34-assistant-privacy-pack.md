# Assistant privacy pack (A8): notice changes, DPIA inputs, what the code does

**Status:** inputs for the owner and counsel. Nothing here is legal advice and the wording is **not approved** (decisions D16, D35 open). Written 2026-11-03.

## 1. What is built (verifiable in the repository)

| Requirement | Where | State |
|---|---|---|
| First message says it is an AI; notice under the input; link to the privacy page | `ChatWidget.tsx` | Built (wording to approve) |
| Visitor can delete the chat (text and records) | widget "Delete this chat", `POST /api/assistant/forget`, `assistant_forget_conversation` | Built, browser test passes |
| Chat held in the tab only on the visitor's side | session storage (gone when the tab closes) | Built |
| Email and phone removed before storage and before the model | `checkInput` / `redact`; pgTAP and unit tests | Built |
| Retention: text 30 days, records 12 months | `prune_assistant_messages(30)`, `prune_assistant_events(365)` in the daily job | Built (daily job needs the cron running) |
| Records contain no text | `TurnRecord`; `assistant_events` check constraints | Built |
| Reviewer access limited, no export of text beyond the screen | `/admin/assistant`, `assistant_overview` requires `audit.read` (super admins) | Built; "named reviewer" (D22) is a later role decision |
| Conversation deletion by id for privacy requests | `delete_assistant_conversation` (service role) | Built; not yet wired into the privacy admin screens |
| `PersonalDataProvider` for the module | doc 28 section 11 | **Not built**: the module holds no identifier that maps to a person, so lookup is by conversation id only |
| Providers' terms read and recorded | doc 28 section 12 | **Not done** |

## 2. Privacy notice: changes to hand to counsel

Add to the privacy notice (current page: `/privacy`):
1. **What the assistant is:** an AI that answers from our own public information; it can be wrong; it does not make decisions about the visitor.
2. **What is processed:** the messages typed in the chat (with email addresses and phone numbers automatically removed), the answers, whether a rating or a link was clicked, and technical measurements (time taken, tool calls). No name or contact details are asked for.
3. **Why and basis:** to answer the visitor and to improve the service; basis proposed is legitimate interest with an objection route (D35), or consent if counsel advises; learning from message text is **not** done: only counts and outcomes are used.
4. **Who receives it:** the hosting provider and the model provider (NVIDIA, as chosen) as processors; location and transfer mechanism to be stated once confirmed.
5. **How long:** chat text 30 days; figures 12 months; the visitor can delete a chat at any time with "Delete this chat".
6. **Rights and contact:** the existing data-request route (`/privacy-request`); chats can be found only through the conversation id held in the visitor's own tab, so a request may need the visitor to delete the chat themselves.
7. **Warning in the widget:** do not type personal details; the widget already says so.

## 3. DPIA input pack (for the owner's data protection lead)

- **Purpose and necessity:** answer puppy and process questions around the clock, hand over to staff; no profiling of individuals; no automated decisions with legal effect.
- **Data inventory:** see section 2 item 2; identifiers: a random conversation id (not linked to a customer; decision D25 keeps it that way); IP address is used only for short-lived rate limiting (hashed) and is not stored with chats.
- **Risks and controls:** visitors typing personal data (redaction, warning, 30-day retention, deletion); prompt injection (guard, strict tools, verifier, evaluation suite with injection cases); wrong answers (grounding check, fallback, hand-over); provider data use (to be contractually settled before real traffic); cost abuse (daily request caps, kill switch).
- **Residual risks to record:** redaction is pattern-based and can miss unusual formats; chat text is stored 30 days in the database (encrypted at rest by the platform, row-level security, super admins only); the free model endpoint's terms are unknown.
- **Open before real traffic:** counsel's review of the notice; provider terms and DPA; owner's confirmation of D21 and D22; the decision whether chats may be linked to customers (D25, kept off).
