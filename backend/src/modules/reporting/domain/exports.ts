import { minorToDecimal } from './csv';

export const EXPORT_KINDS = ['enquiries', 'orders', 'payments', 'invoices'] as const;
export type ExportKind = (typeof EXPORT_KINDS)[number];

type Row = Record<string, unknown>;
interface Column { header: string; value: (row: Row) => unknown }
const text = (key: string): Column => ({ header: key, value: (r) => r[key] });
const money = (key: string, header = key.replace(/_minor$/, '')): Column => ({ header, value: (r) => minorToDecimal(r[key]) });
const date = (key: string): Column => ({ header: key, value: (r) => (typeof r[key] === 'string' ? (r[key] as string).slice(0, 19).replace('T', ' ') : r[key]) });

export const EXPORT_COLUMNS: Record<ExportKind, readonly Column[]> = {
  enquiries: [date('created_at'), text('name'), text('phone'), text('email'), text('area'), text('source'), text('status'), text('puppy'), text('source_page')],
  orders: [text('number'), date('created_at'), text('customer'), text('type'), text('status'), text('currency'), money('total_minor', 'total_ex_vat'), money('tax_minor', 'vat'), money('paid_minor', 'paid'), money('balance_minor', 'balance')],
  payments: [date('paid_at'), text('order_number'), text('invoice_number'), text('gateway'), text('gateway_ref'), text('method'), text('status'), text('currency'), money('amount_minor', 'amount')],
  invoices: [text('number'), date('issued_at'), text('due_at'), text('customer'), text('status'), text('currency'), money('subtotal_minor', 'subtotal'), money('tax_minor', 'vat'), money('total_minor', 'total'), money('paid_minor', 'paid')],
};

export const isExportKind = (value: string): value is ExportKind => (EXPORT_KINDS as readonly string[]).includes(value);

export interface DashboardStats {
  readonly enquiries: { new: number; open: number; unassigned: number; last7days: number };
  readonly orders: { open: number; byStatus: Record<string, number>; createdThisMonth: number };
  readonly deliveries: { open: number; delayed: number };
  readonly money: { paidThisMonthMinor: number; outstandingMinor: number; overdueInvoices: number; failedPayments7days: number; refundsWaiting: number };
  readonly puppies: { available: number; reserved: number; drafts: number };
  readonly system: { outboxPending: number; outboxFailed: number; oldestPendingMinutes: number };
}
