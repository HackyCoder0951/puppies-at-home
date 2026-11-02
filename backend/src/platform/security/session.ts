/** Session age rules (docs/03-security-privacy section 4): an idle timeout and an absolute lifetime. */
export type SessionVerdict = 'ok' | 'idle' | 'absolute';

export const SEEN_COOKIE = 'tp_seen';
export const START_COOKIE = 'tp_start';

export function evaluateSession(input: { seen?: number; start?: number; now: number; idleMinutes: number; absoluteHours: number }): SessionVerdict {
  const { seen, start, now, idleMinutes, absoluteHours } = input;
  if (start !== undefined && now - start > absoluteHours * 3_600_000) return 'absolute';
  if (seen !== undefined && now - seen > idleMinutes * 60_000) return 'idle';
  return 'ok';
}

export const parseStamp = (value: string | undefined): number | undefined => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};
