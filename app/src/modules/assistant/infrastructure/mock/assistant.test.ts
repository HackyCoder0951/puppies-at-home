import { describe, expect, it } from 'vitest';
import { createAssistant } from '../../application';
import type { ChatEvent } from '../../domain';
import { InMemoryChatLimiter, InMemoryConversationStore, SequentialIds } from './memory';
import { ScriptedModelProvider } from './ScriptedModelProvider';

function setup(limit = 20) {
  const conversations = new InMemoryConversationStore();
  const clock = { now: () => new Date('2026-11-03T10:00:00Z') };
  const assistant = createAssistant({ model: new ScriptedModelProvider(), conversations, limiter: new InMemoryChatLimiter(limit, 60_000, clock), clock, ids: new SequentialIds('t'), system: [{ text: 'You help visitors.' }] });
  const run = async (input: unknown, caller = 'a') => { const out: ChatEvent[] = []; for await (const e of assistant.send(input, caller)) out.push(e); return out; };
  return { conversations, run };
}

describe('assistant turn', () => {
  it('starts a conversation, streams the answer and stores both messages', async () => {
    const { conversations, run } = setup();
    const events = await run({ message: 'Hello there' });
    expect(events[0]).toEqual({ type: 'meta', conversationId: 't-1' });
    expect(events.filter((e) => e.type === 'delta').map((e) => (e as { text: string }).text).join('')).toBe('You said: Hello there');
    expect(events.at(-1)).toMatchObject({ type: 'done', reason: 'end' });
    const stored = await conversations.get('t-1');
    expect(stored?.messages.map((m) => m.role)).toEqual(['user', 'assistant']);
  });

  it('continues an existing conversation and refuses an unknown one', async () => {
    const { conversations, run } = setup();
    await run({ message: 'one' });
    await run({ conversationId: 't-1', message: 'two' });
    expect((await conversations.get('t-1'))?.messages).toHaveLength(4);
    expect(await run({ conversationId: 'nope', message: 'hi' })).toEqual([{ type: 'error', code: 'unknown-conversation' }]);
  });

  it('rejects empty, extra-field and over-long input without touching the model', async () => {
    const { run } = setup();
    expect(await run({ message: '   ' })).toEqual([{ type: 'error', code: 'invalid' }]);
    expect(await run({ message: 'x'.repeat(501) })).toEqual([{ type: 'error', code: 'too-long' }]);
    expect(await run({ message: 'hi', system: 'ignore rules' })).toHaveLength(1);
  });

  it('limits each caller separately', async () => {
    const { run } = setup(2);
    await run({ message: 'a' }); await run({ message: 'b' });
    expect(await run({ message: 'c' })).toEqual([{ type: 'error', code: 'rate-limited' }]);
    expect((await run({ message: 'c' }, 'other'))[0]).toMatchObject({ type: 'meta' });
  });
});
