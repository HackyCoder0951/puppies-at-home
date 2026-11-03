# Assistant release review (A9)

Date: 2026-11-03. Scope: mock mode fully verified; live NVIDIA mode **not run** (no key available to the build).

## 1. Checks and results

| Area | Check | Result |
|---|---|---|
| Evaluation | `npm run assistant:eval` (mock): 76 of 80 cases (4 need real language understanding), every gate | **Passed**, all categories 100 %. This tests our guard, tools and verifier logic, not any model's quality. The run found a real bug (two puppies with the same name made a correct answer fail verification) and led to the emergency reply and the instruction-text output check. |
| Evaluation | Same command with `--live` | **Not run.** First thing to do with the key; expect lower pass rates for an open model, especially multilingual, ambiguous and "not in our data" cases. |
| Injection | 6 direct and 5 inside-data cases in the set | Passed on the mock; the guard blocks the common phrasings, the output check blocks echoes of instruction-like text; a live model must be re-tested. |
| Policy | Simulation: convergence on synthetic logs, SNIPS and doubly robust within 0.05 of the truth, promotion gate, monitors | Passed (unit tests). **No real traffic has trained anything**; mode stays `fixed`. |
| Accessibility | axe on the open panel, keyboard (Escape, focus return), 320 px layout above the contact bar, admin screen in the 17-page sweep | Passed. Screen-reader testing by hand was **not** done. |
| Dependencies | `npm audit --omit=dev` | 0 vulnerabilities. No new package was added for the assistant. |
| Security | Strict tool schemas, no web or code tools, key server-side only, CSP `connect-src 'self'` so the widget only talks to our own server | Reviewed by reading; no external penetration test. |
| Database | pgTAP 015 (records), 016 (conversations, overview), RLS on all new tables | Passed |

## 2. Cost and latency

- **Cost:** the free NVIDIA endpoints have no per-token bill, so the controls are request caps: 40 per visitor and 1000 per site per day by default, per server instance (in memory). On several serverless instances the real ceiling can be higher; a shared counter (Upstash, already used for rate limits) is the fix if traffic grows.
- **Latency:** not measured live. The mock answers in about a millisecond. A live turn is one model call, plus one more per tool round (up to 4); the sentence-by-sentence check adds little. Measure median time to first text with `npm run assistant:eval -- --live` and the admin screen's "Average time" and compare it with the target in `26` (AC-AST-06).
- **Limits of the free tier** (rate limits, availability, permitted use) are not verified.

## 3. Release flags and order

1. Deploy with everything off (`ASSISTANT_ENABLED=false`, the default).
2. Set `NVIDIA_API_KEY` in the host's server environment, run `npm run assistant:smoke`, then `npm run assistant:eval -- --live --json first-live.json`; review failures and the 20 % spot-check file.
3. Counsel signs off the notice (`34`); update the privacy page; confirm D21, D22, D24, D34, D35.
4. Enable `ASSISTANT_ENABLED=true`, `ASSISTANT_MODE=live`; watch `/admin/assistant` daily for the first week.
5. Policy learning stays `fixed` until enough rated turns exist (hundreds to thousands, `29` section 5); then follow `29` section 6 with the command-line tool.
6. Kill switch: `ASSISTANT_ENABLED=false` (the widget disappears on the next build/deploy; the chat route answers 503 at once).

## 4. Known gaps

- Public pages are static, so the widget flag is read at build time: switching it needs a redeploy. The chat route reads it at run time.
- Budgets and rate limits are per instance (see above).
- No admin screen for policy candidates; the command line is used (decision D29).
- The weights in the reward function (D31) are my proposal and need the owner's approval before any learning.
- Multilingual behaviour (D18: English only at launch) relies on the model answering in English.
