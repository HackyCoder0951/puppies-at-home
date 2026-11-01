import { z } from 'zod';
import { toE164 } from '../domain';

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.string().trim().max(max).optional());

/** One schema for browser and server so the same rules and messages apply on both sides. */
export const enquirySchema = z.object({
  source: z.enum(['contact', 'puppy']),
  name: z.string().trim().min(2, 'Please tell us your name.').max(80, 'That name is a little long.'),
  phone: z
    .string()
    .trim()
    .refine((v) => toE164(v) !== undefined, 'Please enter a phone number with country code, for example +971 50 123 4567.'),
  email: z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), z.email('That email does not look right.').optional()),
  area: optionalText(80),
  puppy: optionalText(120),
  message: optionalText(2000),
  marketing: z.boolean().default(false),
  whatsappUpdates: z.boolean().default(false),
  sourcePage: z.string().max(200).default('/'),
  /** Honeypot: real people leave it empty. */
  website: z.string().max(200).optional().default(''),
  /** Milliseconds timestamp when the form was shown; very fast submissions are treated as bots. */
  shownAt: z.number().int().nonnegative().default(0),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type ParsedEnquiry = z.output<typeof enquirySchema>;

/** First message per field, ready for inline display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    out[key] ??= issue.message;
  }
  return out;
}
