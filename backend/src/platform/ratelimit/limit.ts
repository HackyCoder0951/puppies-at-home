import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { getEnv } from '@backend/config';
import { logger } from '../logging';
import { hashIdentifier } from './identify';
import { LIMITERS, type LimiterId, type LimiterSpec } from './limiters';

export interface LimitResult {
  readonly allowed: boolean;
  /** Seconds until the caller may retry (0 when allowed). */
  readonly retryAfterSeconds: number;
}

const memory = new Map<string, { count: number; resetAt: number }>();
const upstash = new Map<string, Ratelimit>();

function memoryHit(key: string, spec: LimiterSpec, now = Date.now()): LimitResult {
  const entry = memory.get(key);
  if (!entry || entry.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + spec.windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  entry.count += 1;
  return entry.count > spec.limit
    ? { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) }
    : { allowed: true, retryAfterSeconds: 0 };
}

function upstashLimiter(spec: LimiterSpec): Ratelimit | undefined {
  const env = getEnv();
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) return undefined;
  let limiter = upstash.get(spec.id);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN }),
      limiter: Ratelimit.slidingWindow(spec.limit, `${spec.windowSeconds} s`),
      prefix: `rl:${spec.id}`,
    });
    upstash.set(spec.id, limiter);
  }
  return limiter;
}

/**
 * Applies a named limiter to an identifier (hashed here). Uses Upstash when configured, otherwise an in-memory
 * window (single instance, local development). Store failures follow the limiter's fail-open or fail-closed rule.
 */
export async function limit(id: LimiterId, identifier: string): Promise<LimitResult> {
  const env = getEnv();
  if (!env.RATE_LIMIT_ENABLED) return { allowed: true, retryAfterSeconds: 0 };
  const spec: LimiterSpec = LIMITERS[id];
  const key = `${spec.id}:${hashIdentifier(identifier)}`;
  const remote = upstashLimiter(spec);
  if (!remote) return memoryHit(key, spec);
  try {
    const res = await remote.limit(key);
    return res.success ? { allowed: true, retryAfterSeconds: 0 } : { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((res.reset - Date.now()) / 1000)) };
  } catch (error) {
    logger.warn('rate limit store unavailable', { limiter: spec.id, failure: spec.onFailure, error: String(error) });
    return spec.onFailure === 'open' ? { allowed: true, retryAfterSeconds: 0 } : { allowed: false, retryAfterSeconds: 60 };
  }
}

/** Test helper. */
export function resetMemoryLimits(): void {
  memory.clear();
}
