import type { EmailSender } from '../../application';

/** Resend over HTTPS. The idempotency key makes a retry after a timeout safe (Resend de-duplicates for 24 hours). */
export class ResendEmailSender implements EmailSender {
  readonly id = 'resend';

  constructor(private readonly apiKey: string, private readonly from: string, private readonly fetcher: typeof fetch = fetch) {}

  async send(message: { to: string; subject: string; text: string; html: string; idempotencyKey: string }) {
    const response = await this.fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': message.idempotencyKey },
      body: JSON.stringify({ from: this.from, to: [message.to], subject: message.subject, text: message.text, html: message.html }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Resend responded ${response.status}`);
    const body = (await response.json()) as { id?: string };
    if (!body.id) throw new Error('Resend returned no message id');
    return { providerId: body.id };
  }
}
