import type { SupabaseClient } from '@supabase/supabase-js';
import type { IntakeStore } from '../../application';

/** Sends the request through `intake_privacy_request`, the only way the anonymous role can create one. */
export class SupabaseIntakeStore implements IntakeStore {
  constructor(private readonly client: SupabaseClient) {}

  async submit(input: { name: string; contact: string; type: string; details: string }) {
    const { error } = await this.client.rpc('intake_privacy_request', { payload: input });
    if (error) throw new Error(`privacy intake: ${error.message}`);
  }
}
