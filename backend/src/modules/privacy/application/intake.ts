import { err, ok, type Result } from '@backend/kernel';
import { z } from 'zod';
import { REQUEST_TYPES } from '../domain';

const intakeSchema = z.object({
  name: z.string().trim().min(2, 'name').max(120, 'name'),
  contact: z.string().trim().min(5, 'contact').max(200, 'contact'),
  type: z.enum(REQUEST_TYPES, 'type'),
  details: z.string().trim().max(2000, 'details').optional().transform((v) => v ?? ''),
  /** Honeypot: real people never fill it. */
  website: z.string().optional(),
  /** Milliseconds between opening the form and sending it. */
  elapsedMs: z.coerce.number().optional(),
});

export type IntakeError = { code: 'invalid'; field: string } | { code: 'rate-limited'; retryAfterSeconds: number } | { code: 'unavailable' };

export interface IntakeStore { submit(input: { name: string; contact: string; type: string; details: string }): Promise<void> }
export interface IntakeLimiter { hit(key: string): Promise<number> }

/** Public request form: bots are answered with success and nothing is stored; people are rate limited per caller. */
export function createPublicIntake(deps: { store: IntakeStore; limiter: IntakeLimiter }) {
  return {
    async submit(raw: unknown, callerKey: string): Promise<Result<true, IntakeError>> {
      const parsed = intakeSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: String(parsed.error.issues[0]?.path[0] ?? 'form') });
      const input = parsed.data;
      if (input.website || (input.elapsedMs !== undefined && input.elapsedMs < 2500)) return ok(true);   // looks automated: pretend it worked
      const wait = await deps.limiter.hit(callerKey);
      if (wait > 0) return err({ code: 'rate-limited', retryAfterSeconds: wait });
      try {
        await deps.store.submit({ name: input.name, contact: input.contact, type: input.type, details: input.details });
        return ok(true);
      } catch {
        return err({ code: 'unavailable' });
      }
    },
  };
}
