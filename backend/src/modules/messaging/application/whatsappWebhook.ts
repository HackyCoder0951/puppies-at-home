/** Provider-neutral handling of WhatsApp Cloud API webhook deliveries: receipts and customer replies. */
export interface WhatsAppLedger {
  applyStatus(eventId: string, providerId: string, status: string, error: string | null): Promise<string>;
  inbound(eventId: string, phone: string, text: string): Promise<string>;
}

export interface WhatsAppWebhookDeps {
  readonly appSecret: string;
  readonly verifySignature: (rawBody: string, header: string | null, secret: string) => boolean;
  readonly ledger: WhatsAppLedger;
}

interface Change {
  value?: {
    statuses?: { id?: string; status?: string; errors?: { title?: string; message?: string }[] }[];
    messages?: { id?: string; from?: string; type?: string; text?: { body?: string } }[];
  };
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');

/**
 * Verifies the signature on the raw body, then applies every receipt and reply in it. Bad signatures are refused (401),
 * unreadable bodies are 400, and a storage failure answers 500 so Meta retries (every write is idempotent on its event id).
 */
export async function handleWhatsAppWebhook(deps: WhatsAppWebhookDeps, rawBody: string, signature: string | null): Promise<{ status: number; outcome: string }> {
  if (!deps.verifySignature(rawBody, signature, deps.appSecret)) return { status: 401, outcome: 'invalid signature' };
  let payload: { entry?: { changes?: Change[] }[] };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return { status: 400, outcome: 'unreadable body' };
  }
  let applied = 0;
  try {
    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        for (const s of change.value?.statuses ?? []) {
          const id = str(s.id);
          const status = str(s.status);
          if (!id || !status) continue;
          await deps.ledger.applyStatus(`${id}:${status}`, id, status, s.errors?.[0]?.title ?? s.errors?.[0]?.message ?? null);
          applied += 1;
        }
        for (const m of change.value?.messages ?? []) {
          const id = str(m.id);
          const from = str(m.from);
          if (!id || !from) continue;
          await deps.ledger.inbound(id, from, m.type === 'text' ? str(m.text?.body) : `[${str(m.type) || 'message'}]`);
          applied += 1;
        }
      }
    }
  } catch {
    return { status: 500, outcome: 'could not record' };
  }
  return { status: 200, outcome: `applied ${applied}` };
}

/** Meta's one-time subscription handshake: echo the challenge only when the shared verify token matches. */
export function whatsappChallenge(query: { mode: string | null; token: string | null; challenge: string | null }, verifyToken: string): string | null {
  return query.mode === 'subscribe' && query.token !== null && query.token === verifyToken && query.challenge ? query.challenge : null;
}
