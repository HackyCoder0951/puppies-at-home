import { describe, expect, it } from 'vitest';
import { regressions, runCase, spotCheckSample, summarise, judge } from '../../application';
import { EVAL_CASES, evalHarness } from '.';
import { ScriptedModelProvider } from '../mock/ScriptedModelProvider';

describe('evaluation set v1', () => {
  it('has 80 cases in the planned categories with unique ids', () => {
    expect(EVAL_CASES).toHaveLength(80);
    expect(new Set(EVAL_CASES.map((c) => c.id)).size).toBe(80);
    const count = (cat: string) => EVAL_CASES.filter((c) => c.category === cat).length;
    expect(['search', 'lookup', 'faq', 'price', 'unknown', 'offtopic', 'injection', 'poisoned', 'personal', 'safety', 'multilingual', 'ambiguous', 'human', 'multiturn'].map(count)).toEqual([12, 8, 10, 6, 6, 6, 6, 5, 4, 3, 4, 4, 3, 3]);
  });

  it('passes every gate with the scripted model on the cases it can understand (logic check, not model quality)', async () => {
    const make = evalHarness(() => new ScriptedModelProvider());
    const results = [];
    for (const c of EVAL_CASES.filter((x) => !x.liveOnly)) results.push(await runCase(c, make));
    const report = summarise(results);
    const failing = report.failures.map((f) => `${f.id}: ${f.failures.join('; ')} -> "${f.answer.slice(0, 80)}"`);
    expect(failing).toEqual([]);
    expect(report.gatesPass).toBe(true);
  });

  it('detects a regression and builds a spot-check sample', async () => {
    const make = evalHarness(() => new ScriptedModelProvider());
    const cases = EVAL_CASES.filter((c) => ['S01', 'I01', 'P01'].includes(c.id));
    const good = summarise(await Promise.all(cases.map((c) => runCase(c, make))));
    const bad = summarise(good.failures.length ? [] : [{ id: 'I01', category: 'injection', pass: false, failures: ['x'], answer: '', cards: 0, latencyMs: 0 }, ...(await Promise.all(cases.filter((c) => c.id !== 'I01').map((c) => runCase(c, make))))]);
    expect(regressions(bad, good).join()).toMatch(/safety case I01 newly fails|injection fell/);
    expect(spotCheckSample(Array.from({ length: 10 }, (_, i) => ({ id: `c${i}`, category: 'search' as const, pass: true, failures: [], answer: 'a', cards: 0, latencyMs: 1 })), 5)).toHaveLength(2);
  });

  it('a judge only accepts a clean 1 to 5', async () => {
    const reply = (t: string) => ({ async *stream() { yield { type: 'text' as const, delta: t }; yield { type: 'stop' as const, reason: 'end' as const }; } });
    expect(await judge(reply('4'), 'q', 'a')).toBe(4);
    expect(await judge(reply('I think 4'), 'q', 'a')).toBeNull();
    expect(await judge(reply('9'), 'q', 'a')).toBeNull();
  });
});
