/** Plain types of the assistant (docs/02-architecture/27 section 4). No framework imports. */
export type Role = 'user' | 'assistant';

export interface ChatMessage {
  readonly id: string;
  readonly role: Role;
  readonly text: string;
  readonly at: Date;
}

export interface Conversation {
  readonly id: string;
  readonly startedAt: Date;
  readonly messages: readonly ChatMessage[];
}

export const TOOL_NAMES = ['retrieve_puppies', 'get_puppy', 'retrieve_info', 'get_contact_options', 'create_enquiry_draft'] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

export interface ToolCall { readonly id: string; readonly name: ToolName; readonly input: unknown }
export interface ToolResult { readonly callId: string; readonly ok: boolean; readonly output: unknown; readonly evidenceIds: readonly string[] }

export interface ToolDefinition { readonly name: ToolName; readonly description: string; readonly inputSchema: Record<string, unknown> }

/** What the model is asked: a stable prefix first, volatile parts last (prompt caching in the live adapter). */
export interface SystemBlock { readonly text: string; readonly cache?: boolean }
export type ModelMessage =
  | { readonly role: 'user'; readonly text: string }
  | { readonly role: 'assistant'; readonly text: string; readonly toolCalls?: readonly ToolCall[] }
  | { readonly role: 'tool'; readonly result: ToolResult };

export interface ModelRequest {
  readonly system: readonly SystemBlock[];
  readonly messages: readonly ModelMessage[];
  readonly tools: readonly ToolDefinition[];
  readonly maxOutputTokens: number;
}

export type StopReason = 'end' | 'max_tokens' | 'refusal' | 'error';
export type ModelEvent =
  | { readonly type: 'text'; readonly delta: string }
  | { readonly type: 'tool_use'; readonly id: string; readonly name: ToolName; readonly input: unknown }
  | { readonly type: 'usage'; readonly inputTokens: number; readonly outputTokens: number; readonly cacheReadTokens: number; readonly cacheWriteTokens: number }
  | { readonly type: 'stop'; readonly reason: StopReason };

export interface PuppyCard { readonly slug: string; readonly name: string; readonly breed: string; readonly sex: string; readonly age: string; readonly pageUrl: string; readonly reserved: boolean }

/** Events the widget receives (server-sent events, docs/02-architecture/27 section 11). */
export type ChatEvent =
  | { readonly type: 'meta'; readonly conversationId: string }
  | { readonly type: 'delta'; readonly text: string }
  | { readonly type: 'card'; readonly puppy: PuppyCard }
  | { readonly type: 'handover'; readonly whatsappUrl: string; readonly contactFormUrl: string }
  | { readonly type: 'done'; readonly reason: StopReason; readonly messageId?: string }
  | { readonly type: 'error'; readonly code: 'rate-limited' | 'too-long' | 'invalid' | 'unavailable' | 'unknown-conversation' | 'busy' };

export * from './knowledge';
export { buildBm25, tokenize, type Bm25Index } from './bm25';
export * from './guard';

/** Text-free record of one turn (docs/06-quality/29 section 4): what ran and how it ended, never what was typed. */
export interface TurnRecord {
  readonly conversationId: string;
  readonly messageId: string;
  readonly versions: { readonly prompt: string; readonly knowledge: string; readonly model: string; readonly mode: string };
  readonly tools: readonly string[];
  readonly evidenceCount: number;
  readonly outcome: 'answered' | 'replaced' | 'canned' | 'error';
  readonly stop: StopReason;
  readonly latencyMs: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  /** Policy decision (no text): context features, the action served, its propensity and, in shadow mode, what the candidate would have done. */
  readonly policy?: { readonly intent: string; readonly turn: number; readonly topK: number; readonly weights: string; readonly propensity: number; readonly mode: string; readonly version: number; readonly shadowTopK?: number; readonly shadowWeights?: string };
}

export const FEEDBACK_KINDS = ['up', 'down', 'link', 'handover'] as const;
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];
export interface FeedbackRecord { readonly conversationId: string; readonly messageId: string; readonly kind: FeedbackKind }
export * from './policy';
export * from './replay';
export * from './evaluation';
