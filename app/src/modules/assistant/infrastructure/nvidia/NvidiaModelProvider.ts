import type { ModelProvider } from '../../application';
import type { ModelEvent, ModelMessage, ModelRequest, StopReason, ToolName } from '../../domain';

/** The only place that knows NVIDIA's OpenAI-compatible chat API (build.nvidia.com). Plain `fetch`, no SDK. */
export interface NvidiaOptions { readonly apiKey: string; readonly model: string; readonly baseUrl: string; readonly fetcher?: typeof fetch; readonly timeoutMs?: number }

type WireMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content?: string; tool_calls?: { id: string; type: 'function'; function: { name: string; arguments: string } }[]; tool_call_id?: string };

/** Tool output is data from our own files, but it is still wrapped so the model treats it as untrusted text, never as instructions. */
const wrapTool = (output: unknown) => `<tool_result untrusted="true">\n${JSON.stringify(output)}\n</tool_result>`;

export function toWireMessages(request: ModelRequest): WireMessage[] {
  const out: WireMessage[] = [{ role: 'system', content: request.system.map((b) => b.text).join('\n\n') }];
  for (const m of request.messages as readonly ModelMessage[]) {
    if (m.role === 'user') out.push({ role: 'user', content: m.text });
    else if (m.role === 'assistant') {
      out.push({ role: 'assistant', content: m.text || undefined, ...(m.toolCalls?.length ? { tool_calls: m.toolCalls.map((c) => ({ id: c.id, type: 'function' as const, function: { name: c.name, arguments: JSON.stringify(c.input ?? {}) } })) } : {}) });
    } else out.push({ role: 'tool', tool_call_id: m.result.callId, content: wrapTool(m.result.output) });
  }
  return out;
}

const stopOf = (finish: string | null | undefined): StopReason => (finish === 'length' ? 'max_tokens' : finish === 'content_filter' ? 'refusal' : 'end');

export class NvidiaModelProvider implements ModelProvider {
  constructor(private readonly options: NvidiaOptions) {}

  async *stream(request: ModelRequest): AsyncGenerator<ModelEvent> {
    const { apiKey, model, baseUrl, fetcher = fetch, timeoutMs = 60_000 } = this.options;
    const response = await fetcher(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        model,
        messages: toWireMessages(request),
        stream: true,
        stream_options: { include_usage: true },
        max_tokens: request.maxOutputTokens,
        temperature: 0.2,
        frequency_penalty: 0.3,
        ...(request.tools.length ? { tools: request.tools.map((t) => ({ type: 'function', function: { name: t.name, description: t.description, parameters: stripSchema(t.inputSchema) } })), tool_choice: 'auto' } : {}),
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    // Provider errors never reach the visitor: the use case turns a throw into a friendly "unavailable" event.
    if (!response.ok || !response.body) {
      // The text goes to the server log only (never to the visitor); a short snippet is enough to see "model retired" or "rate limited".
      const detail = response.ok ? 'no body' : (await response.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200);
      throw new Error(`NVIDIA responded ${response.status}: ${detail}`);
    }

    const calls = new Map<number, { id: string; name: string; args: string }>();
    let finish: string | null | undefined;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    try {
    for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
      buffer += decoder.decode(chunk.value, { stream: true });
      let nl = buffer.indexOf('\n');
      while (nl >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        nl = buffer.indexOf('\n');
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data === '[DONE]') continue;
        let json: { choices?: { delta?: { content?: string | null; tool_calls?: { index?: number; id?: string; function?: { name?: string; arguments?: string } }[] }; finish_reason?: string | null }[]; usage?: { prompt_tokens?: number; completion_tokens?: number } };
        try { json = JSON.parse(data); } catch { continue; }
        const choice = json.choices?.[0];
        if (choice?.delta?.content) yield { type: 'text', delta: choice.delta.content };
        for (const tc of choice?.delta?.tool_calls ?? []) {
          const entry = calls.get(tc.index ?? 0) ?? { id: '', name: '', args: '' };
          if (tc.id) entry.id = tc.id;
          if (tc.function?.name) entry.name += tc.function.name;
          if (tc.function?.arguments) entry.args += tc.function.arguments;
          calls.set(tc.index ?? 0, entry);
        }
        if (choice?.finish_reason) finish = choice.finish_reason;
        if (json.usage) yield { type: 'usage', inputTokens: json.usage.prompt_tokens ?? 0, outputTokens: json.usage.completion_tokens ?? 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
      }
    }
    } finally {
      await reader.cancel().catch(() => undefined);   // stop downloading when the consumer stops early
    }
    for (const [i, c] of [...calls.entries()].sort((a, b) => a[0] - b[0])) {
      let input: unknown = {};
      try { input = c.args ? JSON.parse(c.args) : {}; } catch { input = { __invalid: true }; }   // fails the tool's strict schema, which the model is told about
      yield { type: 'tool_use', id: c.id || `call-${i}`, name: c.name as ToolName, input };
    }
    yield { type: 'stop', reason: stopOf(finish) };
  }
}

function stripSchema(schema: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...schema };
  delete rest.$schema;
  return rest;
}
