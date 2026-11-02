import { describe, expect, it } from 'vitest';
import { whatsappLinkFor, safeSearch } from '../domain';
import { createInbox } from './inbox';
import { RepositoryError, type InboxRepository } from './ports';

const repo = (over: Partial<InboxRepository> = {}) =>
  ({
    setStatus: async () => undefined,
    addNote: async () => undefined,
    updateCustomer: async () => undefined,
    getEnquiry: async () => null,
    ...over,
  }) as unknown as InboxRepository;

describe('inbox use cases', () => {
  it('rejects an unknown status and an empty note without touching the repository', async () => {
    let touched = 0;
    const inbox = createInbox(repo({ setStatus: async () => void touched++, addNote: async () => void touched++ }));
    expect(await inbox.setStatus('e1', 'won')).toEqual({ ok: false, error: { code: 'invalid', field: 'status' } });
    expect(await inbox.addNote('e1', '   ')).toEqual({ ok: false, error: { code: 'invalid', field: 'body' } });
    expect(touched).toBe(0);
  });

  it('maps database refusals and missing rows', async () => {
    const inbox = createInbox(repo({ setStatus: async () => { throw new RepositoryError('forbidden', 'x'); } }));
    expect(await inbox.setStatus('e1', 'closed')).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(await inbox.getEnquiry('nope')).toEqual({ ok: false, error: { code: 'not-found' } });
  });

  it('normalises customer input', async () => {
    let saved: unknown;
    const inbox = createInbox(repo({ updateCustomer: async (_id, input) => void (saved = input) }));
    await inbox.updateCustomer('c1', { fullName: ' Aisha K ', email: 'A@B.CO', area: '', notes: '', tags: 'vip, , repeat' });
    expect(saved).toEqual({ fullName: 'Aisha K', email: 'a@b.co', area: null, notes: null, tags: ['vip', 'repeat'] });
    expect(await inbox.updateCustomer('c1', { fullName: 'A', email: '', tags: '' })).toMatchObject({ ok: false });
  });
});

describe('inbox helpers', () => {
  it('builds wa.me links from stored numbers and strips filter syntax from searches', () => {
    expect(whatsappLinkFor('+971541676733', 'Hi there')).toBe('https://wa.me/971541676733?text=Hi%20there');
    expect(whatsappLinkFor(null)).toBeNull();
    expect(safeSearch('a,b)(%_x@y.co')).toBe('abx@y.co');
  });
});
