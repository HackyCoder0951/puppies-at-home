import { describe, expect, it } from 'vitest';
import { authorityHoursLeft, daysUntil } from '../domain';
import { createPrivacy } from './privacy';
import { RepositoryError, type PrivacyRepository } from './ports';

const customer = { id: 'c1', fullName: 'Aisha Khan', restricted: false, anonymised: false, consents: [] };
const make = (over: Partial<PrivacyRepository> = {}) => {
  const calls: string[] = [];
  const repo = {
    subject: async () => customer,
    anonymiseSubject: async () => (calls.push('anonymise'), { enquiries: 2 }),
    createRequest: async (i: unknown) => (calls.push(JSON.stringify(i)), 'd1'),
    ...over,
  } as unknown as PrivacyRepository;
  return { privacy: createPrivacy(repo), calls };
};

describe('privacy use cases', () => {
  it('erases only after the customer’s name is typed exactly (case-insensitive)', async () => {
    const t = make();
    expect(await t.privacy.anonymiseSubject('c1', null, 'someone else')).toMatchObject({ ok: false, error: { code: 'rule' } });
    expect(t.calls).toEqual([]);
    expect(await t.privacy.anonymiseSubject('c1', 'd1', ' aisha KHAN ')).toEqual({ ok: true, value: { enquiries: 2 } });
    expect(t.calls).toEqual(['anonymise']);
  });

  it('validates requests and incidents before the database', async () => {
    const t = make();
    expect(await t.privacy.createRequest({ type: 'sell-my-data', requester: 'Aisha', contact: 'a@b.co' })).toMatchObject({ ok: false, error: { code: 'invalid', field: 'type' } });
    expect(await t.privacy.createRequest({ type: 'access', requester: 'A', contact: 'a@b.co' })).toMatchObject({ ok: false });
    expect((await t.privacy.createRequest({ type: 'access', requester: 'Aisha Khan', contact: 'a@b.co', details: 'copy please' })).ok).toBe(true);
    expect(await t.privacy.createIncident({ detectedAt: '2026-11-01', awareAt: '2026-11-01', summary: 'x', riskLevel: 'low' })).toMatchObject({ ok: false, error: { field: 'summary' } });
    expect(await t.privacy.withdrawConsent('c1', 'everything')).toEqual({ ok: false, error: { code: 'invalid', field: 'purpose' } });
  });

  it('maps database refusals', async () => {
    const t = make({ restrict: async () => { throw new RepositoryError('forbidden', 'x'); } });
    expect(await t.privacy.restrict('c1', true)).toEqual({ ok: false, error: { code: 'forbidden' } });
  });
});

describe('deadlines', () => {
  it('counts days to a due date and hours left of the 72-hour window', () => {
    const now = new Date('2026-11-10T12:00:00Z');
    expect(daysUntil('2026-11-12T12:00:00Z', now)).toBe(2);
    expect(daysUntil('2026-11-08T12:00:00Z', now)).toBe(-2);
    expect(authorityHoursLeft('2026-11-09T12:00:00Z', now)).toBe(48);
    expect(authorityHoursLeft('2026-11-05T12:00:00Z', now)).toBeLessThan(0);
  });
});
