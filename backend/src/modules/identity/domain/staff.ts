export type StaffRole = 'super_admin' | 'operator';

export interface StaffMember {
  readonly userId: string;
  readonly email: string;
  readonly fullName: string;
  readonly role: StaffRole;
  readonly mfaRequired: boolean;
}

export const MIN_PASSWORD_LENGTH = 12;

/** Password policy (docs/03 section 4): length first, no composition rules. Returns an error key or undefined. */
export function passwordProblem(password: string): 'too-short' | 'too-long' | undefined {
  if (password.length < MIN_PASSWORD_LENGTH) return 'too-short';
  if (password.length > 128) return 'too-long';
  return undefined;
}

export const normaliseEmail = (email: string): string => email.trim().toLowerCase();
export const isEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
