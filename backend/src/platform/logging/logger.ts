import { getEnv } from '@backend/config';

type Level = 'debug' | 'info' | 'warn' | 'error';
const order: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

/** Keys whose values must never reach logs. */
const SENSITIVE = /pass(word)?|token|secret|key|authorization|cookie|email|phone|name|address|message|body/i;

function scrub(value: unknown, depth = 0): unknown {
  if (value === null || typeof value !== 'object' || depth > 4) return value;
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => scrub(v, depth + 1));
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SENSITIVE.test(k) ? '[redacted]' : scrub(v, depth + 1)]),
  );
}

export interface Logger {
  debug(msg: string, ctx?: Record<string, unknown>): void;
  info(msg: string, ctx?: Record<string, unknown>): void;
  warn(msg: string, ctx?: Record<string, unknown>): void;
  error(msg: string, ctx?: Record<string, unknown>): void;
  child(ctx: Record<string, unknown>): Logger;
}

/** Structured JSON logger. Personal data fields are redacted by key name; do not log message text on purpose. */
export function createLogger(base: Record<string, unknown> = {}): Logger {
  const emit = (level: Level, msg: string, ctx?: Record<string, unknown>) => {
    if (order[level] < order[getEnv().LOG_LEVEL]) return;
    const line = JSON.stringify({ level, msg, ts: new Date().toISOString(), ...(scrub({ ...base, ...ctx }) as object) });
    (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(line);
  };
  return {
    debug: (m, c) => emit('debug', m, c),
    info: (m, c) => emit('info', m, c),
    warn: (m, c) => emit('warn', m, c),
    error: (m, c) => emit('error', m, c),
    child: (ctx) => createLogger({ ...base, ...ctx }),
  };
}

export const logger = createLogger();
