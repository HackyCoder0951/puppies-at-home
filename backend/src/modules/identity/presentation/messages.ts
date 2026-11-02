import type { ResetError, SignInError } from '../application';

/** User-facing copy for the admin forms. Generic on purpose: never reveals whether an account exists. */
export function signInMessage(error: SignInError): string {
  switch (error.code) {
    case 'invalid-input':
      return 'Enter your email and password.';
    case 'invalid-credentials':
      return 'The email or password is not correct.';
    case 'locked':
      return 'Too many failed attempts. Try again in 15 minutes or reset your password.';
    case 'rate-limited':
      return `Too many attempts. Try again in ${Math.max(1, Math.ceil(error.retryAfterSeconds / 60))} minute(s).`;
    case 'unavailable':
      return 'Sign-in is temporarily unavailable. Try again shortly.';
  }
}

export function resetMessage(error: ResetError): string {
  switch (error.code) {
    case 'invalid-input':
      return 'Enter a valid email address.';
    case 'weak-password':
      return error.reason === 'too-long' ? 'Use at most 128 characters.' : 'Use at least 12 characters.';
    case 'no-session':
      return 'This reset link has expired. Request a new one.';
    case 'unavailable':
      return 'Could not update the password. Try again shortly.';
  }
}

export const RESET_REQUESTED_MESSAGE = 'If that email belongs to a staff account, a reset link is on its way.';
