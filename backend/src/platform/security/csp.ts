/**
 * Content-Security-Policy builders. Pure functions so the policy is unit tested and the proxy / next.config only wire them in.
 * Admin pages are always rendered per request, so they get a per-request nonce with `strict-dynamic` (no `unsafe-inline` for scripts).
 * Public pages are statically generated and cannot carry a per-request nonce, so scripts allow inline code from the framework itself
 * and every other directive stays tight (no plugins, no framing, no foreign form targets, images and connections only to us and storage).
 */
export interface CspOptions {
  /** Origin of the Supabase project (REST, auth, storage, realtime), if any. */
  readonly supabaseOrigin?: string;
  /** Development servers need eval for hot reload and a websocket for the dev overlay. */
  readonly dev?: boolean;
}

const q = (list: readonly (string | undefined | false)[]) => list.filter(Boolean).join(' ');

function origins(supabaseOrigin: string | undefined, dev: boolean) {
  const ws = supabaseOrigin?.replace(/^http/, 'ws');
  return { image: q(["'self'", 'data:', 'blob:', supabaseOrigin]), connect: q(["'self'", supabaseOrigin, ws, dev && 'ws:']) };
}

export function adminCsp(nonce: string, { supabaseOrigin, dev = false }: CspOptions = {}): string {
  const o = origins(supabaseOrigin, dev);
  return [
    "default-src 'self'",
    `script-src ${q(["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", dev && "'unsafe-eval'"])}`,
    "style-src 'self' 'unsafe-inline'",   // React style attributes need inline styles; scripts are the high-value target
    `img-src ${o.image}`,
    "font-src 'self'",
    `connect-src ${o.connect}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ');
}

export function publicCsp({ supabaseOrigin, dev = false }: CspOptions = {}): string {
  const o = origins(supabaseOrigin, dev);
  return [
    "default-src 'self'",
    `script-src ${q(["'self'", "'unsafe-inline'", dev && "'unsafe-eval'"])}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${o.image}`,
    "font-src 'self'",
    `connect-src ${o.connect}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

/** 128 random bits, base64: unguessable per request. */
export function newNonce(): string {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
}

/** Origin of a URL string, or undefined when it is blank or invalid. */
export function originOf(url: string | undefined): string | undefined {
  try { return url ? new URL(url).origin : undefined; } catch { return undefined; }
}
