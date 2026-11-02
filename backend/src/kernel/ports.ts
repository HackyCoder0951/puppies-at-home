/** Time and identity come from ports so that use cases stay deterministic in tests. */
export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}

/** What a module reports about the personal data it stores (docs/03-security-privacy/06-security-architecture.md 6.6). */
export interface PersonalDataSubject {
  readonly email?: string;
  readonly phoneE164?: string;
  readonly customerId?: string;
}

export interface PersonalDataDescription {
  readonly module: string;
  readonly categories: readonly string[];
  readonly retention: string;
}

export interface PersonalDataExport {
  readonly module: string;
  readonly records: readonly Record<string, unknown>[];
}

export interface AnonymiseOutcome {
  readonly module: string;
  readonly anonymised: number;
  readonly retained: readonly { readonly reason: string; readonly count: number }[];
}

/**
 * Every module that stores personal data implements this port so that data subject requests,
 * retention and erasure work across modules. Modules without personal data do not implement it.
 */
export interface PersonalDataProvider {
  describe(): PersonalDataDescription;
  export(subject: PersonalDataSubject): Promise<PersonalDataExport>;
  anonymise(subject: PersonalDataSubject): Promise<AnonymiseOutcome>;
}
