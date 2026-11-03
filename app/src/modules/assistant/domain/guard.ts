/** Pure safety rules (docs/03 and 28): what may enter the model, what may leave it. No framework imports. */
const EMAIL = /[\w.+-]+@[\w-]+\.[\w.]+/g;
const PHONE = /\+?\d[\d\s().-]{7,}\d/g;
const INJECTION = /ignore (all |any |the )?(previous|prior|above|earlier)|disregard (the |your )?(rules|instructions)|(reveal|show|print|repeat) (me )?(your |the )?(system )?(prompt|instructions)|you are now|act as (an? )?(?!puppy)|jailbreak|developer mode|pretend (to be|you are)/i;
const PRICE = /\b(price|prices|pricing|cost|costs|how much|expensive|cheap|afford|discount|fee|fees|payment|deposit|installment)\b|\bAED\b|\bdhs?\b|[$€£]\s?\d/i;
/** Never in an answer: money, promises about timing or health outcomes, or medical advice. */
const BANNED_OUTPUT = /\b(AED|USD|EUR|dhs?)\s?\d|\d\s?(AED|USD|dhs?)\b|[$€£]\s?\d|\bguarantee[sd]?\b.*\b(deliver|arrive|by)\b|\bwill (definitely|certainly) (arrive|be delivered)\b|\bopen (daily|from|until)\b|\bhours? (are|is)\b/i;

export interface InputVerdict {
  /** The text with email and phone numbers removed: only this goes to the model and the log. */
  readonly redacted: string;
  readonly injection: boolean;
  readonly personalData: boolean;
  readonly asksPrice: boolean;
}

export const redact = (text: string): string => text.replace(EMAIL, '[email]').replace(PHONE, '[phone]');

export function checkInput(text: string): InputVerdict {
  const redacted = redact(text);
  return { redacted, injection: INJECTION.test(text), personalData: redacted !== text, asksPrice: PRICE.test(text) };
}

export interface Evidence {
  readonly ids: ReadonlySet<string>;
  /** Paths and URLs the answer may link to (this turn's results plus the fixed site pages). */
  readonly links: ReadonlySet<string>;
  readonly knownNames: readonly { id: string; name: string }[];
  readonly businessContacts: readonly string[];
}
export type OutputVerdict = { readonly ok: true } | { readonly ok: false; readonly reason: 'unknown-puppy' | 'link' | 'contact' | 'banned' };

const SITE_PATHS = ['/puppies', '/faq', '/contact', '/how-it-works', '/families', '/gone-home'];

/** A segment passes only if everything it names is in this turn's evidence. */
export function verifySegment(text: string, evidence: Evidence): OutputVerdict {
  if (BANNED_OUTPUT.test(text)) return { ok: false, reason: 'banned' };
  for (const { id, name } of evidence.knownNames) {
    if (new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text) && !evidence.ids.has(id)) return { ok: false, reason: 'unknown-puppy' };
  }
  for (const m of text.match(/https?:\/\/[^\s)]+|\/[a-z][a-z0-9/_-]*/gi) ?? []) {
    const link = m.replace(/[.,;:!?]+$/, '');
    if (!evidence.links.has(link) && !SITE_PATHS.some((p) => link === p) && ![...evidence.links].some((l) => l.includes('://') && link.startsWith(l.split('?')[0] ?? l))) return { ok: false, reason: 'link' };
  }
  const digits = (s: string) => s.replace(/\D/g, '');
  for (const m of [...(text.match(EMAIL) ?? []), ...(text.match(PHONE) ?? [])]) {
    if (!evidence.businessContacts.some((c) => digits(c) && digits(m).includes(digits(c))) && !evidence.businessContacts.includes(m)) return { ok: false, reason: 'contact' };
  }
  return { ok: true };
}
