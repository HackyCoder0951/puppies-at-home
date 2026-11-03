/** `{{ variable }}` substitution with no logic or code; unknown variables render as empty text. */
export function renderTemplate(template: string, vars: Readonly<Record<string, string>>): string {
  return template.replace(/\{\{\s*([^}]*?)\s*\}\}/g, (_, name: string) => vars[name] ?? '');
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, (c) => ESCAPES[c] ?? c);

/** Plain text to a minimal HTML email body (escaped, paragraphs from blank lines). */
export function textToHtml(text: string): string {
  return text.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`).join('');
}

export const firstName = (fullName: string): string => fullName.trim().split(/\s+/)[0] ?? '';

/** Variables a template may use (mirrors `app_private.allowed_template_vars`). */
export const TEMPLATE_VARIABLES = [
  'customer.name', 'customer.first_name', 'order.number', 'order.status', 'order.total', 'order.balance', 'puppy.name', 'puppy.breed', 'delivery.method',
  'delivery.tracking_no', 'delivery.eta', 'delivery.carrier', 'delivery.status', 'delivery.note', 'delivery.location', 'invoice.number', 'invoice.total', 'invoice.due_date',
  'payment.amount', 'payment.method', 'payment.reference', 'refund.amount', 'business.name', 'business.phone', 'business.whatsapp_url', 'enquiry.message',
  'digest.date', 'digest.new_enquiries', 'digest.open_enquiries', 'digest.orders_to_confirm', 'digest.overdue_invoices', 'digest.refunds_waiting', 'digest.delayed_deliveries',
] as const;

export const SAMPLE_VARIABLES: Readonly<Record<string, string>> = {
  'customer.name': 'Aisha Khan', 'customer.first_name': 'Aisha', 'order.number': 'TP-2026-000123', 'order.status': 'Preparing', 'order.total': 'AED 4,725', 'order.balance': 'AED 3,725',
  'puppy.name': 'Max', 'puppy.breed': 'Maltipoo', 'delivery.method': 'Dubai delivery', 'delivery.tracking_no': 'TRK-12345', 'delivery.eta': '2026-11-20', 'delivery.carrier': 'Own van',
  'delivery.status': 'Dispatched', 'delivery.note': 'On the way.', 'delivery.location': 'Sheikh Zayed Road', 'invoice.number': 'INV-2026-000045', 'invoice.total': 'AED 4,725',
  'invoice.due_date': '2026-11-30', 'payment.amount': 'AED 1,000', 'payment.method': 'Bank transfer', 'payment.reference': 'REF-0001', 'refund.amount': 'AED 300',
  'business.name': 'TeddyPups U.A.E.', 'business.phone': '+971 54 167 6733', 'business.whatsapp_url': 'https://wa.me/971541676733', 'enquiry.message': 'Is Max still available?',
  'digest.date': '03 Nov 2026', 'digest.new_enquiries': '4', 'digest.open_enquiries': '11', 'digest.orders_to_confirm': '2', 'digest.overdue_invoices': '1', 'digest.refunds_waiting': '0', 'digest.delayed_deliveries': '1',
};

/** `https://wa.me/<digits>?text=...` for a stored E.164 number. */
export function whatsappLink(phoneE164: string, text: string): string {
  return `https://wa.me/${phoneE164.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}
