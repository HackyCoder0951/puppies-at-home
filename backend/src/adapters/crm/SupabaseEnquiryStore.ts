import type { SupabaseClient } from '@supabase/supabase-js';

/** Enquiry as the app's crm module hands it over (structurally compatible with its `Enquiry`). */
export interface EnquiryRecord {
  readonly id: string;
  readonly source: 'contact' | 'puppy';
  readonly name: string;
  readonly phoneE164: string;
  readonly email?: string;
  readonly area?: string;
  readonly puppy?: string;
  readonly message?: string;
  readonly receivedAt: Date;
  readonly consent: { readonly textVersion: string; readonly marketing: boolean; readonly whatsappUpdates: boolean; readonly sourcePage: string };
  readonly ipHash?: string;
  readonly userAgent?: string;
}

/** Stores a validated enquiry through the `create_enquiry` RPC (the only way the anon role can write). */
export class SupabaseEnquiryStore {
  constructor(private readonly client: SupabaseClient) {}

  async save(enquiry: EnquiryRecord): Promise<void> {
    const { error } = await this.client.rpc('create_enquiry', {
      payload: {
        source: enquiry.source,
        name: enquiry.name,
        phone: enquiry.phoneE164,
        email: enquiry.email ?? '',
        area: enquiry.area ?? '',
        puppy: enquiry.puppy ?? '',
        message: enquiry.message ?? '',
        marketing: enquiry.consent.marketing,
        whatsappUpdates: enquiry.consent.whatsappUpdates,
        consentTextVersion: enquiry.consent.textVersion,
        sourcePage: enquiry.consent.sourcePage,
        ipHash: enquiry.ipHash ?? '',
        userAgent: enquiry.userAgent ?? '',
      },
    });
    if (error) throw new Error(`enquiry: ${error.message}`);
  }
}
