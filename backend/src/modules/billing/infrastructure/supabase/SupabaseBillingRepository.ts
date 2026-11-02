import type { SupabaseClient } from '@supabase/supabase-js';
import {
  PAGE_SIZE, type InvoiceDetail, type InvoiceQuery, type InvoiceRow, type InvoiceStatus, type OrderMoney, type PaymentMethod, type PaymentRow, type PaymentStatus,
  type RefundRow, type RefundStatus, type TaxRate,
} from '../../domain';
import { RepositoryError, type BillingRepository, type PaymentInput, type RefundRequest } from '../../application';

type Failure = { code?: string; message: string } | null;

function fail(error: Failure): never {
  const message = error?.message ?? 'unknown';
  switch (error?.code) {
    case '42501': throw new RepositoryError('forbidden', message);
    case 'P0001': case '22023': throw new RepositoryError('rule', message);   // raised by our own functions: written for staff
    default: throw new RepositoryError('unavailable', message);
  }
}

interface InvoiceDb {
  id: string; number: string | null; order_id: string; customer_id: string; status: InvoiceStatus; total_minor: number; paid_minor: number; currency: string; due_at: string | null; issued_at: string | null;
  orders: { number: string } | null; customers: { full_name: string } | null;
}
interface RefundDb { id: string; payment_id: string; amount_minor: number; reason: string; status: RefundStatus; requested_by: string | null; decided_by: string | null; decision_note: string | null; created_at: string }
interface PaymentDb {
  id: string; order_id: string; invoice_id: string | null; gateway: string; gateway_ref: string; method: PaymentMethod; amount_minor: number; currency: string; status: PaymentStatus; paid_at: string; note: string | null; recorded_by: string | null;
  orders: { number: string } | null; invoices: { number: string | null } | null; refunds?: RefundDb[];
}

const INVOICE_LIST = 'id, number, order_id, customer_id, status, total_minor, paid_minor, currency, due_at, issued_at, orders(number), customers(full_name)';
const PAYMENT_BASE = 'id, order_id, invoice_id, gateway, gateway_ref, method, amount_minor, currency, status, paid_at, note, recorded_by, orders(number), invoices(number)';
const REFUND_COLUMNS = 'id, payment_id, amount_minor, reason, status, requested_by, decided_by, decision_note, created_at';
const PAYMENT_SELECT = `${PAYMENT_BASE}, refunds(${REFUND_COLUMNS})`;

export class SupabaseBillingRepository implements BillingRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async rpc<T = null>(name: string, args: Record<string, unknown>): Promise<T> {
    const { data, error } = await this.client.rpc(name, args);
    if (error) fail(error);
    return data as T;
  }

  private async staffNames(): Promise<Map<string, string>> {
    const rows = (await this.rpc<{ user_id: string; full_name: string }[]>('list_staff', {})) ?? [];
    return new Map(rows.map((s) => [s.user_id, s.full_name]));
  }

  private invoiceRow = (i: InvoiceDb): InvoiceRow => ({
    id: i.id, number: i.number, orderId: i.order_id, orderNumber: i.orders?.number ?? '', customerName: i.customers?.full_name ?? 'Unknown', status: i.status,
    totalMinor: Number(i.total_minor), paidMinor: Number(i.paid_minor), currency: i.currency, dueAt: i.due_at, issuedAt: i.issued_at,
  });

  private paymentRow(p: PaymentDb, staff: Map<string, string>): PaymentRow {
    const name = (id: string | null) => (id ? (staff.get(id) ?? 'Former staff member') : null);
    return {
      id: p.id, orderId: p.order_id, orderNumber: p.orders?.number ?? '', invoiceId: p.invoice_id, invoiceNumber: p.invoices?.number ?? null, gateway: p.gateway, reference: p.gateway_ref,
      method: p.method, amountMinor: Number(p.amount_minor), currency: p.currency, status: p.status, paidAt: p.paid_at, note: p.note, recordedByName: name(p.recorded_by),
      refunds: [...(p.refunds ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)).map((r): RefundRow => ({
        id: r.id, paymentId: r.payment_id, amountMinor: Number(r.amount_minor), reason: r.reason, status: r.status, requestedByName: name(r.requested_by) ?? 'Former staff member', decidedByName: name(r.decided_by),
        decisionNote: r.decision_note, createdAt: r.created_at,
      })),
    };
  }

  async listInvoices(q: InvoiceQuery) {
    let query = this.client.from('invoices').select(INVOICE_LIST, { count: 'exact' });
    if (q.status) query = query.eq('status', q.status);
    const { data, count, error } = await query.order('created_at', { ascending: false }).range((q.page - 1) * PAGE_SIZE, q.page * PAGE_SIZE - 1);
    if (error) fail(error);
    return { rows: (data as unknown as InvoiceDb[]).map(this.invoiceRow), total: count ?? 0 };
  }

  async getInvoice(id: string): Promise<InvoiceDetail | null> {
    const { data, error } = await this.client
      .from('invoices')
      .select(`${INVOICE_LIST}, subtotal_minor, tax_minor, notes, void_reason, invoice_lines(description, quantity, unit_minor, tax_rate_bps, tax_minor, sort_order)`)
      .eq('id', id)
      .maybeSingle();
    if (error) fail(error);
    if (!data) return null;
    const i = data as unknown as InvoiceDb & { subtotal_minor: number; tax_minor: number; notes: string | null; void_reason: string | null; invoice_lines: { description: string; quantity: number; unit_minor: number; tax_rate_bps: number; tax_minor: number; sort_order: number }[] };
    const { data: payments, error: payError } = await this.client.from('payments').select(PAYMENT_SELECT).eq('invoice_id', id).order('paid_at');
    if (payError) fail(payError);
    const staff = await this.staffNames();
    return {
      ...this.invoiceRow(i), customerId: i.customer_id, subtotalMinor: Number(i.subtotal_minor), taxMinor: Number(i.tax_minor), notes: i.notes, voidReason: i.void_reason,
      lines: [...i.invoice_lines].sort((a, b) => a.sort_order - b.sort_order).map((l) => ({ description: l.description, quantity: l.quantity, unitMinor: Number(l.unit_minor), taxRateBps: l.tax_rate_bps, taxMinor: Number(l.tax_minor) })),
      payments: (payments as unknown as PaymentDb[]).map((p) => this.paymentRow(p, staff)),
    };
  }

  createInvoice(orderId: string, dueAt: string | null, notes: string | null) {
    return this.rpc<string>('create_invoice', { p_order: orderId, p_due: dueAt, p_notes: notes });
  }

  async updateDraft(invoiceId: string, dueAt: string | null, notes: string | null) {
    await this.rpc('update_invoice_draft', { p_invoice: invoiceId, p_due: dueAt, p_notes: notes });
  }

  issueInvoice(invoiceId: string, dueAt: string | null) {
    return this.rpc<string>('issue_invoice', { p_invoice: invoiceId, p_due: dueAt });
  }

  async voidInvoice(invoiceId: string, reason: string) {
    await this.rpc('void_invoice', { p_invoice: invoiceId, p_reason: reason });
  }

  async orderMoney(orderId: string): Promise<OrderMoney> {
    const [invoices, payments, staff] = await Promise.all([
      this.client.from('invoices').select(INVOICE_LIST).eq('order_id', orderId).order('created_at'),
      this.client.from('payments').select(PAYMENT_SELECT).eq('order_id', orderId).order('paid_at'),
      this.staffNames(),
    ]);
    if (invoices.error) fail(invoices.error);
    if (payments.error) fail(payments.error);
    return { invoices: (invoices.data as unknown as InvoiceDb[]).map(this.invoiceRow), payments: (payments.data as unknown as PaymentDb[]).map((p) => this.paymentRow(p, staff)) };
  }

  async listPayments(page: number, customerId?: string) {
    const query = customerId ? this.client.from('payments').select(`${PAYMENT_SELECT}, customer:orders!inner(customer_id)`, { count: 'exact' }).eq('customer.customer_id', customerId) : this.client.from('payments').select(PAYMENT_SELECT, { count: 'exact' });
    const { data, count, error } = await query.order('paid_at', { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (error) fail(error);
    const staff = await this.staffNames();
    return { rows: (data as unknown as PaymentDb[]).map((p) => this.paymentRow(p, staff)), total: count ?? 0 };
  }

  recordPayment(input: PaymentInput) {
    return this.rpc<{ id: string; duplicate: boolean }>('record_manual_payment', {
      p_order: input.orderId, p_invoice: input.invoiceId, p_reference: input.reference, p_method: input.method, p_amount_minor: input.amountMinor, p_note: input.note,
    });
  }

  requestRefund(input: RefundRequest) {
    return this.rpc<string>('request_refund', { p_payment: input.paymentId, p_amount_minor: input.amountMinor, p_reason: input.reason });
  }

  decideRefund(refundId: string, approve: boolean, note: string | null) {
    return this.rpc<'processed' | 'approved' | 'rejected'>('decide_refund', { p_refund: refundId, p_approve: approve, p_note: note });
  }

  async refundContext(refundId: string) {
    const rows = await this.rpc<{ refund_id: string; amount_minor: number; gateway: string; gateway_ref: string; reason: string }[]>('refund_context', { p_refund: refundId });
    const r = rows?.[0];
    return r ? { refundId: r.refund_id, amountMinor: Number(r.amount_minor), gateway: r.gateway, gatewayRef: r.gateway_ref, reason: r.reason } : null;
  }

  async completeGatewayRefund(refundId: string, gatewayRef: string) {
    await this.rpc('complete_gateway_refund', { p_refund: refundId, p_gateway_ref: gatewayRef });
  }

  async failGatewayRefund(refundId: string, error: string) {
    await this.rpc('fail_gateway_refund', { p_refund: refundId, p_error: error });
  }

  startGatewayPayment(input: { orderId: string; invoiceId: string | null; gateway: string; gatewayRef: string; amountMinor: number; url: string }) {
    return this.rpc<string>('start_gateway_payment', { p_order: input.orderId, p_invoice: input.invoiceId, p_gateway: input.gateway, p_ref: input.gatewayRef, p_amount_minor: input.amountMinor, p_url: input.url });
  }

  async pendingRefunds() {
    const { data, error } = await this.client.from('refunds').select(`${REFUND_COLUMNS}, payments(${PAYMENT_BASE})`).eq('status', 'requested').order('created_at');
    if (error) fail(error);
    const staff = await this.staffNames();
    return (data as unknown as (RefundDb & { payments: PaymentDb })[]).map((r) => ({ ...this.paymentRow({ ...r.payments, refunds: [r] }, staff), refundId: r.id }));
  }

  async taxRates(): Promise<TaxRate[]> {
    const { data, error } = await this.client.from('tax_rates').select('id, name, rate_bps, is_default').order('created_at', { ascending: false });
    if (error) fail(error);
    return (data as { id: string; name: string; rate_bps: number; is_default: boolean }[]).map((t) => ({ id: t.id, name: t.name, rateBps: t.rate_bps, isDefault: t.is_default }));
  }

  async setDefaultTaxRate(name: string, rateBps: number) {
    await this.rpc('set_default_tax_rate', { p_name: name, p_rate_bps: rateBps });
  }
}
