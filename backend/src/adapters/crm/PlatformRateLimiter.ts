import { limit, type LimiterId } from '../../platform/ratelimit';

/** Adapts a named platform limiter to the crm `RateLimiter` port (returns seconds to wait, 0 when allowed). */
export class PlatformRateLimiter {
  constructor(private readonly id: LimiterId) {}

  async hit(key: string): Promise<number> {
    const result = await limit(this.id, key);
    return result.allowed ? 0 : result.retryAfterSeconds;
  }
}
