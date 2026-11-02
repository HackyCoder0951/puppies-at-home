import { describe, expect, it } from 'vitest';
import { csvCell, minorToDecimal, toCsv } from '../domain';
import { createReporting, RepositoryError, type ReportingRepository } from './reporting';

describe('csv', () => {
  it('quotes, escapes and neutralises formulas', () => {
    expect(csvCell('plain')).toBe('plain');
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    for (const evil of ['=1+1', '+SUM(A1)', '-2+3', '@cmd', '\tfoo']) expect(csvCell(evil).replace(/^"|"$/g, '')).toMatch(/^'/);
    expect(csvCell(42)).toBe('42');
    expect(csvCell(null)).toBe('');
    expect(toCsv(['a', 'b'], [[1, 'x,y']])).toBe('﻿a,b\r\n1,"x,y"\r\n');
    expect(minorToDecimal(450050)).toBe('4500.50');
  });
});

describe('exports', () => {
  const make = (over: Partial<ReportingRepository> = {}, wait = 0) => {
    const audit: unknown[] = [];
    const repo = { currentUserId: async () => 'u1', rows: async () => [{ number: 'TP-1', created_at: '2026-11-02T10:00:00+00:00', customer: '=HYPERLINK("x")', type: 'local', status: 'new', currency: 'AED', total_minor: 100000, tax_minor: 5000, paid_minor: 0, balance_minor: 105000 }], ...over } as unknown as ReportingRepository;
    return { reporting: createReporting({ repo, audit: { record: async (e) => void audit.push(e) }, limiter: { hit: async () => wait } }), audit };
  };

  it('produces a named CSV in AED decimals, neutralises customer names and audits the export', async () => {
    const { reporting, audit } = make();
    const r = await reporting.exportCsv('orders', '2026-11-01', '2026-11-30');
    if (!r.ok) throw new Error('export failed');
    expect(r.value.filename).toBe('teddypups-orders-2026-11-01-to-2026-11-30.csv');
    expect(r.value.csv).toContain('TP-1,2026-11-02 10:00:00,\'=HYPERLINK("x"),local,new,AED,1000.00,50.00,0.00,1050.00'.replace('\'=HYPERLINK("x")', '"\'=HYPERLINK(""x"")"'));
    expect(audit).toEqual([{ actorId: 'u1', kind: 'orders', from: '2026-11-01', to: '2026-11-30', rows: 1 }]);
  });

  it('rejects unknown kinds and bad dates, applies the limiter and maps denials', async () => {
    const { reporting, audit } = make();
    expect(await reporting.exportCsv('customers', '2026-11-01', '2026-11-30')).toEqual({ ok: false, error: { code: 'invalid', field: 'kind' } });
    expect(await reporting.exportCsv('orders', '01/11/2026', '2026-11-30')).toEqual({ ok: false, error: { code: 'invalid', field: 'range' } });
    expect(await make({}, 90).reporting.exportCsv('orders', '2026-11-01', '2026-11-30')).toEqual({ ok: false, error: { code: 'rate-limited', retryAfterSeconds: 90 } });
    const denied = make({ rows: async () => { throw new RepositoryError('forbidden', 'x'); } });
    expect(await denied.reporting.exportCsv('payments', '2026-11-01', '2026-11-30')).toEqual({ ok: false, error: { code: 'forbidden' } });
    expect(denied.audit).toEqual([]);
    expect(audit).toEqual([]);
  });
});
