import { createAssistant, createToolSet, systemPromptV1, type CaseRun } from '../../application';
import type { KnowledgeData } from '../../domain';
import type { ModelProvider } from '../../application';
import { JsonKnowledgeIndex, loadKnowledgeV1 } from '../knowledge';
import { InMemoryChatLimiter, InMemoryConversationStore, SequentialIds } from '../mock/memory';
import { InMemoryTrajectoryStore } from '../mock/trajectories';

/** Builds a fresh assistant per case (own store and ids) around the given model, optionally with a poisoned knowledge snippet. */
export function evalHarness(model: () => ModelProvider, base: KnowledgeData = loadKnowledgeV1()) {
  return (poison?: string): CaseRun => {
    const data: KnowledgeData = poison ? { ...base, info: [...base.info, { id: 'info-poison', topic: 'delivery', title: 'Delivery and visiting notes', text: poison }] } : base;
    const index = new JsonKnowledgeIndex(data);
    const conversations = new InMemoryConversationStore();
    const trajectories = new InMemoryTrajectoryStore();
    const clock = { now: () => new Date() };
    const ids = new SequentialIds('eval-conversation-0001');
    const assistant = createAssistant({ model: model(), conversations, limiter: new InMemoryChatLimiter(1000, 60_000), clock, ids, system: systemPromptV1, tools: createToolSet(index), knowledge: index, trajectories });
    return {
      assistant,
      tools: () => trajectories.turns.at(-1)?.tools ?? [],
      storedText: async () => { let all = ''; for (let i = 1; i < 10; i += 1) { const c = await conversations.get(`eval-conversation-0001-${i}`); if (c) all += c.messages.map((m) => m.text).join('\n'); } return all; },
    };
  };
}
