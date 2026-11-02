const minutesOf = (hhmm: string): number => {
  const [h = '0', m = '0'] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
};

/** Local minutes since midnight in a time zone. */
export function localMinutes(now: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? '0');
  return (get('hour') % 24) * 60 + get('minute');
}

/** True inside the quiet window; handles windows that wrap midnight (21:00 to 08:00). */
export function isQuietHour(now: Date, start: string, end: string, timeZone: string): boolean {
  const t = localMinutes(now, timeZone);
  const s = minutesOf(start);
  const e = minutesOf(end);
  return s === e ? false : s < e ? t >= s && t < e : t >= s || t < e;
}
