import { z } from 'zod';
import { DELIVERY_METHODS, ORDER_STATUSES, toMinor } from '../domain';

const money = z
  .union([z.string(), z.number()])
  .transform((v) => toMinor(String(v)))
  .pipe(z.number().int().min(0));

export const orderItemSchema = z.object({
  description: z.string().trim().min(2, 'description').max(200, 'description'),
  quantity: z.coerce.number().int().min(1, 'quantity').max(99, 'quantity'),
  unitMinor: money,
});

export const orderInputSchema = z.object({
  customerId: z.string().uuid('customerId'),
  puppyId: z.string().uuid('puppyId').nullable().default(null),
  enquiryId: z.string().uuid('enquiryId').nullable().default(null),
  type: z.enum(['local', 'imported']),
  items: z.array(orderItemSchema).min(1, 'items').max(20, 'items'),
  depositMinor: money.default(0),
  notes: z.string().trim().max(2000).optional().transform((v) => (v ? v : null)),
});
export type OrderInput = z.infer<typeof orderInputSchema>;

export const itemsInputSchema = z.object({ items: z.array(orderItemSchema).min(1, 'items').max(20, 'items'), depositMinor: money.nullable().default(null) });
export type ItemsInput = z.infer<typeof itemsInputSchema>;

export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const deliveryInputSchema = z.object({
  method: z.enum(DELIVERY_METHODS),
  carrier: z.string().trim().max(80).optional().transform((v) => (v ? v : null)),
  trackingNo: z.string().trim().max(80).optional().transform((v) => (v ? v : null)),
  addressText: z.string().trim().max(400).optional().transform((v) => (v ? v : null)),
  eta: z.string().trim().optional().transform((v) => (v ? v : null)).pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'eta').nullable()),
});
export type DeliveryInput = z.infer<typeof deliveryInputSchema>;
