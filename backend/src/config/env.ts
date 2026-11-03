import { z } from 'zod';

/**
 * The only place in the application that reads the environment (enforced by an architecture test).
 * Names and defaults are documented in docs/02-architecture/14-env-and-configuration.md.
 */
/** Blank means "not set". Stray spaces and a pair of wrapping quotes (easy to paste into a dashboard) are removed first. */
const clean = (x: unknown) => {
  if (typeof x !== 'string') return x;
  const t = x.trim().replace(/^(["'])(.*)\1$/, '$2').trim();
  return t === '' ? undefined : t;
};
const optionalText = (v: z.ZodType<string>) => z.preprocess(clean, v.optional());
const flag = (fallback: boolean) => z.stringbool().default(fallback);

const schema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
    APP_ENV: z.enum(['local', 'preview', 'production']).default('local'),
    DATA_SOURCE: z.enum(['mock', 'supabase']).default('mock'),
    FEATURE_PUBLIC_CURTAIN: flag(true),
    FEATURE_ROAMING_MASCOT: flag(true),
    CONSENT_TEXT_VERSION: z.string().min(1).default('v1'),
    PRIVACY_CONTACT_EMAIL: optionalText(z.email()),

    // Supabase (docs/02-architecture/14 section 3). The service-role key is server only.
    NEXT_PUBLIC_SUPABASE_URL: optionalText(z.url()),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalText(z.string().min(20)),
    SUPABASE_SERVICE_ROLE_KEY: optionalText(z.string().min(20)),

    // Rate limiting (section 4)
    UPSTASH_REDIS_REST_URL: optionalText(z.url()),
    UPSTASH_REDIS_REST_TOKEN: optionalText(z.string().min(10)),
    RATE_LIMIT_ENABLED: flag(true),

    // Internal endpoints and hashing (section 2)
    CRON_SECRET: optionalText(z.string().min(24)),
    IP_HASH_SALT: optionalText(z.string().min(16)),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    // Authentication and session (section 5)
    SESSION_IDLE_MINUTES: z.coerce.number().int().min(5).max(480).default(30),
    SESSION_ABSOLUTE_HOURS: z.coerce.number().int().min(1).max(72).default(12),
    MFA_REQUIRED_FOR_OPERATORS: flag(false),
    LOGIN_LOCK_THRESHOLD: z.coerce.number().int().min(3).max(50).default(10),
    LOGIN_LOCK_MINUTES: z.coerce.number().int().min(1).max(240).default(15),
    ADMIN_IP_ALLOWLIST: optionalText(z.string()),

    // Payments (docs/02-architecture/10 section 3). `manual` is always available.
    PAYMENT_GATEWAYS: z.string().default('manual').transform((v) => v.split(',').map((g) => g.trim().toLowerCase()).filter(Boolean)),
    DEFAULT_CURRENCY: z.string().length(3).default('AED'),
    STRIPE_SECRET_KEY: optionalText(z.string().regex(/^(sk|rk)_(test|live)_/)),
    STRIPE_WEBHOOK_SECRET: optionalText(z.string().startsWith('whsec_')),

    // AI assistant (docs/02-architecture/27 section 10). Off by default; mock mode only until the owner confirms D23, D24 and D34.
    ASSISTANT_ENABLED: flag(false),
    ASSISTANT_MODE: z.enum(['mock']).default('mock'),

    // Notifications (docs/02-architecture/11 sections 3 and 6)
    FEATURE_OUTBOX_ENABLED: flag(true),
    FEATURE_STAFF_DIGEST: flag(false),
    EMAIL_PROVIDER: z.enum(['log', 'resend']).default('log'),
    RESEND_API_KEY: optionalText(z.string().min(10)),
    EMAIL_FROM: optionalText(z.string().min(5)),
    WHATSAPP_PROVIDER: z.enum(['none', 'cloud']).default('none'),
    WHATSAPP_ACCESS_TOKEN: optionalText(z.string().min(20)),
    WHATSAPP_PHONE_NUMBER_ID: optionalText(z.string().regex(/^\d{6,}$/)),
    WHATSAPP_APP_SECRET: optionalText(z.string().min(16)),
    WHATSAPP_VERIFY_TOKEN: optionalText(z.string().min(16)),
    WHATSAPP_API_VERSION: z.string().regex(/^v\d+\.\d+$/).default('v21.0'),
    QUIET_HOURS_START: z.string().regex(/^\d{2}:\d{2}$/).default('21:00'),
    QUIET_HOURS_END: z.string().regex(/^\d{2}:\d{2}$/).default('08:00'),
    QUIET_HOURS_TZ: z.string().min(3).default('Asia/Dubai'),
    AUTOMATED_MSG_DAILY_CAP: z.coerce.number().int().min(1).max(50).default(5),
  })
  .superRefine((env, ctx) => {
    const need = (name: keyof typeof env, reason: string) => {
      if (!env[name]) ctx.addIssue({ code: 'custom', path: [name], message: `${String(name)} is required ${reason}` });
    };
    if (env.DATA_SOURCE === 'supabase') {
      need('NEXT_PUBLIC_SUPABASE_URL', 'when DATA_SOURCE=supabase');
      need('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'when DATA_SOURCE=supabase');
    }
    if (env.PAYMENT_GATEWAYS.includes('stripe')) {
      need('STRIPE_SECRET_KEY', 'when PAYMENT_GATEWAYS includes stripe');
      need('STRIPE_WEBHOOK_SECRET', 'when PAYMENT_GATEWAYS includes stripe');
    }
    if (env.EMAIL_PROVIDER === 'resend') {
      need('RESEND_API_KEY', 'when EMAIL_PROVIDER=resend');
      need('EMAIL_FROM', 'when EMAIL_PROVIDER=resend');
    }
    if (env.WHATSAPP_PROVIDER === 'cloud') {
      for (const name of ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_APP_SECRET', 'WHATSAPP_VERIFY_TOKEN'] as const) need(name, 'when WHATSAPP_PROVIDER=cloud');
    }
    if (env.APP_ENV === 'production') {
      need('CRON_SECRET', 'in production');
      need('IP_HASH_SALT', 'in production');
      if (env.RATE_LIMIT_ENABLED) {
        need('UPSTASH_REDIS_REST_URL', 'in production while RATE_LIMIT_ENABLED is true');
        need('UPSTASH_REDIS_REST_TOKEN', 'in production while RATE_LIMIT_ENABLED is true');
      }
    }
  });

export type Env = z.infer<typeof schema>;

export class EnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvError';
  }
}

/** Parses a source object; throws an `EnvError` that lists every problem at once. */
export function parseEnv(source: Readonly<Record<string, string | undefined>>): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    throw new EnvError(`Invalid environment configuration:\n${z.prettifyError(parsed.error)}`);
  }
  return parsed.data;
}

let cached: Env | undefined;

/** Reads `process.env` once and caches the validated result. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}

/** Test helper: forget the cached value. */
/** Server-only values that only some code paths need; fail loudly with a clear message when missing. */
export function requireServiceRoleKey(env: Env = getEnv()): string {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) throw new EnvError('SUPABASE_SERVICE_ROLE_KEY is required for this operation');
  return env.SUPABASE_SERVICE_ROLE_KEY;
}

export function requireCronSecret(env: Env = getEnv()): string {
  if (!env.CRON_SECRET) throw new EnvError('CRON_SECRET is required for this operation');
  return env.CRON_SECRET;
}

export function resetEnvCache(): void {
  cached = undefined;
}
