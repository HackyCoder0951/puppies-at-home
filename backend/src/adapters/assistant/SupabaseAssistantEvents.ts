import type { SupabaseClient } from '@supabase/supabase-js';

/** Appends text-free assistant records through the validated `record_assistant_event` function (the only way anon may write). */
export class SupabaseAssistantEvents {
  constructor(private readonly client: SupabaseClient) {}

  async record(kind: 'turn' | 'feedback', conversationId: string, messageId: string, data: Record<string, unknown>): Promise<void> {
    const { error } = await this.client.rpc('record_assistant_event', { p_kind: kind, p_conversation: conversationId, p_message: messageId, p_data: data });
    if (error) throw new Error(`assistant event: ${error.message}`);
  }
}
