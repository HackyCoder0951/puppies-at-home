import { describe, expect, it } from 'vitest';
import type { ChatEvent } from '../domain';
import { parseSse, toSseStream } from './sse';

async function* events(): AsyncGenerator<ChatEvent> {
  yield { type: 'meta', conversationId: 'c1' };
  yield { type: 'delta', text: 'Hi\nthere' };
  yield { type: 'done', reason: 'end' };
}

describe('sse', () => {
  it('round-trips events, including text with line breaks, across arbitrary chunking', async () => {
    const text = await new Response(toSseStream(events())).text();
    const half = Math.floor(text.length / 2);
    const first = parseSse(text.slice(0, half));
    const second = parseSse(first.rest + text.slice(half));
    expect([...first.events, ...second.events].map((e) => e.type)).toEqual(['meta', 'delta', 'done']);
    expect((second.events[0] ?? first.events[1]) && [...first.events, ...second.events][1]).toEqual({ type: 'delta', text: 'Hi\nthere' });
  });
  it('turns a failing source into one friendly error event', async () => {
    async function* broken(): AsyncGenerator<ChatEvent> { yield { type: 'meta', conversationId: 'c' }; throw new Error('boom'); }
    const text = await new Response(toSseStream(broken())).text();
    expect(parseSse(text).events.at(-1)).toEqual({ type: 'error', code: 'unavailable' });
  });
});
