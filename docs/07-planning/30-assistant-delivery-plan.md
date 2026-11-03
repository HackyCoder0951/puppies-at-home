# 30. AI Assistant: Delivery Plan, Cost, Risks and Decisions

| | |
|---|---|
| **Status** | Draft, awaiting owner review. **No code, packages, migrations or API keys until approved** |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `26` (product), `27` (architecture), `28` (safety and data), `29` (learning and evaluation), `22` (style reference), `17` section 0.2 (backend phases), `14` |
| **Owner decisions (2026-11-02)** | RL-based RAG agent on Claude; retrieval from generated JSON knowledge files only; no internet; policy layer learns from feedback while the model stays frozen |

## 1. Goal and principles

Deliver a safe, useful assistant in the smallest steps that each stand on their own. **The minimum viable slice (A1 to A4) ships a grounded, guarded, streaming assistant with a fixed default policy and no learning**; learning, evaluation tooling and privacy tooling follow. Everything runs in mock mode first, so the live model is the last thing connected. Rules from `21` apply to every task: public APIs between modules, thin `app/`, config only through `shared/config`, tests per layer.

## 2. Phases at a glance

| Phase | Name | h | Depends on | Milestone tag |
|---|---|---|---|---|
| A0 | Review and decisions | 1 | This document set | `assistant/m0-docs-approved` |
| A1 | Module skeleton, ports, mock provider | 6 | A0 | `assistant/m1-skeleton` |
| A2 | Knowledge files, retrieval, tools, guard | 9 | A1 | `assistant/m2-knowledge-tools` |
| A3 | Streaming route and chat widget (mock) | 9 | A2 | `assistant/m3-widget-mock` |
| A4 | Live Claude adapter, prompt v1, budgets | 6 | A3, provider terms (D24), API key | `assistant/m4-live-mvp` |
| A5 | Feedback and trajectory logging, stores | 6 | A4 (persistent store needs backend B1) | `assistant/m5-feedback` |
| A6 | Evaluation harness and offline replay | 9 | A4, A5 | `assistant/m6-eval` |
| A7 | Policy layer, trainer, canary, rollback | 12 | A5, A6 | `assistant/m7-policy` |
| A8 | Privacy tooling and notice | 4 | A5, D16, D21 | `assistant/m8-privacy` |
| A9 | Hardening, accessibility, cost, release | 5 | all | `assistant/m9-release` |
| | **Total** | **67** | | |

**MVP slice A1 to A4 = 30 h.** Add about **7 h contingency** (about 10%) for a planning total of about **74 h**. (An earlier summary figure of about 62 h in the request notes was an addition error; the task tables below sum to 67 h.) Stop-loss: a phase over 150% of its estimate triggers a scope cut inside that phase; no live traffic before the A6 evaluation gates pass; no policy learning before A5 logging and A6 offline evaluation exist.

## 3. Phase detail

### A0. Review and decisions (1 h)

| Task | Work | h |
|---|---|---|
| A0-01 | Owner reviews `26` to `30`, answers D18 to D35 (section 11), approves or changes the proposals | 1.0 |

Exit: written approval and decisions recorded in `RESEARCH-SIGNOFF.md` and the progress log.

### A1. Module skeleton, ports, mock provider (6 h)

| Task | Work | h |
|---|---|---|
| A1-01 | `assistant` module anatomy (`index.ts`, `module.config.ts`, README, four layer folders), module catalogue row, architecture tests pass | 1.0 |
| A1-02 | Domain types and Zod validation (Conversation, Message, ToolCall, Feedback, versions) | 1.0 |
| A1-03 | Ports from `27` section 4 with contract-test scaffolding | 1.0 |
| A1-04 | `ScriptedModelProvider`, in-memory stores, seeded id and clock | 1.5 |
| A1-05 | `StartConversation` and `SendMessage` skeleton (no tools), unit tests | 1.5 |

Exit: `npm run verify` green; a mock conversation round-trips in a unit test.

### A2. Knowledge files, retrieval, tools, guard (9 h)

| Task | Work | h |
|---|---|---|
| A2-01 | `build-knowledge.mjs` and `manifest.json`, generator checks (no prices, no stray contact data, instruction-pattern scan), fixtures-backed `knowledge/v1` | 2.0 |
| A2-02 | `JsonKnowledgeIndex`: structured filters (catalog semantics), BM25 over FAQ and info, ranking weights | 2.5 |
| A2-03 | Five tools with Zod input and output, caps, tests | 2.0 |
| A2-04 | `Guard`: input checks, redaction, output verifier, banned patterns, link allow-list | 2.5 |

Exit: tools return correct, size-capped results on the fixtures; verifier tests and redaction tests pass (T-AST-SAF-02, 03).

### A3. Streaming route and chat widget in mock mode (9 h)

| Task | Work | h |
|---|---|---|
| A3-01 | `POST /api/assistant/chat` (SSE), session token, in-memory limiter, kill switch, thin route | 2.0 |
| A3-02 | `ChatWidget` client island: launcher, panel, focus handling, streaming render, assistant stylesheet | 3.0 |
| A3-03 | Puppy cards, handover buttons, feedback bar (UI only) | 1.5 |
| A3-04 | Mobile sheet above the bottom bar, flag, embed in `SiteShell`, layering with curtain and mascot | 1.0 |
| A3-05 | Playwright journeys in mock mode (T-AST-E2E) | 1.5 |

Exit: AC-AST-01, 05, 07 pass in mock mode; visual comparison of public pages is unchanged with the widget closed.

### A4. Live Claude adapter, prompt v1, budgets (6 h)

| Task | Work | h |
|---|---|---|
| A4-01 | `AnthropicModelProvider`: streaming, tool use, prompt caching, stop reasons (refusal, max tokens), usage accounting | 2.5 |
| A4-02 | Prompt v1, tool descriptions, system rules; stable-prefix layout | 1.5 |
| A4-03 | Per-visitor and global budgets, daily spend cap, kill switch, cost accounting | 1.0 |
| A4-04 | Architecture tests T-AST-ARCH-01, 02, 06, 07; live smoke test under a spend cap | 1.0 |

Exit (MVP): the assistant answers real questions from the knowledge files with the fixed default policy, verified and guarded; kill switch tested. **Requires D24 (provider terms and a signed DPA) and an API key before any live call.**

### A5. Feedback and trajectory logging, stores (6 h)

| Task | Work | h |
|---|---|---|
| A5-01 | Trajectory and feedback records written by the use cases (`29` section 4) | 1.5 |
| A5-02 | Feedback route; signal capture for thumbs, link clicks, handover clicks, rephrase, abandon | 1.5 |
| A5-03 | Store adapters behind the ports: file or in-memory now, Supabase when backend B1 exists | 2.0 |
| A5-04 | Retention job and delete-by-id (basis for `PersonalDataProvider`) | 1.0 |

Exit: every rated or clicked answer produces a correct trajectory row with versions and propensity fields (propensity fixed at 1.0 until A7).

### A6. Evaluation harness and offline replay (9 h)

| Task | Work | h |
|---|---|---|
| A6-01 | Author the 80-case evaluation set (`29` section 12), synthetic text only | 3.0 |
| A6-02 | Runner with deterministic graders and a results report | 2.5 |
| A6-03 | Rubric judge (cheaper model) and human spot-check workflow | 1.5 |
| A6-04 | Offline replay evaluator (SNIPS, doubly robust, bootstrap) and synthetic log generator | 2.0 |

Exit: thresholds in `29` section 12 measured on the MVP; baseline numbers recorded in the first release manifest.

### A7. Policy layer, trainer, canary and rollback (12 h)

| Task | Work | h |
|---|---|---|
| A7-01 | `PolicyEngine`: action space, feature extractor, `fixed` mode default | 2.0 |
| A7-02 | Reward function and gates; per-visitor caps | 1.5 |
| A7-03 | Factorised contextual bandit trainer, artifact format and validation | 3.0 |
| A7-04 | Offline simulation tests (convergence, estimator bias) (T-AST-RL) | 2.0 |
| A7-05 | Exploration share, minimum propensity, shadow and canary routing | 1.5 |
| A7-06 | Promotion workflow (command line first), rollback, monitors and alerts | 2.0 |

Exit: a candidate policy can be trained from logs, evaluated offline, shadowed, canaried, promoted by a human and rolled back; monitors alert on the breach conditions in `29` section 6.

### A8. Privacy tooling and notice (4 h)

| Task | Work | h |
|---|---|---|
| A8-01 | First-message notice and links; session storage handling; privacy notice change list handed to the owner and counsel | 1.0 |
| A8-02 | Deletion by conversation id, expiry job, complete `PersonalDataProvider` | 1.5 |
| A8-03 | Reviewer access control and redacted export | 1.0 |
| A8-04 | Vendor register entry and DPIA input pack | 0.5 |

Exit: T-AST-SAF-06 passes; wording approved by the owner and counsel (D16, D35) before production use.

### A9. Hardening, accessibility, cost and release (5 h)

| Task | Work | h |
|---|---|---|
| A9-01 | Accessibility and mobile pass on the widget | 1.5 |
| A9-02 | Cost and latency review; tune limits and caching | 1.0 |
| A9-03 | Live injection suite, dependency audit, final safety review | 1.5 |
| A9-04 | Flags, runbook, documents, tag `assistant/m9-release` | 1.0 |

## 4. Dependencies and sequencing with the backend plan

| Assistant work | Needs from the backend track | Fallback until then |
|---|---|---|
| Knowledge from published content | Backend B2 (Supabase repositories) for live content | Mock fixtures through the public APIs (works today) |
| Persistent conversations and feedback | Backend B1 (schema, RLS) | File or in-memory stores (single instance only) |
| Rate limiting at scale | Upstash adapter from backend B2 | In-memory limiter (single instance) |
| Reviewer screens | Admin foundation B3 | Command-line export |
| Privacy tooling | Backend privacy phase | Module-level delete and export |

The MVP (A1 to A4) needs **none** of the backend track.

## 5. Quality gates

| Gate | Condition |
|---|---|
| Per phase | `npm run verify` green; phase tests pass; one test-and-fix pass per phase |
| Before any live call | D24 approved, DPA signed, vendor register updated, kill switch and budget tested |
| Before launch | Evaluation set meets `29` thresholds; AC-AST-01 to 08 pass; notice approved |
| Before any policy promotion | Offline evaluation passes, canary clean, human approval, rollback tested |

## 6. Milestones and commits

Conventional Commits, one per task group, **no co-author or tool attribution lines**. Tags in the table in section 2 are local and annotated, as in `22`.

## 7. Risks and mitigations

| ID | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R-AST-01 | Hallucinated or ungrounded answers | Medium | High | Evidence-only prompting, output verifier, fallback, evaluation gates, monitors |
| R-AST-02 | Prompt injection (user or data) | Medium | High | Layered guardrails, data-as-data, strict tools, injection suites, no secrets or internet in reach |
| R-AST-03 | Too little traffic for the policy to learn in useful time | High | Medium | Small factorised model, implicit signals, priors from offline simulation, fixed mode fallback, early reliance on evaluation and human review |
| R-AST-04 | Reward gaming or bias (clicks vs thumbs-down) | Medium | Medium | Verifier gate in reward, caps, divergence monitors, human promotion |
| R-AST-05 | Cost overruns | Medium | Medium | Caching, budgets, caps, kill switch, small model for cheap steps, monthly review |
| R-AST-06 | Provider terms, region or retention unsuitable | Medium | High | D24 and D34 before live use; mock mode needs none; keep the adapter swappable |
| R-AST-07 | Legal basis for learning from feedback not accepted | Medium | High | D35: counsel decision, opt-in fallback, aggregated-only fallback |
| R-AST-08 | Widget harms performance, accessibility or the reference look | Low | Medium | Lazy island, flag, visual comparison, accessibility tests, layering tests |
| R-AST-09 | Knowledge staleness (puppy availability changes) | Medium | Medium | Regenerate knowledge on content change; show the knowledge date in the manifest; handover for anything time-critical |
| R-AST-10 | Model updates change behaviour | Medium | Medium | Model id in config, evaluation run on every change, version recorded per conversation |
| R-AST-11 | Reviewers see personal data typed by visitors | Low | Medium | Redaction, access control (D22), short retention, review window logging |

## 8. Configuration to add (documented in `14`, created at A1 to A4 in `.env.example`)

All read only through `shared/config`; defaults are safe (assistant off, mock mode).

| Variable | Default | Secret | Meaning |
|---|---|---|---|
| `ASSISTANT_ENABLED` | `false` | No | Kill switch for the feature |
| `FEATURE_ASSISTANT_WIDGET` | `false` | No | Show the widget on the public site |
| `ASSISTANT_MODE` | `mock` | No | `mock` or `live` |
| `ANTHROPIC_API_KEY` | none | **Yes** | Server only; required in `live` |
| `ASSISTANT_MODEL` | none (required in `live`) | No | Model id for answers |
| `ASSISTANT_JUDGE_MODEL` | none | No | Optional cheaper model for rubric grading |
| `ASSISTANT_MAX_OUTPUT_TOKENS` | `700` | No | Per answer cap (proposal) |
| `ASSISTANT_MAX_TURNS` | `20` | No | Per conversation |
| `ASSISTANT_MAX_TOOL_CALLS` | `4` | No | Per turn |
| `ASSISTANT_DAILY_VISITOR_CAP` | `10` | No | Conversations per visitor per day |
| `ASSISTANT_DAILY_BUDGET` | none (required in `live`) | No | Global daily spend cap in the billing currency |
| `ASSISTANT_RETENTION_DAYS` | `30` | No | Redacted chat text retention |
| `ASSISTANT_TRAJECTORY_RETENTION_DAYS` | `365` | No | Trajectory and reward records |
| `ASSISTANT_PROMPT_VERSION` | `p1` | No | Active prompt release |
| `ASSISTANT_KNOWLEDGE_VERSION` | `v1` | No | Active knowledge folder |
| `ASSISTANT_POLICY_VERSION` | `default` | No | Active policy artifact id |
| `ASSISTANT_POLICY_MODE` | `fixed` | No | `fixed` or `learning` |
| `ASSISTANT_EXPLORATION_SHARE` | `0.10` | No | Share of traffic that explores (learning mode) |
| `ASSISTANT_AUTO_PROMOTE` | `false` | No | Allow bounded automatic promotion |
| `ASSISTANT_SESSION_SECRET` | none | **Yes** | Signs the session token |

## 9. Model choice and cost

> **Update 2026-11-03:** the owner chose NVIDIA's free hosted models (build.nvidia.com) for the live assistant (D23, D32 unchanged). The Claude price table below is kept as a reference only; with the free tier cost is bounded by request caps, not dollars (`27` section 13). The Claude-specific tasks in A4 (prompt caching, stop reasons for Claude) are replaced by the NVIDIA adapter.

**Recommendation (to confirm with D23):** use a **Sonnet-class model for answers** (strong tool use and grounding at a mid-tier price) and a **Haiku-class model for optional cheap steps** (rubric grading, intent classification) — **assuming** the quality is sufficient on the evaluation set; **Opus-class** is the upgrade path if grounding or tone evaluations fail and the budget allows. Model id comes from configuration, never code. Settings such as effort, thinking and tool choice differ by model and must be re-verified at build time (`27` section 13).

**Prices used for the estimate (cached from the model catalogue dated 2026-10-06; verify on the pricing page before relying on them):**

| Model class | Model id (as of that catalogue) | Input $/1M | Output $/1M | Cache read $/1M |
|---|---|---|---|---|
| Sonnet-class | `claude-sonnet-5-5` | 2.00 | 10.00 | 0.20 |
| Haiku-class | `claude-haiku-5-5` | 0.10 (up to 100K-token prompts) | 0.50 | not stated; assumed 0.01 |
| Opus-class | `claude-opus-5-5` | 4.00 | 20.00 | 0.20 |

**Worked example (assumptions, not measurements):** one conversation of 4 visitor turns with an average of 1.5 model calls per turn (tool loop) = 6 calls; stable prefix (system, tools, rules) about 3,000 tokens, cached after the first call (write assumed at 1.25 times the input price; **verify**); variable input per call about 2,200 tokens (history, evidence, question); output about 200 tokens per call.

| Model class | Per conversation | If output is 500 tokens per call (heavier thinking) | 1,000 conversations per month |
|---|---|---|---|
| Sonnet-class | about $0.049 | about $0.067 | about $49 to $67 |
| Haiku-class | about $0.002 | about $0.003 | about $2 to $3 |
| Opus-class | about $0.095 | about $0.131 | about $95 to $131 |

Reading it: cost scales with traffic and with output length (adaptive thinking is billed as output); caching the stable prefix is worth doing; the live evaluation run (80 cases, about 2 calls each) costs a few dollars on a Sonnet-class model (**estimate**, measured in A6). The worked example will be replaced by measured usage in A4 and A9, and the daily budget cap (RL-AST-7) bounds the downside whatever the traffic.

## 10. Traceability to the owner's request

| # | Owner item | Where |
|---|---|---|
| 1 | Product spec | `26` |
| 2 | Architecture, module, ports, mock mode, composition, streaming, keys | `27` sections 2 to 5, 9 to 12 |
| 3 | Tools, schemas, module APIs | `27` sections 6 to 8 |
| 4 | Guardrails and safety | `28` sections 1 to 7 |
| 5 | Data protection | `28` sections 8 to 12 |
| 6 | Feedback and learning loop (honest, RL) | `29` sections 1 to 11 |
| 7 | Evaluation plan | `29` sections 12 to 14 |
| 8 | Delivery plan, MVP, risks, env, cost, model | This document sections 1 to 9 |
| 9 | Open questions with recommendations | Section 11 below |

## 11. Open questions and decisions for the owner

Numbering continues the decision register in `RESEARCH-SIGNOFF.md` (D1 to D17). Each has a recommendation.

| ID | Decision | Options | Recommendation |
|---|---|---|---|
| D18 | Languages at launch | English only / English plus Arabic | English only; add Arabic after it passes the evaluation set |
| D19 | Default handover channel | WhatsApp first / form first | WhatsApp first, form second, both always visible |
| D20 | Where the widget appears | Every public page / selected pages; auto-open or launcher only | Every public page except legal pages and 404; launcher only, never auto-open |
| D21 | Retention | `28` section 10 values | 30 days redacted text, 12 months trajectories |
| D22 | Who may read logged conversations | Nobody / super admins / named reviewers | Super admins and one named reviewer; redacted text only; access logged |
| D23 | Model tier and monthly budget | Haiku / Sonnet / Opus class; budget amount | Sonnet-class answers, Haiku-class helpers; set the cap after the first month of measured use, start with a low cap you are comfortable with |
| D24 | Provider terms, region, retention, zero-data-retention | Accept after counsel review / reject | Do not go live until counsel has reviewed and the DPA is signed; mock mode until then |
| D25 | Link chats to customers (after an enquiry) | Never / with explicit consent | Never at launch |
| D26 | Persona name | "Teddy" / "Teddy's helper" / neutral | "Teddy's helper" with the mascot as avatar; the first message says it is an AI |
| D27 | Reply-time and hours promises | None / stated hours | None until hours are confirmed |
| D28 | Prices | Never discussed / indicative ranges | Never; hand over |
| D29 | Admin screen to review conversations and promote policies | Yes (after backend B3) / command line only | Command line at first; screens later |
| D30 | Automatic promotion of learned policies | Off / bounded auto | Off; human approval for every promotion |
| D31 | Exploration share and reward weights | `29` sections 3 and 5 values | Approve the initial table; exploration 10% in learning mode only |
| D32 | Weight-level model training | No / later / now | No (door kept open by preference-pair logging) |
| D33 | Embeddings for retrieval | None / local model | None at launch (lexical retrieval); revisit if evaluation shows gaps |
| D34 | Provider data handling and "no data to other services" | Verify in writing / accept as is | Verify in the provider's terms and record in the vendor register before going live |
| D35 | Basis for using feedback to improve the assistant | Legitimate interest with objection / explicit opt-in / no learning from text | Legitimate interest with a clear notice and objection route if counsel agrees; otherwise opt-in; keep trajectory-only learning (no text) in either case |

## Open questions

The table above is the open-question list; answers are recorded in `RESEARCH-SIGNOFF.md` and the progress log when the owner replies.
