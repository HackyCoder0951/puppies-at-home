/**
 * Error taxonomy shared by all modules. Delivery code (pages, route handlers) maps these
 * to HTTP statuses and UI messages; domain and application code never import HTTP types.
 */
export type ErrorCode =
  | 'validation_failed'
  | 'not_found'
  | 'forbidden'
  | 'conflict'
  | 'rate_limited'
  | 'unexpected';

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class ValidationError extends AppError {
  readonly code = 'validation_failed' as const;

  constructor(
    message: string,
    readonly fields: Readonly<Record<string, string>> = {},
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  readonly code = 'not_found' as const;
}

export class ForbiddenError extends AppError {
  readonly code = 'forbidden' as const;
}

export class ConflictError extends AppError {
  readonly code = 'conflict' as const;
}

export class RateLimitedError extends AppError {
  readonly code = 'rate_limited' as const;

  constructor(
    message: string,
    readonly retryAfterSeconds: number,
  ) {
    super(message);
  }
}

export class UnexpectedError extends AppError {
  readonly code = 'unexpected' as const;
}

export const isAppError = (value: unknown): value is AppError => value instanceof AppError;
