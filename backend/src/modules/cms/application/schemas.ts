import { z } from 'zod';

const text = (max: number) => z.string().trim().max(max);
const list = z
  .union([z.string(), z.array(z.string())])
  .transform((v) => (Array.isArray(v) ? v : v.split(',')).map((s) => s.trim()).filter(Boolean))
  .pipe(z.array(z.string().max(60)).max(10));

export const puppyInputSchema = z.object({
  name: text(60).optional().transform((v) => (v ? v : null)),
  breed: text(80).min(2, 'breed'),
  breeds: list.default([]),
  collections: list.default([]),
  sex: z.enum(['male', 'female', 'male-female']),
  ageText: text(40).min(1, 'age'),
  colour: text(60).optional().transform((v) => (v ? v : null)),
  origin: z.enum(['local', 'imported']),
  /** Internal price in whole AED (never shown publicly). */
  priceAed: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === '' ? null : Number(v)))
    .pipe(z.number().int().min(0).max(1_000_000).nullable()),
});
export type PuppyInput = z.infer<typeof puppyInputSchema>;

export const faqInputSchema = z.object({ question: text(300).min(3, 'question'), answer: text(4000).min(3, 'answer') });
export type FaqInput = z.infer<typeof faqInputSchema>;

export const testimonialInputSchema = z.object({ quote: text(1200).min(10, 'quote'), author: text(120).min(2, 'author'), location: text(120).optional().transform((v) => (v ? v : null)) });
export type TestimonialInput = z.infer<typeof testimonialInputSchema>;

export const settingsInputSchema = z.object({
  whatsapp_number: z.string().trim().regex(/^\d{8,15}$/, 'whatsapp_number'),
  whatsapp_text: text(300).min(3),
  phone_href: z.string().trim().regex(/^tel:\+\d{8,15}$/, 'phone_href'),
  email: z.string().trim().email().max(254),
  address: text(200).min(3),
  maps_href: z.string().trim().url().max(500),
  instagram: z.string().trim().url().max(300),
  tiktok: z.string().trim().url().max(300),
  facebook: z.string().trim().url().max(300),
});
export type SettingsInput = z.infer<typeof settingsInputSchema>;

