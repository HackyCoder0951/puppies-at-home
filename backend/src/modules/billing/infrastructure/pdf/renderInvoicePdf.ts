import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { formatMoney, formatRate, type InvoiceDocument } from '../../domain';

const PAGE = { w: 595.28, h: 841.89 };   // A4 in points
const MARGIN = 48;
const INK = rgb(0.13, 0.13, 0.15);
const MUTED = rgb(0.42, 0.42, 0.46);
const LINE = rgb(0.85, 0.85, 0.88);

/** The built-in fonts cover Latin-1 only; anything else prints as "?" instead of failing the whole document. */
const safe = (text: string) => Array.from(text.replace(/\s+/g, ' ')).map((ch) => ((ch.codePointAt(0) ?? 63) <= 255 ? ch : '?')).join('');

function wrap(text: string, font: PDFFont, size: number, width: number): string[] {
  const words = safe(text).split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width || !current) current = next;
    else { lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines;
}

const date = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' }) : '-');

/** A4 tax invoice: header, parties, line table with per-line VAT, totals, balance and notes. Deterministic for a given invoice. */
export async function renderInvoicePdf(doc: InvoiceDocument): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Invoice ${doc.number}`);
  pdf.setProducer('TeddyPups');
  pdf.setCreationDate(doc.issuedAt ? new Date(doc.issuedAt) : new Date(0));
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page: PDFPage = pdf.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - MARGIN;
  const right = PAGE.w - MARGIN;

  const text = (s: string, x: number, size = 10, font = regular, color = INK) => page.drawText(safe(s), { x, y, size, font, color });
  const textRight = (s: string, xRight: number, size = 10, font = regular, color = INK) => page.drawText(safe(s), { x: xRight - font.widthOfTextAtSize(safe(s), size), y, size, font, color });
  const rule = () => page.drawLine({ start: { x: MARGIN, y }, end: { x: right, y }, thickness: 0.6, color: LINE });
  const ensure = (needed: number) => {
    if (y - needed >= MARGIN + 30) return;
    page = pdf.addPage([PAGE.w, PAGE.h]);
    y = PAGE.h - MARGIN;
  };

  text(doc.business.name, MARGIN, 18, bold);
  textRight('TAX INVOICE', right, 14, bold, MUTED);
  y -= 16;
  for (const line of [doc.business.address, doc.business.email, doc.business.phone].filter(Boolean)) { text(line, MARGIN, 9, regular, MUTED); y -= 12; }
  y -= 10;
  rule();
  y -= 22;

  const meta: [string, string][] = [['Invoice', doc.number], ['Order', doc.orderNumber], ['Issued', date(doc.issuedAt)], ['Due', date(doc.dueAt)]];
  const top = y;
  text('Bill to', MARGIN, 9, regular, MUTED);
  y -= 14;
  text(doc.customer.name, MARGIN, 11, bold);
  y -= 13;
  for (const line of [doc.customer.email, doc.customer.phone].filter((v): v is string => Boolean(v))) { text(line, MARGIN, 9); y -= 12; }
  const afterParty = y;
  y = top;
  for (const [label, value] of meta) { text(label, 360, 9, regular, MUTED); textRight(value, right, 10, bold); y -= 14; }
  y = Math.min(y, afterParty) - 18;

  const col = { desc: MARGIN, qty: 330, unit: 395, vat: 445, total: right };
  text('Description', col.desc, 9, bold, MUTED);
  textRight('Qty', col.qty + 20, 9, bold, MUTED);
  textRight('Unit', col.unit + 40, 9, bold, MUTED);
  textRight('VAT', col.vat + 40, 9, bold, MUTED);
  textRight('Amount', col.total, 9, bold, MUTED);
  y -= 8;
  rule();
  y -= 16;
  for (const l of doc.lines) {
    const desc = wrap(l.description, regular, 10, col.qty - col.desc - 12);
    ensure(desc.length * 13 + 10);
    const lineNet = l.unitMinor * l.quantity;
    text(desc[0] ?? '', col.desc);
    textRight(String(l.quantity), col.qty + 20);
    textRight(formatMoney(l.unitMinor, doc.currency).replace(`${doc.currency} `, ''), col.unit + 40);
    textRight(`${formatRate(l.taxRateBps)}`, col.vat + 40, 9, regular, MUTED);
    textRight(formatMoney(lineNet, doc.currency).replace(`${doc.currency} `, ''), col.total);
    for (const extra of desc.slice(1)) { y -= 13; text(extra, col.desc); }
    y -= 18;
  }
  rule();
  y -= 18;
  const total = (label: string, value: string, strong = false) => {
    ensure(20);
    text(label, 360, strong ? 11 : 10, strong ? bold : regular, strong ? INK : MUTED);
    textRight(value, right, strong ? 11 : 10, strong ? bold : regular);
    y -= strong ? 18 : 15;
  };
  total('Subtotal', formatMoney(doc.subtotalMinor, doc.currency));
  total('VAT', formatMoney(doc.taxMinor, doc.currency));
  total('Total', formatMoney(doc.totalMinor, doc.currency), true);
  total('Paid', formatMoney(doc.paidMinor, doc.currency));
  total('Balance due', formatMoney(Math.max(0, doc.totalMinor - doc.paidMinor), doc.currency), true);

  if (doc.notes) {
    y -= 12;
    ensure(40);
    text('Notes', MARGIN, 9, bold, MUTED);
    y -= 14;
    for (const line of wrap(doc.notes, regular, 9, right - MARGIN)) { ensure(14); text(line, MARGIN, 9); y -= 12; }
  }
  for (const p of pdf.getPages()) p.drawText(safe(`${doc.business.name} - Invoice ${doc.number}`), { x: MARGIN, y: 28, size: 8, font: regular, color: MUTED });
  return pdf.save({ useObjectStreams: false });
}
