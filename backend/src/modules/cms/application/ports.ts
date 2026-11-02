import type { FaqAdminRow, PuppyAdminDetail, PuppyAdminRow, TestimonialAdmin } from '../domain';
import type { FaqInput, PuppyInput, SettingsInput, TestimonialInput } from './schemas';

export class RepositoryError extends Error {
  constructor(readonly kind: 'forbidden' | 'conflict' | 'not-found' | 'unavailable', message: string) {
    super(message);
  }
}

export interface NewMedia {
  readonly kind: 'photo' | 'video';
  readonly storagePath: string;
  readonly posterPath: string | null;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly durationS: number | null;
}

/** Everything the staff session may read and write; authorisation is enforced by the database (RLS and triggers). */
export interface CmsRepository {
  listPuppies(): Promise<readonly PuppyAdminRow[]>;
  getPuppy(id: string): Promise<PuppyAdminDetail | null>;
  slugExists(slug: string): Promise<boolean>;
  createPuppy(input: PuppyInput, slug: string): Promise<{ id: string }>;
  updatePuppy(id: string, input: PuppyInput): Promise<void>;
  setPublished(id: string, published: boolean): Promise<void>;
  setGoneHome(id: string, goneHome: boolean, source: 'TeddyPups' | 'Dubai showroom'): Promise<void>;
  softDeletePuppy(id: string): Promise<void>;
  addMedia(puppyId: string, media: NewMedia): Promise<void>;
  removeMedia(mediaId: string): Promise<readonly string[]>;
  setCover(puppyId: string, mediaId: string): Promise<void>;

  listFaqs(): Promise<readonly FaqAdminRow[]>;
  saveFaq(id: string | null, input: FaqInput): Promise<void>;
  setFaqPublished(id: string, published: boolean): Promise<void>;
  softDeleteFaq(id: string): Promise<void>;

  getTestimonial(): Promise<TestimonialAdmin | null>;
  saveTestimonial(input: TestimonialInput, publish: boolean): Promise<void>;

  getSettings(): Promise<Record<string, string>>;
  saveSettings(values: SettingsInput): Promise<void>;
}

export interface MediaStore {
  upload(path: string, bytes: Uint8Array, contentType: string): Promise<void>;
  remove(paths: readonly string[]): Promise<void>;
}

export interface MediaProbe {
  /** Pixel size of an image, or undefined when the bytes are not a readable image. */
  dimensions(bytes: Uint8Array): Promise<{ width: number; height: number } | undefined>;
}

/** Tells the public site its cached content changed. */
export interface ContentPublisher {
  changed(scope: 'puppies' | 'content'): Promise<void>;
}

export interface Ids {
  next(): string;
}
