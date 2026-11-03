import type { Clock, IdGenerator } from '@shared/kernel';
import { checkInput, choose, contextOf, fractionOf, PRESET_WEIGHTS, seededRandom, verifySegment, type EngineConfig, type TurnRecord, type ChatEvent, type ChatMessage, type Evidence, type ModelMessage, type SystemBlock, type ToolCall, type ToolResult } from '../domain';
import type { ConversationStore, KnowledgeIndex, ModelProvider, RateLimiter, ToolSet, TrajectoryStore, UsageBudget } from './ports';
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
  /** Daily request caps; without it the turn is only rate limited. */
  readonly budget?: UsageBudget;
  /** Text-free turn records; a failing store never breaks a turn. */
  readonly trajectories?: TrajectoryStore;
  /** Learned retrieval policy; without it every turn uses the default action. */
  readonly policy?: EngineConfig;
  /** Source of randomness for exploration (seeded in tests). */
  readonly random?: () => number;
  readonly versions?: { readonly prompt: string; readonly knowledge: string; readonly model: string; readonly mode: string };
  /** Needed by the output check (which puppies exist, which links are allowed). */
  readonly knowledge?: KnowledgeIndex;
  readonly maxToolCalls?: number;
  readonly maxOutputTokens?: number;
  /** How many earlier messages go to the model with each turn. */
  readonly historyWindow?: number;
}

/**
 * One chat turn as a stream of events. The only writer of conversation records (docs/02-architecture/27 section 5).
 * Expected failures are events, never exceptions, so the route can always answer with a friendly message.
 */
export const FALLBACK_TEXT = "I can't confirm that from what I have, so it's best to ask the team directly.";
export const PRICE_TEXT = 'The team will gladly talk you through everything, including costs. The quickest way is WhatsApp or the contact form.';
export const BLOCKED_TEXT = "I can only help with TeddyPups puppies and how buying one works, so I can't do that. Would you like to see our available puppies?";

const sentenceEnd = /^(.*?[.!?\n])(\s+|$)/s;

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

    // Only the redacted text (no email or phone) is stored and sent on.
    const verdict = checkInput(parsed.data.message);
    const userMessage = message('user', verdict.redacted);
    await deps.conversations.append(id, userMessage);
    const messages: ModelMessage[] = [...history.slice(-window), userMessage].map((m) => ({ role: m.role, text: m.text }));

    const evidence = { ids: new Set<string>(), links: new Set<string>() };
    const knownNames = deps.knowledge?.allNames() ?? [];
    const contacts = deps.knowledge ? [deps.knowledge.contact().email, deps.knowledge.contact().phoneDisplay, deps.knowledge.contact().whatsappNumber] : [];
    const asEvidence = (): Evidence => ({ ids: evidence.ids, links: evidence.links, knownNames, businessContacts: contacts });
    const handover = (): ChatEvent[] => (deps.knowledge ? [{ type: 'handover', whatsappUrl: deps.knowledge.contact().whatsappUrl, contactFormUrl: deps.knowledge.contact().contactFormUrl }] : []);

    const userTurns = history.filter((m) => m.role === 'user').length + 1;
    const context = contextOf(verdict.redacted, userTurns);
    const decision = choose(deps.policy ?? { mode: 'fixed' }, context, fractionOf(id), deps.random ?? seededRandom(fractionOf(`${id}${userTurns}`) * 1e9));
    const settings = { topK: decision.action.topK, weights: PRESET_WEIGHTS[decision.action.weights] };
    const startedAt = deps.clock.now().getTime();
    const tools: string[] = [];
    let tokensIn = 0;
    let tokensOut = 0;
    let outcome: TurnRecord['outcome'] = 'answered';
    const finish = async (messageId: string, stop: TurnRecord['stop']) => {
      try {
        await deps.trajectories?.recordTurn({ conversationId: id as string, messageId, versions: deps.versions ?? { prompt: '', knowledge: '', model: '', mode: '' }, tools, evidenceCount: evidence.ids.size, outcome, stop, latencyMs: Math.max(0, deps.clock.now().getTime() - startedAt), inputTokens: tokensIn, outputTokens: tokensOut, policy: { intent: context.intent, turn: context.turn, topK: decision.action.topK, weights: decision.action.weights, propensity: decision.propensity, mode: decision.mode, version: deps.policy?.artifact?.version ?? 0, ...(decision.shadow ? { shadowTopK: decision.shadow.topK, shadowWeights: decision.shadow.weights } : {}) } });
      } catch { /* logging must never break a turn */ }
    };
    let answer = '';
    let reason: 'end' | 'max_tokens' | 'refusal' | 'error' = 'end';
    // Injection attempts and price questions never reach the model: the reply is fixed and the visitor is handed over.
    const canned = verdict.injection ? BLOCKED_TEXT : verdict.asksPrice ? PRICE_TEXT : null;
    if (canned) {
      answer = canned;
      yield { type: 'delta', text: canned };
      if (!verdict.injection) for (const e of handover()) yield e;
      const cannedMessage = message('assistant', answer);
      await deps.conversations.append(id, cannedMessage);
      outcome = 'canned';
      await finish(cannedMessage.id, 'end');
      yield { type: 'done', reason: 'end', messageId: cannedMessage.id };
      return;
    }
    // The budget is only charged for turns that actually reach the model.
    if (deps.budget && (await deps.budget.take(callerKey)) !== 'ok') {
      yield { type: 'error', code: 'busy' };
      return;
    }
    try {
      let buffer = '';
      let replaced = false;
      const safeEmit = function* (segment: string): Generator<ChatEvent> {
        const ok = !deps.knowledge || verifySegment(segment, asEvidence()).ok;
        if (ok) { answer += segment; yield { type: 'delta', text: segment }; }
        else if (!replaced) { replaced = true; outcome = 'replaced'; answer += FALLBACK_TEXT; yield { type: 'delta', text: FALLBACK_TEXT }; for (const e of handover()) yield e; }
      };
      for (let round = 0; round <= maxToolCalls; round += 1) {
        const calls: ToolCall[] = [];
        let text = '';
        for await (const event of deps.model.stream({ system: deps.system, messages, tools: deps.tools?.definitions() ?? [], maxOutputTokens: deps.maxOutputTokens ?? 600 })) {
          if (event.type === 'text') {
            text += event.delta;
            buffer += event.delta;
            // Verified sentence by sentence: nothing unchecked reaches the visitor.
            for (let m = sentenceEnd.exec(buffer); m; m = sentenceEnd.exec(buffer)) { yield* safeEmit(`${m[1] ?? ''}${m[2] ?? ''}`); buffer = buffer.slice(m[0].length); }
          } else if (event.type === 'usage') { tokensIn += event.inputTokens; tokensOut += event.outputTokens; }
          else if (event.type === 'tool_use') calls.push({ id: event.id, name: event.name, input: event.input });
          else if (event.type === 'stop') reason = event.reason;
        }
        if (buffer.trim()) { yield* safeEmit(buffer); buffer = ''; }
        if (calls.length === 0 || !deps.tools || round === maxToolCalls) break;
        messages.push({ role: 'assistant', text, toolCalls: calls });
        for (const call of calls) {
          tools.push(call.name);
          const result = await deps.tools.run(call, settings);
          messages.push({ role: 'tool', result });
          for (const e of toEvents(call, result, evidence)) yield e;
        }
      }
    } catch {
      outcome = 'error';
      await finish('none', 'error');
      yield { type: 'error', code: 'unavailable' };
      return;
    }
    const reply = message('assistant', answer);
    if (answer) await deps.conversations.append(id, reply);
    await finish(reply.id, reason);
    yield { type: 'done', reason, ...(answer ? { messageId: reply.id } : {}) };
  }

  /** The visitor forgets a conversation: its text and its records are removed. */
  async function forget(conversationId: unknown): Promise<boolean> {
    if (typeof conversationId !== 'string' || conversationId.length < 1 || conversationId.length > 80) return false;
    return deps.conversations.delete(conversationId);
  }

  return { send, forget };
}

/** Records what a tool returned as evidence and turns puppy results into cards and contact results into the hand-over buttons. */
function* toEvents(call: ToolCall, result: ToolResult, evidence: { ids: Set<string>; links: Set<string> }): Generator<ChatEvent> {
  for (const id of result.evidenceIds) evidence.ids.add(id);
  const out = result.output as Record<string, unknown>;
  const card = (p: Record<string, unknown>): ChatEvent => ({ type: 'card', puppy: { slug: String(p.slug), name: String(p.name), breed: String(p.breed), sex: String(p.sex), age: String(p.age), pageUrl: String(p.pageUrl), reserved: Boolean(p.reserved) } });
  if (call.name === 'retrieve_puppies' && Array.isArray(out.hits)) for (const p of out.hits as Record<string, unknown>[]) { evidence.links.add(String(p.pageUrl)); yield card(p); }
  if (call.name === 'get_puppy' && out.puppy) { const p = out.puppy as Record<string, unknown>; evidence.links.add(String(p.pageUrl)); if (p.status === 'available') yield card(p); }
  if (call.name === 'get_contact_options' && out.whatsappUrl) { evidence.links.add(String(out.whatsappUrl)); evidence.links.add(String(out.contactFormUrl)); yield { type: 'handover', whatsappUrl: String(out.whatsappUrl), contactFormUrl: String(out.contactFormUrl) }; }
  if (call.name === 'create_enquiry_draft' && out.whatsappLink) { evidence.links.add(String(out.whatsappLink)); evidence.links.add(String(out.formLink)); }
}

export type Assistant = ReturnType<typeof createAssistant>;
