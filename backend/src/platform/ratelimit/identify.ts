import { createHmac } from 'node:crypto';
import { getEnv } from '@backend/config';

/** Salted hash of an identifier (IP, email, phone). Plain values never reach the limiter store or the logs. */
export function hashIdentifier(value: string): string {
  const salt = getEnv().IP_HASH_SALT ?? 'local-development-salt';
  return createHmac('sha256', salt).update(value.trim().toLowerCase()).digest('hex').slice(0, 32);
}

/** Client IP from the trusted proxy header (first hop). Falls back to a constant for local use. */
export function clientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip') || 'local';
}
