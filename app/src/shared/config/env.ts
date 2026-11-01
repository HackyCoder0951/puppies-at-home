import { z } from 'zod';

/**
 * The only place in the application that reads the environment (enforced by an architecture test).
 * Names and defaults are documented in docs/02-architecture/14-env-and-configuration.md.
 */
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
  APP_ENV: z.enum(['local', 'preview', 'production']).default('local'),
  DATA_SOURCE: z.enum(['mock', 'supabase']).default('mock'),
  FEATURE_PUBLIC_CURTAIN: z.stringbool().default(true),
  FEATURE_ROAMING_MASCOT: z.stringbool().default(true),
  CONSENT_TEXT_VERSION: z.string().min(1).default('v1'),
  PRIVACY_CONTACT_EMAIL: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.email().optional(),
  ),
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
export function resetEnvCache(): void {
  cached = undefined;
}
