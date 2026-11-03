import type { SupabaseClient } from '@supabase/supabase-js';

interface StoredMessage { readonly id: string; readonly role: 'user' | 'assistant'; readonly text: string; readonly at: Date }
interface StoredConversation { readonly id: string; readonly startedAt: Date; readonly messages: readonly StoredMessage[] }

/**
 * Redacted conversation text through validated functions (anon may call them; the unguessable conversation id is the capability).
 * Structurally compatible with the assistant module's `ConversationStore`.
 */
export class SupabaseAssistantConversations {
  constructor(private readonly client: SupabaseClient) {}

  private async call<T>(name: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await this.client.rpc(name, args);
    if (error) throw new Error(`${name}: ${error.message}`);
    return data as T;
  }

  async create(conversation: StoredConversation): Promise<void> {
    await this.call('assistant_start_conversation', { p_id: conversation.id });
  }

  async get(id: string): Promise<StoredConversation | undefined> {
    const data = await this.call<{ startedAt: string; messages: { id: string; role: 'user' | 'assistant'; text: string; at: string }[] } | null>('assistant_load_conversation', { p_conversation: id });
    if (!data) return undefined;
    return { id, startedAt: new Date(data.startedAt), messages: data.messages.map((m) => ({ id: m.id, role: m.role, text: m.text, at: new Date(m.at) })) };
  }

  async append(id: string, message: StoredMessage): Promise<void> {
    await this.call('assistant_append_message', { p_conversation: id, p_role: message.role, p_text: message.text.slice(0, 2000) });
  }

  async delete(id: string): Promise<boolean> {
    return this.call<boolean>('assistant_forget_conversation', { p_conversation: id });
  }
}
