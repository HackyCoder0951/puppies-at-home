import { createAssistant, createFeedback, createToolSet, PROMPT_VERSION, systemPromptV1, toSseStream, type Assistant, type Feedback, type TrajectoryStore } from '@modules/assistant/application';
import { InMemoryChatLimiter, InMemoryConversationStore, InMemoryTrajectoryStore, InMemoryUsageBudget, SinkTrajectoryStore, JsonKnowledgeIndex, NvidiaModelProvider, ScriptedModelProvider, loadKnowledgeV1 } from '@modules/assistant/infrastructure';
import { SupabaseAssistantEvents } from '@backend/adapters';
import { createPublicClient } from '@platform';
import { getEnv } from '@shared/config';

let cached: Assistant | undefined;
let feedback: Feedback | undefined;
let trajectories: TrajectoryStore | undefined;

/** Records go to the database when it is the data source, otherwise to memory. */
function getTrajectories(): TrajectoryStore {
  trajectories ??= getEnv().DATA_SOURCE === 'supabase' ? new SinkTrajectoryStore(new SupabaseAssistantEvents(createPublicClient())) : new InMemoryTrajectoryStore();
  return trajectories;
}

/** Composition root for the assistant: scripted model (mock) or NVIDIA's hosted model (live), in-memory conversations, generated knowledge files. */
export function getAssistant(): Assistant | null {
  if (!getEnv().ASSISTANT_ENABLED) return null;
  if (cached) return cached;
  const env = getEnv();
  const knowledge = new JsonKnowledgeIndex(loadKnowledgeV1());
  const live = env.ASSISTANT_MODE === 'live' && env.NVIDIA_API_KEY;
  cached = createAssistant({
    model: live ? new NvidiaModelProvider({ apiKey: env.NVIDIA_API_KEY ?? '', model: env.NVIDIA_MODEL, baseUrl: env.NVIDIA_BASE_URL }) : new ScriptedModelProvider(),
    trajectories: getTrajectories(),
    versions: { prompt: PROMPT_VERSION, knowledge: knowledge.version(), model: live ? env.NVIDIA_MODEL : 'scripted', mode: live ? 'live' : 'mock' },
    budget: new InMemoryUsageBudget(env.ASSISTANT_VISITOR_DAILY_REQUESTS, env.ASSISTANT_GLOBAL_DAILY_REQUESTS),
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

/** Records a rating or a click from the widget; null while the assistant is switched off. */
export async function recordAssistantFeedback(input: unknown, callerKey: string): Promise<'recorded' | 'invalid' | 'rate-limited' | null> {
  if (!getEnv().ASSISTANT_ENABLED) return null;
  feedback ??= createFeedback({ store: getTrajectories(), limiter: new InMemoryChatLimiter(60, 60_000) });
  return feedback.record(input, callerKey);
}
