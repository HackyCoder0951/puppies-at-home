import type { TrajectoryStore } from '../../application';
import type { FeedbackRecord, TurnRecord } from '../../domain';

export class InMemoryTrajectoryStore implements TrajectoryStore {
  readonly turns: TurnRecord[] = [];
  readonly feedback: FeedbackRecord[] = [];
  async recordTurn(record: TurnRecord) { this.turns.push(record); }
  async recordFeedback(record: FeedbackRecord) { this.feedback.push(record); }
}

/** Where the database adapter (in the backend root) receives records; keeps this module free of Supabase. */
export interface EventSink { record(kind: 'turn' | 'feedback', conversationId: string, messageId: string, data: Record<string, unknown>): Promise<void> }

export class SinkTrajectoryStore implements TrajectoryStore {
  constructor(private readonly sink: EventSink) {}
  async recordTurn(r: TurnRecord) {
    const { conversationId, messageId, ...data } = r;
    await this.sink.record('turn', conversationId, messageId, data);
  }
  async recordFeedback(r: FeedbackRecord) { await this.sink.record('feedback', r.conversationId, r.messageId, { kind: r.kind }); }
}
