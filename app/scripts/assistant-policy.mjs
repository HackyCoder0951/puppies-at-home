#!/usr/bin/env node
/**
 * Policy tooling for the assistant (docs/06-quality/29 section 6), run by a person; nothing here is automatic.
 *
 *   npm run assistant:policy -- synth 4000 logs.json          synthetic logs (for a dry run)
 *   npm run assistant:policy -- export logs.json              turns joined with feedback from the database (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
 *   npm run assistant:policy -- train logs.json candidate.json
 *   npm run assistant:policy -- evaluate logs.json candidate.json
 *   npm run assistant:policy -- promote candidate.json logs.json --approved-by "Name"   (runs the gate, keeps history)
 *   npm run assistant:policy -- rollback --approved-by "Name"
 *
 * The promoted artifact is src/modules/assistant/infrastructure/policy/active.json; deploy it and set ASSISTANT_POLICY_MODE.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/modules/assistant/infrastructure/policy');
const active = join(dir, 'active.json');
const history = join(dir, 'history');
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const positional = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] ?? '').startsWith('--'));
const [command, ...rest] = positional;
const readJson = (p) => JSON.parse(readFileSync(resolve(p), 'utf8'));
const writeJson = (p, v) => writeFileSync(resolve(p), `${JSON.stringify(v, null, 2)}\n`);

const server = await createServer({ root, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null }, optimizeDeps: { noDiscovery: true, include: [] }, resolve: { alias: { '@shared': join(root, 'src/shared'), '@backend': join(root, '../backend/src'), 'server-only': join(root, '../backend/test-support/server-only.ts') } } });
const domain = await server.ssrLoadModule('/src/modules/assistant/domain/index.ts');
const ops = await server.ssrLoadModule('/src/modules/assistant/application/policyOps.ts');
const finish = async (code) => { await server.close(); process.exit(code); };

const loadActive = () => { try { const a = readJson(active); return domain.validateArtifact(a) ? a : undefined; } catch { return undefined; } };
const nextVersion = () => (existsSync(history) ? readdirSync(history).filter((f) => /^v\d+\.json$/.test(f)).length : 0) + 1;

async function exportLogs(out) {
  const url = process.env.SUPABASE_URL; const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) { console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'); return finish(1); }
  const res = await fetch(`${url}/rest/v1/assistant_events?select=kind,conversation_id,message_id,data&order=created_at.asc&limit=100000`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  if (!res.ok) { console.error(`database answered ${res.status}`); return finish(1); }
  const events = await res.json();
  const signals = new Map();
  for (const e of events.filter((x) => x.kind === 'feedback')) {
    const s = signals.get(e.message_id) ?? {};
    if (e.data.kind === 'up' || e.data.kind === 'down') s.thumbs = e.data.kind;
    if (e.data.kind === 'link') s.linkClick = true;
    if (e.data.kind === 'handover') s.handoverClick = true;
    signals.set(e.message_id, s);
  }
  const logs = events.filter((x) => x.kind === 'turn' && x.data.policy && x.data.outcome !== undefined).map((t) => ({
    context: { intent: t.data.policy.intent, turn: t.data.policy.turn },
    action: { topK: t.data.policy.topK, weights: t.data.policy.weights },
    propensity: t.data.policy.propensity,
    reward: domain.reward({ ...(signals.get(t.message_id) ?? {}), outcome: t.data.outcome }),
  }));
  writeJson(out, logs);
  console.log(`exported ${logs.length} turns (${signals.size} with feedback)`);
}

try {
  if (command === 'synth') { const logs = domain.syntheticLogs(Number(rest[0] ?? 4000), domain.seededRandom(Number(flag('seed') ?? 1))); writeJson(rest[1] ?? 'logs.json', logs); console.log(`wrote ${logs.length} synthetic turns`); }
  else if (command === 'export') await exportLogs(rest[0] ?? 'logs.json');
  else if (command === 'train') {
    const logs = readJson(rest[0]);
    const artifact = domain.train(logs, { version: nextVersion(), createdAt: new Date().toISOString(), explorationShare: Number(flag('exploration') ?? 0.1) });
    writeJson(rest[1] ?? 'candidate.json', artifact);
    console.log(`trained version ${artifact.version} on ${logs.length} turns`);
  } else if (command === 'evaluate') {
    const result = ops.evaluateCandidate(readJson(rest[0]), readJson(rest[1]), loadActive());
    console.log(JSON.stringify(result, null, 2));
    await finish(result.pass ? 0 : 1);
  } else if (command === 'promote') {
    const approver = flag('approved-by');
    if (!approver) { console.error('Promotion needs --approved-by "Name" (a person approves every promotion).'); await finish(1); }
    const candidate = readJson(rest[0]);
    const result = ops.evaluateCandidate(readJson(rest[1]), candidate, loadActive());
    if (!result.pass) { console.error(`Refused: ${result.reasons.join('; ')}`); await finish(1); }
    mkdirSync(history, { recursive: true });
    writeJson(join(history, `v${candidate.version}.json`), { ...candidate, promotedBy: approver, promotedAt: new Date().toISOString(), evaluation: result });
    writeJson(active, candidate);
    console.log(`Promoted version ${candidate.version}, approved by ${approver}. Deploy and set ASSISTANT_POLICY_MODE (shadow or canary first).`);
  } else if (command === 'rollback') {
    if (!flag('approved-by')) { console.error('Rollback needs --approved-by "Name".'); await finish(1); }
    const current = loadActive();
    const versions = existsSync(history) ? readdirSync(history).map((f) => /^v(\d+)\.json$/.exec(f)?.[1]).filter(Boolean).map(Number).sort((a, b) => a - b) : [];
    const previous = versions.filter((v) => !current || v < current.version).pop();
    if (previous) { const artifact = readJson(join(history, `v${previous}.json`)); for (const k of ['promotedBy', 'promotedAt', 'evaluation']) delete artifact[k]; writeJson(active, artifact); console.log(`Rolled back to version ${previous}.`); }
    else { writeJson(active, {}); console.log('No earlier version: the fixed default policy is active again.'); }
  } else { console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]); }
} finally { await finish(process.exitCode ?? 0); }
