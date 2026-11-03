/** Offline evaluation of a candidate policy on logged data (docs/06-quality/29 section 6): SNIPS, doubly robust, bootstrap. */
import { contextKey, type LoggedTurn, type PolicyAction, type PolicyArtifact, type PolicyContext, type Random, seededRandom, TOP_K_OPTIONS, WEIGHT_PRESETS } from './policy';

export interface Estimate { readonly value: number; readonly ess: number }

const sameAction = (a: PolicyAction, b: PolicyAction) => a.topK === b.topK && a.weights === b.weights;

/** The action a deterministic target policy would take (best known option per factor, default when unknown). */
export function greedyAction(a: PolicyArtifact, ctx: PolicyContext): PolicyAction {
  const key = contextKey(ctx);
  const best = <T extends string>(row: Record<string, { n: number; mean: number }> | undefined, options: readonly T[], fb: T): T => {
    let out = fb; let m = -Infinity;
    for (const o of options) { const c = row?.[o]; if (c && c.n >= a.minSamples && c.mean > m) { out = o; m = c.mean; } }
    return out;
  };
  return { topK: Number(best(a.tables.topK[key], TOP_K_OPTIONS.map(String), '5')) as PolicyAction['topK'], weights: best(a.tables.weights[key], WEIGHT_PRESETS, 'balanced') };
}

/** Self-normalised inverse propensity scoring for a deterministic target; propensities clipped. ESS = (sum w)^2 / sum w^2. */
export function snips(logs: readonly LoggedTurn[], target: (c: PolicyContext) => PolicyAction, clip = 0.05): Estimate {
  let sw = 0; let swr = 0; let sw2 = 0;
  for (const t of logs) {
    if (!sameAction(t.action, target(t.context))) continue;
    const w = 1 / Math.max(t.propensity, clip);
    sw += w; swr += w * t.reward; sw2 += w * w;
  }
  return { value: sw ? swr / sw : 0, ess: sw2 ? (sw * sw) / sw2 : 0 };
}

/** Doubly robust: a per-action mean-reward model as the baseline, corrected by weighted residuals where the logged action matches the target. */
export function doublyRobust(logs: readonly LoggedTurn[], target: (c: PolicyContext) => PolicyAction, clip = 0.05): number {
  if (!logs.length) return 0;
  const key = (c: PolicyContext, a: PolicyAction) => `${contextKey(c)}|${a.topK}|${a.weights}`;
  const sums = new Map<string, { s: number; n: number }>();
  for (const t of logs) { const k = key(t.context, t.action); const e = sums.get(k) ?? { s: 0, n: 0 }; e.s += t.reward; e.n += 1; sums.set(k, e); }
  const overall = logs.reduce((s, t) => s + t.reward, 0) / logs.length;
  const model = (c: PolicyContext, a: PolicyAction) => { const e = sums.get(key(c, a)); return e ? e.s / e.n : overall; };
  let total = 0;
  for (const t of logs) {
    const tgt = target(t.context);
    total += model(t.context, tgt) + (sameAction(t.action, tgt) ? (t.reward - model(t.context, t.action)) / Math.max(t.propensity, clip) : 0);
  }
  return total / logs.length;
}

export interface Interval { readonly low: number; readonly high: number; readonly mean: number }
/** Percentile bootstrap (resampling turns) of any estimator. Seeded, so reports are reproducible. */
export function bootstrap(logs: readonly LoggedTurn[], estimator: (l: readonly LoggedTurn[]) => number, rounds = 200, rnd: Random = seededRandom(7)): Interval {
  if (!logs.length) return { low: 0, high: 0, mean: 0 };
  const values: number[] = [];
  for (let r = 0; r < rounds; r += 1) values.push(estimator(Array.from({ length: logs.length }, () => logs[Math.floor(rnd() * logs.length)] as LoggedTurn)));
  values.sort((a, b) => a - b);
  return { low: values[Math.floor(rounds * 0.05)] ?? 0, high: values[Math.floor(rounds * 0.95)] ?? 0, mean: values.reduce((s, v) => s + v, 0) / rounds };
}

/** Synthetic logs from a known reward table, so estimators and the bandit can be tested without real traffic. */
export function syntheticLogs(n: number, rnd: Random, behaviourExplore = 0.5, truth: (c: PolicyContext, a: PolicyAction) => number = defaultTruth): LoggedTurn[] {
  const intents = ['puppies', 'info', 'contact', 'other'] as const;
  const out: LoggedTurn[] = [];
  for (let i = 0; i < n; i += 1) {
    const context: PolicyContext = { intent: intents[Math.floor(rnd() * 4)] as PolicyContext['intent'], turn: (1 + Math.floor(rnd() * 3)) as 1 | 2 | 3 };
    // Behaviour policy: the default action with probability 1 - explore, otherwise uniform over every combination.
    const uniform = rnd() < behaviourExplore;
    const action: PolicyAction = uniform ? { topK: TOP_K_OPTIONS[Math.floor(rnd() * 3)] as PolicyAction['topK'], weights: WEIGHT_PRESETS[Math.floor(rnd() * 3)] as PolicyAction['weights'] } : { topK: 5, weights: 'balanced' };
    const isDefault = action.topK === 5 && action.weights === 'balanced';
    const propensity = (1 - behaviourExplore) * (isDefault ? 1 : 0) + behaviourExplore / 9;
    const mean = truth(context, action);
    out.push({ context, action, propensity, reward: Math.max(-1, Math.min(1, mean + (rnd() - 0.5) * 0.6)) });
  }
  return out;
}

/** Ground truth for the simulation: puppy questions like three filter-heavy results, info questions like text-heavy ones. */
export function defaultTruth(c: PolicyContext, a: PolicyAction): number {
  const base = 0.1;
  if (c.intent === 'puppies') return base + (a.weights === 'filter-heavy' ? 0.4 : 0) + (a.topK === 3 ? 0.1 : 0);
  if (c.intent === 'info') return base + (a.weights === 'text-heavy' ? 0.4 : 0);
  return base;
}
