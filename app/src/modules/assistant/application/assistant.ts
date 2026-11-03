import type { Clock, IdGenerator } from '@shared/kernel';
import type { ChatEvent, ChatMessage, ModelMessage, SystemBlock, ToolCall } from '../domain';
import type { ConversationStore, ModelProvider, RateLimiter, ToolSet } from './ports';
import { chatRequestSchema, MAX_MESSAGE_CHARS } from './validation';

export interface AssistantDeps {
  readonly model: ModelProvider;
  readonly conversations: ConversationStore;
  readonly limiter: RateLimiter;
  readonly clock: Clock;
  readonly ids: IdGenerator;
  readonly system: readonly SystemBlock[];
  /** Optional until phase A2; without it the model gets no tools. */
  readonly tools?: ToolSet;
  readonly maxToolCalls?: number;
  readonly maxOutputTokens?: number;
  /** How many earlier messages go to the model with each turn. */
  readonly historyWindow?: number;
}

/**
 * One chat turn as a stream of events. The only writer of conversation records (docs/02-architecture/27 section 5).
 * Expected failures are events, never exceptions, so the route can always answer with a friendly message.
 */
export function createAssistant(deps: AssistantDeps) {
  const maxToolCalls = deps.maxToolCalls ?? 4;
  const window = deps.historyWindow ?? 12;

  const message = (role: ChatMessage['role'], text: string): ChatMessage => ({ id: deps.ids.next(), role, text, at: deps.clock.now() });

  async function* send(input: unknown, callerKey: string): AsyncGenerator<ChatEvent> {
    const wait = await deps.limiter.hit(callerKey);
    if (wait > 0) return void (yield { type: 'error', code: 'rate-limited' });
    const parsed = chatRequestSchema.safeParse(input);
    if (!parsed.success) return void (yield { type: 'error', code: String((input as { message?: unknown } | null)?.message ?? '').length > MAX_MESSAGE_CHARS ? 'too-long' : 'invalid' });

    let id = parsed.data.conversationId;
    let history: readonly ChatMessage[] = [];
    if (id) {
      const found = await deps.conversations.get(id);
      if (!found) return void (yield { type: 'error', code: 'unknown-conversation' });
      history = found.messages;
    } else {
      id = deps.ids.next();
      await deps.conversations.create({ id, startedAt: deps.clock.now(), messages: [] });
    }
    yield { type: 'meta', conversationId: id };

    const userMessage = message('user', parsed.data.message);
    await deps.conversations.append(id, userMessage);
    const messages: ModelMessage[] = [...history.slice(-window), userMessage].map((m) => ({ role: m.role, text: m.text }));

    let answer = '';
    let reason: 'end' | 'max_tokens' | 'refusal' | 'error' = 'end';
    try {
      for (let round = 0; round <= maxToolCalls; round += 1) {
        const calls: ToolCall[] = [];
        let text = '';
        for await (const event of deps.model.stream({ system: deps.system, messages, tools: deps.tools?.definitions() ?? [], maxOutputTokens: deps.maxOutputTokens ?? 600 })) {
          if (event.type === 'text') { text += event.delta; answer += event.delta; yield { type: 'delta', text: event.delta }; }
          else if (event.type === 'tool_use') calls.push({ id: event.id, name: event.name, input: event.input });
          else if (event.type === 'stop') reason = event.reason;
        }
        if (calls.length === 0 || !deps.tools || round === maxToolCalls) break;
        messages.push({ role: 'assistant', text, toolCalls: calls });
        for (const call of calls) messages.push({ role: 'tool', result: await deps.tools.run(call) });
      }
    } catch {
      yield { type: 'error', code: 'unavailable' };
      return;
    }
    if (answer) await deps.conversations.append(id, message('assistant', answer));
    yield { type: 'done', reason };
  }

  return { send };
}

export type Assistant = ReturnType<typeof createAssistant>;
