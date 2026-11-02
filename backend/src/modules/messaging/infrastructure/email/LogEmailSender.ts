import type { EmailSender } from '../../application';

/** Local and test sender: nothing leaves the machine; the message log shows what would have been sent. */
export class LogEmailSender implements EmailSender {
  readonly id = 'log';

  async send(message: { to: string; subject: string; idempotencyKey: string }) {
    return { providerId: `log-${message.idempotencyKey}` };
  }
}
