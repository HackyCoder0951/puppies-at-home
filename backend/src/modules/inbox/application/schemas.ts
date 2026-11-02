import { z } from 'zod';
import { ENQUIRY_STATUSES } from '../domain';

export const noteSchema = z.object({ body: z.string().trim().min(1, 'body').max(4000, 'body') });
export const statusSchema = z.enum(ENQUIRY_STATUSES);
export const customerInputSchema = z.object({
  fullName: z.string().trim().min(2, 'fullName').max(120, 'fullName'),
  email: z.string().trim().max(254).optional().transform((v) => (v ? v.toLowerCase() : null)).pipe(z.string().email('email').nullable()),
  area: z.string().trim().max(80).optional().transform((v) => (v ? v : null)),
  notes: z.string().trim().max(4000).optional().transform((v) => (v ? v : null)),
  tags: z
    .string()
    .optional()
    .transform((v) => (v ?? '').split(',').map((t) => t.trim()).filter(Boolean))
    .pipe(z.array(z.string().max(30)).max(10)),
});
export type CustomerInput = z.infer<typeof customerInputSchema>;
