#!/usr/bin/env node
/**
 * Runs the 80-case evaluation set (docs/06-quality/29 section 12) and checks the pass gates.
 *
 *   npm run assistant:eval                         scripted mock model (logic check, free, offline)
 *   NVIDIA_API_KEY=... npm run assistant:eval -- --live      the real model; skips nothing; ~1.5 s between cases
 *   ... -- --json report.json --baseline previous.json       save the report, fail on regressions against an earlier one
 *   ... -- --only S01,F01,P01                      run only these case ids (quick live check)
 *   ... -- --judge                                  also score tone and helpfulness with NVIDIA_JUDGE_MODEL (trend only, never a gate)
 *   ... -- --spot-check spot.json                   every 5th answer for the human spot-check
 *
 * Exit code 0 only when every gate passes and there are no regressions. Live runs make real requests against the free tier.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const has = (n) => args.includes(`--${n}`);
const val = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };

const server = await createServer({ root, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, resolve: { alias: { '@shared': join(root, 'src/shared'), '@backend': join(root, '../backend/src'), 'server-only': join(root, '../backend/test-support/server-only.ts') } } });
let code = 0;
try {
  const app = await server.ssrLoadModule('/src/modules/assistant/application/index.ts');
  const infra = await server.ssrLoadModule('/src/modules/assistant/infrastructure/index.ts');
  const live = has('live');
  const key = process.env.NVIDIA_API_KEY;
  if (live && !key) { console.error('--live needs NVIDIA_API_KEY.'); process.exit(1); }
  const nvidia = (model) => new infra.NvidiaModelProvider({ apiKey: key, model, baseUrl: process.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1' });
  const model = live ? () => nvidia(process.env.NVIDIA_MODEL ?? 'nvidia/nemotron-3.5-lightning-30b-a3b') : () => new infra.ScriptedModelProvider();
  const make = infra.evalHarness(model);
  const only = val('only')?.split(',');
  const cases = infra.EVAL_CASES.filter((c) => (live || !c.liveOnly) && (!only || only.includes(c.id)));
  const results = [];
  for (const c of cases) {
    const r = await app.runCase(c, make);
    results.push(r);
    console.log(`${r.pass ? 'pass' : 'FAIL'} ${c.id} ${r.failures.join('; ')}`);
    if (live) await new Promise((res) => setTimeout(res, 1500));
  }
  const report = app.summarise(results);
  if (has('judge') && live) {
    const judgeModel = nvidia(process.env.NVIDIA_JUDGE_MODEL ?? 'nvidia/nemotron-3.5-bolt-e4b');
    const scores = [];
    for (const r of results.filter((_, i) => i % 5 === 0)) { const s = await app.judge(judgeModel, cases.find((c) => c.id === r.id).turns.at(-1), r.answer); if (s) scores.push(s); await new Promise((res) => setTimeout(res, 1500)); }
    report.judge = { sampled: scores.length, mean: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null };
  }
  console.log(`\n${report.passed}/${report.total} passed, median latency ${report.medianLatencyMs} ms, mode ${live ? 'LIVE' : 'mock'}${live ? '' : ` (${infra.EVAL_CASES.length - cases.length} live-only cases skipped)`}`);
  for (const [cat, c] of Object.entries(report.byCategory)) console.log(`${c.gatePass ? 'ok  ' : 'FAIL'} ${cat.padEnd(13)} ${c.passed}/${c.total} (${(c.rate * 100).toFixed(0)}%, gate ${(c.gate * 100).toFixed(0)}%)`);
  if (report.judge) console.log(`judge mean ${report.judge.mean?.toFixed(2)} over ${report.judge.sampled} answers (trend only)`);
  if (val('baseline')) {
    const issues = app.regressions(report, JSON.parse(readFileSync(resolve(val('baseline')), 'utf8')));
    for (const i of issues) console.log(`REGRESSION ${i}`);
    if (issues.length) code = 1;
  }
  if (val('json')) writeFileSync(resolve(val('json')), `${JSON.stringify({ ...report, mode: live ? 'live' : 'mock', at: new Date().toISOString() }, null, 2)}\n`);
  if (val('spot-check')) writeFileSync(resolve(val('spot-check')), `${JSON.stringify(app.spotCheckSample(results), null, 2)}\n`);
  if (!report.gatesPass) code = 1;
} finally { await server.close(); }
process.exit(code);
