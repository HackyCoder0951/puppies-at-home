import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import { requireCronSecret } from '@backend/config';
import { limit } from '../ratelimit';

const digest = (value: string) => createHash('sha256').update(value).digest();

/**
 * Authorises a cron or internal call: `Authorization: Bearer <CRON_SECRET>` compared in constant time, plus the RL-CRON
 * limiter so a leaked or guessed endpoint cannot be hammered. Vercel Cron sends this header automatically.
 */
export async function verifyCronRequest(headers: { get(name: string): string | null }): Promise<boolean> {
  const supplied = /^Bearer (.+)$/.exec(headers.get('authorization') ?? '')?.[1] ?? '';
  const valid = timingSafeEqual(digest(supplied), digest(requireCronSecret()));
  const allowed = (await limit('RL-CRON', headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'cron')).allowed;
  return valid && allowed;
}
