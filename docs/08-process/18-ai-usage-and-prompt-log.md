# 18. AI Usage and Prompt Log

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `16`, `17`, assignment brief (interviewer asked for exact prompts) |

## 1. Principles

1. **AI assists; the owner decides.** Requirements, security trade-offs, scope cuts and approvals are human decisions.
2. **Everything AI produces is reviewed.** Code is read, run and tested before it is accepted; claims are verified against the reference or documentation.
3. **No secrets in prompts.** Never paste API keys, tokens, customer data or production credentials.
4. **Exact prompts are recorded**, together with outputs, verification and changes (needed for the Loom).
5. **Evidence over assumption.** Observed behaviour, inferred behaviour and unknowns are labelled (as in the research files).

## 2. Workflow by stage

| Stage | Objective | AI role | Prompt strategy | AI must not decide | Human verification |
|---|---|---|---|---|---|
| Research | Understand the reference | Inspect pages, extract tokens, summarise | Ask for evidence tags and measurements; request raw captures | What is "good enough"; asset legality | Open the site, compare screenshots, spot-check measurements |
| Requirements | Turn research and requests into FR/NFR | Draft, structure, cross-reference | Provide the brief and prior docs; ask for open questions | Priorities, scope, legal and business rules | Read every requirement; approve in the sign-off |
| Architecture | Design stack, data model, security | Propose options with trade-offs | Ask for alternatives and risks, not just a choice | Final stack and risk acceptance | Review ADRs; challenge assumptions |
| Implementation | Write code | Generate modules from approved specs, small units | One feature per prompt, reference spec IDs, request tests | Security-critical logic without review (RLS, payments, auth) | Code review, run tests, read diffs |
| Debugging | Fix failures | Hypothesise causes from logs and traces | Provide minimal reproduction and error text | Disabling checks, loosening RLS | Reproduce the fix; add a regression test |
| Testing | Cover requirements | Draft test cases and fixtures | Map tests to AC and FR IDs | Pass/fail judgement of visual fidelity | Run tests; inspect screenshots |
| Code review | Find defects | Review diffs for correctness, security, performance | Ask for specific checklists (`06`, `09`) | Merge decisions | Human final review |
| Documentation | Keep docs accurate | Draft and update | Provide actual code and config | Claims about behaviour not verified | Spot-run steps in the docs |
| Loom preparation | Explain the work | Outline talking points, collect prompts and decisions | Provide the prompt log and ADRs | What to emphasise or omit | Rehearse and edit the script |

## 3. Things AI output must be checked for

- Invented facts (libraries, API options, gateway features) → verify in official docs.
- Insecure defaults (service-role use in the browser, permissive RLS, missing signature checks).
- Silent scope growth.
- Copyrighted text or assets copied from the reference.
- Missing edge cases in money, time zones, idempotency.
- Over-engineering relative to the 48-hour constraint.

## 4. Prompt log template

Copy one block per significant prompt.

```markdown
## AI Prompt #NNN

### Date
YYYY-MM-DD

### Tool
Claude Code / ChatGPT / Cursor / other (model name)

### Phase
Research | Requirements | Architecture | Implementation | Debugging | Testing | Review | Docs | Loom

### Objective
What I wanted and why.

### Exact Prompt
(paste verbatim; redact any secrets)

### Output
Summary of what came back (link or attach the full text if long).

### Human Verification
What I checked, how, and what I found.

### Changes Made
Files or decisions changed as a result; what I rejected or edited.

### Result
Worked / partly worked / failed, and the next step.
```

## 5. Log: documentation phase

Prompts below are taken from the conversation that produced these documents. They are the owner's messages, kept verbatim except where marked as abbreviated. The long master prompt (#001) is stored in full at `docs/08-process/prompts/00-master-research-prompt.md` (added by the owner at 00:36 IST on 2026-11-02), and the screenshot protocol (#010) at `docs/08-process/prompts/01-master-reference-analysis-prompt.md`.

### AI Prompt #001

- **Date:** 2026-11-01
- **Tool:** Claude Code (Sonnet 5.5)
- **Phase:** Research
- **Objective:** Reverse-engineer https://puppy.instabizweb.com/ and produce a complete research and requirements package without implementing anything.
- **Exact Prompt:** the "MASTER PROMPT: WEBSITE CLONE RESEARCH & REQUIREMENTS ENGINEERING" (22 phases, final rules 1 to 15). Full text: `docs/08-process/prompts/00-master-research-prompt.md`.
- **Output:** reconnaissance findings (routes, HTML, CSS tokens, headers), later extended into `docs/05-research/02-design-pattern-analysis.md` to `05`.
- **Human Verification:** owner supplied 27 screenshots (the earlier count of 28 was wrong, corrected in entry 13 of the progress log) and a 7-minute recording; assistant re-tested claims against them.
- **Changes Made:** corrected the "dead filters" claim after the video showed working filters.
- **Result:** research complete for the public site; mobile and tablet captured live.

### AI Prompt #002

- **Date:** 2026-11-01
- **Tool:** Claude Code
- **Phase:** Research
- **Exact Prompt:** "this will be project dir and now do an full analysis of complete design patterns using user experience tools" (project folder `/home/hackycoder/mca_labs/puppies-at-home`).
- **Output:** `docs/05-research/02-design-pattern-analysis.md`.
- **Result:** design tokens, patterns, motion inventory.

### AI Prompt #003

- **Date:** 2026-11-01
- **Phase:** Research
- **Exact Prompt:** "now check the dir as i have added the screenshots and one full screen recording of our reference website"
- **Output:** `docs/05-research/03-screenshots-and-video-review.md` (contact sheets from the video, per-page findings, corrections).
- **Result:** corrected earlier assumptions; identified gaps (no mobile or tablet captures).

### AI Prompt #004

- **Date:** 2026-11-01
- **Phase:** Research
- **Exact Prompt:** "make sure that from ui/ux analysis all the things like animation, any kind of effects / the color patterns and layout framing for pages and sections are included in the analysis"
- **Output:** `docs/05-research/04-ui-ux-animation-effects-color-layout.md`.

### AI Prompt #005

- **Date:** 2026-11-01
- **Phase:** Research
- **Exact Prompt:** "sure" (approving mobile and tablet capture and exact colour sampling).
- **Output:** `docs/05-research/05-responsive-analysis.md`; exact door colours added to 04.

### AI Prompt #006

- **Date:** 2026-11-01
- **Phase:** Requirements / Architecture
- **Exact Prompt:** "this will also include an compete dynamic portal with real backend with supabase and the portal will not includes any kind of SEOs tags or the public accessible option only can be visited through /admin navigation and the queries should be optimised properly and api rate limiting and related conventions with secured login with verifications and password reset options / rbac controls and all relevant things"
- **Output:** clarifying questions, then the plan.

### AI Prompt #007

- **Date:** 2026-11-01
- **Phase:** Requirements
- **Exact Prompt (answers):** content "also should be dynamically updated using admin portal along with payment monitoring / delivery updates / order tracking / billing and invoices / customer managements / custom message templates management for email / whatsapp all in the admin portal"; roles "super_admin and operator with content / enquiries / check messages / billing and invoices / payments & transactions / delivery tracking and order management / customer management"; payments "stripe plus razorpay and other payment integration hybrid based only configs in envs".

### AI Prompt #008

- **Date:** 2026-11-02
- **Phase:** Requirements
- **Exact Prompt:** "notifications also includes / email / whatsapp via cloud providers / payments updates / order updates / invoices / enquires updates etc"
- **Output:** notification system added to the plan (`11`).

### AI Prompt #009

- **Date:** 2026-11-02
- **Phase:** Process
- **Exact Prompt:** "the architecutre sshould be defined in md docs along with all docs should generrate first for review and upon confirmation proceed for dvelopements first phase will be only requirements generations into md files and upon confirmation will proceed furthor"
- **Output:** this document set in `docs/`.
- **Human Verification:** pending (owner review).
- **Result:** development locked until approval.

### AI Prompt #010

- **Date:** 2026-11-02 (received 00:48 IST)
- **Tool:** Claude Code (Sonnet 5.5)
- **Phase:** Research (visual reference analysis)
- **Exact Prompt:** "@docs/08-process/prompts/01-master-reference-analysis-prompt.md use this prompt to re analyse the UI/UX screens and patterns / behaviours / interactions from those images and video file". The referenced file is the "SCREENSHOT-BASED VISUAL REFERENCE PROTOCOL" (23 attributes per screenshot, visual QA, responsive comparison, fidelity priority, seven output files).
- **Output:** `docs/04-design-ux/reference-analysis/` (7 files).
- **Human Verification:** pending owner review. The assistant cross-checked screenshots against the video, live computed styles at 1905×1080 and pixel measurements.
- **Changes Made:** corrections to `docs/05-research/03-screenshots-and-video-review.md` and `docs/05-research/04-ui-ux-animation-effects-color-layout.md` (screenshot count, mixed zoom, video timestamps, curtain duration).
- **Result:** found that the screenshots use mixed zoom levels and that no mobile screenshots exist; mobile analysis is secondary evidence.

### AI Prompt #011

- **Date:** 2026-11-02 (received about 01:25 IST)
- **Tool:** Claude Code (Sonnet 5.5)
- **Phase:** Architecture
- **Exact Prompt:** "the system architecture will be modular monolithic with proper enterprises project structure like domain / business logic / function / navigation etc so update all according it"
- **Output:** `docs/02-architecture/21-modular-monolith-architecture.md` and path updates across `04`, `05`, `07`, `08`, `10`, `13`, `14`, `15`, `16`, `17`, `20`, `01`, `03`, sign-off and index.
- **Human Verification:** pending owner review; assistant grepped all docs for the old `lib/` layout and fixed every reference; interpretation of "functions" flagged as an open question.
- **Result:** ADR-015; frontend track estimates raised by 2 hours; development still locked.

### AI Prompt #012

- **Date:** 2026-11-02 (received about 01:33 IST)
- **Tool:** Claude Code (Sonnet 5.5)
- **Phase:** Security and privacy architecture
- **Exact Prompt:** "ok so update the data protection standard accordingly to international and UAE rDP acts like HIPPA GDPR DPDP etc in the security architecture"
- **Output:** `docs/03-security-privacy/06-security-architecture.md` section 6 rewritten as a data protection standard (roles, applicability matrix, principles, data inventory, lawful basis and consent, data subject rights, retention, processors and transfers, security measures, breach management, privacy by design, transparency, children, governance, mock-track rules); consequential edits in `02`, `03`, `05`, `07`, `08`, `11`, `12`, `13`, `14`, `15`, `16`, `17`, `21`, sign-off.
- **Human Verification:** pending. Not legal advice; the assistant flagged items to verify and recommended UAE counsel review (D16). The assistant stated that HIPAA is very likely not applicable and used it only as a security benchmark.
- **Result:** ADR-016, FR-PRIV-001 to 012, NFR-PRIV-008 to 020, tests T-PRIV-01 to 10, risks R-21 to R-25, decisions D16 and D17.

### AI Prompt #013

- **Date:** 2026-11-02 (received about 01:48 IST)
- **Tool:** Claude Code (Sonnet 5.5)
- **Phase:** Documentation structure
- **Exact Prompt:** "now i have reviewed all the docs and re organize the all docs into docs dir with proper relevant subdir"
- **Output:** all documents moved into topic subfolders under `docs/`, `docs/README.md`, updated index, path references rewritten.
- **Human Verification:** a link and path checker was run (all resolve except one planned future folder); owner to confirm the layout.
- **Result:** nine topic folders; numbers preserved; development still locked.

## 6. Loom talking points (draft)

1. How the research was done (HTML, CSS and JS bundles, live measurements, owner screenshots and video) and what was corrected.
2. Why documentation came first and what the review gate caught.
3. Architecture decisions (ADR highlights): RLS as authority, outbox, adapters, admin isolation.
4. Security and performance choices.
5. How AI was used, what was verified by hand, what was rejected.
6. Trade-offs made for the 48-hour limit.

## Open questions

1. Which AI tools may be used during development (Claude Code only, or others)?
2. Should the full text of the long master prompt be stored in the repository (recommended) for the interviewer?
