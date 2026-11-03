import type { FeedbackRecord, TurnRecord, ChatMessage, Conversation, ModelEvent, ModelRequest, ToolCall, ToolDefinition, ToolResult } from '../domain';

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

export interface ToolSettings { readonly topK: number; readonly weights: RankingWeights }

/** Read-only tools over generated knowledge; nothing here changes any state. */
export interface ToolSet {
  definitions(): readonly ToolDefinition[];
  /** `settings` carries this turn's policy choices (result count, ranking weights). */
  run(call: ToolCall, settings?: ToolSettings): Promise<ToolResult>;
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

/** Request budgets so a free or paid model can never be run up by one visitor or by the whole internet. */
export interface UsageBudget {
  /** Counts one model-backed turn; says which limit (if any) stops it. */
  take(callerKey: string): Promise<'ok' | 'visitor-cap' | 'global-cap'>;
}

/** Where turn and feedback records go: memory now, the `assistant_events` table when the database is the data source. */
export interface TrajectoryStore {
  recordTurn(record: TurnRecord): Promise<void>;
  recordFeedback(record: FeedbackRecord): Promise<void>;
}
