import type { Clock } from '@shared/kernel';
import type { UsageBudget } from '../../application';

/** Daily request caps per visitor and for the whole site, in memory (one server process), reset each UTC day. */
export class InMemoryUsageBudget implements UsageBudget {
  private day = '';
  private global = 0;
  private readonly visitors = new Map<string, number>();

  constructor(private readonly perVisitor: number, private readonly perSite: number, private readonly clock: Clock = { now: () => new Date() }) {}

  async take(key: string) {
    const today = this.clock.now().toISOString().slice(0, 10);
    if (today !== this.day) { this.day = today; this.global = 0; this.visitors.clear(); }
    if (this.global >= this.perSite) return 'global-cap' as const;
    const used = this.visitors.get(key) ?? 0;
    if (used >= this.perVisitor) return 'visitor-cap' as const;
    this.visitors.set(key, used + 1);
    this.global += 1;
    return 'ok' as const;
  }
}
