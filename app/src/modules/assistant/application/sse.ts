import type { ChatEvent } from '../domain';

/** Server-sent events: one `event:` and one JSON `data:` line per chat event, as a web stream the route can return. */
export function toSseStream(events: AsyncIterable<ChatEvent>): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const iterator = events[Symbol.asyncIterator]();
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const next = await iterator.next();
        if (next.done) return controller.close();
        controller.enqueue(encoder.encode(`event: ${next.value.type}\ndata: ${JSON.stringify(next.value)}\n\n`));
      } catch {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ type: 'error', code: 'unavailable' })}\n\n`));
        controller.close();
      }
    },
    async cancel() { await iterator.return?.(); },
  });
}

/** Parses the stream back into events (used by the widget and tests); incomplete trailing blocks wait for more bytes. */
export function parseSse(buffer: string): { events: ChatEvent[]; rest: string } {
  const blocks = buffer.split('\n\n');
  const rest = blocks.pop() ?? '';
  const events: ChatEvent[] = [];
  for (const block of blocks) {
    const data = block.split('\n').find((l) => l.startsWith('data: '));
    if (!data) continue;
    try { events.push(JSON.parse(data.slice(6)) as ChatEvent); } catch { /* ignore a damaged block */ }
  }
  return { events, rest };
}
