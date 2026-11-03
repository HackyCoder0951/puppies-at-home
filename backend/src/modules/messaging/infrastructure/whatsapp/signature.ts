import { createHmac, timingSafeEqual } from 'node:crypto';

/** Meta signs the raw request body with the app secret: `X-Hub-Signature-256: sha256=<hex hmac>`. Constant-time comparison. */
export function verifyWhatsAppSignature(rawBody: string, header: string | null, appSecret: string): boolean {
  const match = /^sha256=([0-9a-f]{64})$/i.exec(header ?? '');
  if (!match?.[1]) return false;
  const expected = createHmac('sha256', appSecret).update(rawBody).digest();
  return timingSafeEqual(expected, Buffer.from(match[1], 'hex'));
}
