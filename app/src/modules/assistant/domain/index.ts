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

/** Events the widget receives (server-sent events, docs/02-architecture/27 section 11). */
export type ChatEvent =
  | { readonly type: 'meta'; readonly conversationId: string }
  | { readonly type: 'delta'; readonly text: string }
  | { readonly type: 'done'; readonly reason: StopReason }
  | { readonly type: 'error'; readonly code: 'rate-limited' | 'too-long' | 'invalid' | 'unavailable' | 'unknown-conversation' };
