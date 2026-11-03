import type { Clock, IdGenerator } from '@shared/kernel';
import type { ConversationStore, RateLimiter } from '../../application';
import type { ChatMessage, Conversation } from '../../domain';

export class InMemoryConversationStore implements ConversationStore {
  private readonly items = new Map<string, Conversation>();

  async create(conversation: Conversation) { this.items.set(conversation.id, conversation); }
  async get(id: string) { return this.items.get(id); }
  async append(id: string, message: ChatMessage) {
    const c = this.items.get(id);
    if (c) this.items.set(id, { ...c, messages: [...c.messages, message] });
  }
  async delete(id: string) { return this.items.delete(id); }
}

/** Fixed-window limiter, per key, in memory (one server process). */
export class InMemoryChatLimiter implements RateLimiter {
  private readonly hits = new Map<string, { start: number; count: number }>();
  constructor(private readonly max = 20, private readonly windowMs = 60_000, private readonly clock: Clock = { now: () => new Date() }) {}

  async hit(key: string) {
    const now = this.clock.now().getTime();
    const entry = this.hits.get(key);
    if (!entry || now - entry.start >= this.windowMs) { this.hits.set(key, { start: now, count: 1 }); return 0; }
    entry.count += 1;
    return entry.count > this.max ? Math.ceil((entry.start + this.windowMs - now) / 1000) : 0;
  }
}

/** Counting ids (`id-1`, `id-2`, ...) so tests and demos are deterministic. */
export class SequentialIds implements IdGenerator {
  private n = 0;
  constructor(private readonly prefix = 'id') {}
  next() { this.n += 1; return `${this.prefix}-${this.n}`; }
}
