import { createAssistant, createToolSet, systemPromptV1, toSseStream, type Assistant } from '@modules/assistant/application';
import { InMemoryChatLimiter, InMemoryConversationStore, JsonKnowledgeIndex, ScriptedModelProvider, SequentialIds, loadKnowledgeV1 } from '@modules/assistant/infrastructure';
import { getEnv } from '@shared/config';

let cached: Assistant | undefined;

/** Composition root for the assistant. Mock mode only: scripted model, in-memory conversations, generated knowledge files. */
export function getAssistant(): Assistant | null {
  if (!getEnv().ASSISTANT_ENABLED) return null;
  if (cached) return cached;
  const knowledge = new JsonKnowledgeIndex(loadKnowledgeV1());
  cached = createAssistant({
    model: new ScriptedModelProvider(),
    conversations: new InMemoryConversationStore(),
    limiter: new InMemoryChatLimiter(20, 60_000),
    clock: { now: () => new Date() },
    ids: { next: () => crypto.randomUUID() },
    system: systemPromptV1,
    tools: createToolSet(knowledge),
    knowledge,
  });
  return cached;
}

/** One chat turn as an event-stream response, or null while the assistant is switched off. */
export function chatResponse(input: unknown, callerKey: string): Response | null {
  const assistant = getAssistant();
  if (!assistant) return null;
  return new Response(toSseStream(assistant.send(input, callerKey)), {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store, no-transform', 'X-Accel-Buffering': 'no' },
  });
}
