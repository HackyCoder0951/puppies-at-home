import type { Enquiry } from '../../domain';
import type { EnquiryStore, RateLimiter } from '../../application';

/** Memory-only store for the mock track: nothing is written to disk or sent anywhere. */
export class InMemoryEnquiryStore implements EnquiryStore {
  readonly saved: Enquiry[] = [];
  async save(enquiry: Enquiry): Promise<void> {
    await new Promise((r) => setTimeout(r, 300));
    this.saved.push(enquiry);
  }
}

/** Fixed window: `limit` hits per `windowMs` per key. */
export class InMemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();
  constructor(private readonly limit = 5, private readonly windowMs = 60_000, private readonly now: () => number = Date.now) {}

  async hit(key: string): Promise<number> {
    const t = this.now();
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= t) {
      this.hits.set(key, { count: 1, resetAt: t + this.windowMs });
      return 0;
    }
    entry.count += 1;
    return entry.count > this.limit ? Math.ceil((entry.resetAt - t) / 1000) : 0;
  }
}
