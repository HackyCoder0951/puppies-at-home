import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoiceDocument, InvoiceStatus } from '../../domain';

interface Db {
  number: string | null; status: InvoiceStatus; issued_at: string | null; due_at: string | null; currency: string; subtotal_minor: number; tax_minor: number; total_minor: number; paid_minor: number; notes: string | null;
  orders: { number: string } | null; customers: { full_name: string; email: string | null; phone_e164: string | null } | null;
  invoice_lines: { description: string; quantity: number; unit_minor: number; tax_rate_bps: number; tax_minor: number; sort_order: number }[];
}

/** Reads one invoice with its customer and the business details. Works with a staff session or the service role (the email worker). */
export async function loadInvoiceDocument(client: SupabaseClient, invoiceId: string): Promise<InvoiceDocument | null> {
  const { data, error } = await client
    .from('invoices')
    .select('number, status, issued_at, due_at, currency, subtotal_minor, tax_minor, total_minor, paid_minor, notes, orders(number), customers(full_name, email, phone_e164), invoice_lines(description, quantity, unit_minor, tax_rate_bps, tax_minor, sort_order)')
    .eq('id', invoiceId)
    .maybeSingle();
  if (error) throw new Error(`invoice document: ${error.message}`);
  const i = data as unknown as Db | null;
  if (!i || !i.number || i.status === 'draft') return null;
  const { data: settings, error: settingsError } = await client.from('site_settings').select('key, value').in('key', ['address', 'email', 'phone_href']);
  if (settingsError) throw new Error(`invoice document settings: ${settingsError.message}`);
  const s = new Map((settings ?? []).map((r: { key: string; value: unknown }) => [r.key, String(r.value)]));
  return {
    number: i.number, status: i.status, issuedAt: i.issued_at, dueAt: i.due_at, currency: i.currency, orderNumber: i.orders?.number ?? '',
    customer: { name: i.customers?.full_name ?? '', email: i.customers?.email ?? null, phone: i.customers?.phone_e164 ?? null },
    lines: [...i.invoice_lines].sort((a, b) => a.sort_order - b.sort_order).map((l) => ({ description: l.description, quantity: l.quantity, unitMinor: Number(l.unit_minor), taxRateBps: l.tax_rate_bps, taxMinor: Number(l.tax_minor) })),
    subtotalMinor: Number(i.subtotal_minor), taxMinor: Number(i.tax_minor), totalMinor: Number(i.total_minor), paidMinor: Number(i.paid_minor), notes: i.notes,
    business: { name: 'TeddyPups U.A.E.', address: s.get('address') ?? '', email: s.get('email') ?? '', phone: (s.get('phone_href') ?? '').replace(/^tel:/, '') },
  };
}
