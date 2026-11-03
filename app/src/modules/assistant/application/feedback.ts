import { z } from 'zod';
import { FEEDBACK_KINDS } from '../domain';
import type { RateLimiter, TrajectoryStore } from './ports';

export const feedbackSchema = z.object({
  conversationId: z.string().min(1).max(80),
  messageId: z.string().min(1).max(80),
  kind: z.enum(FEEDBACK_KINDS),
}).strict();

export type FeedbackOutcome = 'recorded' | 'invalid' | 'rate-limited';

/** Records a rating or a click. Strict input, rate limited per caller, and silent about storage trouble (feedback is best effort). */
export function createFeedback(deps: { store: TrajectoryStore; limiter: RateLimiter }) {
  return {
    async record(input: unknown, callerKey: string): Promise<FeedbackOutcome> {
      if ((await deps.limiter.hit(callerKey)) > 0) return 'rate-limited';
      const parsed = feedbackSchema.safeParse(input);
      if (!parsed.success) return 'invalid';
      try { await deps.store.recordFeedback(parsed.data); } catch { /* best effort */ }
      return 'recorded';
    },
  };
}
export type Feedback = ReturnType<typeof createFeedback>;
