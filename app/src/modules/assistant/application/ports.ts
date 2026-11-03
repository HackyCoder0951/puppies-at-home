import type { ChatMessage, Conversation, ModelEvent, ModelRequest, ToolCall, ToolDefinition, ToolResult } from '../domain';

/** Claude in live mode, a scripted rule-based model in mock mode. Only the adapter knows which. */
export interface ModelProvider {
  stream(request: ModelRequest): AsyncIterable<ModelEvent>;
}

export interface ConversationStore {
  create(conversation: Conversation): Promise<void>;
  get(id: string): Promise<Conversation | undefined>;
  append(id: string, message: ChatMessage): Promise<void>;
  delete(id: string): Promise<boolean>;
}

/** Read-only tools over generated knowledge; nothing here changes any state. */
export interface ToolSet {
  definitions(): readonly ToolDefinition[];
  run(call: ToolCall): Promise<ToolResult>;
}

export interface RateLimiter {
  /** Returns 0 when allowed, otherwise the seconds until the caller may retry. */
  hit(key: string): Promise<number>;
}
