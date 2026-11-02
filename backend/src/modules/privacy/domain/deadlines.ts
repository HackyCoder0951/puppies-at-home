const DAY_MS = 86_400_000;

/** Whole days until a due date (negative when overdue). */
export const daysUntil = (iso: string, now: Date): number => Math.ceil((new Date(iso).getTime() - now.getTime()) / DAY_MS);

/** Hours left of the 72-hour window to notify the authority, counted from when the business became aware. */
export const authorityHoursLeft = (awareIso: string, now: Date): number => Math.round(72 - (now.getTime() - new Date(awareIso).getTime()) / 3_600_000);
