import type { WhatsAppSender } from '../../application';

/**
 * WhatsApp Cloud API (Meta Graph) template messages. The recipient is a stored E.164 number; Meta wants digits only.
 * Meta offers no idempotency key, so the message log (one row per outbox event, rule and channel) is what prevents a second send.
 */
export class WhatsAppCloudSender implements WhatsAppSender {
  readonly id = 'whatsapp_cloud';

  constructor(private readonly token: string, private readonly phoneNumberId: string, private readonly version = 'v21.0', private readonly fetcher: typeof fetch = fetch) {}

  async send(message: { to: string; templateName: string; language: string; params: readonly string[] }) {
    const response = await this.fetcher(`https://graph.facebook.com/${this.version}/${this.phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.to.replace(/\D/g, ''),
        type: 'template',
        template: { name: message.templateName, language: { code: message.language }, ...(message.params.length ? { components: [{ type: 'body', parameters: message.params.map((text) => ({ type: 'text', text })) }] } : {}) },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`WhatsApp responded ${response.status}`);
    const body = (await response.json()) as { messages?: { id?: string }[] };
    const id = body.messages?.[0]?.id;
    if (!id) throw new Error('WhatsApp returned no message id');
    return { providerId: id };
  }
}
