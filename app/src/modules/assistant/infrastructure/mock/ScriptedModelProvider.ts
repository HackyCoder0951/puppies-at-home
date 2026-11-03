import type { ModelProvider } from '../../application';
import type { ModelEvent, ModelRequest } from '../../domain';

/**
 * Deterministic stand-in for the model: no network. In this first version it only greets and echoes what it was asked;
 * phase A2 adds the rule-based classifier that calls tools and composes answers from their results.
 */
export class ScriptedModelProvider implements ModelProvider {
  async *stream(request: ModelRequest): AsyncGenerator<ModelEvent> {
    const last = [...request.messages].reverse().find((m) => m.role === 'user');
    const text = last && last.role === 'user' ? `You said: ${last.text}` : 'Hello!';
    for (const word of text.split(/(?<= )/)) yield { type: 'text', delta: word };
    yield { type: 'usage', inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };
    yield { type: 'stop', reason: 'end' };
  }
}
