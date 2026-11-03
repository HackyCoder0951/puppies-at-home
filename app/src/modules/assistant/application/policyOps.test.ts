import { describe, expect, it } from 'vitest';
import { seededRandom, syntheticLogs, train } from '../domain';
import { evaluateCandidate, monitorWindow, type WindowStats } from './policyOps';

const NOW = '2026-11-03T00:00:00Z';

describe('promotion gate', () => {
  it('passes a candidate that clearly beats the default on enough data and refuses one with too little data', () => {
    const logs = syntheticLogs(6000, seededRandom(21));
    const candidate = train(logs, { version: 1, createdAt: NOW });
    const ok = evaluateCandidate(logs, candidate);
    expect(ok.pass).toBe(true);
    expect(ok.interval.low).toBeGreaterThan(ok.baselineValue);
    const few = syntheticLogs(60, seededRandom(22));
    const rejected = evaluateCandidate(few, train(few, { version: 1, createdAt: NOW }));
    expect(rejected.pass).toBe(false);
    expect(rejected.reasons.join(' ')).toMatch(/effective sample size/);
  });
  it('refuses a candidate no better than the active policy', () => {
    const logs = syntheticLogs(6000, seededRandom(23));
    const same = train(logs, { version: 2, createdAt: NOW });
    expect(evaluateCandidate(logs, same, same).pass).toBe(false);
  });
});

describe('monitors', () => {
  const healthy: WindowStats = { turns: 200, replaced: 8, errors: 2, thumbsUp: 30, thumbsDown: 6, handovers: 40, meanReward: 0.4 };
  it('stays quiet for a healthy window and for windows too small to judge', () => {
    expect(monitorWindow(healthy, healthy)).toEqual({ alerts: [], rollback: false });
    expect(monitorWindow({ ...healthy, turns: 10, replaced: 10 }, healthy).rollback).toBe(false);
  });
  it('recommends rollback on each breach', () => {
    expect(monitorWindow({ ...healthy, replaced: 60 }, healthy).alerts[0]).toMatch(/unverified/);
    expect(monitorWindow({ ...healthy, errors: 30 }, healthy).alerts[0]).toMatch(/errors/);
    expect(monitorWindow({ ...healthy, thumbsDown: 30 }, healthy).alerts.join()).toMatch(/thumbs-down/);
    expect(monitorWindow({ ...healthy, meanReward: 0.1 }, healthy).alerts.join()).toMatch(/reward fell/);
    expect(monitorWindow({ ...healthy, handovers: 160, thumbsDown: 20 }, healthy).alerts.join()).toMatch(/reward hacking/);
  });
});
