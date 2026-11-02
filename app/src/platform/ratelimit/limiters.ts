/** Named limiters from docs/02-architecture/08-api-and-rate-limiting.md section 4. */
export interface LimiterSpec {
  readonly id: string;
  readonly limit: number;
  readonly windowSeconds: number;
  /** What to do when the limiter store is unavailable. */
  readonly onFailure: 'closed' | 'open';
}

export const LIMITERS = {
  'RL-PUB-1': { id: 'RL-PUB-1', limit: 5, windowSeconds: 600, onFailure: 'closed' },
  'RL-PUB-2': { id: 'RL-PUB-2', limit: 3, windowSeconds: 3600, onFailure: 'closed' },
  'RL-PUB-3': { id: 'RL-PUB-3', limit: 3, windowSeconds: 86400, onFailure: 'closed' },
  'RL-GEN': { id: 'RL-GEN', limit: 100, windowSeconds: 60, onFailure: 'open' },
  'RL-AUTH-1': { id: 'RL-AUTH-1', limit: 5, windowSeconds: 900, onFailure: 'closed' },
  'RL-AUTH-3': { id: 'RL-AUTH-3', limit: 3, windowSeconds: 3600, onFailure: 'closed' },
  'RL-AUTH-4': { id: 'RL-AUTH-4', limit: 5, windowSeconds: 600, onFailure: 'closed' },
  'RL-ADM-1': { id: 'RL-ADM-1', limit: 120, windowSeconds: 60, onFailure: 'open' },
  'RL-ADM-2': { id: 'RL-ADM-2', limit: 600, windowSeconds: 60, onFailure: 'open' },
  'RL-ADM-3': { id: 'RL-ADM-3', limit: 10, windowSeconds: 3600, onFailure: 'closed' },
  'RL-ADM-4': { id: 'RL-ADM-4', limit: 60, windowSeconds: 3600, onFailure: 'open' },
  'RL-MSG-1': { id: 'RL-MSG-1', limit: 60, windowSeconds: 3600, onFailure: 'closed' },
  'RL-WH-1': { id: 'RL-WH-1', limit: 600, windowSeconds: 60, onFailure: 'open' },
  'RL-CRON': { id: 'RL-CRON', limit: 10, windowSeconds: 60, onFailure: 'closed' },
} as const satisfies Record<string, LimiterSpec>;

export type LimiterId = keyof typeof LIMITERS;
