import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { handleWhatsAppWebhook, whatsappChallenge, type WhatsAppLedger } from '../../application';
import { templateParams } from '../../domain';
import { WhatsAppCloudSender } from './WhatsAppCloudSender';
import { verifyWhatsAppSignature } from './signature';

const SECRET = 'app-secret-for-unit-tests-0123456789';
const sign = (body: string) => `sha256=${createHmac('sha256', SECRET).update(body).digest('hex')}`;

describe('WhatsAppCloudSender', () => {
  it('posts an approved template with positional parameters to digits-only recipients', async () => {
    const calls: { url: string; body: Record<string, unknown>; auth: string | null }[] = [];
    const fetcher = (async (url: string, init: RequestInit) => {
      calls.push({ url, body: JSON.parse(String(init.body)), auth: new Headers(init.headers).get('authorization') });
      return new Response(JSON.stringify({ messages: [{ id: 'wamid.X1' }] }), { status: 200 });
    }) as unknown as typeof fetch;
    const out = await new WhatsAppCloudSender('tok', '1234567890', 'v21.0', fetcher).send({ to: '+971 50 000 0001', templateName: 'enquiry_received_wa', language: 'en', params: ['Aisha', 'TeddyPups'] });
    expect(out.providerId).toBe('wamid.X1');
    expect(calls[0]?.url).toBe('https://graph.facebook.com/v21.0/1234567890/messages');
    expect(calls[0]?.auth).toBe('Bearer tok');
    expect(calls[0]?.body).toMatchObject({ to: '971500000001', type: 'template', template: { name: 'enquiry_received_wa', components: [{ type: 'body', parameters: [{ type: 'text', text: 'Aisha' }, { type: 'text', text: 'TeddyPups' }] }] } });
  });

  it('fails loudly on a provider error or a missing message id', async () => {
    const bad = (async () => new Response('no', { status: 400 })) as unknown as typeof fetch;
    await expect(new WhatsAppCloudSender('t', '123456', 'v21.0', bad).send({ to: '1', templateName: 'x', language: 'en', params: [] })).rejects.toThrow('400');
    const empty = (async () => new Response('{}', { status: 200 })) as unknown as typeof fetch;
    await expect(new WhatsAppCloudSender('t', '123456', 'v21.0', empty).send({ to: '1', templateName: 'x', language: 'en', params: [] })).rejects.toThrow('no message id');
  });
});

describe('signature and handshake', () => {
  it('accepts only the exact HMAC of the raw body', () => {
    expect(verifyWhatsAppSignature('{"a":1}', sign('{"a":1}'), SECRET)).toBe(true);
    expect(verifyWhatsAppSignature('{"a":2}', sign('{"a":1}'), SECRET)).toBe(false);
    expect(verifyWhatsAppSignature('{}', null, SECRET)).toBe(false);
    expect(verifyWhatsAppSignature('{}', 'sha256=zz', SECRET)).toBe(false);
  });
  it('answers the challenge only for the right token', () => {
    expect(whatsappChallenge({ mode: 'subscribe', token: 'good-token', challenge: '1158201444' }, 'good-token')).toBe('1158201444');
    expect(whatsappChallenge({ mode: 'subscribe', token: 'bad', challenge: '1' }, 'good-token')).toBeNull();
    expect(whatsappChallenge({ mode: 'subscribe', token: null, challenge: '1' }, 'good-token')).toBeNull();
  });
});

describe('handleWhatsAppWebhook', () => {
  const run = (body: string, header: string | null, fail = false) => {
    const log: string[] = [];
    const ledger: WhatsAppLedger = {
      applyStatus: async (e, p, s) => { if (fail) throw new Error('db'); log.push(`status ${e} ${p} ${s}`); return 'updated'; },
      inbound: async (e, phone, text) => (log.push(`inbound ${e} ${phone} ${text}`), 'forwarded'),
    };
    return handleWhatsAppWebhook({ appSecret: SECRET, verifySignature: verifyWhatsAppSignature, ledger }, body, header).then((r) => ({ ...r, log }));
  };
  const payload = JSON.stringify({ entry: [{ changes: [{ value: { statuses: [{ id: 'wamid.A', status: 'delivered' }, { id: 'wamid.B', status: 'failed', errors: [{ title: 'Undeliverable' }] }], messages: [{ id: 'wamid.C', from: '971500000001', type: 'text', text: { body: 'STOP' } }, { id: 'wamid.D', from: '971500000001', type: 'image' }] } }] }] });

  it('applies receipts and replies from a correctly signed delivery', async () => {
    const r = await run(payload, sign(payload));
    expect(r).toMatchObject({ status: 200, outcome: 'applied 4' });
    expect(r.log).toEqual(['status wamid.A:delivered wamid.A delivered', 'status wamid.B:failed wamid.B failed', 'inbound wamid.C 971500000001 STOP', 'inbound wamid.D 971500000001 [image]']);
  });
  it('refuses a missing or wrong signature before reading anything', async () => {
    expect(await run(payload, null)).toMatchObject({ status: 401, log: [] });
    expect(await run(payload, sign('other'))).toMatchObject({ status: 401, log: [] });
  });
  it('answers 400 for unreadable bodies and 500 when storage fails so Meta retries', async () => {
    expect((await run('not json', sign('not json'))).status).toBe(400);
    expect((await run(payload, sign(payload), true)).status).toBe(500);
  });
});

describe('templateParams', () => {
  it('lists distinct variables in order of first appearance', () => {
    expect(templateParams('Hi {{customer.first_name}}, order {{order.number}} from {{business.name}}. Bye {{customer.first_name}}')).toEqual(['customer.first_name', 'order.number', 'business.name']);
  });
});
