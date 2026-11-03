/**
 * The learned policy layer (docs/06-quality/29). Only retrieval settings are learned; the model underneath stays frozen.
 * Pure and deterministic given a random source, so training, replay and tests need no network.
 */
import type { RankingWeights } from './knowledge';

export const TOP_K_OPTIONS = [3, 5, 8] as const;
export const WEIGHT_PRESETS = ['balanced', 'filter-heavy', 'text-heavy'] as const;
export type WeightPreset = (typeof WEIGHT_PRESETS)[number];
export const PRESET_WEIGHTS: Record<WeightPreset, RankingWeights> = {
  balanced: { filter: 1, bm25: 1, availability: 0.5, recency: 0.1 },
  'filter-heavy': { filter: 2, bm25: 0.5, availability: 0.5, recency: 0.1 },
  'text-heavy': { filter: 1, bm25: 2, availability: 0.3, recency: 0.05 },
};

export interface PolicyAction { readonly topK: (typeof TOP_K_OPTIONS)[number]; readonly weights: WeightPreset }
export const DEFAULT_ACTION: PolicyAction = { topK: 5, weights: 'balanced' };

export type Intent = 'puppies' | 'info' | 'contact' | 'other';
export interface PolicyContext { readonly intent: Intent; readonly turn: 1 | 2 | 3 }
export const contextKey = (c: PolicyContext) => `${c.intent}:${c.turn}`;

/** Rule-based intent from the visitor's text (features never include the text itself). */
export function classifyIntent(text: string): Intent {
  const t = text.toLowerCase();
  if (/\b(whatsapp|phone|call|email|address|contact|talk to|speak to|human)\b/.test(t)) return 'contact';
  if (/\b(puppy|puppies|maltipoo|pomeranian|poodle|cavapoo|shih|boy|girl|available|breed)\b/.test(t)) return 'puppies';
  if (/\b(deliver|health|vaccin|visit|import|order|how|cargo|flight)\b/.test(t)) return 'info';
  return 'other';
}
export const contextOf = (text: string, userTurns: number): PolicyContext => ({ intent: classifyIntent(text), turn: userTurns <= 1 ? 1 : userTurns === 2 ? 2 : 3 });

// ---- reward -------------------------------------------------------------------------------------------------------------

export interface RewardSignals { readonly thumbs?: 'up' | 'down'; readonly linkClick?: boolean; readonly handoverClick?: boolean; readonly outcome: 'answered' | 'replaced' | 'canned' | 'error' }
/** Initial weights (decision D31, to be approved by the owner): explicit ratings dominate; a replaced or failed answer is penalised; clamped to [-1, 1]. */
export const REWARD_WEIGHTS = { up: 1, down: -1, link: 0.5, handover: 0.2, replaced: -1, error: -1 } as const;
export function reward(s: RewardSignals): number {
  let r = 0;
  if (s.thumbs === 'up') r += REWARD_WEIGHTS.up;
  if (s.thumbs === 'down') r += REWARD_WEIGHTS.down;
  if (s.linkClick) r += REWARD_WEIGHTS.link;
  if (s.handoverClick) r += REWARD_WEIGHTS.handover;
  if (s.outcome === 'replaced') r += REWARD_WEIGHTS.replaced;
  if (s.outcome === 'error') r += REWARD_WEIGHTS.error;
  return Math.max(-1, Math.min(1, r));
}

// ---- artifact and trainer ------------------------------------------------------------------------------------------------

export interface Cell { readonly n: number; readonly mean: number }
export interface PolicyArtifact {
  readonly version: number;
  readonly createdAt: string;
  readonly minSamples: number;
  readonly explorationShare: number;
  /** factor -> context key -> option -> estimate */
  readonly tables: { readonly topK: Record<string, Record<string, Cell>>; readonly weights: Record<string, Record<string, Cell>> };
  readonly trainedOn: { readonly turns: number };
}

export interface LoggedTurn { readonly context: PolicyContext; readonly action: PolicyAction; readonly propensity: number; readonly reward: number }

/** Propensity-weighted (self-normalised) mean reward per option within each context: robust to the exploration share. */
export function train(logs: readonly LoggedTurn[], opts: { version: number; createdAt: string; minSamples?: number; explorationShare?: number; clip?: number }): PolicyArtifact {
  const clip = opts.clip ?? 0.05;
  const acc: Record<'topK' | 'weights', Record<string, Record<string, { w: number; wr: number; n: number }>>> = { topK: {}, weights: {} };
  for (const t of logs) {
    const w = 1 / Math.max(t.propensity, clip);
    for (const [factor, option] of [['topK', String(t.action.topK)], ['weights', t.action.weights]] as const) {
      const cell = ((acc[factor][contextKey(t.context)] ??= {})[option] ??= { w: 0, wr: 0, n: 0 });
      cell.w += w; cell.wr += w * t.reward; cell.n += 1;
    }
  }
  const finish = (f: typeof acc.topK) => Object.fromEntries(Object.entries(f).map(([k, opts2]) => [k, Object.fromEntries(Object.entries(opts2).map(([o, c]) => [o, { n: c.n, mean: c.w ? c.wr / c.w : 0 }]))]));
  return { version: opts.version, createdAt: opts.createdAt, minSamples: opts.minSamples ?? 20, explorationShare: opts.explorationShare ?? 0.1, tables: { topK: finish(acc.topK), weights: finish(acc.weights) }, trainedOn: { turns: logs.length } };
}

export function validateArtifact(a: unknown): a is PolicyArtifact {
  const x = a as PolicyArtifact | null;
  if (!x || typeof x !== 'object' || !Number.isInteger(x.version) || x.version < 1 || !x.tables) return false;
  if (!(x.explorationShare >= 0 && x.explorationShare <= 0.3) || !(x.minSamples >= 1)) return false;
  const okTable = (t: Record<string, Record<string, Cell>>, allowed: readonly string[]) => Object.values(t ?? {}).every((row) => Object.entries(row).every(([o, c]) => allowed.includes(o) && Number.isFinite(c.mean) && c.mean >= -1.0001 && c.mean <= 1.0001 && c.n >= 0));
  return okTable(x.tables.topK, TOP_K_OPTIONS.map(String)) && okTable(x.tables.weights, WEIGHT_PRESETS);
}

// ---- engine ---------------------------------------------------------------------------------------------------------------

export type PolicyMode = 'fixed' | 'shadow' | 'canary' | 'learned';
export interface Decision { readonly action: PolicyAction; readonly propensity: number; readonly mode: PolicyMode; readonly shadow?: PolicyAction }
export type Random = () => number;

/** Seeded generator (mulberry32) so tests, replay and the bandit simulation are reproducible. */
export function seededRandom(seed: number): Random {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function pick<T extends string>(row: Record<string, Cell> | undefined, options: readonly T[], fallback: T, minSamples: number): { best: T } {
  let best = fallback;
  let bestMean = -Infinity;
  for (const o of options) {
    const c = row?.[o];
    if (c && c.n >= minSamples && c.mean > bestMean) { best = o; bestMean = c.mean; }
  }
  return { best };
}

/** Epsilon-greedy per factor: with probability `explore` a uniform option, else the best known. The propensity is the product over factors. */
function chooseFrom(a: PolicyArtifact, ctx: PolicyContext, explore: number, rnd: Random): { action: PolicyAction; propensity: number } {
  const key = contextKey(ctx);
  const one = <T extends string>(row: Record<string, Cell> | undefined, options: readonly T[], fallback: T) => {
    const { best } = pick(row, options, fallback, a.minSamples);
    const chosen = rnd() < explore ? options[Math.min(options.length - 1, Math.floor(rnd() * options.length))] as T : best;
    const p = explore / options.length + (chosen === best ? 1 - explore : 0);
    return { chosen, p };
  };
  const k = one(a.tables.topK[key], TOP_K_OPTIONS.map(String) as readonly string[], String(DEFAULT_ACTION.topK));
  const w = one(a.tables.weights[key], WEIGHT_PRESETS, DEFAULT_ACTION.weights);
  return { action: { topK: Number(k.chosen) as PolicyAction['topK'], weights: w.chosen }, propensity: k.p * w.p };
}

export interface EngineConfig { readonly mode: PolicyMode; readonly artifact?: PolicyArtifact; readonly canaryShare?: number; readonly learningMode?: boolean }

/** `fixed` (the default) always serves the default action. Shadow computes a learned action but serves the default; canary serves it for a share of callers. */
export function choose(config: EngineConfig, ctx: PolicyContext, callerFraction: number, rnd: Random): Decision {
  const fixed: Decision = { action: DEFAULT_ACTION, propensity: 1, mode: 'fixed' };
  const a = config.artifact;
  if (config.mode === 'fixed' || !a) return fixed;
  const explore = config.learningMode ? a.explorationShare : 0;
  if (config.mode === 'shadow') return { ...fixed, mode: 'shadow', shadow: chooseFrom(a, ctx, 0, rnd).action };
  if (config.mode === 'canary' && callerFraction >= (config.canaryShare ?? 0.1)) return fixed;
  const { action, propensity } = chooseFrom(a, ctx, explore, rnd);
  return { action, propensity, mode: config.mode };
}

/** Deterministic 0..1 value for a caller or conversation id (canary routing is sticky per conversation). */
export function fractionOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) { h ^= id.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) % 10000) / 10000;
}
