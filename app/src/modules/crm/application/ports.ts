import type { Enquiry } from '../domain';

/** Where accepted enquiries go. Mock: memory only. Later: Supabase with RLS. */
export interface EnquiryStore {
  save(enquiry: Enquiry): Promise<void>;
}

/** Fixed-window limiter keyed by caller (hashed IP at the edge). */
export interface RateLimiter {
  /** Returns 0 when allowed, otherwise the seconds until the caller may retry. */
  hit(key: string): Promise<number>;
}
