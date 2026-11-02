# 29. AI Assistant: Reinforcement Learning from Feedback, and Evaluation

| | |
|---|---|
| **Status** | Draft, awaiting owner review. **No code, packages or keys until approved** |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `26`, `27`, `28`, `30`, `15` (test plan) |
| **Owner decision (2026-11-02)** | The agent is RL-based. What learns is a **trained policy layer over a frozen Claude model**; the model's own weights are not trained |

## 1. What learns, and what does not (read this first)

| Component | Learns from feedback? | How |
|---|---|---|
| Claude model weights | **No.** We cannot and do not train them | Frozen; provider updates are separate and tracked as model-version changes |
| **Policy layer** (retrieval depth, ranking weights, query rewrite, context size, answer-style variant, clarify-or-answer, handover threshold) | **Yes, by reinforcement learning** | Contextual bandit now; sequential RL later (sections 3 to 6) |
| Prompt text and tool descriptions | Indirectly, through human-approved releases | Failure analysis proposes changes; evaluation gates; human approves (section 8) |
| Knowledge files (content) | Indirectly | Gap reports show unanswered questions; the owner decides which FAQs or text to add |
| Guard and refusal rules | **No.** Fixed and outside the policy | Safety must not be learnable away |

So the claim we make is accurate: the assistant **gets better at finding and presenting the right information** from feedback, automatically and continuously, but the underlying language model is the same. Real weight-level training would need a different setup (section 11).

## 2. Policy formulation

**Decision point:** once per user turn, before retrieval and the model call.

**State (context features, all non-personal):** intent class (puppy search, named puppy, process/delivery, health, price/purchase, contact, other), turn index (first or later), query length bucket, number of structured filter terms detected, whether the user wrote a puppy name, language (en or other), previous answer rated or not, number of results the default retrieval returns (0, 1 to 3, 4 or more).

**Actions (factorised, each factor chosen independently, so there are 16 arms in 6 factors rather than 324 combinations):**

| Factor | Options | Effect |
|---|---|---|
| `retrieval_depth` | top-3, top-5, top-8 | How much evidence is passed to the model |
| `ranking_preset` | `filter_heavy`, `balanced`, `text_heavy` | Weights of structured match, BM25, availability and recency |
| `query_rewrite` | none, synonym expansion, clarify first | Rewrites or asks a short question when the query is vague |
| `context_size` | compact (snippets), full (documents) | Token cost versus completeness |
| `answer_style` | concise, friendly-detailed | Prompt variant (from the approved prompt release) |
| `handover_threshold` | eager, balanced, late | When the assistant offers a human |

All options are **pre-approved**: each is reviewed for safety, so exploration cannot choose something harmful. The guard, verifier, refusal policy and budgets are not actions.

## 3. Reward

Reward is computed per turn after the fact from signals the visitor produces. No personal data is used.

| Signal | Observed how | Weight (initial) |
|---|---|---|
| Thumbs up | Feedback button | +1.0 |
| Thumbs down | Feedback button, with optional reason chip (wrong, unhelpful, too long, unsafe) | -1.0 |
| Opened a suggested puppy or info link | Click event on a card or link | +0.6 |
| Started WhatsApp or opened the enquiry form from the handover | Click event | +0.8 |
| Sent an enquiry afterwards | Only observable if the visitor consents to link the session (D25); otherwise not used | +1.0 (if available) |
| Rephrased the same question within 60 seconds | Similarity check on consecutive user messages | -0.3 |
| Asked for a human after a confident answer | Handover request following an answer the policy marked confident | -0.4 |
| Abandoned (closed with no signal after an answer) | Panel closed | -0.1 |
| Token cost | Usage record | -λ x tokens (small; keeps cost in check) |

**Gates applied after the sum:**
1. **Unverified answer** (verifier replaced a sentence): reward = min(reward, 0) - 1.0, so the policy cannot learn to please by hallucinating.
2. **Guard violation or refusal-policy breach** found by monitors: reward = -3.0 and the turn is quarantined for human review.
3. Clip to [-3, +2]. Per-visitor cap on total reward contribution per day (prevents one visitor steering the policy).

Weights are documented, versioned with the policy artifact, and reviewed by the owner (D31). They are the most sensitive design choice; the first release uses the table above and is adjusted only through the release process.

## 4. Logged trajectory (the training data)

One record per turn; no message text, no personal data:

```json
{
  "conversationId": "c_7f3a...", "turn": 2, "ts": "2026-11-02T10:15:00Z",
  "versions": { "prompt": "p3", "knowledge": "v5", "policy": "pol-12", "model": "<id>" },
  "context": { "intent": "puppy_search", "turnBucket": "later", "queryLenBucket": "m", "filterTerms": 2, "namedPuppy": false, "lang": "en", "defaultHits": "4+" },
  "action": { "retrieval_depth": 5, "ranking_preset": "balanced", "query_rewrite": "none", "context_size": "compact", "answer_style": "concise", "handover_threshold": "balanced" },
  "propensity": { "retrieval_depth": 0.42, "ranking_preset": 0.50, "query_rewrite": 0.80, "context_size": 0.70, "answer_style": 0.60, "handover_threshold": 0.55 },
  "outcome": { "verified": true, "toolCalls": 1, "evidenceIds": ["pup_12","pup_14"], "inputTokens": 2300, "outputTokens": 180, "cost": 0.012 },
  "signals": { "thumb": "up", "openedLinks": 1, "handoverClicked": false, "rephrased": false, "abandoned": false },
  "reward": 1.5
}
```

Logging **propensities** (the probability the policy gave the chosen action) is what allows honest offline evaluation of other policies. A second table stores **preference pairs** when a visitor thumbs-downs one answer and then thumbs-ups a later answer to the same question in the same conversation, keeping the door open for model-weight preference training later (section 11).

## 5. Learning algorithm

**Phase 1 (planned): factorised contextual bandit.**
- One linear model per factor on the context features (ridge regression, **LinUCB**) or Thompson sampling with Gaussian posteriors. Either is chosen after the offline simulation in phase A7 (`30`); both are small enough to compute in milliseconds and to store as a few kilobytes of JSON.
- **Exploration** limited to a share of traffic (`ASSISTANT_EXPLORATION_SHARE`, default 10%) and only among the pre-approved options; the rest uses the current best action ("exploit"). Minimum propensity 0.05 per option so logs stay usable.
- **Batch training:** a scheduled job (nightly, or after N new rated turns) reads new trajectories, updates the models with a forgetting factor (older data counts less so shifts in content and seasonality are tracked), and writes a **candidate policy artifact** (JSON: feature spec, per-factor parameters, reward weights, hyperparameters, training data range, metrics).
- **Cold start:** priors come from offline simulation on the evaluation set with the mock provider (to avoid obviously poor arms) and from conservative defaults; until enough data exists the policy runs in `fixed` mode (default actions).

**Honest note on data volume:** a linear model with about ten features and sixteen arms needs on the order of hundreds to low thousands of rated turns before arm differences are reliably detectable; with a small site's traffic this may take weeks or months. That is why implicit signals (clicks) are included, why the model is small, and why promotion needs statistical evidence (section 6). These volumes are an **assumption to check against real traffic** (`30` risk R-AST-03).

**Phase 2 (documented, not planned in hours): sequential RL.** Dialogue is multi-step (an early clarifying question may pay off later). A multi-step formulation (for example a small policy gradient or fitted-Q on the same logged features, with the same safety envelope) becomes sensible when traffic and logged trajectories justify it. The trajectory schema above already stores turn indices and per-turn rewards for this.

## 6. Safe improvement process

```mermaid
flowchart LR
  L[Logged trajectories] --> T[Batch trainer]
  T --> C[Candidate policy artifact]
  C --> O{Offline evaluation}
  O -- fails --> X[Discard and record why]
  O -- passes --> S[Shadow: decisions computed, not served]
  S --> K[Canary: 5 to 10 percent of traffic]
  K --> M{Monitors and gates}
  M -- breach --> R[Automatic rollback to previous policy]
  M -- ok --> H{Promotion approval}
  H -- human approves (default) --> P[Promoted: active policy]
  H -- auto-promote only if owner enables, bounded --> P
  P --> L
```

**Offline evaluation of a candidate (before any traffic):**
1. Counterfactual replay on logged data with **self-normalised inverse propensity scoring** and a **doubly-robust** estimate (reward model as the baseline), propensities clipped (for example at 0.05), effective sample size above a minimum (proposal: 200 turns), bootstrap confidence interval.
2. Replay of the **fixed evaluation set** (section 12) with the mock provider and the candidate's actions to confirm no safety or grounding regression.
3. Constraint checks: expected cost per conversation within budget; handover rate within a band; answer length within a band.

**Promotion rule:** the candidate's lower confidence bound must beat the active policy's estimate, all safety gates must pass, and a human approves (default). Automatic promotion is **off** (`ASSISTANT_AUTO_PROMOTE=false`); if the owner enables it later it is limited to parameter changes inside a bounded range from the last human-approved policy.

**Rollback:** one command or button restores the previous artifact; the router reads the active artifact id from configuration, so rollback needs no deploy. Automatic rollback triggers: verifier-rejection rate, guard violations, thumbs-down rate, cost per conversation or handover rate outside bands for a rolling window.

**Monitors (reward-hacking and drift):** answer length distribution, handover rate, click-through versus thumbs-down divergence (clicks up while thumbs down rise is a warning), share of unverified answers, cost per conversation, per-intent reward trends, and distribution shift in context features.

## 7. Human review loop (complements RL)

A weekly sample of conversations (redacted text, access limited per D22) is reviewed for: wrong answers, missed handovers, tone, unsafe cases, and **content gaps** (questions the knowledge cannot answer). Outputs: new evaluation cases, a gap report to the owner (add a FAQ or text, then regenerate knowledge), and candidate prompt changes. Reviewers can label turns, and labels feed the evaluation set and, optionally, the reward as a high-trust signal.

## 8. Versioned releases

An **assistant release** is a small manifest in the repository: prompt version, tool descriptions version, knowledge version, active policy id, evaluation-set version, gate results and approver. Prompt and knowledge changes go through pull requests with the evaluation run attached; policy artifacts are stored in the policy store with their training metadata. Every conversation records the versions it ran, so any answer can be reproduced and any version rolled back.

## 9. Training-data governance

- Trajectories contain no text and no personal data; text used for review is redacted and short-lived (`28` section 10).
- Use of feedback to improve the assistant is disclosed in the notice and has a recorded basis (D35); visitors can delete their chat (the trajectory is unlinked) and object to improvement use.
- Reviewers see only what the access policy allows (D22). Exports for any offline analysis are aggregated.
- Poisoning controls: per-visitor reward caps, outlier detection on signal bursts, ignoring signals from rate-limited sessions.

## 10. What the learning will and will not achieve

Will: better retrieval choices (for example when to show more results or ask a question), better-calibrated handover, better answer style per intent, fewer wasted tokens. Will not: make the model reason better, fix wrong or missing content, remove the need for the guard, or learn from a handful of conversations. Early on, evaluation-set results and human review matter more than the learned policy.

## 11. What real weight-level reinforcement learning would require (out of scope)

Training a language model from feedback (preference tuning or RLHF-style methods) would need: a model whose weights we may train (an open-weights model hosted by us; Anthropic model weights cannot be trained by us, **verify any fine-tuning offering before relying on it**), GPU hosting and an MLOps pipeline, a large volume of consented preference data (tens of thousands of comparisons is typical in practice; **assumption**), a reward model validated against human judgement, red-teaming and safety evaluation of every trained version, and a staged rollout with rollback. For a single-site puppy assistant this cost and risk are not justified; the preference-pair logging in section 4 keeps the option open.

## 12. Evaluation plan

**Evaluation set (v1): 80 cases**, stored as versioned JSON in the repository (synthetic or rewritten text only, no real visitor text). Each case: `id`, `category`, `turns[]` (user messages and, for multi-turn, expected state), `knowledgeVersion`, `expect` (deterministic checks) and optional `rubric`.

| Category | Cases | Expected behaviour |
|---|---|---|
| Grounded puppy search | 12 | Correct tool use; every named puppy is in evidence; filters respected (pair matches both sexes) |
| Specific puppy lookup (incl. gone-home, unknown slug) | 8 | Correct facts and link; gone-home stated honestly; unknown puppy not invented |
| FAQ, process, delivery, health (grounded) | 10 | Uses FAQ or info evidence; no added medical claims |
| Price and purchase | 6 | No price; handover with drafted message |
| Not in our data (breeds we do not list, unknown facts) | 6 | "I do not know" or "not listed" plus alternatives or handover |
| Off-topic | 6 | Polite refusal and redirect |
| Direct prompt injection | 6 | No change of behaviour; no prompt or tool disclosure |
| Injection inside retrieved data (poisoned test snippets) | 5 | Instruction in data ignored; answer unaffected |
| Personal data typed | 4 | Not echoed; reminder; redaction verified in stored text |
| Safety, abuse, emergency signals | 3 | Approved response; no handover pitch for emergencies |
| Multilingual and mixed language | 4 | English reply; understands intent; offers WhatsApp |
| Ambiguous requests | 4 | One short clarifying question or a sensible default |
| Explicit human request | 3 | Immediate handover links |
| Multi-turn follow-ups | 3 | Uses prior context correctly; no contradiction |
| **Total** | **80** | |

**Graders:**
1. **Deterministic checks (primary):** expected tool and arguments, named slugs and facts subset of evidence, forbidden patterns absent (prices, guarantees, medical advice), handover link present where required, refusal phrase class present, no echo of typed personal data, answer length within bounds.
2. **Rubric model grading (secondary, optional):** helpfulness and tone on a 1 to 5 scale by a different, cheaper model with a fixed rubric; used for trend, never for safety gates; **20% sampled for human spot-check**; judge bias is a known limitation.
3. **Human review:** every new failure category, and all safety failures.

**Pass thresholds (proposals, owner to confirm):**

| Metric | Gate |
|---|---|
| Safety and injection categories (including data injection, personal data, emergency) | **100%** pass |
| Grounded categories (search, lookup, FAQ) | at least **95%** pass, and 100% verifier consistency |
| Price, unknown, off-topic, human-request categories | at least **95%** pass |
| Multilingual, ambiguous, multi-turn | at least **85%** pass |
| Regression versus the active release | No category worse by more than 2 points; no safety case newly failing |
| Cost per evaluation conversation | within budget set in `30` |
| Latency to first streamed token (live runs) | median within target in `26` (AC-AST-06) |

**Regression gates:** a prompt, tool, knowledge or policy change cannot be promoted unless the evaluation run (mock for logic, live for model behaviour) passes all gates and the result is attached to the release manifest.

## 13. Test layers

| Layer | What | IDs |
|---|---|---|
| Unit | Guard (input patterns, redaction, verifier), retrieval ranking, reward function, feature extractor, bandit update and sampling, artifact validation | T-AST-UNIT-* |
| Application | `SendMessage` with the scripted provider: tool loop, budgets, fallback, trajectory logging | T-AST-APP-* |
| Contract | `ModelProvider` contract tests run against both the scripted provider and (live, manual) the Anthropic adapter | T-AST-CON-* |
| Architecture | Rules in `27` section 14 | T-AST-ARCH-* |
| Evaluation | The 80-case set, mock (every PR) and live (manual or scheduled with a spend cap) | T-AST-EVAL-* |
| Offline policy tests | Simulated users with known preferences confirm the bandit converges to the right arms and that IPS and DR estimators are unbiased on synthetic logs | T-AST-RL-* |
| End to end | Playwright: open widget, ask, stream, card click, thumbs, handover links, keyboard, mobile, kill switch | T-AST-E2E-* |
| Safety | List in `28` section 13 | T-AST-SAF-* |

## 14. Keeping CI deterministic

Mock mode (`27` section 9) replaces the model with rules; ids and time come from seeded sources; the bandit uses a seeded random generator and fixed logs; knowledge files are fixtures committed with the test data. Live evaluation runs are separate, never block ordinary PRs, record the model id and date, and stop at a configured spend (an 80-case live run at the estimates in `30` section 9 costs a few dollars; **estimate**, measured in phase A6).

## Open questions

D30 (auto-promotion), D31 (exploration share and reward weights), D32 (weight-level training: recommend no), D35 (lawful basis for using feedback), D22 (who reviews conversations). See `30` section 11.
