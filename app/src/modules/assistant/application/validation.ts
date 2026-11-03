import { z } from 'zod';

export const MAX_MESSAGE_CHARS = 500;

export const chatRequestSchema = z.object({
  conversationId: z.string().min(1).max(80).optional(),
  message: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
}).strict();

export type ChatRequest = z.infer<typeof chatRequestSchema>;
