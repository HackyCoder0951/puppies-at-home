import { describe, expect, it } from 'vitest';
import { createAssistant, createToolSet, systemPromptV1 } from '../../application';
import type { ChatEvent, ModelEvent, ModelRequest } from '../../domain';
import { JsonKnowledgeIndex, loadKnowledgeV1 } from '../knowledge';
import { InMemoryChatLimiter, InMemoryConversationStore, SequentialIds } from '../mock/memory';
import { InMemoryUsageBudget } from '../mock/budget';
import { NvidiaModelProvider, toWireMessages } from './NvidiaModelProvider';

const sse = (...chunks: unknown[]) => [...chunks.map((c) => `data: ${JSON.stringify(c)}\n\n`), 'data: [DONE]\n\n'];
const streamOf = (parts: string[], status = 200) => new Response(new ReadableStream({ start(c) { for (const p of parts) c.enqueue(new TextEncoder().encode(p)); c.close(); } }), { status });
const base = (over: Partial<ModelRequest> = {}): ModelRequest => ({ system: [{ text: 'rules' }], messages: [{ role: 'user', text: 'hi' }], tools: [], maxOutputTokens: 200, ...over });
async function collect(it: AsyncIterable<ModelEvent>) { const out: ModelEvent[] = []; for await (const e of it) out.push(e); return out; }
const provider = (fetcher: typeof fetch) => new NvidiaModelProvider({ apiKey: 'k'.repeat(20), model: 'm', baseUrl: 'https://x', fetcher });

describe('NvidiaModelProvider', () => {
  it('streams text, usage and the stop reason, and sends the key, model and limits', async () => {
    let seen: { url: string; auth: string | null; body: Record<string, unknown> } | undefined;
    const fetcher = (async (url: string, init: RequestInit) => {
      seen = { url, auth: new Headers(init.headers).get('authorization'), body: JSON.parse(String(init.body)) };
      return streamOf(sse({ choices: [{ delta: { content: 'Hel' } }] }, { choices: [{ delta: { content: 'lo!' }, finish_reason: 'stop' }] }, { choices: [], usage: { prompt_tokens: 10, completion_tokens: 3 } }));
    }) as unknown as typeof fetch;
    const events = await collect(new NvidiaModelProvider({ apiKey: 'nvapi-test', model: 'm/x', baseUrl: 'https://nim.test/v1/', fetcher }).stream(base()));
    expect(events.filter((e) => e.type === 'text').map((e) => (e as { delta: string }).delta).join('')).toBe('Hello!');
    expect(events).toContainEqual({ type: 'usage', inputTokens: 10, outputTokens: 3, cacheReadTokens: 0, cacheWriteTokens: 0 });
    expect(events.at(-1)).toEqual({ type: 'stop', reason: 'end' });
    expect(seen).toMatchObject({ url: 'https://nim.test/v1/chat/completions', auth: 'Bearer nvapi-test', body: { model: 'm/x', stream: true, max_tokens: 200 } });
  });

  it('assembles a tool call whose name and arguments arrive in pieces', async () => {
    const fetcher = (async () => streamOf(sse(
      { choices: [{ delta: { tool_calls: [{ index: 0, id: 'call_1', function: { name: 'retrieve_pup', arguments: '{"bre' } }] } }] },
      { choices: [{ delta: { tool_calls: [{ index: 0, function: { name: 'pies', arguments: 'ed":"maltipoo"}' } }] }, finish_reason: 'tool_calls' }] },
    ))) as unknown as typeof fetch;
    expect(await collect(provider(fetcher).stream(base()))).toContainEqual({ type: 'tool_use', id: 'call_1', name: 'retrieve_puppies', input: { breed: 'maltipoo' } });
  });

  it('maps length and filter stops, and survives broken lines', async () => {
    const run = async (finish: string) => (await collect(provider((async () => streamOf(['data: not json\n\n', ...sse({ choices: [{ delta: { content: 'a' }, finish_reason: finish }] })])) as unknown as typeof fetch).stream(base()))).at(-1);
    expect(await run('length')).toEqual({ type: 'stop', reason: 'max_tokens' });
    expect(await run('content_filter')).toEqual({ type: 'stop', reason: 'refusal' });
  });

  it('throws on a provider error so the visitor only sees the friendly message', async () => {
    await expect(collect(provider((async () => new Response('secret details', { status: 429 })) as unknown as typeof fetch).stream(base()))).rejects.toThrow('429');
  });

  it('wraps tool results as untrusted and keeps tool call ids', () => {
    const wire = toWireMessages(base({ messages: [{ role: 'user', text: 'q' }, { role: 'assistant', text: '', toolCalls: [{ id: 'c1', name: 'get_puppy', input: { slug: 'a' } }] }, { role: 'tool', result: { callId: 'c1', ok: true, output: { x: 1 }, evidenceIds: [] } }] }));
    expect(wire[2]).toMatchObject({ role: 'assistant', tool_calls: [{ id: 'c1', type: 'function', function: { name: 'get_puppy', arguments: '{"slug":"a"}' } }] });
    expect(wire[3]).toMatchObject({ role: 'tool', tool_call_id: 'c1' });
    expect(wire[3]?.content).toContain('untrusted="true"');
  });
});

describe('assistant with the NVIDIA adapter and budgets', () => {
  const index = new JsonKnowledgeIndex(loadKnowledgeV1());
  const clock = { now: () => new Date('2026-11-03T10:00:00Z') };
  function chat(fetcher: typeof fetch, perVisitor = 5) {
    const assistant = createAssistant({ model: provider(fetcher), conversations: new InMemoryConversationStore(), limiter: new InMemoryChatLimiter(50, 60_000, clock), budget: new InMemoryUsageBudget(perVisitor, 100, clock), clock, ids: new SequentialIds('t'), system: systemPromptV1, tools: createToolSet(index), knowledge: index });
    return async (message: string) => { const out: ChatEvent[] = []; for await (const e of assistant.send({ message }, 'k')) out.push(e); return out; };
  }
  const text = (events: ChatEvent[]) => events.filter((e) => e.type === 'delta').map((e) => (e as { text: string }).text).join('');

  it('runs the tool loop through the adapter and verifies the answer against the tool results', async () => {
    const first = index.puppies({}, 1).hits[0]!;
    let call = 0;
    const fetcher = (async () => {
      call += 1;
      return call === 1
        ? streamOf(sse({ choices: [{ delta: { tool_calls: [{ index: 0, id: 'c1', function: { name: 'retrieve_puppies', arguments: '{"limit":1}' } }] }, finish_reason: 'tool_calls' }] }))
        : streamOf(sse({ choices: [{ delta: { content: `${first.hasPersonalName ? first.name : 'This puppy'} is available, see ${first.pageUrl}.` }, finish_reason: 'stop' }] }));
    }) as unknown as typeof fetch;
    const events = await chat(fetcher)('show me a puppy');
    expect(events.some((e) => e.type === 'card')).toBe(true);
    expect(text(events)).toContain(first.pageUrl);
    expect(call).toBe(2);
  });

  it('replaces a made-up price from the live model with the fallback', async () => {
    const fetcher = (async () => streamOf(sse({ choices: [{ delta: { content: 'That puppy costs AED 5000.' }, finish_reason: 'stop' }] }))) as unknown as typeof fetch;
    const out = text(await chat(fetcher)('tell me about your puppies'));
    expect(out).not.toMatch(/5000/);
    expect(out).toMatch(/ask the team/);
  });

  it('shows a friendly error when the provider fails, and stops at the visitor budget without calling it', async () => {
    let calls = 0;
    const run = chat((async () => { calls += 1; return new Response('x', { status: 500 }); }) as unknown as typeof fetch, 2);
    expect(await run('hello there')).toContainEqual({ type: 'error', code: 'unavailable' });
    await run('again');
    expect(await run('third')).toContainEqual({ type: 'error', code: 'busy' });
    expect(calls).toBe(2);
  });
});
