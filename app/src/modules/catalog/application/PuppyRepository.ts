import type { Puppy } from '../domain';

/** Port: where puppies come from. Adapters: mock fixtures now, Supabase views later. */
export interface PuppyRepository {
  /** Available puppies in display order. */
  listAvailable(): Promise<readonly Puppy[]>;
  /** Gone-home puppies in display order, most recent first. */
  listGoneHome(): Promise<readonly Puppy[]>;
}
