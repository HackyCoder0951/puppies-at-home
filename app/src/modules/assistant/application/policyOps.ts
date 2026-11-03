import { bootstrap, doublyRobust, greedyAction, snips, DEFAULT_ACTION, validateArtifact, type LoggedTurn, type PolicyArtifact } from '../domain';

export interface Evaluation {
  readonly candidateValue: number;
  readonly interval: { readonly low: number; readonly high: number };
  readonly baselineValue: number;
  readonly ess: number;
  readonly pass: boolean;
  readonly reasons: readonly string[];
}

export const MIN_ESS = 200;

/** Offline gate for a candidate (docs/06-quality/29 section 6): valid artifact, enough effective samples, and a lower confidence bound above the active policy's estimate. */
export function evaluateCandidate(logs: readonly LoggedTurn[], candidate: PolicyArtifact, active?: PolicyArtifact): Evaluation {
  const target = (c: LoggedTurn['context']) => greedyAction(candidate, c);
  const base = (c: LoggedTurn['context']) => (active ? greedyAction(active, c) : DEFAULT_ACTION);
  const interval = bootstrap(logs, (l) => doublyRobust(l, target), 200);
  const baselineValue = doublyRobust(logs, base);
  const ess = snips(logs, target).ess;
  const reasons: string[] = [];
  if (!validateArtifact(candidate)) reasons.push('the artifact is not valid');
  if (ess < MIN_ESS) reasons.push(`effective sample size ${ess.toFixed(0)} is below ${MIN_ESS}`);
  if (!(interval.low > baselineValue)) reasons.push(`lower bound ${interval.low.toFixed(3)} does not beat the active policy's ${baselineValue.toFixed(3)}`);
  return { candidateValue: doublyRobust(logs, target), interval: { low: interval.low, high: interval.high }, baselineValue, ess, pass: reasons.length === 0, reasons };
}

export interface WindowStats { readonly turns: number; readonly replaced: number; readonly errors: number; readonly thumbsUp: number; readonly thumbsDown: number; readonly handovers: number; readonly meanReward: number }
export interface Bands { readonly maxReplaced: number; readonly maxErrors: number; readonly maxDownShare: number; readonly handoverRange: readonly [number, number]; readonly minRewardDrop: number }
export const DEFAULT_BANDS: Bands = { maxReplaced: 0.15, maxErrors: 0.05, maxDownShare: 0.3, handoverRange: [0.02, 0.6], minRewardDrop: 0.15 };

/** Monitors for a canary or promoted policy (`29` section 6): any breach recommends rollback. Windows below 30 turns are not judged. */
export function monitorWindow(current: WindowStats, baseline: WindowStats, bands: Bands = DEFAULT_BANDS): { alerts: string[]; rollback: boolean } {
  const alerts: string[] = [];
  if (current.turns < 30) return { alerts, rollback: false };
  const share = (n: number, d = current.turns) => (d ? n / d : 0);
  if (share(current.replaced) > bands.maxReplaced) alerts.push(`unverified answers ${(share(current.replaced) * 100).toFixed(1)}% above ${bands.maxReplaced * 100}%`);
  if (share(current.errors) > bands.maxErrors) alerts.push(`errors ${(share(current.errors) * 100).toFixed(1)}% above ${bands.maxErrors * 100}%`);
  const rated = current.thumbsUp + current.thumbsDown;
  if (rated >= 10 && share(current.thumbsDown, rated) > bands.maxDownShare) alerts.push(`thumbs-down share ${(share(current.thumbsDown, rated) * 100).toFixed(0)}% above ${bands.maxDownShare * 100}%`);
  const h = share(current.handovers);
  if (h < bands.handoverRange[0] || h > bands.handoverRange[1]) alerts.push(`hand-over rate ${(h * 100).toFixed(0)}% outside its band`);
  if (baseline.meanReward - current.meanReward > bands.minRewardDrop) alerts.push(`mean reward fell by ${(baseline.meanReward - current.meanReward).toFixed(2)}`);
  // Clicks rising while ratings fall is the reward-hacking warning from the design.
  if (rated >= 10 && current.handovers > baseline.handovers * 1.5 && share(current.thumbsDown, rated) > share(baseline.thumbsDown, baseline.thumbsUp + baseline.thumbsDown)) alerts.push('clicks up while thumbs-down rise (possible reward hacking)');
  return { alerts, rollback: alerts.length > 0 };
}
