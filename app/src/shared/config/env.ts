import { z } from 'zod';

/**
 * The only place in the application that reads the environment (enforced by an architecture test).
 * Names and defaults are documented in docs/02-architecture/14-env-and-configuration.md.
 */
const optionalText = (v: z.ZodType<string>) => z.preprocess((x) => (x === '' ? undefined : x), v.optional());
const flag = (fallback: boolean) => z.stringbool().default(fallback);

const schema = z
  .object({
    NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
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
  })
  .superRefine((env, ctx) => {
    const need = (name: keyof typeof env, reason: string) => {
      if (!env[name]) ctx.addIssue({ code: 'custom', path: [name], message: `${String(name)} is required ${reason}` });
    };
    if (env.DATA_SOURCE === 'supabase') {
      need('NEXT_PUBLIC_SUPABASE_URL', 'when DATA_SOURCE=supabase');
      need('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'when DATA_SOURCE=supabase');
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
