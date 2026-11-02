/** `https://wa.me/<digits>` link for a stored E.164 number, optionally with a prefilled message. */
export function whatsappLinkFor(phoneE164: string | null, text?: string): string | null {
  const digits = (phoneE164 ?? '').replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Search text safe to place inside a PostgREST `or` filter: only letters, digits, space, plus, dot, dash and at. */
export function safeSearch(raw: string): string {
  return raw.replace(/[^\p{L}\p{N}\s+.@-]/gu, '').trim().slice(0, 60);
}
