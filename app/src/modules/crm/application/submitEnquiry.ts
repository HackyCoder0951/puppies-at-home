import type { Clock, IdGenerator } from '@shared/kernel';
import { toE164, type Enquiry } from '../domain';
import type { EnquiryStore, RateLimiter } from './ports';
import { enquirySchema, fieldErrors, type EnquiryInput } from './validation';

export type SubmitOutcome =
  | { ok: true; reference: string }
  | { ok: false; code: 'validation'; fields: Record<string, string> }
  | { ok: false; code: 'rate-limited'; retryAfterSeconds: number }
  | { ok: false; code: 'unexpected' };

export interface EnquiryDeps {
  store: EnquiryStore;
  limiter: RateLimiter;
  clock: Clock;
  ids: IdGenerator;
  consentTextVersion: string;
  /** Minimum time a human needs to fill the form. */
  minFillMs?: number;
}

export function createEnquiryService(deps: EnquiryDeps) {
  const minFillMs = deps.minFillMs ?? 2000;
  return {
    async submit(input: EnquiryInput | unknown, callerKey: string): Promise<SubmitOutcome> {
      const wait = await deps.limiter.hit(callerKey);
      if (wait > 0) return { ok: false, code: 'rate-limited', retryAfterSeconds: wait };

      const parsed = enquirySchema.safeParse(input);
      if (!parsed.success) return { ok: false, code: 'validation', fields: fieldErrors(parsed.error) };
      const d = parsed.data;

      const now = deps.clock.now();
      const tooFast = d.shownAt > 0 && now.getTime() - d.shownAt < minFillMs;
      // Bots get a normal-looking success and nothing is stored.
      if (d.website !== '' || tooFast) return { ok: true, reference: deps.ids.next() };

      const enquiry: Enquiry = {
        id: deps.ids.next(),
        source: d.source,
        name: d.name,
        phoneE164: toE164(d.phone) as string,
        email: d.email,
        area: d.area,
        puppy: d.puppy,
        message: d.message,
        receivedAt: now,
        consent: {
          textVersion: deps.consentTextVersion,
          marketing: d.marketing,
          whatsappUpdates: d.whatsappUpdates,
          adultStatement: true,
          sourcePage: d.sourcePage,
        },
      };
      try {
        await deps.store.save(enquiry);
        return { ok: true, reference: enquiry.id };
      } catch {
        return { ok: false, code: 'unexpected' };
      }
    },
  };
}

export type EnquiryService = ReturnType<typeof createEnquiryService>;
