import { describe, expect, it } from 'vitest';
import { bootstrap, defaultTruth, doublyRobust, greedyAction, snips, syntheticLogs } from './replay';
import { DEFAULT_ACTION, choose, classifyIntent, contextOf, fractionOf, reward, seededRandom, train, validateArtifact, type PolicyContext } from './policy';

const NOW = '2026-11-03T00:00:00Z';

describe('context and reward', () => {
  it('derives intent and turn bucket from the text without keeping it', () => {
    expect(contextOf('Do you have a girl Maltipoo?', 1)).toEqual({ intent: 'puppies', turn: 1 });
    expect(contextOf('how does delivery work', 5)).toEqual({ intent: 'info', turn: 3 });
    expect(classifyIntent('can I whatsapp you')).toBe('contact');
    expect(classifyIntent('hmm')).toBe('other');
  });
  it('weights explicit ratings over clicks, penalises replaced answers and clamps', () => {
    expect(reward({ outcome: 'answered', thumbs: 'up' })).toBe(1);
    expect(reward({ outcome: 'answered', linkClick: true })).toBe(0.5);
    expect(reward({ outcome: 'answered', thumbs: 'down', linkClick: true })).toBe(-0.5);
    expect(reward({ outcome: 'replaced', thumbs: 'down' })).toBe(-1);
    expect(reward({ outcome: 'answered', thumbs: 'up', linkClick: true, handoverClick: true })).toBe(1);
  });
});

describe('trainer and artifact', () => {
  it('learns the better option per context from logs gathered with exploration (T-AST-RL convergence)', () => {
    const logs = syntheticLogs(6000, seededRandom(1));
    const artifact = train(logs, { version: 1, createdAt: NOW });
    expect(validateArtifact(artifact)).toBe(true);
    expect(greedyAction(artifact, { intent: 'puppies', turn: 1 }).weights).toBe('filter-heavy');
    expect(greedyAction(artifact, { intent: 'info', turn: 2 }).weights).toBe('text-heavy');
    expect(greedyAction(artifact, { intent: 'other', turn: 1 }).topK).toBeDefined();
  });
  it('rejects malformed artifacts', () => {
    const good = train(syntheticLogs(200, seededRandom(2)), { version: 1, createdAt: NOW });
    expect(validateArtifact({ ...good, version: 0 })).toBe(false);
    expect(validateArtifact({ ...good, explorationShare: 0.9 })).toBe(false);
    expect(validateArtifact({ ...good, tables: { ...good.tables, weights: { 'puppies:1': { 'made-up': { n: 1, mean: 0 } } } } })).toBe(false);
    expect(validateArtifact(null)).toBe(false);
  });
});

describe('engine', () => {
  const ctx: PolicyContext = { intent: 'puppies', turn: 1 };
  const artifact = train(syntheticLogs(6000, seededRandom(3)), { version: 2, createdAt: NOW });
  it('serves the default action with propensity 1 in fixed mode, and without an artifact', () => {
    expect(choose({ mode: 'fixed', artifact }, ctx, 0, seededRandom(1))).toMatchObject({ action: DEFAULT_ACTION, propensity: 1, mode: 'fixed' });
    expect(choose({ mode: 'learned' }, ctx, 0, seededRandom(1)).action).toEqual(DEFAULT_ACTION);
  });
  it('shadow mode serves the default but reports what the candidate would do', () => {
    const d = choose({ mode: 'shadow', artifact }, ctx, 0, seededRandom(1));
    expect(d.action).toEqual(DEFAULT_ACTION);
    expect(d.shadow?.weights).toBe('filter-heavy');
  });
  it('canary routing is sticky per conversation and limited to its share', () => {
    expect(fractionOf('conv-a')).toBe(fractionOf('conv-a'));
    const served = Array.from({ length: 2000 }, (_, i) => choose({ mode: 'canary', artifact, canaryShare: 0.1 }, ctx, fractionOf(`c${i}`), seededRandom(i)).mode === 'canary').filter(Boolean).length;
    expect(served / 2000).toBeGreaterThan(0.06);
    expect(served / 2000).toBeLessThan(0.14);
  });
  it('explores only in learning mode, within the share, and never below the minimum propensity', () => {
    const rnd = seededRandom(9);
    const decisions = Array.from({ length: 4000 }, () => choose({ mode: 'learned', artifact, learningMode: true }, ctx, 0, rnd));
    const off = decisions.filter((d) => d.action.weights !== 'filter-heavy' || d.action.topK !== 3).length / 4000;
    expect(off).toBeGreaterThan(0.05);
    expect(off).toBeLessThan(0.25);
    expect(Math.min(...decisions.map((d) => d.propensity))).toBeGreaterThanOrEqual(0.1 / 3 * (0.1 / 3));
    expect(choose({ mode: 'learned', artifact }, ctx, 0, seededRandom(1)).propensity).toBeGreaterThan(0.99);
  });
});

describe('offline evaluation (T-AST-RL estimator bias)', () => {
  const logs = syntheticLogs(8000, seededRandom(5));
  const target = (c: PolicyContext) => ({ topK: 5 as const, weights: (c.intent === 'puppies' ? 'filter-heavy' : c.intent === 'info' ? 'text-heavy' : 'balanced') as 'balanced' });
  const truthValue = (() => { const rnd = seededRandom(11); let s = 0; for (let i = 0; i < 20000; i += 1) { const c: PolicyContext = { intent: (['puppies', 'info', 'contact', 'other'] as const)[Math.floor(rnd() * 4)] as PolicyContext['intent'], turn: 1 }; s += defaultTruth(c, target(c)); } return s / 20000; })();
  it('SNIPS and doubly robust recover the true value of a deterministic target within a small error', () => {
    expect(Math.abs(snips(logs, target).value - truthValue)).toBeLessThan(0.05);
    expect(Math.abs(doublyRobust(logs, target) - truthValue)).toBeLessThan(0.05);
  });
  it('reports an effective sample size and a bootstrap interval that contains the truth', () => {
    expect(snips(logs, target).ess).toBeGreaterThan(200);
    const ci = bootstrap(logs, (l) => doublyRobust(l, target), 60);
    expect(ci.low).toBeLessThanOrEqual(truthValue + 0.03);
    expect(ci.high).toBeGreaterThanOrEqual(truthValue - 0.03);
  });
  it('shows the candidate beating the default policy on the logs', () => {
    const baseline = () => DEFAULT_ACTION;
    expect(doublyRobust(logs, target)).toBeGreaterThan(doublyRobust(logs, baseline) + 0.05);
  });
});
