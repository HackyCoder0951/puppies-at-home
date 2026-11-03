import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import type { InvoiceDocument } from '../../domain';
import { renderInvoicePdf } from './renderInvoicePdf';

const doc: InvoiceDocument = {
  number: 'INV-2026-0001', status: 'issued', issuedAt: '2026-11-03T08:00:00Z', dueAt: '2026-11-10', currency: 'AED', orderNumber: 'TP-0001',
  customer: { name: 'Layla Ahmed ليلى', email: 'layla@example.test', phone: '+971500000000' },
  lines: [{ description: 'Golden retriever puppy with a long description that has to wrap over more than one line of the table to be readable', quantity: 1, unitMinor: 100000, taxRateBps: 500, taxMinor: 5000 }],
  subtotalMinor: 100000, taxMinor: 5000, totalMinor: 105000, paidMinor: 20000, notes: 'Bank transfer details on request.',
  business: { name: 'TeddyPups U.A.E.', address: 'Downtown Dubai, United Arab Emirates', email: 'hello@example.test', phone: '+971500000001' },
};

describe('renderInvoicePdf', () => {
  it('produces a readable one-page A4 PDF and tolerates characters the built-in font lacks', async () => {
    const bytes = await renderInvoicePdf(doc);
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    const parsed = await PDFDocument.load(bytes);
    expect(parsed.getPageCount()).toBe(1);
    expect(parsed.getTitle()).toBe('Invoice INV-2026-0001');
  });

  it('adds pages for long invoices instead of overflowing', async () => {
    const many = { ...doc, lines: Array.from({ length: 60 }, (_, n) => ({ ...doc.lines[0]!, description: `Item ${n}` })) };
    expect((await PDFDocument.load(await renderInvoicePdf(many))).getPageCount()).toBeGreaterThan(1);
  });

  it('is deterministic for the same invoice', async () => {
    expect(Buffer.from(await renderInvoicePdf(doc)).equals(Buffer.from(await renderInvoicePdf(doc)))).toBe(true);
  });
});
