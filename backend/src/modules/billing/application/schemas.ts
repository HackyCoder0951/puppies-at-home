import { z } from 'zod';
import { PAYMENT_METHODS, toMinor } from '../domain';

const amount = z.union([z.string(), z.number()]).transform((v) => toMinor(String(v))).pipe(z.number().int().min(1));

export const paymentInputSchema = z.object({
  orderId: z.string().uuid('orderId'),
  invoiceId: z.string().uuid('invoiceId').nullable().default(null),
  reference: z.string().trim().min(6, 'reference').max(100, 'reference'),
  method: z.enum(PAYMENT_METHODS, 'method'),
  amountMinor: amount,
  note: z.string().trim().max(300).optional().transform((v) => (v ? v : null)),
});
export type PaymentInput = z.infer<typeof paymentInputSchema>;

export const refundRequestSchema = z.object({ paymentId: z.string().uuid('paymentId'), amountMinor: amount, reason: z.string().trim().min(3, 'reason').max(500, 'reason') });
export type RefundRequest = z.infer<typeof refundRequestSchema>;

export const dueDateSchema = z.string().trim().optional().transform((v) => (v ? v : null)).pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dueAt').nullable());
export const taxRateSchema = z.object({
  name: z.string().trim().min(2, 'name').max(60, 'name'),
  percent: z.union([z.string(), z.number()]).transform((v) => Number(String(v).replace('%', ''))).pipe(z.number().min(0, 'percent').max(100, 'percent')).transform((p) => Math.round(p * 100)),
});
