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

import type { InfoHit, PuppyDoc, PuppyQuery, RankingWeights, SettingsDoc } from '../domain';

/** Generated JSON files only; no database, no network. */
export interface KnowledgeIndex {
  version(): string;
  puppies(query: PuppyQuery, limit: number, weights?: RankingWeights): { total: number; hits: readonly PuppyDoc[] };
  puppy(slug: string): PuppyDoc | undefined;
  info(query: string, limit: number, topic?: string): InfoHit[];
  contact(): SettingsDoc;
  /** Names of puppies with a personal name, so the guard can spot a puppy mentioned without evidence. */
  allNames(): readonly { id: string; name: string }[];
}
