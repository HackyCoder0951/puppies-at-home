import type { SupabaseClient } from '@supabase/supabase-js';
import type { WhatsAppLedger } from '../../application';

/** Webhook-side writes with the service-role client handed in by the route. */
export class SupabaseWhatsAppLedger implements WhatsAppLedger {
  constructor(private readonly db: SupabaseClient) {}

  async applyStatus(eventId: string, providerId: string, status: string, error: string | null) {
    const { data, error: failure } = await this.db.rpc('apply_whatsapp_status', { p_event_id: eventId, p_provider_id: providerId, p_status: status, p_error: error });
    if (failure) throw new Error(`whatsapp status: ${failure.message}`);
    return String(data);
  }

  async inbound(eventId: string, phone: string, text: string) {
    const { data, error } = await this.db.rpc('record_whatsapp_inbound', { p_event_id: eventId, p_phone: phone, p_text: text });
    if (error) throw new Error(`whatsapp inbound: ${error.message}`);
    return String(data);
  }
}
