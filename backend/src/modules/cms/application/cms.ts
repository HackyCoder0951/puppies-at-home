import { err, ok, type Result } from '@backend/kernel';
import { EXTENSION_FOR, MEDIA_LIMITS, puppySlug, type FaqAdminRow, type PuppyAdminDetail, type PuppyAdminRow, type TestimonialAdmin } from '../domain';
import { faqInputSchema, puppyInputSchema, settingsInputSchema, testimonialInputSchema } from './schemas';
import { RepositoryError, type CmsRepository, type ContentPublisher, type Ids, type MediaProbe, type MediaStore } from './ports';

export type CmsError =
  | { code: 'invalid'; field?: string }
  | { code: 'forbidden' }
  | { code: 'not-found' }
  | { code: 'conflict' }
  | { code: 'unsupported-media' }
  | { code: 'too-large' }
  | { code: 'unavailable' };

export interface CmsDeps {
  repo: CmsRepository;
  media: MediaStore;
  probe: MediaProbe;
  publisher: ContentPublisher;
  ids: Ids;
}

export interface UploadedFile {
  readonly bytes: Uint8Array;
  readonly contentType: string;
  readonly alt: string;
}

const fieldOf = (issue: { path: PropertyKey[]; message: string } | undefined) => String(issue?.path[0] ?? issue?.message ?? '');

export function createCms(deps: CmsDeps) {
  const { repo, media, probe, publisher, ids } = deps;

  /** Runs a repository call and maps database refusals to the application's error codes. */
  async function run<T>(scope: 'puppies' | 'content' | null, action: () => Promise<T>): Promise<Result<T, CmsError>> {
    try {
      const value = await action();
      if (scope) await publisher.changed(scope);
      return ok(value);
    } catch (error) {
      if (error instanceof RepositoryError) return err({ code: error.kind });
      throw error;
    }
  }

  return {
    listPuppies: (): Promise<Result<readonly PuppyAdminRow[], CmsError>> => run(null, () => repo.listPuppies()),
    getPuppy: async (id: string): Promise<Result<PuppyAdminDetail, CmsError>> => {
      const r = await run(null, () => repo.getPuppy(id));
      if (!r.ok) return r;
      return r.value ? ok(r.value) : err({ code: 'not-found' });
    },

    async createPuppy(raw: unknown): Promise<Result<{ id: string }, CmsError>> {
      const parsed = puppyInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run('puppies', async () => {
        const base = puppySlug(parsed.data);
        let slug = base;
        for (let n = 2; await repo.slugExists(slug); n++) slug = `${base}-${n}`;
        return repo.createPuppy(parsed.data, slug);
      });
    },

    async updatePuppy(id: string, raw: unknown): Promise<Result<true, CmsError>> {
      const parsed = puppyInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run('puppies', async () => (await repo.updatePuppy(id, parsed.data), true as const));
    },

    publishPuppy: (id: string, published: boolean) => run('puppies', async () => (await repo.setPublished(id, published), true as const)),
    markGoneHome: (id: string, goneHome: boolean, source: 'TeddyPups' | 'Dubai showroom' = 'TeddyPups') =>
      run('puppies', async () => (await repo.setGoneHome(id, goneHome, source), true as const)),
    deletePuppy: (id: string) => run('puppies', async () => (await repo.softDeletePuppy(id), true as const)),

    /** Validates type, size and (for photos) that the bytes decode as an image, then stores the file and its row. */
    async addPuppyMedia(puppyId: string, file: UploadedFile): Promise<Result<true, CmsError>> {
      const isImage = (MEDIA_LIMITS.imageTypes as readonly string[]).includes(file.contentType);
      const isVideo = (MEDIA_LIMITS.videoTypes as readonly string[]).includes(file.contentType);
      if (!isImage && !isVideo) return err({ code: 'unsupported-media' });
      if (file.bytes.byteLength > (isImage ? MEDIA_LIMITS.maxImageBytes : MEDIA_LIMITS.maxVideoBytes)) return err({ code: 'too-large' });
      if (file.alt.trim().length < 3 || file.alt.length > 200) return err({ code: 'invalid', field: 'alt' });
      let size = { width: 1080, height: 1920 };
      if (isImage) {
        const found = await probe.dimensions(file.bytes);
        if (!found) return err({ code: 'unsupported-media' });
        size = found;
      }
      return run('puppies', async () => {
        const detail = await repo.getPuppy(puppyId);
        if (!detail) throw new RepositoryError('not-found', 'puppy');
        const path = `puppies/${detail.slug}/${ids.next()}.${EXTENSION_FOR[file.contentType]}`;
        await media.upload(path, file.bytes, file.contentType);
        await repo.addMedia(puppyId, { kind: isImage ? 'photo' : 'video', storagePath: path, posterPath: null, alt: file.alt.trim(), width: size.width, height: size.height, durationS: null });
        return true as const;
      });
    },

    removePuppyMedia: (mediaId: string) =>
      run('puppies', async () => {
        const paths = await repo.removeMedia(mediaId);
        await media.remove(paths).catch(() => undefined);
        return true as const;
      }),
    setPuppyCover: (puppyId: string, mediaId: string) => run('puppies', async () => (await repo.setCover(puppyId, mediaId), true as const)),

    listFaqs: (): Promise<Result<readonly FaqAdminRow[], CmsError>> => run(null, () => repo.listFaqs()),
    async saveFaq(id: string | null, raw: unknown): Promise<Result<true, CmsError>> {
      const parsed = faqInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run('content', async () => (await repo.saveFaq(id, parsed.data), true as const));
    },
    publishFaq: (id: string, published: boolean) => run('content', async () => (await repo.setFaqPublished(id, published), true as const)),
    deleteFaq: (id: string) => run('content', async () => (await repo.softDeleteFaq(id), true as const)),

    getTestimonial: (): Promise<Result<TestimonialAdmin | null, CmsError>> => run(null, () => repo.getTestimonial()),
    async saveTestimonial(raw: unknown, publish: boolean): Promise<Result<true, CmsError>> {
      const parsed = testimonialInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run('content', async () => (await repo.saveTestimonial(parsed.data, publish), true as const));
    },

    getSettings: (): Promise<Result<Record<string, string>, CmsError>> => run(null, () => repo.getSettings()),
    async saveSettings(raw: unknown): Promise<Result<true, CmsError>> {
      const parsed = settingsInputSchema.safeParse(raw);
      if (!parsed.success) return err({ code: 'invalid', field: fieldOf(parsed.error.issues[0]) });
      return run('content', async () => (await repo.saveSettings(parsed.data), true as const));
    },
  };
}

export type Cms = ReturnType<typeof createCms>;
