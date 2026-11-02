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

### AI Prompt #014

- **Date:** 2026-11-02 (received about 01:54 IST)
- **Tool:** Claude Code (Sonnet 5.5)
- **Phase:** Repository setup
- **Exact Prompt:** "now initialize the git repo and you have to do git commits for everything we have done in requirement gathering and analysis phase the commits should be accordingly to incremental timeline and for every files or progress related and don't add your self as co-author line add this to project memory"
- **Output:** git repository with 45 incremental commits plus a final commit, `.gitignore`, evidence README, `CLAUDE.md`, project memory rule.
- **Human Verification:** pending; owner to review `git log`. The assistant verified authorship, absence of attribution lines, ordering and a clean working tree.
- **Result:** history reconstructed with dates set to first-writing times; limits stated in the first commit and in the progress log (entry 19).

### AI Prompt #015

- **Date:** 2026-11-02 (received about 02:00 IST)
- **Tool:** Claude Code (Sonnet 5.5)
- **Phase:** Planning
- **Exact Prompt:** "now plan the frontend development phases with complete mock data"
- **Output:** `docs/07-planning/22-frontend-development-plan.md`, `docs/02-architecture/23-mock-data-catalogue.md`, a local data snapshot, index and cross-reference updates.
- **Human Verification:** pending owner review. The assistant extracted the data from the live pages, generated tables from the extracted JSON, summed task hours by script and checked references.
- **Result:** frontend plan with task-level estimates; complete dataset catalogue with known gaps; development still locked.

### AI Prompt #016

- **Time:** 2026-11-02 ~02:40 IST
- **Prompt (exact):** "start the development as per decided plan" then "i have the frontend files into app dir so use it properly"
- **Output used:** F0 scaffold in `app/`; architecture rule engine and tests.
- **Verification:** `npm run verify` green (31 tests, build ok).

### AI Prompt #017

- **Time:** 2026-11-02 ~03:00 IST
- **Prompt (exact):** "ok i won't be giving any inputs till the f9 only puase if limits hits and make during the testing you don't lost in solving ifinites issues test should resolve only at the end of each phases so that we use the tokens and context limit properly"
- **Output used:** autonomous build of F1 to F6 and F9 with one test-and-fix pass per phase.
- **Verification:** lint, typecheck, 65 tests, build and 7 e2e journeys pass; browser overflow and structure checks.

### AI Prompt #018

- **Time:** 2026-11-02 ~03:20 IST
- **Prompt (exact):** "check the reference site and that you build using live server"
- **Output used:** side-by-side comparison in the browser; copy and navigation aligned to the reference.
- **Verification:** full verify and e2e suite pass; screenshots compared.

### AI Prompt #019

- **Time:** 2026-11-02 ~03:50 IST
- **Prompt (exact):** "the assignment says exact copy in design / layout and structure / functionality so why aren't you make exact copy i have given you every references / data from reference like images, photos,  exact text content fully copied to reference site" then "yes download everything you required for copy demo"
- **Output used:** downloaded media, adopted the reference stylesheet and markup, ported behaviours, measured filter rules.
- **Verification:** verify and e2e green; live side-by-side checks.

### AI Prompt #020

- **Time:** 2026-11-02 ~04:10 IST
- **Prompt (exact):** "so what should we do to make it match like missing animations and other" then "start the in your given order"
- **Output used:** visual diff harness, reference fonts, smooth scroll, mascot and roaming journey, flight, swipe, reveal rules.
- **Verification:** verify and e2e green; pixel-diff table.

### AI Prompt #021

- **Time:** 2026-11-02 05:45 IST
- **Prompt (exact):** "now which file contains the puppet character roaming speed on various sections on screen" then "i need to slow his speed hist moving speed if possible to tune and control the speed set an patch where i can easily changes the speed"
- **Output used:** `pup/tuning.ts` and two patched constants in the engine.
- **Verification:** typecheck, lint, build; roaming checked at five scroll positions.

### AI Prompt #022

- **Time:** 2026-11-02 05:53 IST
- **Prompt (exact):** "the pup moscot is not moving around after the patch also the mostcot got seated after reaching at the meet the pups sections is should walkable just like walk till forward to next section" (with two screenshots)
- **Output used:** walk/treadmill switch for the Meet scene stop.
- **Verification:** headless sweep and screenshot.

### AI Prompt #023

- **Time:** 2026-11-02 06:03 IST
- **Prompt (exact):** "ok only the pows are not printing the moving part is working so fix the pows rendering as pup moscot movies around just like happen mouse on screen moves" (with screenshot)
- **Output used:** `body { position: relative }` so the footprint container spans the page.
- **Verification:** headless count of visible prints while walking; screenshot; visual comparison.

### AI Prompt #024

- **Time:** 2026-11-02 (earlier in this session; exact clock time not captured)
- **Prompt (exact):** "likely frontend is mostely completed now plan the full backend as per requirments analysis"
- **Output used:** backend plan (phases B0 to B13), owner scope answers.
- **Verification:** plan reviewed and approved by the owner in plan mode; no code written.

### AI Prompt #025

- **Time:** 2026-11-02 18:33 IST (received before the clarification below)
- **Prompt (exact):**

> TASK: PLAN THE AI CHATBOT LAYER (planning and documents only; do not write application code yet)
>
> Context
> The TeddyPups U.A.E. frontend (Next.js, modular monolith in app/) is built and matches the reference site. The Supabase backend and admin portal are planned or built separately. The AI layer is pending. Read docs/README.md, docs/02-architecture/21-modular-monolith-architecture.md and docs/03-security-privacy/06-security-architecture.md (section 6, data protection) first, and follow their rules.
>
> Goal
> Design a puppy-assistant chatbot for the public site, powered by a Claude agent that uses tools over our own data, with a feedback-driven improvement loop.
>
> What to produce (as new markdown docs in docs/, with the next document numbers, then update docs/README.md)
> 1. Product spec: user stories, example conversations, what the bot may and may not do, tone (friendly puppy assistant), languages, handover to a human via WhatsApp or the enquiry form, entry points in the UI (chat widget placement, mobile behaviour, how it fits the reference design without changing the existing pages).
> 2. Architecture: a new "assistant" module with domain / application / infrastructure / presentation layers; ports and adapters (model provider port, tool ports, conversation store port, feedback store port); a MOCK mode so tests and demos run without the real model; composition-root wiring chosen by env config; streaming responses; where the server code runs and why keys never reach the browser.
> 3. Tools the agent may call (narrow, typed, read-only except the enquiry draft): search puppies, get puppy details, search FAQs, delivery/health info, create enquiry draft. Define each tool's input and output schema (Zod) and which module's public API it uses.
> 4. Guardrails and safety: answer only from our data, never invent puppies, prices or health claims, say "I don't know" and hand over; refuse off-topic or unsafe requests; resist prompt injection from user text and from data; no personal data in prompts beyond the consent rules; rate limiting and abuse limits per visitor; cost and token budgets; logging without personal data.
> 5. Data protection: what is stored (conversations, feedback), lawful basis and consent text, retention, deletion on request, PersonalDataProvider implementation for the new module, effect on the privacy notice (flag for owner and legal review; do not invent legal text).
> 6. Feedback-driven improvement loop (be honest and precise): reward signals (thumbs up/down, opened a puppy page, started WhatsApp, sent an enquiry), how conversations are scored and reviewed, an OFFLINE loop that improves prompts, retrieval and tool choices with a human approving each change, and a versioned prompt/config release process. State clearly that the live model does not retrain itself; call it "feedback-driven" or "RL-inspired" unless a real training approach is justified, and say what would be needed for real reinforcement learning.
> 7. Evaluation plan: a fixed evaluation set (questions with expected behaviour: correct answer, correct refusal, correct handover), pass thresholds, regression gates before any new version ships, plus unit, architecture and Playwright tests; how mock mode keeps CI deterministic.
> 8. Delivery plan: phases with tasks and hours, dependencies, exit criteria and milestone tags, fitting the existing plan style (docs/07-planning/22-frontend-development-plan.md); a minimum viable slice first; risks and mitigations; env variables to add to .env.example and docs/02-architecture/14-env-and-configuration.md; cost estimate and model choice with reasons.
> 9. Open questions and decisions for the owner (numbered, with a recommendation for each).
>
> Rules
> - Planning only. Do not create code, packages, migrations or API keys until I approve the documents.
> - Do not invent facts; mark assumptions and anything to verify.
> - Keep the existing architecture rules (public APIs between modules, no raw process.env outside shared/config, thin app/ pages).
> - Commits: incremental Conventional Commits, no Co-Authored-By or any Claude/Anthropic attribution line.
> - After this message, add the timestamped entry to docs/08-process/19-development-progress-log.md and the exact prompt to docs/08-process/18-ai-usage-and-prompt-log.md.
> - At the end, summarise what you wrote, list the decisions you need from me, and wait for my review. Do not start development.

- **Output used:** see #026 and entry 30.

### AI Prompt #026

- **Time:** 2026-11-02 18:33 IST
- **Prompt (exact, sent while the plan was being reviewed):** "it should RL based RAG chatbot agent that shoudl be allowed data retreival from json based db only not internet access to that agent the feedback he recieve will go into the training it'self for better improvements"
- **Clarifying answers given by the owner:** what learns = "Trained policy layer over frozen Claude (Recommended)"; the JSON database = "Generated JSON knowledge files from our public data (Recommended)".
- **Output used:** documents `26` to `30` (RL policy layer, JSON-only retrieval, no internet), ADR-017 and ADR-018, decisions D18 to D35.
- **Verification:** hour sums, evaluation case count and paths checked by script; no code written.

### AI Prompt #027

- **Time:** 2026-11-02 ~18:45 IST (approx)
- **Prompt (exact):** "first start the backend plan for development the ai plan will be the last"
- **Output used:** B0 setup, B1 schema and RLS.

### AI Prompt #028

- **Time:** 2026-11-02 19:06 IST
- **Prompt (exact):** "move all the work related to backend in to backend root dir not in the app dir" (answer to the clarifying question: "Backend project imported by the app (Recommended)")
- **Output used:** `backend/` workspace restructure.
- **Verification:** root verify and pgTAP green.

### AI Prompt #029

- **Time:** 2026-11-02 22:49 IST
- **Prompt (exact):** "ok so whats next"
- **Output used:** status summary and next steps (finish B11, then B12 and B13).
- **Verification:** none needed (answer only).

### AI Prompt #030

- **Time:** 2026-11-02 22:55 IST
- **Prompt (exact):** "ok show as reserved and continue till the last"
- **Output used:** reserved label, B11 completion, then B12 and B13.
- **Verification:** see progress log entry 43.

### AI Prompt #031

- **Time:** 2026-11-02 23:40 IST
- **Prompt (exact):** "i have all the account so copy all the env vars into backends example env"
- **Output used:** `backend/.env.example` with all variable names.
- **Verification:** see progress log entry 46.

### AI Prompt #032

- **Time:** 2026-11-03 00:25 IST
- **Prompt (exact):** "switch env.local to cloud values"
- **Output used:** cloud `app/.env.local`.
- **Verification:** see progress log entry 47.

### AI Prompt #033

- **Time:** 2026-11-03 00:43 IST
- **Prompt (exact):** "i have added the admin pass you can continue" / "i have linked the project using supabase link" / "done"
- **Output used:** cloud seed and first admin.
- **Verification:** see progress log entry 48.

### AI Prompt #034

- **Time:** 2026-11-03 01:03 IST
- **Prompt (exact):** "complete the remaining steps what is the password for super admin or admin role / test resend mail configs / check RLS and bucket policies"
- **Output used:** cloud RLS and storage probe, Resend test, storage listing fix.
- **Verification:** see progress log entry 49.

### AI Prompt #035

- **Time:** 2026-11-03 01:56 IST
- **Prompt (exact):** pasted re-analysis "3. Admin portal re-analysis" (layout, colour, fonts, components, style leak; proposal of an ERP-style portal in the TeddyPups theme) with the owner's answers: "Is dark mode needed on day one? -> match the frontend theme / Do staff need to choose their own row density? - no / boards first or tables first? -> board first / Which two or three numbers should lead the overview? -> as you wish" (abbreviated here; full text is in docs/04-design-ux/32).
- **Output used:** first slice of the admin redesign.
- **Verification:** see progress log entry 50.

### AI Prompt #036

- **Time:** 2026-11-03 02:06 IST
- **Prompt (exact):** "continue till end"
- **Output used:** the remaining admin redesign screens and checks.
- **Verification:** see progress log entry 51.

### AI Prompt #037

- **Time:** 2026-11-03 02:23 IST
- **Prompt (exact):** "start building the remaining ones" (then "please continue sorry for intruptions" after an interrupted command)
- **Output used:** trends, drawer, drag-and-drop, bulk, column chooser, landing page, gallery, baselines, record scans.
- **Verification:** see progress log entry 52.

### AI Prompt #038

- **Time:** 2026-11-03 02:30 IST
- **Prompt (exact):** "the ui/ux is not properly responsive" (with a 320 x 685 screenshot of the admin rail); earlier in this stretch a pasted React warning "Each child in a list should have a unique key prop ... Shortcuts.tsx" (fixed in commit "give each shortcut row a keyed fragment")
- **Output used:** drop-down menu on phones.
- **Verification:** see progress log entry 53.

### AI Prompt #039

- **Time:** 2026-11-03 03:01 IST
- **Prompt (exact):** "app is set to root dir and other required step is also on" followed by the Vercel log (module not found, Server Component trace through StripeGateway.ts); earlier questions in this stretch: "check why deployment is failing", "does it has with vercel env configs like saving them in secret or configs format", "if you check my local env file from frontend app same is uploaded to vercel with production configs"
- **Output used:** app depends on the backend workspace.
- **Verification:** see progress log entry 54.

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
